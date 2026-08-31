# Ownership and Voice Measurement Framework

**Status:** Mandatory  
**Date:** 2026-07-23  
**Primary Directive Alignment:** Required

Capital raised is a lagging and incomplete indicator. The system must continuously measure whether ordinary people are gaining enforceable ownership and real voice.

---

## Primary Success Metrics

These metrics become the real dashboard. Capital raised may still be tracked; it is no longer the primary success signal.

1. **Unique Non-Owner Nominators and Voters (per county)**  
   Count of distinct addresses/users who nominated or voted and who were not previously recorded as real-estate owners on the platform.

2. **Voting Power Held by First-Time Owners**  
   Percentage of total weighted voting power held by addresses that acquired their first real-estate-linked token through this platform.

3. **Nomination → Owner Consent → Tokenization Conversion**  
   Number and rate of properties that successfully moved through the full community-driven pipeline.

4. **Sustained Participation**  
   Percentage of voters/nominators who participate in more than one phase or more than one property.

5. **Local Outcome Linkage**  
   Number of executed proposals that have recorded post-execution impact (jobs, housing units, local business activity, health-score deltas) via PhaseManager.

6. **Geographic Concentration of Voice**  
   Share of voting power and nominations coming from County-phase eligible participants versus later phases.

---

## Reporting Cadence

- These metrics must be computable from existing schema and contract events (nominations, votes, holdingsByPhase, impact records, KYC/phase eligibility).
- Weekly optimization log must include the current values (or explicit “not yet instrumented” status).
- Founder dashboard and admin surfaces must expose these numbers alongside or above traditional fundraising metrics.

---

## Failure Condition

If capital is being raised while metrics 1–6 remain flat or declining, the system is failing the Primary Directive regardless of how sophisticated the contracts or UI appear.

This framework is the measurement standard for all future weekly cycles.
