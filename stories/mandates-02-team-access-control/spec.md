---
type: feature
title: "Mandate Team & Access Control"
jira_key: NGCX-682
jira_status: Backlog
original_estimate: 2w
release: friends-and-family
parent_epic: basic-user-mandate-setup
depends_on:
  - mandate-setup
  - mandates-01-payment-approval-rules
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/mandate-backend-integration
  - idv-provider-onfido
  - digital-bff-tech-stack
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-default-roles
  - customer-experience/acquisition-onboarding/mandate-custom-role-configuration
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
---

# Mandate Team & Access Control

## Overview

This feature delivers granular role-based access control (RBAC) for the V2 mandate journey, enabling directors to configure exactly what each team member — directors and non-director employees — can do on the account. Going beyond the five predefined roles of V1, this feature introduces individual permission toggles and per-user payment limits, giving SME and commercial customers fine-grained control over their account governance.

Directors are auto-imported from Companies House and can invite additional registered directors to join the mandate. Non-director team members (e.g. accountants, finance managers) can be added with a custom permission profile. Per-user payment initiation and approval limits are configurable, subject to the account-level approval rule configured in `mandates-01-payment-approval-rules`.

## Scope

**In Scope:**

- Auto-display of registered directors from Companies House with invite capability for those not yet on the mandate
- Invite additional directors by email; invitation sent with secure tokenised link
- Add non-director team members with a role selection: **Director**, **Accountant**, or custom permission profile
- Six granular permission toggles per user: **View Account**, **Initiate Payments**, **Approve Payments**, **Manage Beneficiaries**, **Manage Team**, **Card Access**
- **Approve Payments** permission is gated — cannot be enabled until the user has passed KYC and AML screening
- **Manage Team** permission is restricted to directors only (enforced as a business rule)
- Per-user **payment initiation limit** and **payment approval limit** configurable for users with the relevant permissions
- Status tracking per team member: **Invited** → **Pending Verification** → **Verified** → **Verification Failed**
- Team table showing all members with name, role, permissions summary, payment limits, and verification status
- Mandate cannot activate until all users with **Approve Payments** permission have completed KYC

**Out of Scope:**

- Identity verification flow itself (KYC/AML checks owned by `core-capabilities/kyc-credit-risk`)
- Post-activation team management (V3+)
- More than 15 non-director team members (cap carried forward from V1)
- Custom role creation (V3+)

## User Journeys

### Happy Path: Director Invites a Second Director and Adds an Accountant

1. Director reaches the team configuration screen; registered directors from Companies House are displayed — those already on the mandate shown as active, others as "Not on mandate yet"
2. Director clicks "Invite Director" for a second registered director; invitation email sent
3. Director clicks "Add Team Member"; enters accountant's name and email; selects role "Accountant"
4. System pre-populates permission toggles: **View Account** ON, **Initiate Payments** ON, **Approve Payments** OFF (pending KYC), **Manage Beneficiaries** OFF, **Manage Team** OFF, **Card Access** OFF
5. Director customises: turns **Manage Beneficiaries** ON; sets payment initiation limit to £50,000
6. Director saves; accountant appears in the team table with status "Invited"
7. Accountant completes ID&V via invitation link; status updates to "Verified"; **Approve Payments** toggle becomes available

### Alternative Path: Director Configures Granular Permissions for Finance Manager

1. Director adds a finance manager; selects "Custom" permission profile
2. All six toggles start in their default state; director enables: View Account, Initiate Payments, Manage Beneficiaries
3. Director sets initiation limit to £25,000 per payment
4. Director saves; finance manager receives invitation

### Edge Case: Approve Payments Requested for Unverified User

1. Director adds a team member and immediately tries to enable Approve Payments
2. System shows the toggle as disabled with tooltip: "This user must complete identity verification before they can approve payments"
3. Toggle becomes enabled automatically once the user's KYC status updates to Verified

## Technical Considerations

- Permission state and payment limits are stored in BFF journey state and committed to the mandate record on activation
- The **Approve Payments** gate must be re-evaluated at activation time — if a user's KYC fails before activation, their Approve Payments permission must be revoked automatically
- Manage Team permission enforcement: if a non-director user has Manage Team toggled ON, the system should reject this at validation with a clear error
- Payment limits must be validated against the account-level threshold (per-user limit cannot exceed the account governance threshold from `mandates-01-payment-approval-rules`)
- Director invitations use the same tokenised link mechanism as V1 employee invitations (14-day expiry)
- The team table component should be designed for reuse in post-activation mandate management settings

## Stories

| Story | Description |
|-------|-------------|
| [invite-director](stories/invite-director.md) | Display Companies House directors; invite unregistered directors; track invitation and verification status |
| [add-team-member](stories/add-team-member.md) | Add non-director team members with role selection and granular permission toggles |
| [assign-payment-limits](stories/assign-payment-limits.md) | Set per-user payment initiation and approval limits; validate against account-level governance threshold |
