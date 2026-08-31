# Regulatory Reference: Investment Company Act of 1940 Exemptions (3(c)(1) & 3(c)(7))
**For RevitaHub SPV & Property Tokenization Structure**  
**Knowledge Base Entry – 4Horsemen**  
**Sourced: July 5, 2026**

This entry addresses a critical structural question as RevitaHub scales: How to structure SPVs (or series of SPVs) that issue tokenized real estate interests without inadvertently becoming subject to the heavy regulation of the Investment Company Act of 1940.

---

## 1. The Core Problem

If an entity is deemed an “investment company” under the Investment Company Act of 1940, it becomes subject to extensive regulation, including:
- SEC registration
- Strict limitations on leverage, affiliated transactions, and board composition
- Ongoing reporting and governance requirements

Most property-focused SPVs want to avoid this status.

---

## 2. Primary Source

**Investment Company Act of 1940** (15 U.S.C. § 80a-1 et seq.)  
Official text: https://www.sec.gov/about/laws/ica40.pdf

Key exemptive provisions commonly used by real estate and private fund vehicles:
- **Section 3(c)(1)**
- **Section 3(c)(7)**

---

## 3. Section 3(c)(1) Exemption (Private Fund Exemption)

### Key Requirements
- The issuer must be a private fund (not making a public offering).
- It must have **no more than 100 beneficial owners** (with certain look-through rules for investors that are themselves funds).
- Investors must be “qualified purchasers” in some interpretations, but the main limit is the 100-owner cap.
- The fund cannot be making a public offering of its securities.

### Common Use Case
Smaller or early-stage SPVs that expect a limited number of investors (accredited or sophisticated).

**RevitaHub Implication**:
- Suitable for initial properties or pilot SPVs with a smaller investor base.
- The 100-investor limit makes it less ideal for broad community participation under Reg A+ Tier 2.

---

## 4. Section 3(c)(7) Exemption (Qualified Purchaser Fund)

### Key Requirements
- The issuer must be a private fund.
- All investors must be **“qualified purchasers”** (generally individuals with $5 million+ in investments or institutions with $25 million+ in investments).
- No numerical limit on the number of investors (unlike 3(c)(1)).
- Still cannot make a public offering.

### Common Use Case
Larger private funds that want to accept a higher number of sophisticated/qualified investors without hitting the 100-owner cap.

**RevitaHub Implication**:
- Useful if targeting higher-net-worth or institutional investors alongside community participants.
- Still has limitations for true “everyday people” ownership.

---

## 5. Comparison: 3(c)(1) vs 3(c)(7)

| Feature                    | Section 3(c)(1)              | Section 3(c)(7)                    |
|---------------------------|------------------------------|------------------------------------|
| **Maximum Investors**     | 100 (with look-through)     | No numerical limit                 |
| **Investor Qualification**| Generally accredited/sophisticated | Must be “qualified purchasers”    |
| **Public Offering**       | Not permitted               | Not permitted                      |
| **Best For**              | Smaller / pilot SPVs        | Larger funds with sophisticated investors |
| **RevitaHub Fit**         | Early properties            | Scaling with higher-net-worth investors |

---

## 6. Interaction with Nicki’s Notes & Overall Strategy

Nicki’s notes focus on securities exemptions (Reg D / Reg A+) and compliance infrastructure. The Investment Company Act analysis is the next structural layer:

- The choice of SPV structure (3(c)(1), 3(c)(7), or another approach) affects how many investors we can accept and what type of investors qualify.
- This directly impacts the ability to deliver on the **primary directive** of enabling everyday people to own fractional interests.
- A hybrid approach may be needed: Use 3(c)(1) or 3(c)(7) SPVs for certain properties while exploring other structures or master-feeder arrangements for broader community participation under Reg A+.

---

## 7. Key Takeaways for Platform & Architecture

- SPV structure decisions should be made early in the legal and technical design process.
- Smart contract and backend systems may need to track investor qualification status (especially for 3(c)(7)).
- The compliance layer should eventually support different investor qualification tiers depending on the SPV exemption being used.

---

**Primary Source**: Investment Company Act of 1940 (official SEC text) and established interpretations as of mid-2026.

This entry is now part of the 4Horsemen knowledge base.

---

**Status Update on Knowledge Base Build (Option A)**

I have now created focused reference entries for:

- Reg D & Reg A+
- Howey Test + Broker-Dealer + Transfer Agent
- AML / BSA + Travel Rule
- Investment Company Act Exemptions (this file)

**Next logical ones** (if you want me to continue):
- State Blue Sky Laws & Preemption
- Data Privacy considerations for KYC data

Would you like me to create the next one now, or pause here? Just say the word. We’re building this steadily and practically under Option A.