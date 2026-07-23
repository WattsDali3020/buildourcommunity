# Second-Order Effects of Permanent Permissioned Gate + PhaseManager Review

**Date:** 2026-07-23

## Effects of Removing the Funding Cliff

1. **Secondary market timing changes**  
   Previously, liquidity possibility appeared the moment `isFunded` flipped true. Now eligibility remains the permanent gate. This reduces the “funding success = liquidity event” narrative and aligns incentives with long-term holding and governance.

2. **Escrow and refund interaction**  
   Refunds and burns on failed funding remain unaffected (burns bypass the gate). Successful funding no longer automatically opens a relatively free secondary window. This is intentional under the hybrid model.

3. **Demand for ongoing KYC/AML maintenance**  
   Because both parties need current whitelist + KYC verification ID, the platform must treat identity status as a living requirement, not a one-time onboarding checkbox. Revocation paths already exist and become more important.

4. **Phase allocation and voting power**  
   HoldingsByPhase tracking continues to work. Permanent gating does not break phase-weighted voting. It does increase the value of early/local phases because exit is more constrained.

5. **Marketing and disclosure risk reduced**  
   We can no longer accidentally imply that funding completion creates free transferability. The contracts and the disclosure language now match.

## PhaseManager Stress Under Hybrid Model

Current rules (75% engagement + 7-day minimum) remain reasonable first-order defenses against gaming. Under permanent permissioned transfers the following pressures increase:

- Local participants have stronger reason to stay engaged because exit is gated.
- Demand bars and community health become more important leading indicators than pure capital velocity.
- Poll participation credits and vote-to-earn bonuses gain relative importance as retention tools.

**Recommendation:** Keep the 75% / 7-day parameters for now. Instrument the new ownership-and-voice metrics first. Revisit thresholds only after real participation data exists. Do not loosen engagement requirements simply because transfers are now permanently gated.

## Open Technical Debt
- Frontend still does not surface the new leading metrics.
- No live computation of Unique Local Participants or Voting Power Held by First-Time Owners.
- No automated tests yet for `isTransferAllowed`.
