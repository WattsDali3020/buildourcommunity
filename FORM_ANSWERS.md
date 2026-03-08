# RevitaHub Smart Contract Enhancement Notes (FORM_ANSWERS.md)

## Overview
This doc captures enhancement suggestions, status, rationale, compliance ties (per Amundi report: tech-neutral regs require AML/KYC/custody for RWAs), and founder profit impact. Prioritize for functionality: Escrow for secure funding, Governance for fair votes, PhaseManager for engagement, PropertyToken for RWAs, Treasury for disbursements. Goal: Scale to 100-300 waitlist conversions, feeding 1% treasury cut.

## Strong Existing Features (No Build Needed)
- AML/KYC oracle hooks in Escrow.sol: Builds investor trust, reduces fraud risks.
- EIP-712 potential in Governance.sol: Lowers barriers for mass voting.
- Geo-verification alignment in PhaseManager.sol: Supports County-first model.
- LLC backing concept: SEC-safe for RWAs.
- Multi-sig in Treasury.sol: Adds credibility.

## Already Implemented (Monitor/Refine)
- KYC verification flow: User submits → admin approves (PropertyToken.sol whitelist).
- 3% APR refund logic: In API/Escrow.sol.
- Phase-based pricing/multipliers: PropertyToken.sol.
- 1% founder cut: Treasury.sol (FOUNDER_CUT_BPS).
- Chainlink automation: PhaseManager.sol.

## Build Gaps and Plans

### 1. On-chain AML/KYC Oracle Integration (Chainlink)
- **Status**: Implemented
- **Rationale**: Amundi stresses AML/KYC for tokenized funds; automates Escrow checks to flag suspicious buys.
- **Profit Tie**: Prevents regulatory halts, enabling more fundings → treasury growth.
- **Implementation**: See Escrow.sol — `IAMLOracle` interface integrated with purchase function. Score threshold at 80 triggers `SuspiciousActivityReported` event and reverts.

```solidity
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface IAMLOracle {
    function getAMLScore(address buyer) external returns (uint256); // Score 0-100, high = suspicious
}

// In purchase function
uint256 amlScore = amlOracle.getAMLScore(msg.sender);
if (amlScore > 80) {
    emit SuspiciousActivityReported(propertyId, msg.sender, "High AML Score", block.timestamp);
    revert("AML check failed");
}

// Admin setter
function setAMLOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
    amlOracle = IAMLOracle(_oracle);
}
```

### 2. EIP-712 Signature Verification for Gasless Voting
- **Status**: Implemented
- **Rationale**: Reduces gas costs (critical for mass usage).
- **Profit Tie**: Higher participation → faster phases → more token sales.
- **Implementation**: Governance.sol — `castVoteBySignature()` with EIP-712 domain separator, `VOTE_TYPEHASH`, nonce replay protection, deadline expiry, and `RELAYER_ROLE` for gasless submission.

```solidity
bytes32 public constant VOTE_TYPEHASH = keccak256("Vote(uint256 proposalId,uint8 support,address voter,uint256 nonce,uint256 deadline)");

function castVoteBySignature(uint256 proposalId, uint8 support, address voter, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external onlyRole(RELAYER_ROLE) {
    uint256 currentNonce = nonces[voter]++;
    bytes32 structHash = keccak256(abi.encode(VOTE_TYPEHASH, proposalId, support, voter, currentNonce, deadline));
    bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
    address signer = ECDSA.recover(digest, v, r, s);
    require(signer == voter, "Invalid signature");
    // ... tally vote with phase-weighted power
}
```

### 3. Automated Suspicious Activity Flagging
- **Status**: Implemented (via Build Gap #1)
- **Rationale**: Enhances Escrow compliance; ties to Amundi's custody/disclosure reqs.
- **Profit Tie**: Builds trust for institutional inflows.
- **Implementation**: Integrated in Escrow.sol — AML oracle score check on every `purchase()` call automatically flags and reverts high-score buyers. Manual `reportSuspiciousActivity()` also available for admin/operator use.

### 4. Geo-Verification Oracles for Phase Eligibility
- **Status**: Implemented
- **Rationale**: Ensures County locals get 1.5x votes; Amundi notes regional reg differences (US vs EU).
- **Profit Tie**: Localized engagement drives early sales.
- **Implementation**: PhaseManager.sol — `IGeoOracle` interface with `getPhaseEligibility()`, integrated into `checkSubscriptionAdvancement()` (emits eligibility event) and `claimEngagementBonus()` (1.5x bonus for County locals). Admin setter `setGeoOracle()`.

```solidity
interface IGeoOracle {
    function getPhaseEligibility(address user, uint256 propertyId) external returns (uint8);
}

// In claimEngagementBonus — County locals get 1.5x
if (address(geoOracle) != address(0)) {
    uint8 eligibility = geoOracle.getPhaseEligibility(msg.sender, propertyId);
    if (eligibility == 0) { // Phase.County
        bonusAmount = (BONUS_TOKENS * 3) / 2; // 1.5x
    }
}

function setGeoOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
    geoOracle = IGeoOracle(_oracle);
}
```

### 5. LLC-Backed Property Structs in PropertyToken
- **Status**: Implemented
- **Rationale**: RealT-like SEC safety; Amundi highlights offshore structs for US funds.
- **Profit Tie**: Avoids "securities" classification risks, unlocking retail.
- **Implementation**: PropertyToken.sol — `llcIdentifier` and `custodian` fields added to Property struct. `createProperty()` requires both. `mintTokens()` enforces `custodian != address(0)`. Admin setter `updateLLCBacking()` for post-creation updates.

```solidity
struct Property {
    // ... existing fields ...
    string llcIdentifier; // e.g., "GA-LLC-456"
    address custodian;    // Custody wallet for compliance
}

// In createProperty — required at creation
require(custodian != address(0), "Custodian required for LLC backing");
require(bytes(llcId).length > 0, "LLC identifier required");

// In mintTokens — enforced before minting
require(prop.custodian != address(0), "No LLC backing");

// Admin setter for post-creation updates
function updateLLCBacking(uint256 propertyId, string calldata llcId, address custodian) external onlyRole(DEFAULT_ADMIN_ROLE);
```

### 6. Multi-Sig Treasury Execution
- **Status**: Implemented
- **Rationale**: 2-of-3 for credibility; Amundi on supportive regs but practice caution.
- **Profit Tie**: Secure founder cut without control loss.
- **Implementation**: Treasury.sol — Full 2-of-3 multi-sig with `SIGNER_ROLE` for DAO-appointed signers. `submitTransaction()` → `confirmTransaction()` → `executeTransaction()` flow. 1% founder cut (`FOUNDER_CUT_BPS = 100`) deducted on every execution. 24-month vesting with 90-day cliff. Chainlink reserve verification. Relayer reimbursement pool for gasless voting.

```solidity
// In executeTransaction — 2-of-3 multi-sig with founder cut
require(txn.confirmationCount >= requiredConfirmations, "Not enough confirmations");

uint256 founderCut = (txn.value * FOUNDER_CUT_BPS) / 10000;
if (founderCut > 0) {
    (bool founderSuccess, ) = payable(founderWallet).call{value: founderCut}("");
    require(founderSuccess, "Founder cut transfer failed");
}
uint256 netValue = txn.value - founderCut;
(bool success, ) = txn.target.call{value: netValue}(txn.data);
```

## All Build Gaps Complete
All 6 enhancement areas are now implemented across the 5 core contracts:
1. AML/KYC Oracle (Escrow.sol) — Automated compliance checks on purchases
2. EIP-712 Gasless Voting (Governance.sol) — Off-chain signatures for mass participation
3. Suspicious Activity Flagging (Escrow.sol) — Automated via AML oracle + manual reporting
4. Geo-Verification (PhaseManager.sol) — County-local 1.5x bonus via oracle
5. LLC-Backed Properties (PropertyToken.sol) — Custodian + LLC ID per property
6. Multi-Sig Treasury (Treasury.sol) — 2-of-3 with founder vesting + reserve verification

## Impact Governance Enhancements (March 2026)
Three contracts updated to add impact-based accountability:

### Governance.sol — Impact Reports on Proposals
- `Proposal` struct extended with `impactReportIPFS` (string) and `impactScore` (uint256, 0-100)
- `createProposal()` now takes 8 params (added `impactReportIPFS`, `impactScore`)
- PropertyDevelopment proposals require both fields (non-empty IPFS hash, non-zero score) — "no report, no vote"
- Other proposal types allow empty/zero impact fields
- New `getImpactReport(uint256 proposalId)` view function returns (ipfsHash, impactScore)
- Poll-to-proposal conversions default to empty impact fields (can be updated separately)

### Treasury.sol — Impact-Gated Founder Cut
- `execute()` signature changed: 3 params → 4 params (added `uint256 proposalId`)
- New `IGovernanceImpact` interface for cross-contract impact score reads
- New `governanceContract` state variable + `setGovernance(address)` admin setter
- Logic: If governance is set, reads `impactScore` via `getImpactReport(proposalId)`
  - If `impactScore < 70` → founder cut = $0 (emits `FounderCutZeroedByImpact`)
  - If `impactScore >= 70` → normal 1% founder cut applies
- Fallback: If governance address not set (address(0)), founder cut works as before
- Events: `GovernanceContractUpdated`, `FounderCutZeroedByImpact`

### PhaseManager.sol — Post-Execution Health Tracking
- New `HealthDelta` struct: category (string), delta (int256), timestamp
- New mappings: `propertyHealthScores` (uint256 → uint256), `propertyHealthHistory` (uint256 → HealthDelta[])
- `recordImpactAfterExecution(uint256 propertyId, string category, int256 delta)` — OPERATOR_ROLE only
  - Categories: "jobs", "traffic", "revenue"
  - Running score clamped 0–10000
  - Emits `ImpactRecorded(propertyId, category, delta, newScore)`
- `getPropertyHealthScore(uint256 propertyId)` — view, returns clamped score
- `getPropertyHealthHistory(uint256 propertyId)` — view, returns full delta history

### Deploy Scripts Updated
- `deploy.cjs` and `deploy.js` both call `treasury.setGovernance(governanceAddress)` post-deploy
- Role summary updated to show Treasury ↔ Governance linkage
- All contracts compile (Solidity 0.8.24) and deploy successfully on local Hardhat

## Next Steps
- Test on Base Sepolia (low gas).
- Cost Estimate: Chainlink ~$100 initial LINK.
- Timeline: Deploy and verify each contract sequentially.
- Legal: Consult for SEC (e.g., Reg D for private funds).
