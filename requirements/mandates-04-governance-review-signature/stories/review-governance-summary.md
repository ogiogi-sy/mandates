---
type: story
title: "Review Governance Summary Dashboard"
jira_key: null
jira_status: null
original_estimate: 3d
depends_on:
  - mandates-01-payment-approval-rules/simulate-payment-flow
  - mandates-03-compliance-gating/enforce-kyc-for-approvers
  - mandates-03-compliance-gating/track-mandate-acceptance
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/mandate-backend-integration
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
---

## Context

Before confirming the mandate, the director sees a consolidated "Account governance summary" that brings together the approval rule, team permissions, activation status, and signing section in a single scrollable screen. This is the director's last opportunity to review everything and spot any outstanding blockers before making a legally binding commitment. The screen uses a clear activation checklist with ✅/⚠️ indicators, visual flow diagrams, and a payment simulation link to help the director understand the governance they are about to confirm.

## Acceptance Criteria

- [ ] Screen title is **"Mandate Review"**; heading is **"Account governance summary"**; sub-heading is **"Review your approval rules, team permissions, and mandate status."**

  **Approval Rules Section**
  - [ ] Rule name displayed (e.g. **"Standard payments"**) with an activation status badge (e.g. **"# Pending activation"** or **"Active"**)
  - [ ] Threshold displayed as payment ranges, not raw numbers — e.g. **"£0 – £5,000: 1 Director"** and **"£5,001+: 2 Directors"**
  - [ ] **"Single payments"** and **"Bulk payments"** tabs indicate the rule applies to both payment types
  - [ ] Two action links below the rule display: **"Edit rule"** (returns to approval rules step) and **"Simulate a payment"** (opens payment simulation)

  **Review Rules Section — Visual Flow Diagrams**
  - [ ] Sequential flow diagrams shown for below-threshold and above-threshold paths:
    - Below threshold: **Initiated → Director 1 → Executed**
    - Above threshold: **Initiated → Director 1 → Director 2 → Executed**
  - [ ] Each node in the flow is visually distinct (circle/avatar); arrows indicate direction

  **Team Permissions Matrix**
  - [ ] Table showing all mandate members with columns: **Person**, **View**, **Initiate**, **Approve Payments**, **Manage Beneficiaries**, **Manage Team** (icon-based ✓/— per permission)
  - [ ] Compliance status badge shown per person (Verified / Pending Verification / Verification Failed)
  - [ ] Any member with a pending status shows a visual indicator (e.g. amber warning dot)

  **Mandate Activation Checklist**
  - [ ] A checklist section shows each activation prerequisite with a status indicator:
    - ✅ Primary signatory verified
    - ✅ Second director verified (where applicable)
    - ✅ All directors accepted mandate terms (or ⚠️ if pending)
    - ⚠️ *N* person(s) awaiting verification — with a **"Resend"** action link for each
  - [ ] Each ⚠️ item includes a contextual inline action (e.g. "Resend" invitation)
  - [ ] An informational note explains restricted mode where relevant (e.g. "Your account operates with approval for high-value payments once all verifications are complete")

- [ ] All data on the dashboard reflects the current saved configuration; compliance status badges update in near real time via async events
- [ ] Director can navigate back from this screen without losing any configuration

## Test Scenarios

### Happy Path

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Threshold displayed as ranges | Threshold rule configured at £5,000 | Director reaches mandate review | Approval rules show: "£0 – £5,000: 1 Director" and "£5,001+: 2 Directors" |
| Visual flow diagrams | Threshold rule active | Director on mandate review | Two flow diagrams shown: below-threshold (1-step) and above-threshold (2-step sequential) |
| Checklist all green | All directors verified and mandate terms accepted | Director on mandate review | All checklist items show ✅; no warnings displayed |
| Resend from checklist | One team member awaiting verification | Director on mandate review | ⚠️ item shows "Resend" link; clicking it triggers a new invitation email |

### Failure Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Pending verification shown | One approver has not completed KYC | Director reaches mandate review | ⚠️ item: "1 person awaiting verification" with Resend action |
| Pending acceptance shown | Second director has not accepted mandate terms | Director on mandate review | ⚠️ item: "All directors accepted mandate terms" shown with pending status |

## Technical Notes

- Retrieve live data from the mandate configuration service — do not rely on stale journey state cache for this view
- Activation checklist status is queried from the mandate service's activation readiness endpoint; do not reimplement this logic client-side
- The "Simulate a payment" link reuses the simulation component from `simulate-payment-flow`
- The permissions matrix uses icon-based indicators (✓/—) for scannability rather than text labels in every cell
- The "Edit rule" link returns the director to the approval rules step; on return, the review screen refreshes to reflect any changes
