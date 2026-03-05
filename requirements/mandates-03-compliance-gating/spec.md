---
type: feature
title: "Mandate Compliance Gating"
jira_key: null
jira_status: null
original_estimate: 1w
parent_epic: user-mandate-setup-v2
depends_on:
  - mandates-02-team-access-control
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/mandate-backend-integration
  - async-verification-events
  - idv-provider-onfido
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
  - customer-experience/acquisition-onboarding/mandate-mandatee-role-decline
---

# Mandate Compliance Gating

## Overview

This feature embeds the compliance controls required before a mandate can become active. It ensures that identity verification (KYC) and AML screening are complete for all users with payment approval rights, that all directors have explicitly accepted the mandate terms, and that the system enforces activation blocking logic when these conditions are not met.

Without this gating, the bank cannot rely on the legal validity of the mandate or the compliance status of the individuals it authorises to act on the account. This feature makes compliance prerequisites visible, trackable, and actionable throughout the mandate setup journey — not as a final blocker, but as an ongoing status the director can monitor and act on.

## Scope

**In Scope:**

- KYC status tracking and enforcement for all users with **Approve Payments** permission
- AML clearance and sanctions screening status display per user (results sourced from `core-capabilities/kyc-credit-risk` and `core-capabilities/fraud-fincrime`)
- Approval rights blocked at the mandate level until KYC and AML complete for the relevant user
- Mandate acceptance tracking: each director must individually accept the mandate terms; status visible in the mandate dashboard
- Activation blocking logic: mandate cannot move to Active state until all compliance conditions are met
- Warning banners and clear status indicators throughout the team configuration and governance review screens
- "Restricted mode" indication: mandate can partially activate (account opened, view access granted) while compliance is pending, but payment approval rights are locked
- Notification to the primary director when a pending team member completes or fails verification

**Out of Scope:**

- The KYC/AML screening process itself (owned by `core-capabilities/kyc-credit-risk` and `core-capabilities/fraud-fincrime`)
- Sanctions screening logic (owned by `core-capabilities/fraud-fincrime`)
- Post-activation compliance re-screening (V3+)

## User Journeys

### Happy Path: All Compliance Met Before Activation

1. Director has added two directors and an accountant with Approve Payments permission
2. All three complete KYC and AML clearance; all directors accept mandate terms
3. Governance review screen shows all users as "Verified" with green status indicators
4. No activation blockers; director can proceed to digital signature and activation

### Blocked Path: Pending Verification at Activation Attempt

1. Director attempts to activate the mandate; second director has not yet completed KYC
2. System displays activation blocker: "One or more approvers are pending identity verification. Your mandate cannot activate until all approvers are verified."
3. Second director's status shows as "Pending Verification" in the team table
4. Primary director notified by email when second director completes KYC; activation blocker resolves

### Edge Case: User Fails Verification

1. An invited team member with Approve Payments permission fails KYC (all attempts exhausted)
2. Status updates to "Verification Failed"
3. System automatically revokes the Approve Payments permission for that user
4. Primary director is notified; options presented: remove the user from the mandate, or refer to bank for manual review

## Technical Considerations

- Compliance status is sourced asynchronously from KYC and fraud/fincrime services; status updates must propagate to the mandate UI in near real time via webhook events
- The activation blocking check is enforced at the backend mandate service level, not only at the UI — UI enforcement is supplementary
- Restricted mode: define clearly what "partial activation" means (e.g. account accessible, balance visible, no outbound payments) and ensure core banking supports this state
- Mandate acceptance tracking requires a per-director acceptance record (who accepted, when, what version of terms) — link to the audit trail architecture ADR

## Stories

| Story | Description |
|-------|-------------|
| [enforce-kyc-for-approvers](stories/enforce-kyc-for-approvers.md) | Gate Approve Payments permission on KYC and AML completion; display compliance status; block activation for unverified approvers |
| [track-mandate-acceptance](stories/track-mandate-acceptance.md) | Track individual director acceptance of mandate terms; display status; block activation until all directors have accepted |
