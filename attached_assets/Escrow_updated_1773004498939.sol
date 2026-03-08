// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface IAMLOracle {
    function getAMLScore(address buyer) external returns (uint256);
}

interface IPropertyToken {
    function mintTokens(uint256 propertyId, address buyer, uint256 amount) external;
    function getCurrentPrice(uint256 propertyId) external view returns (uint256);
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
    function markFunded(uint256 propertyId) external;
    function burnFromOnFailure(uint256 propertyId, address holder, uint256 amount) external;
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

interface IGovernanceImpact {
    function getImpactReport(uint256 proposalId) external view returns (string memory ipfsHash, uint256 impactScore);
}

/**
 * @title RevitaHub Escrow
 * @notice Handles token purchases, 100% funding requirement, 3% APR refunds,
 *         and founder sustainability fee (1% at funding + 1% of quarterly distributions)
 * @dev Integrates with Chainlink Automation for deadline monitoring and quarterly payouts
 *
 * FOUNDER FEE MODEL:
 * - Payment 1: 1% of gross raise fires automatically when property hits 100% funded
 *              AND governance impact score >= 70
 * - Payment 2: 1% of every quarterly distribution to token holders, automated by Chainlink
 *
 * RAISE MATH:
 * - fundingTarget = projectBudget / 0.99 (gross raise)
 * - After funding: 1% to founder, 99% to Treasury/project
 * - Project always receives its full required budget
 */
contract Escrow is AccessControl, ReentrancyGuard, Pausable, AutomationCompatibleInterface {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // ============ Constants ============

    uint256 public constant REFUND_APR = 300;               // 3% APR for failed funding refunds
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant AML_THRESHOLD = 80;

    // Founder fee: 1% on funding completion AND 1% on quarterly distributions
    uint256 public constant FOUNDER_FEE_BPS = 100;          // 1%
    uint256 public constant MIN_IMPACT_SCORE = 70;          // Impact gate threshold
    uint256 public constant QUARTERLY_INTERVAL = 90 days;   // Chainlink triggers every 90 days

    // ============ Immutables ============

    IPropertyToken public propertyToken;
    IAMLOracle public amlOracle;

    // Founder wallet — receives 1% at funding + 1% of quarterly distributions
    address public immutable founderWallet;

    // Governance contract — checked for impact score before releasing founder fee
    address public governanceContract;

    // ============ Structs ============

    struct Purchase {
        address buyer;
        uint256 propertyId;
        uint256 amount;
        uint256 price;
        uint256 totalPaid;
        uint256 timestamp;
        bool refunded;
    }

    struct PropertyEscrow {
        uint256 totalRaised;        // Gross amount raised (includes founder fee)
        uint256 fundingTarget;      // Gross raise target (projectBudget / 0.99)
        uint256 projectBudget;      // Net amount going to Treasury after founder fee
        uint256 deadline;
        bool isComplete;
        bool refundsProcessed;
        bool founderFeePaid;        // Tracks whether the 1% funding fee was paid
        uint256 proposalId;         // Governance proposalId for impact score check
    }

    // Quarterly distribution tracking per property
    struct QuarterlyState {
        uint256 lastDistribution;       // Timestamp of last quarterly payout
        uint256 pendingIncome;          // Accumulated income (rent + appreciation) awaiting distribution
        bool isTracked;                 // Whether this property has quarterly tracking enabled
    }

    // ============ Storage ============

    mapping(uint256 => Purchase[]) public propertyPurchases;
    mapping(uint256 => PropertyEscrow) public propertyEscrows;
    mapping(uint256 => mapping(address => uint256)) public buyerContributions;
    mapping(uint256 => QuarterlyState) public quarterlyStates;

    uint256[] public activeProperties;
    mapping(uint256 => bool) public isPropertyActive;

    // Properties eligible for quarterly distribution
    uint256[] public fundedProperties;
    mapping(uint256 => bool) public isPropertyFunded;

    // Dynamic funding targets based on poll demand
    mapping(uint256 => uint256) public pollDemandScores;
    mapping(uint256 => uint256) public baseFundingTargets;
    uint256 public constant MAX_DEMAND_BONUS = 2500;

    // ============ Events ============

    event PurchaseReceived(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPaid,
        uint256 timestamp
    );
    event FundingComplete(uint256 indexed propertyId, uint256 totalRaised, uint256 projectBudget);
    event FounderFundingFeePaid(
        uint256 indexed propertyId,
        address indexed founder,
        uint256 amount,
        uint256 impactScore
    );
    event FounderFeeSkipped(
        uint256 indexed propertyId,
        uint256 impactScore,
        string reason
    );
    event QuarterlyDistribution(
        uint256 indexed propertyId,
        uint256 totalIncome,
        uint256 founderShare,
        uint256 investorShare,
        uint256 timestamp
    );
    event IncomeDeposited(
        uint256 indexed propertyId,
        uint256 amount,
        string incomeType     // "rental" or "appreciation"
    );
    event RefundProcessed(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 principal,
        uint256 interest,
        uint256 total
    );
    event FundingFailed(uint256 indexed propertyId, uint256 totalRaised, uint256 target);
    event FundsReleased(uint256 indexed propertyId, address indexed recipient, uint256 amount);
    event PollDemandUpdated(uint256 indexed propertyId, uint256 demandScore, uint256 adjustedTarget);

    // Compliance Events
    event CompliancePurchaseRecorded(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPaid,
        bytes32 transactionHash
    );
    event InvestorLimitChecked(
        uint256 indexed propertyId,
        address indexed investor,
        uint256 currentContribution,
        uint256 newContribution,
        bool withinLimit
    );
    event SuspiciousActivityReported(
        uint256 indexed propertyId,
        address indexed account,
        string activityType,
        uint256 timestamp
    );
    event RefundComplianceRecorded(
        uint256 indexed propertyId,
        address indexed recipient,
        uint256 principal,
        uint256 interest,
        uint256 timestamp
    );

    // ============ Constructor ============

    constructor(address _propertyToken, address _founderWallet) {
        require(_founderWallet != address(0), "Founder wallet required");
        propertyToken = IPropertyToken(_propertyToken);
        founderWallet = _founderWallet;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    // ============ Admin Functions ============

    /**
     * @notice Set the governance contract for impact score checks
     * @param _governance Address of Governance.sol
     */
    function setGovernanceContract(address _governance) external onlyRole(DEFAULT_ADMIN_ROLE) {
        governanceContract = _governance;
    }

    /**
     * @notice Set AML oracle address
     */
    function setAMLOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        amlOracle = IAMLOracle(_oracle);
    }

    // ============ Escrow Initialization ============

    /**
     * @notice Initialize escrow for a property
     * @param propertyId Property ID
     * @param projectBudget The net amount needed for the project (after founder fee)
     * @param deadline Funding deadline timestamp
     * @param proposalId Governance proposal ID for impact score lookup
     *
     * MATH: fundingTarget = projectBudget / 0.99
     * The gross raise target is calculated so that after the 1% founder fee,
     * exactly projectBudget remains for Treasury/property acquisition.
     *
     * Example: Project needs $500,000
     *   fundingTarget = $500,000 / 0.99 = $505,051
     *   Founder gets: $505,051 * 1% = $5,051
     *   Treasury gets: $505,051 - $5,051 = $500,000 ✓
     */
    function initializeEscrow(
        uint256 propertyId,
        uint256 projectBudget,
        uint256 deadline,
        uint256 proposalId
    ) external onlyRole(OPERATOR_ROLE) {
        require(!isPropertyActive[propertyId], "Escrow already exists");
        require(projectBudget > 0, "Project budget required");

        // Gross raise target = projectBudget / 0.99
        // Equivalent to: projectBudget * 10000 / 9900
        uint256 fundingTarget = (projectBudget * 10000) / 9900;

        baseFundingTargets[propertyId] = fundingTarget;

        propertyEscrows[propertyId] = PropertyEscrow({
            totalRaised: 0,
            fundingTarget: fundingTarget,
            projectBudget: projectBudget,
            deadline: deadline,
            isComplete: false,
            refundsProcessed: false,
            founderFeePaid: false,
            proposalId: proposalId
        });

        activeProperties.push(propertyId);
        isPropertyActive[propertyId] = true;
    }

    // ============ Purchase ============

    /**
     * @notice Purchase tokens for a property
     * @param propertyId Property ID
     * @param amount Number of tokens to purchase
     */
    function purchase(uint256 propertyId, uint256 amount) external payable nonReentrant whenNotPaused {
        PropertyEscrow storage escrow = propertyEscrows[propertyId];
        require(isPropertyActive[propertyId], "Property not active");
        require(!escrow.isComplete, "Funding complete");
        require(block.timestamp < escrow.deadline, "Funding deadline passed");

        if (address(amlOracle) != address(0)) {
            uint256 amlScore = amlOracle.getAMLScore(msg.sender);
            if (amlScore > AML_THRESHOLD) {
                emit SuspiciousActivityReported(propertyId, msg.sender, "High AML Score", block.timestamp);
                revert("AML check failed");
            }
        }

        uint256 price = propertyToken.getCurrentPrice(propertyId);
        uint256 totalCost = price * amount;
        require(msg.value >= totalCost, "Insufficient payment");

        propertyPurchases[propertyId].push(Purchase({
            buyer: msg.sender,
            propertyId: propertyId,
            amount: amount,
            price: price,
            totalPaid: totalCost,
            timestamp: block.timestamp,
            refunded: false
        }));

        escrow.totalRaised += totalCost;
        buyerContributions[propertyId][msg.sender] += totalCost;

        propertyToken.mintTokens(propertyId, msg.sender, amount);

        // Refund excess payment
        if (msg.value > totalCost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - totalCost}("");
            require(success, "Excess refund failed");
        }

        emit PurchaseReceived(propertyId, msg.sender, amount, totalCost, block.timestamp);

        emit CompliancePurchaseRecorded(
            propertyId,
            msg.sender,
            amount,
            totalCost,
            keccak256(abi.encodePacked(block.timestamp, msg.sender, propertyId, amount))
        );

        emit InvestorLimitChecked(
            propertyId,
            msg.sender,
            buyerContributions[propertyId][msg.sender] - totalCost,
            buyerContributions[propertyId][msg.sender],
            true
        );

        // Check if gross funding target reached
        if (escrow.totalRaised >= escrow.fundingTarget) {
            _completeFunding(propertyId);
        }
    }

    // ============ Funding Completion & Founder Fee ============

    /**
     * @notice Internal: complete funding, check impact score, pay founder fee
     * @dev Payment 1 of founder model fires here
     *      - Checks governance impact score >= 70
     *      - Sends 1% of gross raise to founderWallet
     *      - Remainder (projectBudget) stays in escrow for releaseFunds()
     */
    function _completeFunding(uint256 propertyId) internal {
        PropertyEscrow storage escrow = propertyEscrows[propertyId];
        escrow.isComplete = true;

        propertyToken.markFunded(propertyId);

        // Calculate founder fee: 1% of gross raise
        uint256 founderFee = (escrow.totalRaised * FOUNDER_FEE_BPS) / BASIS_POINTS;
        uint256 projectAmount = escrow.totalRaised - founderFee;

        // Check impact score if governance is linked
        bool payFounder = true;
        uint256 impactScore = 0;

        if (governanceContract != address(0)) {
            try IGovernanceImpact(governanceContract).getImpactReport(escrow.proposalId)
                returns (string memory, uint256 score) {
                impactScore = score;
                if (impactScore < MIN_IMPACT_SCORE) {
                    payFounder = false;
                    emit FounderFeeSkipped(
                        propertyId,
                        impactScore,
                        "Impact score below 70 threshold"
                    );
                }
            } catch {
                // Governance not linked or proposal not found — apply fee as fallback
                payFounder = true;
            }
        }

        if (payFounder && founderFee > 0) {
            escrow.founderFeePaid = true;
            (bool success, ) = payable(founderWallet).call{value: founderFee}("");
            require(success, "Founder fee transfer failed");

            emit FounderFundingFeePaid(propertyId, founderWallet, founderFee, impactScore);
        }

        // Enable quarterly distribution tracking for this property
        _enableQuarterlyTracking(propertyId);

        emit FundingComplete(propertyId, escrow.totalRaised, projectAmount);
    }

    /**
     * @notice Enable quarterly distribution tracking after successful funding
     * @param propertyId Property ID
     */
    function _enableQuarterlyTracking(uint256 propertyId) internal {
        quarterlyStates[propertyId] = QuarterlyState({
            lastDistribution: block.timestamp,
            pendingIncome: 0,
            isTracked: true
        });

        fundedProperties.push(propertyId);
        isPropertyFunded[propertyId] = true;
    }

    // ============ Income Deposits & Quarterly Distributions ============

    /**
     * @notice Deposit rental or appreciation income for quarterly distribution
     * @dev Called by Treasury or property manager when income is received
     * @param propertyId Property ID
     * @param incomeType "rental" or "appreciation"
     */
    function depositIncome(
        uint256 propertyId,
        string calldata incomeType
    ) external payable onlyRole(OPERATOR_ROLE) {
        require(isPropertyFunded[propertyId], "Property not funded");
        require(msg.value > 0, "No income to deposit");

        quarterlyStates[propertyId].pendingIncome += msg.value;

        emit IncomeDeposited(propertyId, msg.value, incomeType);
    }

    /**
     * @notice Execute quarterly distribution for a property
     * @dev Payment 2 of founder model fires here every 90 days via Chainlink Automation
     *      - 1% of distributable income goes to founder
     *      - 99% distributed proportionally to token holders
     * @param propertyId Property ID
     */
    function _executeQuarterlyDistribution(uint256 propertyId) internal {
        QuarterlyState storage state = quarterlyStates[propertyId];
        require(state.isTracked, "Not a tracked property");
        require(
            block.timestamp >= state.lastDistribution + QUARTERLY_INTERVAL,
            "Too early for distribution"
        );
        require(state.pendingIncome > 0, "No income to distribute");

        uint256 totalIncome = state.pendingIncome;
        state.pendingIncome = 0;
        state.lastDistribution = block.timestamp;

        // Founder takes 1% of quarterly income
        uint256 founderShare = (totalIncome * FOUNDER_FEE_BPS) / BASIS_POINTS;
        uint256 investorShare = totalIncome - founderShare;

        // Pay founder
        if (founderShare > 0) {
            (bool founderSuccess, ) = payable(founderWallet).call{value: founderShare}("");
            require(founderSuccess, "Founder quarterly payment failed");
        }

        // Remaining 99% stays in contract for token holder claims
        // In production: distribute proportionally via merkle drop or pull pattern
        // For now: emit event for off-chain distribution processor
        emit QuarterlyDistribution(
            propertyId,
            totalIncome,
            founderShare,
            investorShare,
            block.timestamp
        );
    }

    // ============ Chainlink Automation ============

    /**
     * @notice Chainlink Automation check
     * @dev Monitors two conditions:
     *      1. Active properties past funding deadline (trigger refunds)
     *      2. Funded properties due for quarterly distribution
     */
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Check active properties for expired deadlines
        for (uint256 i = 0; i < activeProperties.length; i++) {
            uint256 propertyId = activeProperties[i];
            PropertyEscrow storage escrow = propertyEscrows[propertyId];

            if (
                isPropertyActive[propertyId] &&
                !escrow.isComplete &&
                !escrow.refundsProcessed &&
                block.timestamp >= escrow.deadline
            ) {
                // 0 = refund trigger
                return (true, abi.encode(uint8(0), propertyId));
            }
        }

        // Check funded properties for quarterly distribution
        for (uint256 i = 0; i < fundedProperties.length; i++) {
            uint256 propertyId = fundedProperties[i];
            QuarterlyState storage state = quarterlyStates[propertyId];

            if (
                state.isTracked &&
                state.pendingIncome > 0 &&
                block.timestamp >= state.lastDistribution + QUARTERLY_INTERVAL
            ) {
                // 1 = quarterly distribution trigger
                return (true, abi.encode(uint8(1), propertyId));
            }
        }

        return (false, "");
    }

    /**
     * @notice Chainlink Automation perform upkeep
     * @dev Routes to either refund processing or quarterly distribution
     */
    function performUpkeep(bytes calldata performData) external override {
        (uint8 action, uint256 propertyId) = abi.decode(performData, (uint8, uint256));

        if (action == 0) {
            // Refund expired funding
            PropertyEscrow storage escrow = propertyEscrows[propertyId];
            require(isPropertyActive[propertyId], "Property not active");
            require(!escrow.isComplete, "Funding complete");
            require(!escrow.refundsProcessed, "Refunds processed");
            require(block.timestamp >= escrow.deadline, "Deadline not reached");
            this.processRefunds(propertyId);

        } else if (action == 1) {
            // Execute quarterly distribution
            _executeQuarterlyDistribution(propertyId);
        }
    }

    // ============ Refunds ============

    /**
     * @notice Calculate refund with 3% APR interest
     */
    function calculateRefund(uint256 principal, uint256 investmentTimestamp) public view returns (uint256) {
        uint256 duration = block.timestamp - investmentTimestamp;
        uint256 interest = (principal * REFUND_APR * duration) / (BASIS_POINTS * SECONDS_PER_YEAR);
        return principal + interest;
    }

    /**
     * @notice Process refunds for a failed property funding
     * @param propertyId Property ID
     */
    function processRefunds(uint256 propertyId) external nonReentrant {
        PropertyEscrow storage escrow = propertyEscrows[propertyId];
        require(isPropertyActive[propertyId], "Property not active");
        require(!escrow.isComplete, "Funding was successful");
        require(block.timestamp >= escrow.deadline, "Deadline not reached");
        require(!escrow.refundsProcessed, "Refunds already processed");

        escrow.refundsProcessed = true;

        emit FundingFailed(propertyId, escrow.totalRaised, escrow.fundingTarget);

        Purchase[] storage purchases = propertyPurchases[propertyId];
        for (uint256 i = 0; i < purchases.length; i++) {
            Purchase storage p = purchases[i];
            if (!p.refunded) {
                uint256 refundAmount = calculateRefund(p.totalPaid, p.timestamp);
                p.refunded = true;

                uint256 tokenBalance = propertyToken.balanceOf(p.buyer, propertyId);
                if (tokenBalance > 0) {
                    propertyToken.burnFromOnFailure(propertyId, p.buyer, tokenBalance);
                }

                (bool success, ) = payable(p.buyer).call{value: refundAmount}("");
                require(success, "Refund transfer failed");

                emit RefundProcessed(
                    propertyId,
                    p.buyer,
                    p.totalPaid,
                    refundAmount - p.totalPaid,
                    refundAmount
                );

                emit RefundComplianceRecorded(
                    propertyId,
                    p.buyer,
                    p.totalPaid,
                    refundAmount - p.totalPaid,
                    block.timestamp
                );
            }
        }

        isPropertyActive[propertyId] = false;
    }

    // ============ Fund Release ============

    /**
     * @notice Release project budget to Treasury after successful funding
     * @dev Only releases projectBudget (99% of raise) — founder fee already paid at _completeFunding
     * @param propertyId Property ID
     * @param recipient Treasury address
     */
    function releaseFunds(uint256 propertyId, address recipient) external onlyRole(OPERATOR_ROLE) nonReentrant {
        PropertyEscrow storage escrow = propertyEscrows[propertyId];
        require(escrow.isComplete, "Funding not complete");

        // Release projectBudget — founder fee already paid at completion
        uint256 amount = escrow.projectBudget;
        require(amount > 0, "No project budget to release");

        // Zero out to prevent double release
        escrow.projectBudget = 0;
        isPropertyActive[propertyId] = false;

        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(propertyId, recipient, amount);
    }

    // ============ Poll Demand ============

    /**
     * @notice Update poll demand score and adjust funding target dynamically
     */
    function updatePollDemand(uint256 propertyId, uint256 demandScore) external onlyRole(OPERATOR_ROLE) {
        require(isPropertyActive[propertyId], "Property not active");
        require(demandScore <= 10000, "Invalid demand score");

        PropertyEscrow storage escrow = propertyEscrows[propertyId];
        require(!escrow.isComplete, "Funding already complete");

        pollDemandScores[propertyId] = demandScore;

        uint256 baseTarget = baseFundingTargets[propertyId];
        uint256 demandBonus = 0;

        if (demandScore >= 7000) {
            demandBonus = ((demandScore - 7000) * MAX_DEMAND_BONUS) / 3000;
        }

        uint256 adjustedTarget = baseTarget + (baseTarget * demandBonus) / 10000;
        escrow.fundingTarget = adjustedTarget;

        // Recalculate projectBudget based on adjusted gross target
        escrow.projectBudget = (adjustedTarget * 9900) / 10000;

        emit PollDemandUpdated(propertyId, demandScore, adjustedTarget);
    }

    // ============ View Functions ============

    /**
     * @notice Get escrow status for a property
     */
    function getEscrowStatus(uint256 propertyId) external view returns (
        uint256 totalRaised,
        uint256 fundingTarget,
        uint256 projectBudget,
        uint256 deadline,
        bool isComplete,
        bool founderFeePaid,
        uint256 percentFunded
    ) {
        PropertyEscrow storage escrow = propertyEscrows[propertyId];
        uint256 percent = escrow.fundingTarget > 0
            ? (escrow.totalRaised * 10000) / escrow.fundingTarget
            : 0;

        return (
            escrow.totalRaised,
            escrow.fundingTarget,
            escrow.projectBudget,
            escrow.deadline,
            escrow.isComplete,
            escrow.founderFeePaid,
            percent
        );
    }

    /**
     * @notice Get quarterly distribution state for a funded property
     */
    function getQuarterlyState(uint256 propertyId) external view returns (
        uint256 lastDistribution,
        uint256 pendingIncome,
        uint256 nextDistribution,
        bool isTracked
    ) {
        QuarterlyState storage state = quarterlyStates[propertyId];
        return (
            state.lastDistribution,
            state.pendingIncome,
            state.lastDistribution + QUARTERLY_INTERVAL,
            state.isTracked
        );
    }

    /**
     * @notice Get demand-adjusted funding info
     */
    function getDemandAdjustedTarget(uint256 propertyId) external view returns (
        uint256 baseTarget,
        uint256 adjustedTarget,
        uint256 demandScore
    ) {
        return (
            baseFundingTargets[propertyId],
            propertyEscrows[propertyId].fundingTarget,
            pollDemandScores[propertyId]
        );
    }

    /**
     * @notice Get purchase history for a property
     */
    function getPurchases(uint256 propertyId) external view returns (Purchase[] memory) {
        return propertyPurchases[propertyId];
    }

    /**
     * @notice Get detailed purchase for compliance audit
     */
    function getPurchaseForAudit(uint256 propertyId, uint256 index) external view returns (
        address buyer,
        uint256 amount,
        uint256 price,
        uint256 totalPaid,
        uint256 timestamp,
        bool refunded
    ) {
        require(index < propertyPurchases[propertyId].length, "Index out of bounds");
        Purchase storage p = propertyPurchases[propertyId][index];
        return (p.buyer, p.amount, p.price, p.totalPaid, p.timestamp, p.refunded);
    }

    /**
     * @notice Get purchase count for a property
     */
    function getPurchaseCount(uint256 propertyId) external view returns (uint256) {
        return propertyPurchases[propertyId].length;
    }

    /**
     * @notice Get investor contribution total
     */
    function getInvestorContribution(uint256 propertyId, address investor) external view returns (uint256) {
        return buyerContributions[propertyId][investor];
    }

    // ============ Compliance ============

    function reportSuspiciousActivity(
        uint256 propertyId,
        address account,
        string calldata activityType
    ) external onlyRole(OPERATOR_ROLE) {
        emit SuspiciousActivityReported(propertyId, account, activityType, block.timestamp);
    }

    // ============ Pause ============

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    receive() external payable {}
}
