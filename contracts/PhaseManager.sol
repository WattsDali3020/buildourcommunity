// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface IGeoOracle {
    function getPhaseEligibility(address user, uint256 propertyId) external returns (uint8);
}

interface IPropertyToken {
    enum Phase { County, State, National }

    function advancePhase(uint256 propertyId) external;
    function mintTokens(uint256 propertyId, address buyer, uint256 amount) external;
    function getProperty(uint256 propertyId) external view returns (
        uint256 id,
        string memory name,
        string memory uri,
        uint256 totalSupply,
        uint256 mintedSupply,
        uint256 fundingTarget,
        uint256 fundingDeadline,
        uint8 currentPhase,
        bool isActive,
        bool isFunded
    );
    function whitelist(address account) external view returns (bool);
}

interface IGovernance {
    function proposalCount() external view returns (uint256);
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        uint256 propertyId,
        address proposer,
        uint8 proposalType,
        string memory title,
        string memory description,
        string memory ipfsHash,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 votesAbstain,
        uint256 startTime,
        uint256 endTime,
        uint256 quorumRequired,
        uint8 status,
        bytes memory executionData
    );
    function getDemandBars() external view returns (uint256[4] memory);
    function getCommunityHealthScore() external view returns (uint256);
}

/**
 * @title RevitaHub Phase Manager
 * @notice Engagement analytics only.
 * @dev Sale stages are time gates on PropertyToken (days 0–90 / 91–180 / after 180).
 *      This contract must not open the next stage early. The 75% figure is not a
 *      sale-stage trigger. Its loan-evaluation meaning is undefined and is not invented here.
 */
contract PhaseManager is AccessControl, AutomationCompatibleInterface {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    IPropertyToken public propertyToken;
    IGovernance public governance;
    IGeoOracle public geoOracle;

    // Engagement threshold for early phase advancement (basis points)
    uint256 public constant ENGAGEMENT_THRESHOLD = 7500; // 75%
    
    // Minimum engagement period before early advancement (prevents gaming)
    uint256 public constant MIN_ENGAGEMENT_PERIOD = 7 days;

    // Property engagement tracking
    struct PropertyEngagement {
        uint256 propertyId;
        uint256 phaseStartTime;
        uint256 totalEligibleVoters;
        uint256 activeVoters;
        uint256 totalProposals;
        uint256 votedProposals;
        bool isTracking;
    }

    // Engagement metrics per property
    mapping(uint256 => PropertyEngagement) public propertyEngagement;
    
    // Active properties for automation
    uint256[] public trackedProperties;
    mapping(uint256 => bool) public isTracked;

    // Behavioral nudge triggers
    mapping(uint256 => uint256) public lastNudgeTime;
    uint256 public nudgeCooldown = 24 hours;

    // Engagement bonus tracking (vote-to-earn)
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    uint256 public constant BONUS_TOKENS = 1; // Tokens awarded for engagement bonus
    
    // Poll participation bonuses
    mapping(uint256 => mapping(address => bool)) public pollParticipated; // Track poll voters
    mapping(uint256 => uint256) public propertyPollCount; // Number of polls per property
    uint256 public constant POLL_BONUS_MULTIPLIER = 50; // 0.5 extra engagement credit per poll vote (in basis points)

    // Property health score tracking (post-execution impact)
    struct HealthDelta {
        string category;
        int256 delta;
        uint256 timestamp;
    }
    mapping(uint256 => uint256) public propertyHealthScores;
    mapping(uint256 => HealthDelta[]) public propertyHealthHistory;

    // Events
    event ImpactRecorded(
        uint256 indexed propertyId,
        string category,
        int256 delta,
        uint256 newScore
    );
    event EngagementUpdated(
        uint256 indexed propertyId,
        uint256 activeVoters,
        uint256 totalEligible,
        uint256 engagementPercent
    );
    event PhaseAdvancedByEngagement(
        uint256 indexed propertyId,
        uint8 fromPhase,
        uint8 toPhase,
        uint256 engagementPercent
    );
    event PhaseAdvancedBySubscription(
        uint256 indexed propertyId,
        uint8 fromPhase,
        uint8 toPhase
    );
    event NudgeTriggered(
        uint256 indexed propertyId,
        string nudgeType,
        uint256 engagementPercent
    );
    event PropertyTrackingStarted(uint256 indexed propertyId);
    event PropertyTrackingStopped(uint256 indexed propertyId);
    event BonusClaimed(uint256 indexed propertyId, address indexed claimer, uint256 bonus);
    event PollParticipationRecorded(uint256 indexed propertyId, address indexed participant);
    event PollBonusApplied(uint256 indexed propertyId, uint256 pollParticipants, uint256 bonusEngagement);
    event DemandNudge(uint256 indexed propertyId, uint8 demandType, uint256 demandBps);
    event DemandDrivenAdvancement(uint256 indexed propertyId, uint256 demandBps);
    event GeoEligibilityChecked(uint256 indexed propertyId, address indexed user, uint8 eligiblePhase);
    event GeoOracleUpdated(address indexed newOracle);

    constructor(address _propertyToken, address _governance) {
        propertyToken = IPropertyToken(_propertyToken);
        governance = IGovernance(_governance);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @notice Start tracking engagement for a property
     * @param propertyId Property ID
     * @param totalEligibleVoters Total number of eligible voters
     */
    function startTracking(uint256 propertyId, uint256 totalEligibleVoters) external onlyRole(OPERATOR_ROLE) {
        require(!isTracked[propertyId], "Already tracking");
        
        propertyEngagement[propertyId] = PropertyEngagement({
            propertyId: propertyId,
            phaseStartTime: block.timestamp,
            totalEligibleVoters: totalEligibleVoters,
            activeVoters: 0,
            totalProposals: 0,
            votedProposals: 0,
            isTracking: true
        });

        trackedProperties.push(propertyId);
        isTracked[propertyId] = true;

        emit PropertyTrackingStarted(propertyId);
    }

    /**
     * @notice Update engagement metrics for a property
     * @param propertyId Property ID
     * @param activeVoters Number of unique voters
     * @param totalProposals Total proposals for property
     * @param votedProposals Proposals with votes
     */
    function updateEngagement(
        uint256 propertyId,
        uint256 activeVoters,
        uint256 totalProposals,
        uint256 votedProposals
    ) external onlyRole(OPERATOR_ROLE) {
        PropertyEngagement storage engagement = propertyEngagement[propertyId];
        require(engagement.isTracking, "Not tracking");

        engagement.activeVoters = activeVoters;
        engagement.totalProposals = totalProposals;
        engagement.votedProposals = votedProposals;

        uint256 engagementPercent = calculateEngagement(propertyId);
        emit EngagementUpdated(propertyId, activeVoters, engagement.totalEligibleVoters, engagementPercent);

        // Nudges only. Sale stages are not advanced from engagement.
        _checkNudges(propertyId, engagementPercent);
    }

    /**
     * @notice Calculate engagement percentage
     * @param propertyId Property ID
     */
    function calculateEngagement(uint256 propertyId) public view returns (uint256) {
        PropertyEngagement storage engagement = propertyEngagement[propertyId];
        if (engagement.totalEligibleVoters == 0) return 0;

        // Engagement = (active voters / eligible voters) * 100
        // Returns in basis points (e.g., 7500 = 75%)
        return (engagement.activeVoters * 10000) / engagement.totalEligibleVoters;
    }

    /**
     * @notice Check and trigger behavioral nudges
     * @param propertyId Property ID
     * @param engagementPercent Current engagement
     */
    function _checkNudges(uint256 propertyId, uint256 engagementPercent) internal {
        if (block.timestamp < lastNudgeTime[propertyId] + nudgeCooldown) {
            return;
        }

        string memory nudgeType;

        if (engagementPercent < 2500) {
            // Low engagement - urgent nudge
            nudgeType = "urgent_participation";
        } else if (engagementPercent >= 6000 && engagementPercent < 7500) {
            // Near threshold - milestone nudge
            nudgeType = "milestone_near";
        } else if (engagementPercent >= 7000 && engagementPercent < 7500) {
            // Very close - final push nudge
            nudgeType = "phase_closing";
        } else {
            return; // No nudge needed
        }

        lastNudgeTime[propertyId] = block.timestamp;
        emit NudgeTriggered(propertyId, nudgeType, engagementPercent);
    }

    /**
     * @notice Reserved-bucket advancement was removed. Selling out does not open the next stage.
     */
    function checkSubscriptionAdvancement(uint256) external pure {
        return;
    }

    // ============ Chainlink Automation ============

    /**
     * @notice Chainlink Automation check
     */
    function checkUpkeep(bytes calldata) external pure override returns (bool upkeepNeeded, bytes memory performData) {
        // Sale stages follow PropertyToken's funding clock, not engagement upkeep.
        return (false, "");
    }

    function performUpkeep(bytes calldata) external pure override {
        revert("Access stages follow the common funding clock");
    }

    /**
     * @notice Stop tracking a property
     * @param propertyId Property ID
     */
    function stopTracking(uint256 propertyId) external onlyRole(OPERATOR_ROLE) {
        require(isTracked[propertyId], "Not tracking");
        
        propertyEngagement[propertyId].isTracking = false;
        isTracked[propertyId] = false;
        
        emit PropertyTrackingStopped(propertyId);
    }

    /**
     * @notice Update nudge cooldown
     * @param newCooldown New cooldown in seconds
     */
    function setNudgeCooldown(uint256 newCooldown) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newCooldown >= 1 hours && newCooldown <= 7 days, "Invalid cooldown");
        nudgeCooldown = newCooldown;
    }

    /**
     * @notice Set geo-verification oracle for County-local eligibility checks
     * @param _oracle Address of the geo oracle contract
     */
    function setGeoOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        geoOracle = IGeoOracle(_oracle);
        emit GeoOracleUpdated(_oracle);
    }

    /**
     * @notice Get all tracked properties
     */
    function getTrackedProperties() external view returns (uint256[] memory) {
        return trackedProperties;
    }

    /**
     * @notice TODO(owner): engagement token bonuses are outside the confirmed sale rules.
     */
    function claimEngagementBonus(uint256) external pure {
        // TODO(owner): token bonuses are outside the confirmed sale rules.
        // Do not mint extra supply, and do not treat 1.5x as a bonus multiplier.
        revert("Engagement token bonuses are not part of confirmed sale rules");
    }

    /**
     * @notice Get engagement details for a property
     * @param propertyId Property ID
     */
    function getEngagement(uint256 propertyId) external view returns (
        uint256 phaseStartTime,
        uint256 totalEligible,
        uint256 activeVoters,
        uint256 engagementPercent,
        bool isTracking
    ) {
        PropertyEngagement storage engagement = propertyEngagement[propertyId];
        return (
            engagement.phaseStartTime,
            engagement.totalEligibleVoters,
            engagement.activeVoters,
            calculateEngagement(propertyId),
            engagement.isTracking
        );
    }

    // ============ Poll Bonus Functions ============

    /**
     * @notice Record poll participation for engagement bonus credit
     * @dev Called by operator when user votes on a property-related poll
     * @param propertyId Property ID
     * @param participant Address of poll participant
     */
    function recordPollParticipation(
        uint256 propertyId,
        address participant
    ) external onlyRole(OPERATOR_ROLE) {
        require(isTracked[propertyId], "Property not tracked");
        require(!pollParticipated[propertyId][participant], "Already recorded");
        
        pollParticipated[propertyId][participant] = true;
        emit PollParticipationRecorded(propertyId, participant);
    }

    /**
     * @notice Update engagement with poll participation bonus
     * @dev Adds half-credit for poll voters to boost engagement calculation
     * @param propertyId Property ID
     * @param activeVoters Number of unique proposal voters
     * @param totalProposals Total proposals for property
     * @param votedProposals Proposals with votes
     * @param pollParticipants Number of unique poll voters
     */
    function updateEngagementWithPolls(
        uint256 propertyId,
        uint256 activeVoters,
        uint256 totalProposals,
        uint256 votedProposals,
        uint256 pollParticipants
    ) external onlyRole(OPERATOR_ROLE) {
        PropertyEngagement storage engagement = propertyEngagement[propertyId];
        require(engagement.isTracking, "Not tracking");

        // Calculate poll bonus: half credit per poll voter
        // pollParticipants / 2 added to active voters (but not exceeding totalEligible)
        uint256 pollBonus = (pollParticipants * POLL_BONUS_MULTIPLIER) / 100;
        uint256 adjustedActiveVoters = activeVoters + pollBonus;
        
        // Cap at total eligible voters
        if (adjustedActiveVoters > engagement.totalEligibleVoters) {
            adjustedActiveVoters = engagement.totalEligibleVoters;
        }

        engagement.activeVoters = adjustedActiveVoters;
        engagement.totalProposals = totalProposals;
        engagement.votedProposals = votedProposals;

        uint256 engagementPercent = calculateEngagement(propertyId);
        emit EngagementUpdated(propertyId, adjustedActiveVoters, engagement.totalEligibleVoters, engagementPercent);
        emit PollBonusApplied(propertyId, pollParticipants, pollBonus);

        // Nudges only. Sale stages are not advanced from engagement.
        _checkNudges(propertyId, engagementPercent);
    }

    /**
     * @notice TODO(owner): poll token bonuses are outside the confirmed sale rules.
     */
    function claimPollBoostBonus(uint256) external pure {
        // TODO(owner): token bonuses are outside the confirmed sale rules.
        revert("Engagement token bonuses are not part of confirmed sale rules");
    }

    /**
     * @notice Check if user participated in polls for a property
     * @param propertyId Property ID
     * @param participant User address
     */
    function hasParticipatedInPolls(uint256 propertyId, address participant) external view returns (bool) {
        return pollParticipated[propertyId][participant];
    }

    // ============ Demand-Driven Engagement (SimCity Integration) ============

    /**
     * @notice Record a demand reading. This does not advance a sale stage.
     * @param propertyId Property ID to evaluate
     */
    function updateDemandEngagement(uint256 propertyId) external onlyRole(OPERATOR_ROLE) {
        require(isTracked[propertyId], "Property not tracked");
        PropertyEngagement storage engagement = propertyEngagement[propertyId];
        require(engagement.isTracking, "Not tracking");
        
        // Get demand bars from Governance (SimCity-style RCI readings)
        uint256[4] memory demandBars = governance.getDemandBars();
        uint256 propDemandBps = demandBars[0]; // PropertyDevelopment = index 0
        
        // Emit advisor-style nudge for UI
        emit DemandNudge(propertyId, 0, propDemandBps);
        
        // Demand does not open the next sale stage. The 75% comparison is not a trigger.
        if (propDemandBps >= ENGAGEMENT_THRESHOLD) {
            emit DemandDrivenAdvancement(propertyId, propDemandBps);
        }
    }

    /**
     * @notice Get community health from governance contract
     * @return healthScore 0-10000 based on demand diversity and participation
     */
    function getCommunityHealth() external view returns (uint256) {
        return governance.getCommunityHealthScore();
    }

    /**
     * @notice Get demand-adjusted engagement metrics for a property
     * @param propertyId Property ID
     * @return baseEngagement Standard engagement percentage in BPS
     * @return demandBars Governance demand bars [PropDev, Treasury, Params, Emergency]
     * @return healthScore Community health score 0-10000
     * @return isReadyForAdvancement Whether demand conditions support phase advancement
     */
    function getDemandEngagementMetrics(uint256 propertyId) external view returns (
        uint256 baseEngagement,
        uint256[4] memory demandBars,
        uint256 healthScore,
        bool isReadyForAdvancement
    ) {
        baseEngagement = calculateEngagement(propertyId);
        demandBars = governance.getDemandBars();
        healthScore = governance.getCommunityHealthScore();
        // Sale stages are not engagement-ready. Always false.
        isReadyForAdvancement = false;
    }

    // ============ Post-Execution Impact Recording ============

    /**
     * @notice Record impact health delta after a proposal executes
     * @dev Called by operator or Chainlink Automation after any proposal execution
     * @param propertyId Property ID
     * @param category Impact category: "jobs", "traffic", "revenue"
     * @param delta Health score change (positive or negative)
     */
    function recordImpactAfterExecution(
        uint256 propertyId,
        string calldata category,
        int256 delta
    ) external onlyRole(OPERATOR_ROLE) {
        require(bytes(category).length > 0, "Category required");

        propertyHealthHistory[propertyId].push(HealthDelta({
            category: category,
            delta: delta,
            timestamp: block.timestamp
        }));

        uint256 currentScore = propertyHealthScores[propertyId];
        uint256 newScore;

        if (delta >= 0) {
            newScore = currentScore + uint256(delta);
            if (newScore > 10000) {
                newScore = 10000;
            }
        } else {
            uint256 absDelta = uint256(-delta);
            if (absDelta >= currentScore) {
                newScore = 0;
            } else {
                newScore = currentScore - absDelta;
            }
        }

        propertyHealthScores[propertyId] = newScore;
        emit ImpactRecorded(propertyId, category, delta, newScore);
    }

    /**
     * @notice Get the current health score for a property
     * @param propertyId Property ID
     * @return score Current health score (0-10000)
     */
    function getPropertyHealthScore(uint256 propertyId) external view returns (uint256 score) {
        return propertyHealthScores[propertyId];
    }

    /**
     * @notice Get the full health history for a property
     * @param propertyId Property ID
     * @return history Array of health deltas
     */
    function getPropertyHealthHistory(uint256 propertyId) external view returns (HealthDelta[] memory history) {
        return propertyHealthHistory[propertyId];
    }
}
