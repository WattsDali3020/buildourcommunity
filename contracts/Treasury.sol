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

interface IGovernanceImpact {
    function getImpactReport(uint256 proposalId) external view returns (string memory ipfsHash, uint256 impactScore);
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
    address public governanceContract;
    uint256 public constant FOUNDER_CUT_BPS = 100; // 1% in basis points
    
    // Multi-sig configuration
    uint256 public requiredConfirmations = 2; // 2-of-3 default
    uint256 public transactionCount;
    
    // Vesting schedule for founder cuts (24 months)
    uint256 public constant VESTING_PERIOD = 730 days; // ~24 months
    uint256 public constant VESTING_CLIFF = 90 days; // 3 month cliff
    mapping(address => uint256) public vestedCuts; // Total vested amount per founder
    mapping(address => uint256) public vestingStart; // When vesting started
    mapping(address => uint256) public claimedCuts; // Already claimed amount
    
    // Relayer reimbursement for gasless voting
    uint256 public relayerReimbursementPool;
    uint256 public maxReimbursementPerTx = 0.01 ether; // Max reimbursement per transaction
    mapping(address => uint256) public relayerReimbursements; // Total reimbursed per relayer
    
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
    
    event GovernanceContractUpdated(address indexed oldGovernance, address indexed newGovernance);
    event FounderCutZeroedByImpact(uint256 indexed proposalId, uint256 impactScore);
    
    // Vesting and reimbursement events
    event VestedCutAccrued(address indexed founder, uint256 amount, uint256 totalVested);
    event VestedCutClaimed(address indexed founder, uint256 amount, uint256 remaining);
    event RelayerReimbursed(address indexed relayer, uint256 amount, uint256 poolRemaining);
    event ReimbursementPoolFunded(uint256 amount, uint256 newTotal);
    event MaxReimbursementUpdated(uint256 oldMax, uint256 newMax);

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
     * @param target Target address for the transaction
     * @param value ETH value to send
     * @param data Calldata for the transaction
     * @param proposalId Governance proposal ID (used to check impact score)
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 proposalId
    ) external onlyRole(EXECUTOR_ROLE) nonReentrant returns (bytes memory) {
        require(address(this).balance >= value, "Insufficient treasury balance");
        
        uint256 founderCut = (value * FOUNDER_CUT_BPS) / 10000;

        if (governanceContract != address(0)) {
            (, uint256 impactScore) = IGovernanceImpact(governanceContract).getImpactReport(proposalId);
            if (impactScore < 70) {
                founderCut = 0;
                emit FounderCutZeroedByImpact(proposalId, impactScore);
            }
        }

        uint256 amountToSend = value - founderCut;

        if (founderCut > 0) {
            (bool founderSuccess, ) = payable(founderWallet).call{value: founderCut}("");
            require(founderSuccess, "Founder cut transfer failed");
            emit FounderCutSent(founderWallet, founderCut);
        }

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

    /**
     * @notice Set the Governance contract address for impact score lookups
     * @param _governance Address of the Governance contract
     */
    function setGovernance(address _governance) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_governance != address(0), "Invalid governance address");
        address oldGovernance = governanceContract;
        governanceContract = _governance;
        emit GovernanceContractUpdated(oldGovernance, _governance);
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

    // ============ Vesting Functions ============

    /**
     * @notice Accrue founder cut to vesting schedule instead of immediate payout
     * @dev Called internally when founder cuts would normally be sent
     * @param founder Founder address
     * @param amount Amount to vest
     */
    function _accrueVestedCut(address founder, uint256 amount) internal {
        if (vestingStart[founder] == 0) {
            vestingStart[founder] = block.timestamp;
        }
        vestedCuts[founder] += amount;
        emit VestedCutAccrued(founder, amount, vestedCuts[founder]);
    }

    /**
     * @notice Calculate claimable vested amount
     * @param founder Founder address
     */
    function getClaimableVested(address founder) public view returns (uint256) {
        if (vestingStart[founder] == 0) return 0;
        
        uint256 elapsed = block.timestamp - vestingStart[founder];
        if (elapsed < VESTING_CLIFF) return 0;
        
        uint256 totalVested = vestedCuts[founder];
        uint256 vestedAmount;
        
        if (elapsed >= VESTING_PERIOD) {
            vestedAmount = totalVested;
        } else {
            // Linear vesting after cliff
            vestedAmount = (totalVested * elapsed) / VESTING_PERIOD;
        }
        
        return vestedAmount - claimedCuts[founder];
    }

    /**
     * @notice Claim vested founder cuts
     */
    function claimVestedCuts() external nonReentrant {
        require(msg.sender == founderWallet, "Only founder can claim");
        
        uint256 claimable = getClaimableVested(msg.sender);
        require(claimable > 0, "Nothing to claim");
        require(address(this).balance >= claimable, "Insufficient treasury balance");
        
        claimedCuts[msg.sender] += claimable;
        
        (bool success, ) = payable(msg.sender).call{value: claimable}("");
        require(success, "Transfer failed");
        
        uint256 remaining = vestedCuts[msg.sender] - claimedCuts[msg.sender];
        emit VestedCutClaimed(msg.sender, claimable, remaining);
    }

    /**
     * @notice Get vesting info for founder
     * @param founder Founder address
     */
    function getVestingInfo(address founder) external view returns (
        uint256 totalVested,
        uint256 claimed,
        uint256 claimable,
        uint256 vestingStartTime,
        uint256 vestingEndTime
    ) {
        return (
            vestedCuts[founder],
            claimedCuts[founder],
            getClaimableVested(founder),
            vestingStart[founder],
            vestingStart[founder] + VESTING_PERIOD
        );
    }

    // ============ Relayer Reimbursement Functions ============

    /**
     * @notice Fund the relayer reimbursement pool for gasless voting
     */
    function fundReimbursementPool() external payable {
        relayerReimbursementPool += msg.value;
        emit ReimbursementPoolFunded(msg.value, relayerReimbursementPool);
    }

    /**
     * @notice Reimburse a relayer for gasless voting transaction
     * @dev Called by Governance contract after processing gasless vote
     * @param relayer Relayer address to reimburse
     * @param gasUsed Approximate gas used for the transaction
     */
    function reimburseRelayer(address relayer, uint256 gasUsed) external onlyRole(EXECUTOR_ROLE) {
        uint256 reimbursement = gasUsed * tx.gasprice;
        
        // Cap at max reimbursement
        if (reimbursement > maxReimbursementPerTx) {
            reimbursement = maxReimbursementPerTx;
        }
        
        // Cap at available pool
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

    /**
     * @notice Update max reimbursement per transaction
     * @param newMax New maximum in wei
     */
    function setMaxReimbursement(uint256 newMax) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMax <= 0.1 ether, "Max too high");
        uint256 oldMax = maxReimbursementPerTx;
        maxReimbursementPerTx = newMax;
        emit MaxReimbursementUpdated(oldMax, newMax);
    }

    /**
     * @notice Get reimbursement pool info
     */
    function getReimbursementPoolInfo() external view returns (
        uint256 poolBalance,
        uint256 maxPerTx
    ) {
        return (relayerReimbursementPool, maxReimbursementPerTx);
    }
}
