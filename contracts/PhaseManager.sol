// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface IPropertyToken {
    enum Phase { County, State, National, International }
    
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
    function phaseAllocations(uint256 propertyId, uint8 phase) external view returns (uint256);
    function phaseMinted(uint256 propertyId, uint8 phase) external view returns (uint256);
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
 * @notice Dynamic phase advancement based on engagement analytics
 * @dev Advances phases when 75% engagement threshold OR full subscription is reached
 */
contract PhaseManager is AccessControl, AutomationCompatibleInterface {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    IPropertyToken public propertyToken;
    IGovernance public governance;

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

    // Events
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

        // Check for nudge triggers
        _checkNudges(propertyId, engagementPercent);

        // Check for early phase advancement
        _checkPhaseAdvancement(propertyId, engagementPercent);
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
     * @notice Check if phase should advance based on engagement
     * @param propertyId Property ID
     * @param engagementPercent Current engagement in basis points
     */
    function _checkPhaseAdvancement(uint256 propertyId, uint256 engagementPercent) internal {
        PropertyEngagement storage engagement = propertyEngagement[propertyId];
        
        // Check minimum engagement period
        if (block.timestamp < engagement.phaseStartTime + MIN_ENGAGEMENT_PERIOD) {
            return;
        }

        // Check engagement threshold
        if (engagementPercent >= ENGAGEMENT_THRESHOLD) {
            _advancePhaseByEngagement(propertyId, engagementPercent);
        }
    }

    /**
     * @notice Advance phase due to high engagement
     * @param propertyId Property ID
     * @param engagementPercent Engagement that triggered advancement
     */
    function _advancePhaseByEngagement(uint256 propertyId, uint256 engagementPercent) internal {
        (,,,,,,,uint8 currentPhase,,) = propertyToken.getProperty(propertyId);
        
        if (currentPhase < 3) { // Not at International yet
            propertyToken.advancePhase(propertyId);
            
            // Reset phase tracking
            propertyEngagement[propertyId].phaseStartTime = block.timestamp;
            propertyEngagement[propertyId].activeVoters = 0;
            
            emit PhaseAdvancedByEngagement(propertyId, currentPhase, currentPhase + 1, engagementPercent);
        }
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
     * @notice Manually trigger phase check (for subscription-based advancement)
     * @param propertyId Property ID
     */
    function checkSubscriptionAdvancement(uint256 propertyId) external {
        (,,,,,,,uint8 currentPhase,,) = propertyToken.getProperty(propertyId);
        
        uint256 phaseAllocation = propertyToken.phaseAllocations(propertyId, currentPhase);
        uint256 phaseMinted = propertyToken.phaseMinted(propertyId, currentPhase);

        if (phaseMinted >= phaseAllocation && currentPhase < 3) {
            propertyToken.advancePhase(propertyId);
            
            // Reset tracking for new phase
            propertyEngagement[propertyId].phaseStartTime = block.timestamp;
            propertyEngagement[propertyId].activeVoters = 0;
            
            emit PhaseAdvancedBySubscription(propertyId, currentPhase, currentPhase + 1);
        }
    }

    // ============ Chainlink Automation ============

    /**
     * @notice Chainlink Automation check
     */
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 0; i < trackedProperties.length; i++) {
            uint256 propertyId = trackedProperties[i];
            PropertyEngagement storage engagement = propertyEngagement[propertyId];
            
            if (!engagement.isTracking) continue;

            // Check if minimum period passed
            if (block.timestamp < engagement.phaseStartTime + MIN_ENGAGEMENT_PERIOD) continue;

            uint256 engagementPercent = calculateEngagement(propertyId);
            
            if (engagementPercent >= ENGAGEMENT_THRESHOLD) {
                return (true, abi.encode(propertyId, engagementPercent));
            }
        }
        return (false, "");
    }

    /**
     * @notice Chainlink Automation perform
     */
    function performUpkeep(bytes calldata performData) external override {
        (uint256 propertyId, ) = abi.decode(performData, (uint256, uint256));
        
        PropertyEngagement storage engagement = propertyEngagement[propertyId];
        require(engagement.isTracking, "Not tracking");
        require(block.timestamp >= engagement.phaseStartTime + MIN_ENGAGEMENT_PERIOD, "Too early");
        
        // Re-verify engagement
        uint256 currentEngagement = calculateEngagement(propertyId);
        require(currentEngagement >= ENGAGEMENT_THRESHOLD, "Threshold not met");

        _advancePhaseByEngagement(propertyId, currentEngagement);
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
     * @notice Get all tracked properties
     */
    function getTrackedProperties() external view returns (uint256[] memory) {
        return trackedProperties;
    }

    /**
     * @notice Claim engagement bonus when threshold is met (vote-to-earn)
     * @dev Mints bonus tokens to active participants when 75% engagement is reached
     * @param propertyId Property ID
     */
    function claimEngagementBonus(uint256 propertyId) external {
        require(propertyToken.whitelist(msg.sender), "Not whitelisted");
        require(!hasClaimed[propertyId][msg.sender], "Already claimed");
        
        PropertyEngagement storage engagement = propertyEngagement[propertyId];
        require(engagement.isTracking, "Not tracking");
        require(calculateEngagement(propertyId) >= ENGAGEMENT_THRESHOLD, "Threshold not met");
        require(block.timestamp >= engagement.phaseStartTime + MIN_ENGAGEMENT_PERIOD, "Too early");

        // Mark as claimed before minting (reentrancy protection)
        hasClaimed[propertyId][msg.sender] = true;

        // Mint bonus tokens (requires MINTER_ROLE granted to PhaseManager)
        propertyToken.mintTokens(propertyId, msg.sender, BONUS_TOKENS);

        emit BonusClaimed(propertyId, msg.sender, BONUS_TOKENS);
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

        // Check for nudge triggers
        _checkNudges(propertyId, engagementPercent);

        // Check for early phase advancement
        _checkPhaseAdvancement(propertyId, engagementPercent);
    }

    /**
     * @notice Claim poll-boosted engagement bonus
     * @dev Extra bonus tokens for poll participants when threshold met
     * @param propertyId Property ID
     */
    function claimPollBoostBonus(uint256 propertyId) external {
        require(propertyToken.whitelist(msg.sender), "Not whitelisted");
        require(pollParticipated[propertyId][msg.sender], "Did not participate in polls");
        require(!hasClaimed[propertyId][msg.sender], "Already claimed");
        
        PropertyEngagement storage engagement = propertyEngagement[propertyId];
        require(engagement.isTracking, "Not tracking");
        require(calculateEngagement(propertyId) >= ENGAGEMENT_THRESHOLD, "Threshold not met");
        require(block.timestamp >= engagement.phaseStartTime + MIN_ENGAGEMENT_PERIOD, "Too early");

        hasClaimed[propertyId][msg.sender] = true;

        // Poll participants get 2x bonus
        uint256 bonusAmount = BONUS_TOKENS * 2;
        propertyToken.mintTokens(propertyId, msg.sender, bonusAmount);

        emit BonusClaimed(propertyId, msg.sender, bonusAmount);
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
     * @notice Update engagement based on governance demand signals
     * @dev Reads demand bars from Governance contract, triggers phase advancement
     *      if PropertyDevelopment demand exceeds threshold. Like SimCity's advisor system.
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
        
        // Check if PropertyDevelopment demand meets engagement threshold
        if (propDemandBps >= ENGAGEMENT_THRESHOLD && 
            block.timestamp >= engagement.phaseStartTime + MIN_ENGAGEMENT_PERIOD) {
            _advancePhaseByEngagement(propertyId, propDemandBps);
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
        
        PropertyEngagement storage engagement = propertyEngagement[propertyId];
        isReadyForAdvancement = engagement.isTracking && 
            demandBars[0] >= ENGAGEMENT_THRESHOLD &&
            block.timestamp >= engagement.phaseStartTime + MIN_ENGAGEMENT_PERIOD;
    }
}
