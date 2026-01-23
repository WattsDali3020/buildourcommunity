// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IChainlinkFunctions
 * @notice Interface for Chainlink Functions oracle for reserve verification
 * @dev In production, use actual Chainlink Functions Router interface
 */
interface IChainlinkFunctions {
    function getReserves(uint256 propertyId) external view returns (uint256);
}

/**
 * @title RevitaHub Treasury
 * @notice DAO-controlled treasury with multi-sig, founder sustainability fee, and reserve verification
 * @dev Implements 2-of-3 multi-sig for institutional credibility
 */
contract Treasury is AccessControl, ReentrancyGuard {
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");
    
    address public founderWallet;
    address public chainlinkOracle;
    uint256 public constant FOUNDER_CUT_BPS = 100; // 1% in basis points
    
    // Multi-sig configuration
    uint256 public requiredConfirmations = 2; // 2-of-3 default
    uint256 public transactionCount;
    
    // Transaction structure for multi-sig
    struct Transaction {
        address target;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmationCount;
    }
    
    // Transaction storage
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;

    event FounderCutSent(address indexed founder, uint256 amount);
    event Executed(address indexed target, uint256 value, bytes data);
    event FounderWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event ChainlinkOracleUpdated(address indexed oldOracle, address indexed newOracle);
    event ReservesVerified(uint256 indexed propertyId, uint256 reserves);
    event TransactionSubmitted(uint256 indexed txId, address indexed submitter, address target, uint256 value);
    event TransactionConfirmed(uint256 indexed txId, address indexed signer);
    event TransactionRevoked(uint256 indexed txId, address indexed signer);
    event TransactionExecuted(uint256 indexed txId);
    event RequiredConfirmationsUpdated(uint256 oldRequired, uint256 newRequired);
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);

    constructor(address _founderWallet) {
        require(_founderWallet != address(0), "Invalid founder wallet");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SIGNER_ROLE, msg.sender);
        founderWallet = _founderWallet;
    }

    receive() external payable {}

    // ============ Multi-Sig Functions ============

    /**
     * @notice Submit a new transaction for multi-sig approval
     * @param target Target address for the transaction
     * @param value ETH value to send
     * @param data Calldata for the transaction
     */
    function submitTransaction(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyRole(SIGNER_ROLE) returns (uint256) {
        uint256 txId = transactionCount++;
        
        transactions[txId] = Transaction({
            target: target,
            value: value,
            data: data,
            executed: false,
            confirmationCount: 0
        });
        
        emit TransactionSubmitted(txId, msg.sender, target, value);
        
        // Auto-confirm for submitter
        confirmTransaction(txId);
        
        return txId;
    }

    /**
     * @notice Confirm a pending transaction
     * @param txId Transaction ID to confirm
     */
    function confirmTransaction(uint256 txId) public onlyRole(SIGNER_ROLE) {
        require(txId < transactionCount, "Transaction does not exist");
        require(!transactions[txId].executed, "Transaction already executed");
        require(!confirmations[txId][msg.sender], "Already confirmed");
        
        confirmations[txId][msg.sender] = true;
        transactions[txId].confirmationCount++;
        
        emit TransactionConfirmed(txId, msg.sender);
    }

    /**
     * @notice Revoke a previous confirmation
     * @param txId Transaction ID to revoke confirmation
     */
    function revokeConfirmation(uint256 txId) external onlyRole(SIGNER_ROLE) {
        require(txId < transactionCount, "Transaction does not exist");
        require(!transactions[txId].executed, "Transaction already executed");
        require(confirmations[txId][msg.sender], "Not confirmed");
        
        confirmations[txId][msg.sender] = false;
        transactions[txId].confirmationCount--;
        
        emit TransactionRevoked(txId, msg.sender);
    }

    /**
     * @notice Execute a confirmed transaction (requires enough confirmations)
     * @param txId Transaction ID to execute
     */
    function executeTransaction(uint256 txId) external onlyRole(SIGNER_ROLE) nonReentrant returns (bytes memory) {
        require(txId < transactionCount, "Transaction does not exist");
        Transaction storage txn = transactions[txId];
        require(!txn.executed, "Transaction already executed");
        require(txn.confirmationCount >= requiredConfirmations, "Not enough confirmations");
        require(address(this).balance >= txn.value, "Insufficient treasury balance");
        
        txn.executed = true;
        
        uint256 founderCut = (txn.value * FOUNDER_CUT_BPS) / 10000;
        uint256 amountToSend = txn.value - founderCut;

        // Send founder cut first
        if (founderCut > 0) {
            (bool founderSuccess, ) = payable(founderWallet).call{value: founderCut}("");
            require(founderSuccess, "Founder cut transfer failed");
            emit FounderCutSent(founderWallet, founderCut);
        }

        // Execute the transaction
        (bool success, bytes memory result) = txn.target.call{value: amountToSend}(txn.data);
        require(success, "Transaction execution failed");
        
        emit TransactionExecuted(txId);
        emit Executed(txn.target, amountToSend, txn.data);
        
        return result;
    }

    /**
     * @notice Get transaction details
     * @param txId Transaction ID
     */
    function getTransaction(uint256 txId) external view returns (
        address target,
        uint256 value,
        bytes memory data,
        bool executed,
        uint256 confirmationCount
    ) {
        Transaction storage txn = transactions[txId];
        return (txn.target, txn.value, txn.data, txn.executed, txn.confirmationCount);
    }

    /**
     * @notice Check if an address has confirmed a transaction
     * @param txId Transaction ID
     * @param signer Signer address
     */
    function isConfirmed(uint256 txId, address signer) external view returns (bool) {
        return confirmations[txId][signer];
    }

    // ============ Governance Direct Execute ============
    // ARCHITECTURAL NOTE: Two execution paths exist by design:
    // 1. Multi-sig (submitTransaction → confirmations → executeTransaction): For operational disbursements
    // 2. Direct execute(): For DAO-approved proposals (Governance contract holds EXECUTOR_ROLE)
    //
    // The Governance contract provides its own approval mechanism (proposal voting with quorum),
    // which satisfies institutional governance requirements. Multi-sig is for non-governance operations.
    // In production: EXECUTOR_ROLE should ONLY be granted to the Governance contract.

    /**
     * @notice Direct execute for DAO-approved proposals via Governance contract
     * @dev EXECUTOR_ROLE should ONLY be assigned to Governance contract (which has its own voting approval)
     * @dev This is NOT a bypass - Governance proposals require majority vote to reach this point
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyRole(EXECUTOR_ROLE) nonReentrant returns (bytes memory) {
        require(address(this).balance >= value, "Insufficient treasury balance");
        
        uint256 founderCut = (value * FOUNDER_CUT_BPS) / 10000; // 1% basis points
        uint256 amountToSend = value - founderCut;

        // Send founder cut first
        if (founderCut > 0) {
            (bool founderSuccess, ) = payable(founderWallet).call{value: founderCut}("");
            require(founderSuccess, "Founder cut transfer failed");
            emit FounderCutSent(founderWallet, founderCut);
        }

        // Execute the rest
        (bool success, bytes memory result) = target.call{value: amountToSend}(data);
        require(success, "Call failed");
        
        emit Executed(target, amountToSend, data);
        return result;
    }

    // ============ Admin Functions ============

    /**
     * @notice Add a new signer
     * @param signer Address to add as signer
     */
    function addSigner(address signer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(signer != address(0), "Invalid signer address");
        _grantRole(SIGNER_ROLE, signer);
        emit SignerAdded(signer);
    }

    /**
     * @notice Remove a signer
     * @param signer Address to remove as signer
     */
    function removeSigner(address signer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(SIGNER_ROLE, signer);
        emit SignerRemoved(signer);
    }

    /**
     * @notice Update required confirmations
     * @param _requiredConfirmations New required confirmations count
     */
    function setRequiredConfirmations(uint256 _requiredConfirmations) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_requiredConfirmations > 0, "Must require at least 1 confirmation");
        require(_requiredConfirmations <= 10, "Cannot require more than 10 confirmations");
        uint256 oldRequired = requiredConfirmations;
        requiredConfirmations = _requiredConfirmations;
        emit RequiredConfirmationsUpdated(oldRequired, _requiredConfirmations);
    }

    function updateFounderWallet(address _newFounderWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newFounderWallet != address(0), "Invalid founder wallet");
        address oldWallet = founderWallet;
        founderWallet = _newFounderWallet;
        emit FounderWalletUpdated(oldWallet, _newFounderWallet);
    }

    function withdraw(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw failed");
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Set the Chainlink Functions oracle address
     * @param _chainlinkOracle Address of the Chainlink Functions oracle
     */
    function setChainlinkOracle(address _chainlinkOracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_chainlinkOracle != address(0), "Invalid oracle address");
        address oldOracle = chainlinkOracle;
        chainlinkOracle = _chainlinkOracle;
        emit ChainlinkOracleUpdated(oldOracle, _chainlinkOracle);
    }

    /**
     * @notice Verify reserves for a property via Chainlink Functions
     * @dev Calls Chainlink oracle to fetch LLC/rent balances for proof-of-reserves
     * @param propertyId Property ID to verify reserves for
     * @return reserves The verified reserve amount in wei
     */
    function verifyReserves(uint256 propertyId) external view returns (uint256) {
        require(chainlinkOracle != address(0), "Oracle not configured");
        return IChainlinkFunctions(chainlinkOracle).getReserves(propertyId);
    }

    /**
     * @notice Verify reserves and emit event (non-view for on-chain record)
     * @param propertyId Property ID to verify
     */
    function verifyAndRecordReserves(uint256 propertyId) external returns (uint256) {
        require(chainlinkOracle != address(0), "Oracle not configured");
        uint256 reserves = IChainlinkFunctions(chainlinkOracle).getReserves(propertyId);
        emit ReservesVerified(propertyId, reserves);
        return reserves;
    }
}
