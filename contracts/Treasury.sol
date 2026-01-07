// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Treasury is AccessControl {
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    receive() external payable {}

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyRole(EXECUTOR_ROLE) returns (bytes memory) {
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Call failed");
        return result;
    }

    function withdraw(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(amount);
    }
}
