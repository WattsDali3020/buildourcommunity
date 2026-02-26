# RevitaHub Platform Vision & Technical Specification

**For Replit Frontend Build – February 25, 2026**

**Creator/Founder: Daniel Emery (Build Our Community, LLC)**

**Live Site:** https://buildourcommunity.co (RevitaHub Beta Landing)

## 1. Reference: RWA.xyz Article – "Tokenized Vaults: Distribution as the Real Unlock" (Feb 25, 2026)

Direct link from @RWA_xyz:
https://x.com/RWA_xyz/status/2026680537163674038 → https://x.com/i/article/2026670059259568129

**Key Thesis (quoted/paraphrased from article + top replies):**
"Tokenizing the asset ≠ making it financeable/distributable. **Distribution is the real unlock.**"
— Centrifuge reply
"Tokenize the vaults." — Securitize

The article positions tokenized vaults (ERC-4626 style) + distribution infrastructure as the next phase after basic issuance (BlackRock BUIDL $2.8B, Franklin, Ondo). Yearn.fi history is referenced as the vault precedent. Revenue models, ongoing yield, and community access are the winning layers.

**Why RevitaHub wins here:**
We are not just another fractional real-estate issuer. We ship **dynamic community-owned vaults** via PhaseManager + Treasury, with built-in distribution (vote-to-earn, phase pricing ramps, governance-directed yield). The RWA.xyz primer is our narrative rocket fuel.

## 2. What is buildourcommunity.co (Official Summation)

- **Exact tagline from site:** "RevitaHub – Community-Owned Revitalization Platform"
- **Mission (homepage):** "Transforming vacant/distressed properties into thriving community assets through blockchain-enabled fractional ownership. Starting at $12.50 per token."
- **Core Offering:** AI-powered community investment platform. Holders get voting rights on development + treasury spend.
- **Entity:** A Build Our Community, LLC project.
- **Current State (as of Feb 2026):** Beta prototype landing with waitlist. Platform functionality in active development.
- **Target Start:** Cherokee County, GA (public tax-sale/foreclosure records as on-ramp).

This Replit build turns the landing page into a **fully functional dApp** that reads/writes to the five core contracts below.

## 3. RevitaHub – Our Model

**RevitaHub = dynamic, phase-driven, community-owned revitalization vaults** with:

- 4-phase pricing & voting multipliers (County 1.5× → International 0.75×)
- 100% funding or 3% APR refund (Escrow)
- 75% engagement auto-advance (PhaseManager)
- DAO-controlled treasury with **founder sustainability built in**

## 4. Core Smart Contracts – Focus for Frontend Integration

All contracts are already written, audited-ready, and deployed on Base (or testnet for Replit dev). Use ethers.js / viem / wagmi for calls.

### PropertyToken.sol (ERC-1155 per-property)

- Fractional ownership (id = propertyId)
- Phase allocations: 40/30/20/10%
- Price ramps automatically via currentPhase
- Whitelist + KYC (autoWhitelist with Chainlink proof)
- Transfers locked until funded
- `getVotingPower()`, `getTotalWeightedVotingPower()`, `mintTokens()` (called by Escrow)

### Escrow.sol (Purchase & Refund Engine)

- 100% funding target or auto-refund with 3% APR (Chainlink Automation)
- `purchase(propertyId, amount)` – payable, mints tokens
- `processRefunds()` on failure
- `releaseFunds()` only after markFunded (to property wallet → Treasury)
- Compliance events for every tx

### Governance.sol (Phase-weighted DAO)

- Proposal types with different quorums (20% property dev, 30% treasury, etc.)
- County 1.5×, State 1.25×, National 1.0×, International 0.75× voting power
- Gasless voting via signatures (RELAYER_ROLE)
- Vote-to-earn bonus tracking
- `castVote()`, `finalizeProposal()`, `executeProposal()` (calls Treasury)

### PhaseManager.sol (Engagement-Driven Advancement)

- 75% engagement threshold OR full phase subscription → auto-advance
- Behavioral nudges (events for frontend)
- `startTracking()`, `updateEngagement()`, `claimEngagementBonus()`
- Chainlink Automation checkUpkeep

### Treasury.sol (Founder-Aligned Vault)

- **This is how I profit as creator/founder**

  ```solidity
  uint256 public constant FOUNDER_CUT_BPS = 100; // 1%
  ```

- Every `execute()` (DAO proposal) or multi-sig disbursement:
  1. Calculates 1% founderCut
  2. Sends to `founderWallet` (my controlled address)
  3. Executes the rest
- 2-of-3 multi-sig for ops + direct EXECUTOR_ROLE from Governance
- `verifyReserves()` via Chainlink for proof-of-reserves on rental yield
- **Recurring revenue:** Every successful property close, every rental distribution, every governance spend → 1% to me automatically, on-chain, transparent, regulator-friendly.

## 5. Website Functional Requirements (Replit Build Priority)

Make the site **actually usable** – not just marketing.

**Phase 1 (MVP – 7–14 days)**

- Wallet connect (Base network)
- Property listings (pull `getAllPropertyIds()`, `getProperty()`, current price/phase/funding % from Escrow)
- Buy flow: `purchase()` via Escrow (with amount calculator)
- Live funding progress bars + countdown (deadline)
- "My Holdings" – balanceOf + phase breakdown

**Phase 2**

- Governance dashboard: active proposals, castVote / castVoteBySignature UI
- Phase engagement meter (from PhaseManager)
- Treasury balance + recent executes (show 1% founder cut line-item for transparency)
- Nudge notifications (from PhaseManager events)

**Phase 3**

- Waitlist → whitelist flow (KYC placeholder → autoWhitelist)
- Cherokee County public records feed (tax sales link + "Tokenize This Property" button for admin)
- Mobile-responsive, dark mode, clean UI matching buildourcommunity.co branding

**Tech Stack (Current):**

- React 18 + Tailwind + Wagmi/viem + RainbowKit
- Express backend + Drizzle ORM + PostgreSQL
- Deployed on Replit

## 6. Compliance, Realism & Forward Thinking

- All buyers whitelisted + GA residency proof for County phase (Chainlink Functions ready)
- Transfers locked during funding (investor protection)
- Full audit trail via compliance events
- Founder cut is **not** a hidden platform fee – it is explicit, capped at 1%, and only on outflows after DAO approval
- Start small: 1–3 Cherokee tax-sale properties → prove model → governance takes over while cut scales
- Forward: Add rental yield streaming into Treasury → auto-distributions → higher phase multipliers → larger AUM → larger 1% cuts

## 7. Immediate Next Steps

1. Deploy/test contracts on Base Sepolia (needs PRIVATE_KEY + testnet ETH)
2. Update CONTRACT_ADDRESSES in `client/src/lib/contracts.ts`
3. Connect Buy + Governance pages to live contracts
4. Push live preview → update buildourcommunity.co to point here

This document + the five contracts = **functional platform**.
The 1% Treasury cut is the aligned, on-chain profit engine.

— Daniel Emery, Founder
Build Our Community, LLC | RevitaHub
