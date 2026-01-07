// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

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

/**
 * @title RevitaHub Escrow
 * @notice Handles token purchases, 100% funding requirement, and 3% APR refunds
 * @dev Integrates with Chainlink Automation for deadline monitoring
 */
contract Escrow is AccessControl, ReentrancyGuard, Pausable, AutomationCompatibleInterface {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    // 3% APR for refunds (in basis points)
    uint256 public constant REFUND_APR = 300;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    IPropertyToken public propertyToken;

    // Purchase record
    struct Purchase {
        address buyer;
        uint256 propertyId;
        uint256 amount;
        uint256 price;
        uint256 totalPaid;
        uint256 timestamp;
        bool refunded;
    }

    // Property escrow state
    struct PropertyEscrow {
        uint256 totalRaised;
        uint256 fundingTarget;
        uint256 deadline;
        bool isComplete;
        bool refundsProcessed;
    }

    // Storage
    mapping(uint256 => Purchase[]) public propertyPurchases;
    mapping(uint256 => PropertyEscrow) public propertyEscrows;
    mapping(uint256 => mapping(address => uint256)) public buyerContributions;
    
    // All property IDs for automation
    uint256[] public activeProperties;
    mapping(uint256 => bool) public isPropertyActive;

    // Events
    event PurchaseReceived(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPaid,
        uint256 timestamp
    );
    event FundingComplete(uint256 indexed propertyId, uint256 totalRaised);
    event RefundProcessed(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 principal,
        uint256 interest,
        uint256 total
    );
    event FundingFailed(uint256 indexed propertyId, uint256 totalRaised, uint256 target);
    event FundsReleased(uint256 indexed propertyId, address indexed recipient, uint256 amount);

    constructor(address _propertyToken) {
        propertyToken = IPropertyToken(_propertyToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @notice Initialize escrow for a property
     * @param propertyId Property ID
     * @param fundingTarget Required funding amount
     * @param deadline Funding deadline timestamp
     */
    function initializeEscrow(
        uint256 propertyId,
        uint256 fundingTarget,
        uint256 deadline
    ) external onlyRole(OPERATOR_ROLE) {
        require(!isPropertyActive[propertyId], "Escrow already exists");
        
        propertyEscrows[propertyId] = PropertyEscrow({
            totalRaised: 0,
            fundingTarget: fundingTarget,
            deadline: deadline,
            isComplete: false,
            refundsProcessed: false
        });

        activeProperties.push(propertyId);
        isPropertyActive[propertyId] = true;
    }

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

        uint256 price = propertyToken.getCurrentPrice(propertyId);
        uint256 totalCost = price * amount;
        require(msg.value >= totalCost, "Insufficient payment");

        // Record purchase
        propertyPurchases[propertyId].push(Purchase({
            buyer: msg.sender,
            propertyId: propertyId,
            amount: amount,
            price: price,
            totalPaid: totalCost,
            timestamp: block.timestamp,
            refunded: false
        }));

        // Update escrow state
        escrow.totalRaised += totalCost;
        buyerContributions[propertyId][msg.sender] += totalCost;

        // Mint tokens to buyer
        propertyToken.mintTokens(propertyId, msg.sender, amount);

        // Refund excess payment
        if (msg.value > totalCost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - totalCost}("");
            require(success, "Refund failed");
        }

        emit PurchaseReceived(propertyId, msg.sender, amount, totalCost, block.timestamp);

        // Check if funding target reached
        if (escrow.totalRaised >= escrow.fundingTarget) {
            _completeFunding(propertyId);
        }
    }

    /**
     * @notice Calculate refund with 3% APR interest
     * @param principal Original investment amount
     * @param investmentTimestamp When the investment was made
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

        // Process all refunds and burn tokens
        Purchase[] storage purchases = propertyPurchases[propertyId];
        for (uint256 i = 0; i < purchases.length; i++) {
            Purchase storage p = purchases[i];
            if (!p.refunded) {
                uint256 refundAmount = calculateRefund(p.totalPaid, p.timestamp);
                p.refunded = true;
                
                // Burn buyer's tokens
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
            }
        }

        // Deactivate property
        isPropertyActive[propertyId] = false;
    }

    /**
     * @notice Internal function to complete funding
     * @param propertyId Property ID
     */
    function _completeFunding(uint256 propertyId) internal {
        PropertyEscrow storage escrow = propertyEscrows[propertyId];
        escrow.isComplete = true;
        
        propertyToken.markFunded(propertyId);
        
        emit FundingComplete(propertyId, escrow.totalRaised);
    }

    /**
     * @notice Release funds to property wallet after successful funding
     * @param propertyId Property ID
     * @param recipient Recipient address
     */
    function releaseFunds(uint256 propertyId, address recipient) external onlyRole(OPERATOR_ROLE) nonReentrant {
        PropertyEscrow storage escrow = propertyEscrows[propertyId];
        require(escrow.isComplete, "Funding not complete");
        require(escrow.totalRaised > 0, "No funds to release");

        uint256 amount = escrow.totalRaised;
        escrow.totalRaised = 0;
        isPropertyActive[propertyId] = false;

        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(propertyId, recipient, amount);
    }

    /**
     * @notice Get purchase history for a property
     * @param propertyId Property ID
     */
    function getPurchases(uint256 propertyId) external view returns (Purchase[] memory) {
        return propertyPurchases[propertyId];
    }

    /**
     * @notice Get escrow status for a property
     * @param propertyId Property ID
     */
    function getEscrowStatus(uint256 propertyId) external view returns (
        uint256 totalRaised,
        uint256 fundingTarget,
        uint256 deadline,
        bool isComplete,
        uint256 percentFunded
    ) {
        PropertyEscrow storage escrow = propertyEscrows[propertyId];
        uint256 percent = escrow.fundingTarget > 0 
            ? (escrow.totalRaised * 10000) / escrow.fundingTarget 
            : 0;
        
        return (
            escrow.totalRaised,
            escrow.fundingTarget,
            escrow.deadline,
            escrow.isComplete,
            percent
        );
    }

    // ============ Chainlink Automation ============

    /**
     * @notice Chainlink Automation check for deadline monitoring
     */
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 0; i < activeProperties.length; i++) {
            uint256 propertyId = activeProperties[i];
            PropertyEscrow storage escrow = propertyEscrows[propertyId];
            
            if (isPropertyActive[propertyId] && 
                !escrow.isComplete && 
                !escrow.refundsProcessed &&
                block.timestamp >= escrow.deadline) {
                return (true, abi.encode(propertyId));
            }
        }
        return (false, "");
    }

    /**
     * @notice Chainlink Automation perform upkeep
     */
    function performUpkeep(bytes calldata performData) external override {
        uint256 propertyId = abi.decode(performData, (uint256));
        PropertyEscrow storage escrow = propertyEscrows[propertyId];
        
        // Re-validate conditions
        require(isPropertyActive[propertyId], "Property not active");
        require(!escrow.isComplete, "Funding complete");
        require(!escrow.refundsProcessed, "Refunds processed");
        require(block.timestamp >= escrow.deadline, "Deadline not reached");

        // Trigger refund processing
        this.processRefunds(propertyId);
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Required for receiving ETH for refund interest buffer
     */
    receive() external payable {}
}
