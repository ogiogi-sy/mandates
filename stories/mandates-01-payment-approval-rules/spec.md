---
type: feature
title: "Mandate Payment Approval Rules"
jira_key: NGCX-681
jira_status: Backlog
original_estimate: 2w
release: friends-and-family
parent_epic: basic-user-mandate-setup
depends_on:
  - mandate-setup
  - mandate-authority-configuration
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/mandate-backend-integration
  - customer-experience/acquisition-onboarding/rules-engine-technology
  - digital-bff-tech-stack
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-role-screen-differentiation
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
---

# Mandate Payment Approval Rules

## Overview

This feature delivers the payment approval rules engine for the V2 mandate journey, enabling directors to select and configure the governance model that controls how payments are authorised on their account. Directors choose from three rule types — any one director, two directors always required, or dual approval above a configurable threshold — with the selected rule applied across all payment types (single, bulk, and scheduled).

This is a core governance capability for SME and commercial customers who need to enforce spending controls and reduce financial risk through structured approval workflows. It replaces the implicit "sole authority" model from V1 with explicit, auditable approval logic that propagates to the payments engine at mandate activation.

## Scope

**In Scope:**

- Authority declaration: applicant confirms they are authorised to configure governance on behalf of the business before proceeding
- Rule selection screen presenting three approval models: **Any One Director**, **Two Directors Always**, **Two Directors Above Threshold**
- Dynamic rule preview showing the approval flow path as the director selects each option
- Threshold configuration for the **Two Directors Above Threshold** rule: preset options (£1,000 / £5,000 / £10,000 / £25,000) and a custom numeric input
- Rule applies uniformly to: single payments, bulk payments, and scheduled payments
- Initiator-counts-as-first-approver logic for threshold-based rules
- Sequential (not parallel) approval routing enforced
- Payment flow simulation: director can enter a hypothetical payment amount and see the approval path it would trigger
- Rule and threshold stored in mandate configuration for downstream activation and payments engine propagation
- Audit trail: rule selection, threshold value, and confirming director identity/timestamp recorded

**Out of Scope:**

- Approval workflows in the payments execution engine (owned by `banking-products/payments`)
- Per-user payment limits (covered by `mandates-02-team-access-control`)
- Post-activation rule amendments (V3+)
- Parallel approval routing (not supported in V2)

## User Journeys

### Happy Path: Director Selects Threshold-Based Rule

1. Director completes authority declaration, confirming they are authorised to configure governance
2. Director reaches the approval rules screen; sees three rule options with plain-English descriptions and a dynamic flow preview
3. Director selects **Two Directors Above Threshold**; threshold configuration section expands
4. Director selects £10,000 from the preset list; payment flow preview updates to show: below £10,000 → any one director approves; above £10,000 → two directors must approve sequentially
5. Director uses the payment simulation tool: enters £5,000 → sees single-approval path; enters £15,000 → sees dual-approval path
6. Director confirms; rule and threshold stored in mandate configuration

### Alternative Path: Sole Director (Any One Rule Auto-Selected)

1. Director completes the mandate setup step with no other directors added
2. Approval rules screen defaults to **Any One Director** (pre-selected, since only one director exists)
3. Director cannot select dual-approval rules (options shown as disabled with explanation)
4. Director confirms and proceeds

### Edge Case: Custom Threshold Entry

1. Director selects **Two Directors Above Threshold** and clicks "Enter custom amount"
2. Director types £7,500; system validates (must be numeric, positive, minimum £500)
3. Flow preview updates to reflect the custom threshold
4. Director proceeds; custom threshold stored

## Technical Considerations

- The approval rule is stored in the mandate configuration record (BFF journey state, then committed to core banking on activation)
- Sequential approval logic must be enforced: director 2 cannot approve until director 1 has approved; the initiator counts as director 1 for threshold-based rules
- The rules engine integration point is referenced in the `rules-engine-technology` ADR; ensure the mandate approval rule is serialised in a format the payments engine can consume at activation
- Payment simulation is frontend-only (no backend call); logic mirrors the approval engine rules client-side for immediate feedback
- Threshold presets are configurable (do not hardcode in UI — source from mandate configuration service)
- Analytics: track rule type distribution and threshold selections to understand governance patterns across customer segments

## Stories

| Story | Description |
|-------|-------------|
| [declare-authority](stories/declare-authority.md) | Applicant confirms legal authority to configure account governance; checkbox required; audit record created |
| [select-approval-model](stories/select-approval-model.md) | Director selects from three approval rule types; dynamic preview updates; sole-director auto-selection logic |
| [configure-threshold-approval](stories/configure-threshold-approval.md) | Director sets threshold for dual-approval rule; preset and custom input; per-payment-type application |
| [simulate-payment-flow](stories/simulate-payment-flow.md) | Director simulates a payment amount to visualise the approval path it would trigger under the configured rule |
