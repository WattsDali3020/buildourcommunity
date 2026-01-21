// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Treasury is AccessControl, ReentrancyGuard {
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    address public founderWallet;
    uint256 public constant FOUNDER_CUT_BPS = 100; // 1% in basis points

    event FounderCutSent(address indexed founder, uint256 amount);
    event Executed(address indexed target, uint256 value, bytes data);
    event FounderWalletUpdated(address indexed oldWallet, address indexed newWallet);

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
}
