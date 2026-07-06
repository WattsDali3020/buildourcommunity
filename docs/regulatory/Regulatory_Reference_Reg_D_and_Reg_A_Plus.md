# Regulatory Reference: Regulation D (Reg D) and Regulation A+ (Reg A+)
**For RevitaHub / Build Our Community, LLC – Tokenized Real Estate & Community SPVs**  
**Knowledge Base Entry – 4Horsemen Reference Material**  
**Last Updated: July 5, 2026**

This document provides a clear, structured reference on the two primary SEC exemptions discussed in Nicki Sanders’ notes. It is intended for ongoing use by the 4Horsemen when designing compliance architecture, smart contract hooks, proposal engine rules, KYC/AML flows, and go-to-market strategy.

---

## 1. Overview

Both **Regulation D** and **Regulation A+** are exemptions from the registration requirements of the Securities Act of 1933. They allow issuers (including LLCs/SPVs offering fractional tokenized real estate interests) to sell securities without a full public registration, provided specific rules are followed.

The ERC-1155 Property Tokens will almost certainly be treated as **securities** under the Howey test. Therefore, one or both of these exemptions (or a combination) will likely be used to legally offer them to investors.

---

## 2. Regulation D (Reg D) – Private Placement Exemption

### Key Features (2026)
- **Rule 506(b)** (most commonly referenced in the notes):
  - Unlimited capital raise.
  - Unlimited number of **accredited investors**.
  - Up to **35 non-accredited investors** per offering (they must be “sophisticated” — sufficient knowledge and experience in financial and business matters, or use a purchaser representative).
  - **No general solicitation or advertising** allowed.
  - Form D must be filed with the SEC.
  - Self-certification of accredited status is typical (though verification is safer).

- **Rule 506(c)**:
  - Unlimited capital raise.
  - Only **accredited investors** (no non-accredited allowed).
  - **General solicitation and advertising** permitted.
  - Issuer must take “reasonable steps” to verify accredited investor status.

### Relevance to RevitaHub
- Fastest and lowest-cost path for early raises focused on accredited or sophisticated investors.
- The “Certain limit of non accredited investors” note in Nicki’s materials directly refers to the 35-investor cap under 506(b).
- “Private Security” language aligns with structuring tokenized interests as private placements under Reg D.

**Limitations for RevitaHub Vision**: Strict limits on non-accredited / everyday investors make pure 506(b) less ideal for the community-driven ownership model.

---

## 3. Regulation A+ (Reg A+) – “Mini-IPO” / Retail-Friendly Path

### Key Features (2026)
Regulation A+ has two tiers:

| Feature                        | Tier 1                          | Tier 2 (Most Relevant)              |
|--------------------------------|---------------------------------|-------------------------------------|
| **Maximum Raise (12 months)** | $20 million                    | $75 million                        |
| **Audited Financials**        | Not required                   | Required                           |
| **Ongoing Reporting**         | Limited (Form 1-Z exit report) | Annual (1-K), Semi-annual (1-SA), Current (1-U) |
| **State Blue Sky Laws**       | Must qualify in each state     | Preempted (federal only)           |
| **Non-Accredited Investors**  | Allowed                        | Allowed with investment limits     |
| **Non-Accredited Investment Limit** | No specific federal cap     | Generally limited to 10% of annual income or net worth |
| **Best For**                  | Smaller / testing raises       | Broader retail + community participation |

### Relevance to RevitaHub
- **Tier 2** is particularly attractive because it allows **everyday (non-accredited) investors** while still offering meaningful scale ($75M/year).
- State law preemption reduces complexity for multi-state offerings.
- Aligns strongly with the primary directive: enabling middle/lower class and everyday people to own fractional interests in community assets.
- Requires more upfront work (SEC qualification via Form 1-A, audited financials, ongoing reporting) and higher legal/compliance cost.

---

## 4. Comparison Table: Reg D vs Reg A+ for Tokenized Real Estate

| Aspect                          | Reg D 506(b)                  | Reg D 506(c)               | Reg A+ Tier 2                     |
|--------------------------------|-------------------------------|----------------------------|-----------------------------------|
| **Raise Limit**                | Unlimited                    | Unlimited                 | $75M per 12 months               |
| **Non-Accredited Investors**   | Up to 35 (sophisticated)     | Not allowed               | Allowed (with limits)            |
| **General Solicitation**       | Prohibited                   | Allowed                   | Allowed                          |
| **Cost & Complexity**          | Lowest                       | Low-Medium                | Higher (qualification + reporting) |
| **Speed to Market**            | Fastest                      | Fast                      | Slower                           |
| **Best Fit for RevitaHub**     | Early accredited raises      | Accredited-only raises    | Community / everyday investor focus |
| **Compliance Hooks Needed**    | Strong KYC, transfer restrictions, investor counting | Strong KYC + verification | KYC + AML + ongoing reporting hooks, investment limit enforcement |

---

## 5. Key Compliance Considerations for RevitaHub Platform

When building the system, the following must be addressed regardless of which exemption is chosen:

- **KYC / Identity Verification** — Chainlink Oracle + Persona integration (already in spike)
- **AML Screening & Scoring** — Provider integration + ongoing monitoring
- **Investor Accreditation / Sophistication Checks** — Especially important for 506(b) non-accredited and Reg A+ limits
- **Transfer Restrictions & Legends** — Smart contract level restrictions on who can receive tokens
- **Broker-Dealer Partnership** — Required for secondary trading / liquidity
- **Transfer Agent** — For reconciling on-chain and off-chain ownership records
- **Form D or Form 1-A Filing** — Legal workflow integration
- **Ongoing Reporting** — Especially for Reg A+ Tier 2 (platform may need to support data feeds)

---

## 6. Strategic Recommendation for RevitaHub (Current View)

A **hybrid or phased approach** is likely optimal:

1. **Early Phase** — Use **Reg D 506(b) or 506(c)** for initial property tokenizations with accredited / sophisticated investors (faster, lower cost).
2. **Growth Phase** — Move to or layer in **Reg A+ Tier 2** once the platform and first properties are proven, to open participation to everyday community members.

This sequencing supports both “Bring on Property first” and the long-term vision of broad ownership.

---

## 7. Sources & Notes
- SEC.gov resources on Regulation D and Regulation A (as of mid-2026)
- Current limits confirmed via official and secondary sources (no major changes to core caps in 2026)
- Tailored for tokenized real estate / RWA use case and RevitaHub’s community-driven model

**This entry is now part of the 4Horsemen reference knowledge base** and will be used in all future architecture, contract, proposal, and compliance discussions.

---

**Maintained by 4Horsemen (ORCH lead)**  
For questions or expansions (e.g., adding Howey test analysis, state law considerations, or specific smart contract hook recommendations), notify the team.