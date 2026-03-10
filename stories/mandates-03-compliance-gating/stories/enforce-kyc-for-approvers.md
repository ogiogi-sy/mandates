---
type: story
title: "Enforce KYC and AML Gating for Payment Approvers"
jira_key: NGCX-692
jira_status: Ready
original_estimate: 2d
release: friends-and-family
depends_on:
  - mandates-02-team-access-control/add-team-member
blocked_by_adrs:
  - async-verification-events
  - idv-provider-onfido
  - customer-experience/acquisition-onboarding/mandate-backend-integration
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
---

## Context

Allowing unverified individuals to approve payments would expose the bank to significant AML and fraud risk. Anyone with the **Approve Payments** permission must have completed identity verification (KYC via Onfido) and received AML clearance before their approval rights are active on the account. This story ensures that permission state, activation logic, and UI feedback are all governed by compliance status — surfacing blockers clearly while allowing the mandate setup journey to continue in parallel.

## Acceptance Criteria

- [ ] **Approve Payments** permission toggle is disabled for any team member who has not completed KYC; tooltip shown: "Identity verification required before this user can approve payments"
- [ ] Each team member in the team table displays a compliance status badge with the following states:
  - **Verified** (green) — KYC and AML clearance complete
  - **Pending Verification** (amber) — invitation sent; awaiting completion
  - **Verification Failed** (red) — KYC exhausted or AML declined
  - **Not Invited** (grey) — user not yet sent an invitation
- [ ] AML clearance status is displayed alongside KYC status for users with Approve Payments permission; a single "Cleared" / "Under Review" / "Declined" indicator is sufficient (do not expose raw screening details)
- [ ] When a team member's KYC completes successfully:
  - Compliance badge updates to "Verified" in real time
  - **Approve Payments** toggle becomes enabled for that user
  - Primary director receives an in-app notification and email: "[Name] has completed identity verification"
- [ ] When a team member's KYC fails:
  - Compliance badge updates to "Verification Failed"
  - **Approve Payments** permission is automatically revoked if it was enabled
  - Primary director is notified; offered options: remove user from mandate, or contact the bank
- [ ] Mandate activation is blocked if any user with **Approve Payments** permission ON has a compliance status other than "Verified"
- [ ] Activation blocker is displayed as a warning banner on the governance review screen: "Activation blocked: [N] approver(s) have not completed identity verification"
- [ ] Sanctions screening failure follows the same pattern as AML decline — compliance badge shows "Declined"; Approve Payments permission blocked

## Test Scenarios

### Happy Path

| Scenario | Given | When | Then |
|----------|-------|------|------|
| KYC completed — permission unlocks | Team member has Approve Payments disabled (pending KYC) | Member completes Onfido KYC | Compliance badge → "Verified"; Approve Payments toggle enabled; director notified |
| All approvers verified — no blocker | All team members with Approve Payments have Verified status | Director navigates to governance review | No activation blocker shown; mandate can proceed |

### Failure Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Approve Payments toggle while unverified | Team member not yet KYC'd | Director tries to enable Approve Payments | Toggle stays disabled; tooltip: "Identity verification required" |
| KYC failure | Team member fails Onfido all attempts | — | Badge → "Verification Failed"; Approve Payments revoked; director notified with remediation options |
| Activation blocked by unverified approver | One approver is "Pending Verification" | Director attempts mandate activation | Blocker banner: "Activation blocked: 1 approver has not completed identity verification" |
| Sanctions decline | Team member flagged during sanctions screening | — | AML status → "Declined"; Approve Payments blocked; director notified |

## Technical Notes

- Compliance status updates are delivered via async webhook events from Onfido and the AML/sanctions screening service; the mandate UI subscribes to these events and updates in real time
- The activation check must be enforced server-side at the mandate service layer; the UI blocker is supplementary
- If Approve Payments was previously enabled and then a user's KYC lapses or is revoked, the permission must be automatically disabled — implement as an event-driven update, not a polling loop
- Do not surface raw screening data (e.g. specific sanctions list hits) in the UI; use the abstracted compliance status only
