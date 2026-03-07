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
- **Status**: To Build
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
- **Status**: To Build
- **Rationale**: Reduces gas costs (critical for mass usage), already partially in Governance.sol.
- **Profit Tie**: Higher participation → faster phases → more token sales.
- **Implementation**: See Governance.sol update — EIP-712 domain separator with typed vote struct for off-chain signature collection and on-chain verification.

### 3. Automated Suspicious Activity Flagging
- **Status**: To Build
- **Rationale**: Enhances Escrow compliance; ties to Amundi's custody/disclosure reqs.
- **Profit Tie**: Builds trust for institutional inflows.
- **Implementation**: Integrated in Escrow update — automated via AML oracle score checks on every purchase.

### 4. Geo-Verification Oracles for Phase Eligibility
- **Status**: To Build
- **Rationale**: Ensures County locals get 1.5x votes; Amundi notes regional reg differences (US vs EU).
- **Profit Tie**: Localized engagement drives early sales.
- **Implementation**: See PhaseManager.sol update — Chainlink oracle for geo-verification before phase advancement.

### 5. LLC-Backed Property Structs in PropertyToken
- **Status**: To Build
- **Rationale**: RealT-like SEC safety; Amundi highlights offshore structs for US funds.
- **Profit Tie**: Avoids "securities" classification risks, unlocking retail.
- **Implementation**: See PropertyToken.sol update — LLC address and jurisdiction stored per token ID.

### 6. Multi-Sig Treasury Execution
- **Status**: To Build (expand existing)
- **Rationale**: 2-of-3 for credibility; Amundi on supportive regs but practice caution.
- **Profit Tie**: Secure founder cut without control loss.
- **Implementation**: See Treasury.sol refinement — expand to 2-of-3 multi-sig with DAO-appointed signers.

## Next Steps
- Test on Base Sepolia (low gas).
- Cost Estimate: Chainlink ~$100 initial LINK.
- Timeline: 1 week per contract.
- Legal: Consult for SEC (e.g., Reg D for private funds).
