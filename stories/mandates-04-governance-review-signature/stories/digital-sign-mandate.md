---
type: story
title: "Digitally Sign the Mandate"
jira_key: NGCX-694
jira_status: Ready
original_estimate: 3d
release: friends-and-family
depends_on:
  - review-governance-summary
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/consent-audit-trail-architecture
  - customer-experience/acquisition-onboarding/mandate-backend-integration
  - document-storage-strategy
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-e-signature-regulatory-validation
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
---

## Context

The "Sign to confirm" section is the final element on the Mandate Review screen, directly below the activation checklist. It combines a confirmation checkbox with a displayed script-style signature of the director's name (populated from their verified identity) and a date, giving a legally binding yet frictionless confirmation experience. This approach aligns with the click-to-agree model referenced in the `mandate-e-signature-regulatory-validation` BDR.

The primary CTA **"Confirm mandate"** is the submission action that locks the mandate configuration, triggers activation, and sends acceptance requests to other directors.

Note: if the `mandate-e-signature-regulatory-validation` BDR determines a drawn or qualified electronic signature is required, this story will need to be revised to add a separate signature capture step.

## Acceptance Criteria

- [ ] A **"Sign to confirm"** section appears at the bottom of the Mandate Review screen, below the activation checklist
- [ ] The section contains:
  - A **confirmation checkbox** with the text: *"I confirm this mandate has the authorised persons, approval rules, and governance controls for our account"*
  - A **displayed signature area** showing the director's name rendered in a script/cursive style, sourced from their verified legal name, alongside the current date (e.g. "29, September 2025")
  - The displayed signature acts as the digital representation of the director's agreement (not a drawn input)
- [ ] The **"Confirm mandate"** CTA is displayed below the sign-to-confirm section
- [ ] **"Confirm mandate" is disabled** until the confirmation checkbox is ticked
- [ ] On clicking **"Confirm mandate"**:
  - Director's confirmation is recorded with full audit metadata: identity, timestamp, session ID, confirmation text version, mandate version number
  - Mandate configuration is locked (immutable from this point)
  - Mandate document is generated and stored immutably with a 7-year retention period
  - Acceptance requests are sent to all other directors on the mandate
  - Activation sequence is triggered (per `mandate-review-amendment/activate-mandate`)
- [ ] The mandate version number (e.g. MND-V2-20260303-001) is associated with the confirmation record and the generated document
- [ ] If the confirmation submission fails (technical error), the director is shown a clear error and can retry without the mandate being partially committed

## Test Scenarios

### Happy Path

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Director signature displayed | Director reaches Sign to confirm section | — | Director's legal name shown in script style with today's date |
| Checkbox required to proceed | Director on mandate review | Clicks "Confirm mandate" without ticking checkbox | Button remains disabled |
| Confirm mandate | Director ticks checkbox | Clicks "Confirm mandate" | Audit record created; mandate locked; other directors receive acceptance requests; activation triggered |

### Failure Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Submission failure | Director clicks "Confirm mandate" | Backend returns error | Director shown: "There was a problem confirming your mandate. Please try again."; no partial commit |
| Name not available | Director's legal name not resolved from KYC | — | Fallback: signature area shows a placeholder or omits the script name display; checkbox confirmation still proceeds normally |

## Technical Notes

- The script-style name display is a styled text rendering of the director's verified legal name (from KYC record); it is not a drawn signature capture and requires no canvas or file upload interaction
- The date displayed is the current device/server date at the time the director reaches the section, not the submission date — update to submission timestamp on confirmation
- Audit record must be immutable once written; retain for minimum 7 years; store the exact confirmation text version shown
- The mandate lock: once "Confirm mandate" is submitted successfully, the mandate configuration record must be immutable — subsequent changes require a new mandate version (V3+ scope)
- Acceptance requests dispatched to other directors are triggered by the mandate service on receipt of the confirmation — not by the UI; the UI waits for service confirmation before showing any success state
