# Frontend Lead Metrics Specification

**Status:** Mandatory implementation requirement  
**Date:** 2026-07-23

The live UI must stop leading with fundraising progress. The following metrics become the primary data surfaces on homepage, property-detail, and demand dashboard.

## Required Primary Surfaces

### 1. Demand Bars (Governance.getDemandBars)
- Display four horizontal or vertical bars: PropertyDevelopment, TreasuryAllocation, ParameterChange, Emergency
- Values in basis points (0–10000)
- Must be visible above the fold on property pages and as the hero data on /demand

### 2. Engagement Percentage (PhaseManager.calculateEngagement)
- Large numeric display + progress ring or bar toward 75% threshold
- Show time remaining in current minimum engagement period if applicable
- Color state: red <25%, amber 25–60%, green approaching 75%

### 3. Community Health Score (Governance.getCommunityHealthScore)
- 0–10000 score with short explanation of diversity + participation components

### 4. Unique Local Participants
- Count of distinct County-phase eligible nominators + voters
- Source: nominations + votes filtered by addressPhaseEligibility == County

### 5. Active Proposals + Impact Scores
- List of active proposals with title, type, impactScore, and votesFor/votesAgainst
- Link to full proposal detail

### 6. Pipeline Stage Indicator
- Visual stage: Nomination → Under Review → Owner Consent → Tokenizing → Live → Funded
- Current stage must be unambiguous

## Secondary (Allowed but Not Lead)
- Tokens sold / phase allocation filled
- Capital raised
- Funding deadline countdown

## Empty States
Even with zero data the metric structure and labels must render so users learn what success looks like.

## Implementation Notes for Next Engineering Pass
- property-detail.tsx, home.tsx, demand-dashboard.tsx are the primary targets
- Pull from existing Governance and PhaseManager view functions where possible
- New aggregated endpoints may be required for Unique Local Participants and Pipeline Stage
