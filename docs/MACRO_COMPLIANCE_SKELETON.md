# MACRO_COMPLIANCE_SKELETON.md
*National compliance architecture for RevitaHub — fixed federal layer + reusable state plug-in modules*

### 1. Purpose
This document defines the single national skeleton that allows RevitaHub to operate in every U.S. state without rebuilding the securities or governance plumbing for each new jurisdiction. The federal layer is written once and qualified with the SEC. Each state then drops in a lightweight plug-in module containing only its local requirements.

### 2. Fixed Federal Layer (Immutable — Never Rebuilt)
- **Master Entity**: Delaware Series LLC (Tirios Propco Series LLC precedent) — each property or tightly related cluster is its own Series with ring-fenced assets and liabilities under Delaware Act §18-215.
- **Securities Qualification**: Regulation A Tier 2 — nationwide general solicitation, non-accredited investor access subject to the 10% of greater of annual income or net worth limit, registered broker-dealer and Transfer Agent.
- **Legal Title Primacy**: Registered Transfer Agent (e.g., VStock or equivalent) holds the authoritative book-entry records of ownership. Blockchain records are explicitly “digital courtesy copies” only.
- **On-Chain Layer**: Permissioned security tokens (ERC-3643 or equivalent with identity registry) that enforce governance, voting, transfer restrictions, and PhaseManager thresholds — but never claim to be the primary security instrument.
- **Core Documents** (written once, reused everywhere): Offering Circular, Risk Factor Library, Series Limited Liability Company Agreement, Investor Questionnaire, PhaseManager Operating Logic.

### 3. Modular State Plug-in Template (The Only Variable Part)
Each new state receives its own folder or file containing exactly these four items:

1. **Legal Opinion Letter** from state-qualified counsel confirming:  
   - Delaware Series LLC is enforceable in the target state.  
   - Series insulation (no cross-Series liability) is respected.  
   - Bankruptcy remoteness of individual Series.  
   - Any required modifications to the master Operating Agreement.

2. **County Recording Package**:  
   - Deed recording mechanics into the specific Series.  
   - Title insurance requirements and endorsements.  
   - Any local recording fees, forms, or affidavits.

3. **Blue-Sky Filing**:  
   - Qualification or notice filing with the state securities regulator.  
   - Any state-specific investor-protection disclosures or legends.  
   - Coordination with the federal Reg A qualification.

4. **State-Specific Add-ons** (if any):  
   - Tax treatment differences.  
   - Additional investor-protection rules.  
   - Local economic development or housing program overlays.

### 4. Deployment Workflow
1. Federal layer is qualified once with the SEC (Reg A Tier 2).  
2. For each new state: local counsel produces the four-item plug-in module.  
3. Submit blue-sky filing + record deeds + launch local instance.  
4. No changes to the core Offering Circular, risk factors, or on-chain contracts are required.  
5. Incremental cost and time per state is limited to local counsel opinion + filing fees + recording.

### 5. Integration with Existing Repo
This skeleton slots directly into the current structure:  
- Regulatory docs folder already contains the federal-layer references (Reg D/A, Howey, Investment Company Act, AML, RESPA, State_Blue_Sky_Preemption.md).  
- Contracts folder already contains the on-chain pieces (PropertyToken, PhaseManager, Governance, Escrow, Treasury).  
- Frontend already has StateComplianceTable.tsx.  
The only new work is packaging the four-item state module as a clean, reusable template so any future state can adopt it with minimal effort.

### 6. Next Steps
- Create `docs/MACRO_COMPLIANCE_SKELETON.md` with the content above.  
- Update `State_Blue_Sky_Preemption.md` to reference this skeleton.  
- Add a `states/` folder with a template subfolder containing the four-item structure.  
- Update ARCHITECTURE.md to show the federal layer as fixed and state modules as plug-ins.
