# Test Requirements — Permanent Transfer Gate

**Date:** 2026-07-23  
**Target:** contracts/PropertyToken.sol :: isTransferAllowed + _update

## Required Test Cases

1. Mint (from == address(0)) succeeds regardless of whitelist/KYC state of recipient (existing mint path still enforces whitelist separately).
2. Burn (to == address(0)) succeeds for holder.
3. A fully eligible pair (whitelist + KYC + active property) still cannot transfer while the common funding clock is running, or after it, until post-period liquidity is decided. `isComplianceTransferAllowed` is the whitelist/KYC check. `isTransferAllowed` also applies the lock.
4. Transfer to address with whitelist false reverts with “Transfer not permitted under compliance rules”.
5. Transfer from address with whitelist false reverts.
6. Transfer to address with kycVerificationIds == bytes32(0) reverts.
7. Transfer from address with kycVerificationIds == bytes32(0) reverts.
8. Transfer of tokens for an inactive property reverts.
9. `isFunded` does not open transfers. Early completion is an undecided TODO hook. `transferExceptionsEnabled` and `postPeriodTransfersEnabled` default to false and do not unlock transfers.
10. Phase holdings tracking (holdingsByPhase) continues to update correctly on successful permitted transfers.

## Notes
- These tests must be added before any mainnet or serious testnet deployment of the new gate.
- Foundry or Hardhat test suite location to be determined by current repo tooling.
