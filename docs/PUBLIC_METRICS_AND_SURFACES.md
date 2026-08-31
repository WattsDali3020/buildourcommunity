# Public Metrics and Surfaces

**Status:** Mandatory  
**Date:** 2026-07-23  
**Primary Directive Alignment:** Required

Governance, demand, and community voice are the product. Fundraising progress is secondary.

---

## Lead Metrics (Must Appear First)

On every property page, the demand dashboard, and the homepage, the following signals must be the primary visible data:

1. **Demand Bars** (by proposal type)  
   PropertyDevelopment / TreasuryAllocation / ParameterChange / Emergency

2. **Engagement Percentage**  
   Current progress toward the 75% PhaseManager threshold

3. **Community Health Score**  
   0–10000 diversity + participation score from Governance

4. **Unique Local Participants**  
   Count of distinct nominators and voters with County-phase eligibility

5. **Active Proposals + Impact Scores**  
   Live proposals with their required impact reports and scores

6. **Nomination → Owner Consent → Tokenization Pipeline Status**  
   Clear stage indicator for each property

Fundraising progress (tokens sold, capital raised, phase allocation filled) may still be shown. It may no longer be the lead or dominant signal.

---

## Implementation Requirements

- Homepage and property-detail pages must surface the lead metrics above the fold or in the primary data panel.
- Demand dashboard becomes a first-class navigation item, not a secondary analytics page.
- Empty states must still show the metric structure (so the system trains users on what success looks like even before data exists).
- Any UI that currently leads with “Funding Progress” or “Tokens Sold” must be reordered.

---

## Rationale

The Primary Directive optimizes for ownership and voice held by everyday people, not for capital velocity. Public surfaces that lead with fundraising teach the wrong success metric to users, investors, and the team. This document forces the correct ordering.
