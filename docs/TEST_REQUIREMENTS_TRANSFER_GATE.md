# Test Requirements — Permanent Transfer Gate

**Date:** 2026-07-23  
**Target:** contracts/PropertyToken.sol :: isTransferAllowed + _update

## Required Test Cases

1. Mint (from == address(0)) succeeds regardless of whitelist/KYC state of recipient (existing mint path still enforces whitelist separately).
2. Burn (to == address(0)) succeeds for holder.
3. Transfer between two fully eligible addresses (whitelist true + kycVerificationIds non-zero + property active) succeeds.
4. Transfer to address with whitelist false reverts with “Transfer not permitted under compliance rules”.
5. Transfer from address with whitelist false reverts.
6. Transfer to address with kycVerificationIds == bytes32(0) reverts.
7. Transfer from address with kycVerificationIds == bytes32(0) reverts.
8. Transfer of tokens for an inactive property reverts.
9. Funding status (isFunded true or false) no longer controls the transfer gate.
10. Phase holdings tracking (holdingsByPhase) continues to update correctly on successful permitted transfers.

## Notes
- These tests must be added before any mainnet or serious testnet deployment of the new gate.
- Foundry or Hardhat test suite location to be determined by current repo tooling.
