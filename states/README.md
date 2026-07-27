# State Plug-in Modules

This directory contains the reusable state plug-in modules for the national Macro Compliance Skeleton.

See [`docs/MACRO_COMPLIANCE_SKELETON.md`](../docs/MACRO_COMPLIANCE_SKELETON.md) for the full architecture.

## Structure

Each state gets its own folder (e.g., `states/georgia/`, `states/texas/`).  
Inside every state folder (or the template) there are exactly four required items:

1. **Legal_Opinion_Letter.md** — Opinion from state-qualified counsel on Delaware Series LLC enforceability, series insulation, and bankruptcy remoteness.
2. **County_Recording_Package.md** — Deed recording mechanics, title insurance requirements, local forms and fees.
3. **Blue_Sky_Filing.md** — State securities notice or qualification filing requirements and any state-specific legends.
4. **State_Specific_Addons.md** — Tax treatment differences, extra investor protections, or local program overlays (if any).

## How to Use

1. Copy the entire `template/` folder.
2. Rename it to the target state (lowercase, e.g., `georgia`).
3. Fill in the four files with local counsel input.
4. No changes to the federal Offering Circular, risk factors, or on-chain contracts are required.
