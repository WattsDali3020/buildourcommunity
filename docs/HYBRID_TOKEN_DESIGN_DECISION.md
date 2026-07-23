# Hybrid Token Design Decision

**Status:** Locked  
**Date:** 2026-07-23  
**Authority:** ORCH + full Horsemen review (post Dana Love RWA analysis)  
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

### Non-Goals

- Free / unrestricted secondary trading as default
- Synthetic price exposure without ownership rights
- Pure zero-transfer "ledger-only" design for community SPV interests
- Measuring success primarily by transfer velocity

---

## Rationale (Summary)

- Economic substance governs (SEC Staff Statement on Tokenized Securities, Jan 28 2026).
- Everyday participants require a realistic (if restricted) path to realize value.
- Governance and demand feedback loops are the actual product activity that compounds livability and GDP.
- Compliance-by-design and substance-over-form remain non-negotiable.
- Aligns with Georgia Blockchain Advancement Goal by creating a clear, defensible, local-precedent structure.

---

## Implementation Requirements

- Token standard path: ERC-3643-style (identity + rules) preferred.
- Off-chain legal linkage mandatory (PPM, operating agreement, title references hashed or explicitly referenced).
- All future contract work, frontend messaging, and disclosure language must reference this document.
- Reg retains advisory veto on any deviation that increases regulatory or investor-protection risk.

---

## Reference Context

- Primary Directive (locked)
- Reg Primary Directive (compliance guardian)
- Dana Love analysis of distributed vs represented RWA market (July 2026)
- rwa.xyz Distributed / Represented framework
- SEC Staff Statement on Tokenized Securities (Jan 28 2026)

This document is the single source of truth for the hybrid design until explicitly superseded by founder instruction.
