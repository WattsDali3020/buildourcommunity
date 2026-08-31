# Hybrid Token Design Decision

**Status:** Locked  
**Date:** 2026-07-23  
**Updated:** 2026-08-01 (SEC 33-11412 mapping)  
**Authority:** ORCH + full Horsemen review (post Dana Love RWA analysis + March 2026 SEC/CFTC Release)  
**Primary Directive Alignment:** Required

---

## Decision

RevitaHub will use a **hybrid** token design for community real-estate SPV interests.

### Rejected: Pure Represented (Zero-Transfer)

Pure "represented" tokens (no external wallet movement, no peer-to-peer transfer by design) work for certain institutional ledgers and short-cycle commodity instruments (e.g., Justoken JMWH energy contracts on XRPL with mint/burn on delivery).  

They are **not** appropriate as the default for long-duration, community-driven real-estate equity interests aimed at everyday holders. Zero practical path to value realization conflicts with the Primary Directive (generational wealth for ordinary people).

### Adopted: Hybrid Model

1. **Issuer-sponsored** tokenization (token represents the actual membership interest / beneficial rights in the SPV that holds title).
2. **Permissioned transferability** enforced on-chain (ERC-3643 / T-REX pattern or equivalent: identity registry + compliance rule engine). Transfers succeed only when both parties clear eligibility, sanctions, offering rules, and any lock-up or community thresholds.
3. **Primary on-chain activity signals** are governance votes, demand-oracle updates, PhaseManager state changes, and distributions — **not** secondary market transfer volume.
4. Secondary transfers are gated and optional, never the core product promise.
5. Full, repeated disclosure of illiquidity risk and the gated nature of any secondary market is mandatory in all offering materials and platform UI.

### SEC 33-11412 Classification (August 1, 2026 Update)

Under the March 17, 2026 SEC + CFTC Joint Interpretive Release, RevitaHub PropertyTokens are **Category 5 Digital Securities**. They are financial instruments enumerated in the definition of “security” that are formatted as crypto assets. Tokenization does not alter their legal character. They remain securities for the life of the interest. We do not rely on the investment-contract separation doctrine for these tokens.

**Required language in all materials:**  
“digital security representing membership interests in a Series LLC”

### Non-Goals

- Free / unrestricted secondary trading as default
- Synthetic price exposure without ownership rights
- Pure zero-transfer "ledger-only" design for community SPV interests
- Measuring success primarily by transfer velocity
- Any claim that the tokens can later leave securities regulation via investment-contract ending

---

## Rationale (Summary)

- Economic substance governs (SEC Staff Statement on Tokenized Securities, Jan 28 2026 + March 2026 Release).
- Everyday participants require a realistic (if restricted) path to realize value.
- Governance and demand feedback loops are the actual product activity that compounds livability and GDP.
- Compliance-by-design and substance-over-form remain non-negotiable.
- Aligns with Georgia Blockchain Advancement Goal by creating a clear, defensible, local-precedent structure.

---

## Implementation Requirements

- Token standard path: ERC-3643-style (identity + rules) preferred.
- Off-chain legal linkage mandatory (PPM, operating agreement, title references hashed or explicitly referenced).
- Transfer Agent is the authoritative ownership record; on-chain ledger is a permissioned courtesy copy.
- All future contract work, frontend messaging, and disclosure language must reference this document and the SEC 33-11412 mapping memo.
- Reg retains advisory veto on any deviation that increases regulatory or investor-protection risk.

---

## Reference Context

- Primary Directive (locked)
- Reg Primary Directive (compliance guardian)
- Dana Love analysis of distributed vs represented RWA market (July 2026)
- rwa.xyz Distributed / Represented framework
- SEC Staff Statement on Tokenized Securities (Jan 28 2026)
- SEC + CFTC Joint Interpretive Release 33-11412 / 34-105020 (March 17, 2026)
- docs/regulatory/SEC_33-11412_Mapping_to_RevitaHub.md

This document is the single source of truth for the hybrid design until explicitly superseded by founder instruction.
