// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IChainlinkFunctions
 * @notice Interface for Chainlink Functions oracle for reserve verification
 */
interface IChainlinkFunctions {
    function getReserves(uint256 propertyId) external view returns (uint256);
}

/**
 * @title RevitaHub Treasury
 * @notice DAO-controlled treasury with multi-sig and reserve verification
 * @dev Implements 2-of-3 multi-sig for institutional credibility
 *      Founder sustainability fee is now handled by Escrow.sol (1% at funding + 1% quarterly)
 */
contract Treasury is AccessControl, ReentrancyGuard {
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");
    
    address public chainlinkOracle;
    
    // Multi-sig configuration
    uint256 public requiredConfirmations = 2; // 2-of-3 default
    uint256 public transactionCount;
    
    // Relayer reimbursement for gasless voting
    uint256 public relayerReimbursementPool;
    uint256 public maxReimbursementPerTx = 0.01 ether;
    mapping(address => uint256) public relayerReimbursements;
    
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

    event Executed(address indexed target, uint256 value, bytes data);
    event ChainlinkOracleUpdated(address indexed oldOracle, address indexed newOracle);
    event ReservesVerified(uint256 indexed propertyId, uint256 reserves);
    event TransactionSubmitted(uint256 indexed txId, address indexed submitter, address target, uint256 value);
    event TransactionConfirmed(uint256 indexed txId, address indexed signer);
    event TransactionRevoked(uint256 indexed txId, address indexed signer);
    event TransactionExecuted(uint256 indexed txId);
    event RequiredConfirmationsUpdated(uint256 oldRequired, uint256 newRequired);
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    event RelayerReimbursed(address indexed relayer, uint256 amount, uint256 poolRemaining);
    event ReimbursementPoolFunded(uint256 amount, uint256 newTotal);
    event MaxReimbursementUpdated(uint256 oldMax, uint256 newMax);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SIGNER_ROLE, msg.sender);
    }

    receive() external payable {}

    // ============ Multi-Sig Functions ============

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
        
        confirmTransaction(txId);
        
        return txId;
    }

    function confirmTransaction(uint256 txId) public onlyRole(SIGNER_ROLE) {
        require(txId < transactionCount, "Transaction does not exist");
        require(!transactions[txId].executed, "Transaction already executed");
        require(!confirmations[txId][msg.sender], "Already confirmed");
        
        confirmations[txId][msg.sender] = true;
        transactions[txId].confirmationCount++;
        
        emit TransactionConfirmed(txId, msg.sender);
    }

    function revokeConfirmation(uint256 txId) external onlyRole(SIGNER_ROLE) {
        require(txId < transactionCount, "Transaction does not exist");
        require(!transactions[txId].executed, "Transaction already executed");
        require(confirmations[txId][msg.sender], "Not confirmed");
        
        confirmations[txId][msg.sender] = false;
        transactions[txId].confirmationCount--;
        
        emit TransactionRevoked(txId, msg.sender);
    }

    /**
     * @notice Execute a confirmed multi-sig transaction
     * @dev Full value passes through — no founder fee deduction (handled by Escrow)
     */
    function executeTransaction(uint256 txId) external onlyRole(SIGNER_ROLE) nonReentrant returns (bytes memory) {
        require(txId < transactionCount, "Transaction does not exist");
        Transaction storage txn = transactions[txId];
        require(!txn.executed, "Transaction already executed");
        require(txn.confirmationCount >= requiredConfirmations, "Not enough confirmations");
        require(address(this).balance >= txn.value, "Insufficient treasury balance");
        
        txn.executed = true;

        (bool success, bytes memory result) = txn.target.call{value: txn.value}(txn.data);
        require(success, "Transaction execution failed");
        
        emit TransactionExecuted(txId);
        emit Executed(txn.target, txn.value, txn.data);
        
        return result;
    }

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

    function isConfirmed(uint256 txId, address signer) external view returns (bool) {
        return confirmations[txId][signer];
    }

    // ============ Governance Direct Execute ============

    /**
     * @notice Direct execute for DAO-approved proposals via Governance contract
     * @dev Full value passes through — founder fee is handled by Escrow at funding time
     * @param target Target address for the transaction
     * @param value ETH value to send
     * @param data Calldata for the transaction
     * @param proposalId Governance proposal ID (kept for audit trail)
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 proposalId
    ) external onlyRole(EXECUTOR_ROLE) nonReentrant returns (bytes memory) {
        require(address(this).balance >= value, "Insufficient treasury balance");

        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Call failed");
        
        emit Executed(target, value, data);
        return result;
    }

    // ============ Admin Functions ============

    function addSigner(address signer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(signer != address(0), "Invalid signer address");
        _grantRole(SIGNER_ROLE, signer);
        emit SignerAdded(signer);
    }

    function removeSigner(address signer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(SIGNER_ROLE, signer);
        emit SignerRemoved(signer);
    }

    function setRequiredConfirmations(uint256 _requiredConfirmations) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_requiredConfirmations > 0, "Must require at least 1 confirmation");
        require(_requiredConfirmations <= 10, "Cannot require more than 10 confirmations");
        uint256 oldRequired = requiredConfirmations;
        requiredConfirmations = _requiredConfirmations;
        emit RequiredConfirmationsUpdated(oldRequired, _requiredConfirmations);
    }

    function withdraw(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw failed");
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function setChainlinkOracle(address _chainlinkOracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_chainlinkOracle != address(0), "Invalid oracle address");
        address oldOracle = chainlinkOracle;
        chainlinkOracle = _chainlinkOracle;
        emit ChainlinkOracleUpdated(oldOracle, _chainlinkOracle);
    }

    function verifyReserves(uint256 propertyId) external view returns (uint256) {
        require(chainlinkOracle != address(0), "Oracle not configured");
        return IChainlinkFunctions(chainlinkOracle).getReserves(propertyId);
    }

    function verifyAndRecordReserves(uint256 propertyId) external returns (uint256) {
        require(chainlinkOracle != address(0), "Oracle not configured");
        uint256 reserves = IChainlinkFunctions(chainlinkOracle).getReserves(propertyId);
        emit ReservesVerified(propertyId, reserves);
        return reserves;
    }

    // ============ Relayer Reimbursement Functions ============

    function fundReimbursementPool() external payable {
        relayerReimbursementPool += msg.value;
        emit ReimbursementPoolFunded(msg.value, relayerReimbursementPool);
    }

    function reimburseRelayer(address relayer, uint256 gasUsed) external onlyRole(EXECUTOR_ROLE) {
        uint256 reimbursement = gasUsed * tx.gasprice;
        
        if (reimbursement > maxReimbursementPerTx) {
            reimbursement = maxReimbursementPerTx;
        }
        
        if (reimbursement > relayerReimbursementPool) {
            reimbursement = relayerReimbursementPool;
        }
        
        if (reimbursement > 0) {
            relayerReimbursementPool -= reimbursement;
            relayerReimbursements[relayer] += reimbursement;
            
            (bool success, ) = payable(relayer).call{value: reimbursement}("");
            require(success, "Reimbursement failed");
            
            emit RelayerReimbursed(relayer, reimbursement, relayerReimbursementPool);
        }
    }

    function setMaxReimbursement(uint256 newMax) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMax <= 0.1 ether, "Max too high");
        uint256 oldMax = maxReimbursementPerTx;
        maxReimbursementPerTx = newMax;
        emit MaxReimbursementUpdated(oldMax, newMax);
    }

    function getReimbursementPoolInfo() external view returns (
        uint256 poolBalance,
        uint256 maxPerTx
    ) {
        return (relayerReimbursementPool, maxReimbursementPerTx);
    }
}
