# SEC 33-11412 Mapping to RevitaHub
**Internal Horsemen Memo**  
**Date:** August 1, 2026  
**Authority:** ORCH + full Horsemen review  
**Status:** Locked

---

## 1. Source Document

SEC + CFTC Joint Interpretive Release Nos. 33-11412 and 34-105020  
“Application of the Federal Securities Laws to Certain Types of Crypto Assets and Certain Transactions Involving Crypto Assets”  
Effective March 17, 2026 (68 pages). Supersedes the 2019 Framework.

## 2. Five-Category Token Taxonomy (Official)

| Category | Status under Securities Laws | Relevance to RevitaHub |
|----------|------------------------------|------------------------|
| Digital Commodities | Not securities by default | Not applicable |
| Digital Collectibles | Not securities by default | Not applicable |
| Digital Tools | Not securities by default | Not applicable |
| Stablecoins (covered) | Not securities | Not applicable |
| **Digital Securities** | **Full securities** | **This is us** |

## 3. Classification of RevitaHub PropertyTokens

RevitaHub PropertyTokens are **Category 5 — Digital Securities**.

They represent membership / beneficial interests in a Delaware Series LLC (or equivalent SPV) that holds legal title to real property. Tokenization does not change their legal character. They remain securities under the federal securities laws for the life of the interest.

**Commission language we now adopt verbatim in all materials:**
> “digital security representing membership interests in a Series LLC”

## 4. Investment Contract Separation Doctrine — Does Not Apply

The Release contains an important doctrine allowing certain non-security crypto assets that were sold as investment contracts to later separate from securities regulation once the issuer’s essential managerial efforts are completed or abandoned (with clear public disclosure).

**This doctrine does not apply to pure digital securities.**  
Because our tokens are digital securities by nature (they embody the ownership interest itself), they do not “graduate” out of securities status. We will never pursue or market an investment-contract-ending narrative for PropertyTokens.

## 5. Recordkeeping Architecture Confirmed

The Release endorses hybrid on-chain / off-chain recordkeeping as the proper model for tokenized securities:

- **Authoritative record** = Registered Transfer Agent book-entry records.
- **On-chain ledger** = Permissioned digital courtesy copy that enforces governance, identity, transfer restrictions, and PhaseManager logic.

This is exactly the architecture already locked in the Macro Compliance Skeleton and in PropertyToken.sol (permanent permissioned transfer gate + LLC custodian fields).

## 6. Secondary Trading

Secondary trading of digital securities must occur through a registered broker-dealer or ATS. No change to our existing design.

## 7. Impact on the Five Core Contracts

| Contract | Impact |
|----------|--------|
| PropertyToken | Already correct. Permanent permissioned transfers + LLC backing remain mandatory. |
| Escrow | No change. Funding + impactScore ≥ 70 gate still required before 1% fees fire. |
| Governance | No change. |
| PhaseManager | No change. |
| Treasury | No change. 1% founder cut remains performance- and impact-gated. |

## 8. Required Language Updates

All future offering circulars, risk factors, PPMs, and platform disclosures must use the Commission’s phrasing:

- “digital security representing membership interests in a Series LLC”
- Explicit statement that the tokens are securities under federal law and do not rely on any investment-contract separation doctrine.
- Clear description of the Transfer Agent as the definitive ownership record and the on-chain ledger as a permissioned courtesy copy.

## 9. Decision Filter Result

- Does this increase the chance a property hits Escrow fundingTarget with impactScore ≥ 70? → Yes (by reducing regulatory uncertainty for correctly structured digital securities).
- Does this raise Governance demand bars or PhaseManager engagement? → Indirectly, by making the legal foundation more credible.
- Does this keep the founder 1% path transparent and automatic? → Yes.
- Is this Phase 0 hardening? → Yes.

**ORCH conclusion:** The March 2026 rulebook validates the path we are already on. No redesign of the contracts or Macro Compliance Skeleton is required. We simply lock the Category 5 classification and the permanent digital-security status in writing.

---

**Maintained by Horsemen (ORCH lead)**  
This memo is now part of the permanent regulatory knowledge base.
