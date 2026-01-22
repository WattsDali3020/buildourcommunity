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
 * @notice DAO-controlled treasury with founder sustainability fee and reserve verification
 * @dev Integrates with Chainlink Functions for proof-of-reserves
 */
contract Treasury is AccessControl, ReentrancyGuard {
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    address public founderWallet;
    address public chainlinkOracle;
    uint256 public constant FOUNDER_CUT_BPS = 100; // 1% in basis points

    event FounderCutSent(address indexed founder, uint256 amount);
    event Executed(address indexed target, uint256 value, bytes data);
    event FounderWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event ChainlinkOracleUpdated(address indexed oldOracle, address indexed newOracle);
    event ReservesVerified(uint256 indexed propertyId, uint256 reserves);

    constructor(address _founderWallet) {
        require(_founderWallet != address(0), "Invalid founder wallet");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        founderWallet = _founderWallet;
    }

    receive() external payable {}

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
