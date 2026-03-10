---
type: feature
title: "Mandate Governance Review & Digital Signature"
jira_key: NGCX-684
jira_status: Backlog
original_estimate: 2w
release: friends-and-family
parent_epic: basic-user-mandate-setup
depends_on:
  - mandates-01-payment-approval-rules
  - mandates-02-team-access-control
  - mandates-03-compliance-gating
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/mandate-backend-integration
  - customer-experience/acquisition-onboarding/consent-audit-trail-architecture
  - document-storage-strategy
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-e-signature-regulatory-validation
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-start-expiry-dates
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
---

# Mandate Governance Review & Digital Signature

## Overview

This feature delivers the final two steps of the V2 mandate journey: a consolidated governance review dashboard that gives directors a complete, accurate picture of the mandate they are about to confirm, followed by a digital signature step that legally activates the governance rules.

The governance review brings together the approval rule configuration, team permissions, compliance statuses, and activation blockers into a single, scannable summary. Directors can simulate payment scenarios, view the approval flow, and identify any outstanding issues before committing. The digital signature step captures the primary director's legally binding confirmation and triggers mandate activation.

## Scope

**In Scope:**

- **Governance Review Dashboard:** consolidated summary of the full mandate configuration including:
  - Approval rule summary (rule type, threshold if applicable)
  - Team permissions matrix (each member, their permissions, compliance status, payment limits)
  - Activation blockers section (outstanding KYC, pending director acceptances)
  - Payment simulation widget (reused from `mandates-01-payment-approval-rules`)
  - Visual approval flow diagram for the configured rule
  - Warning banners for pending items
- Edit links from the review dashboard back to relevant configuration steps (approval rules, team)
- **Digital Signature Step:** primary director draws or uploads a signature as legal confirmation
  - Signature captured as a digital artefact, associated with the mandate version, and stored immutably
  - Binding declaration text displayed alongside the signature capture
  - Mandate version number and timestamp generated at the point of signature
  - Activation triggered on successful signature capture and storage

**Out of Scope:**

- Terms and conditions acceptance by non-primary directors (owned by `mandates-03-compliance-gating`)
- Post-activation mandate amendment (V3+)
- Qualified electronic signatures (QES) — out of scope per `mandate-e-signature-regulatory-validation` BDR unless decision changes
- Mandate activation success screen (carried forward from V1 `mandate-review-amendment`)

## User Journeys

### Happy Path: Director Reviews and Signs

1. Director reaches the Governance Review Dashboard; sees a clean summary of all configuration
2. All compliance statuses show "Verified"; no activation blockers
3. Director reviews the approval flow diagram; runs a payment simulation to confirm understanding
4. Director clicks "Proceed to Sign"; signature capture screen displayed
5. Director draws their signature on the canvas; or uploads a pre-prepared signature image
6. Director reads the binding declaration and clicks "Confirm Signature"
7. Signature is stored; mandate version created; other directors receive acceptance requests; system proceeds to activation

### Blocked Path: Outstanding Items Before Signature

1. Director reaches the Governance Review Dashboard; activation blockers section shows two items: one pending KYC and one director yet to accept
2. Director reviews the pending items; decides to proceed without waiting (mandate will activate in restricted mode)
3. System marks the mandate as **Pending Activation** with restricted mode; director signs
4. Full activation completes automatically when all blockers resolve

### Edge Case: Director Amends Configuration from Review Screen

1. Director on governance review notices the approval threshold is wrong
2. Clicks "Edit Approval Rules"; returns to the approval rules configuration step
3. Amends the threshold; returns to governance review
4. Governance review updates to reflect the amendment; director proceeds to signature

## Technical Considerations

- The governance review dashboard must pull live data from the mandate configuration record — not a cached snapshot; changes made via edit links must be reflected immediately on return
- Digital signature: captured as a base64-encoded image (drawn) or file upload (PNG/JPEG, max 2MB); stored with the mandate document in immutable storage with a 7-year retention period
- Mandate version: generate a unique version identifier (e.g. MND-V2-20260303-001) at the point of signature; this version is referenced in all acceptance requests sent to other directors
- The activation blocking check at signature time must re-evaluate all compliance conditions server-side, even if the director bypasses the UI warning
- Signal to `mandate-review-amendment` activation flow (V1) for any shared activation infrastructure that can be reused

## Stories

| Story | Description |
|-------|-------------|
| [review-governance-summary](stories/review-governance-summary.md) | Consolidated governance dashboard: approval rule, team matrix, compliance statuses, blockers, payment simulation, edit links |
| [digital-sign-mandate](stories/digital-sign-mandate.md) | Digital signature capture (draw or upload); binding declaration; mandate version creation; activation trigger |
