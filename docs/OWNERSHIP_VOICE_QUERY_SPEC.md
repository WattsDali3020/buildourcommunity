# Ownership & Voice Metrics — Query and Instrumentation Spec

**Status:** Mandatory for next engineering pass  
**Date:** 2026-07-23

These metrics must become computable from existing schema, events, and contract state.

## 1. Unique Non-Owner Nominators and Voters (per county)

Sources:
- propertyNominations + nominationVotes
- votes table
- users / addressPhaseEligibility (County)
- Optional: cross-reference against any owner flags or prior real-estate holdings if later added

Output: count of distinct userIds/addresses that nominated or voted and carry County eligibility.

## 2. Voting Power Held by First-Time Owners

Requires tracking whether an address’s first real-estate-linked token acquisition occurred on this platform.

Minimum viable approach:
- On first mint to an address for any propertyId, record `firstOwnershipAt`
- Later compute sum of getVotingPower for addresses where firstOwnershipAt is set and no prior external ownership flag exists
- Express as percentage of total weighted voting power

## 3. Nomination → Owner Consent → Tokenization Conversion

Pipeline stages already partially exist in nominationStatus, ownerResponseStatus, propertyStatus, offeringStatus.

Required: clear stage machine and conversion rate reporting (nominations that reach owner consent, consent that reaches live offering, etc.).

## 4. Sustained Participation

Percentage of addresses that appear in votes or nominations across more than one property or more than one phase.

## 5. Local Outcome Linkage

Count of properties/proposals that have at least one PhaseManager.recordImpactAfterExecution entry (jobs, housing, revenue, etc.).

## 6. Geographic Concentration of Voice

Share of total voting power and nomination volume coming from addresses with addressPhaseEligibility == County versus later phases.

## Implementation Notes
- Prefer derived views or scheduled aggregation jobs over heavy real-time joins on every page load.
- Founder dashboard and admin must expose these numbers.
- Weekly optimization log must report current values or explicit “not yet instrumented” status.
