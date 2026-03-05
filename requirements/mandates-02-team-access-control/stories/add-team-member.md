---
type: story
title: "Add Non-Director Team Member with Granular Permissions"
jira_key: null
jira_status: null
original_estimate: 3d
depends_on:
  - invite-director
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/mandate-backend-integration
  - idv-provider-onfido
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-custom-role-configuration
  - customer-experience/acquisition-onboarding/mandate-default-roles
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
---

## Context

Directors need to grant account access to non-director team members — such as accountants, finance managers, or bookkeepers — with precise control over what each person can do. Rather than assigning a broad predefined role, V2 allows directors to configure individual permission toggles per user, giving businesses the flexibility to tailor access to their operational structure without granting unnecessary privileges.

## Acceptance Criteria

- [ ] The form is accessible from the **"+ Add another person"** button on the team screen; the form screen carries the same **"Your Team"** title
- [ ] Form heading: **"Add a team member"**; sub-heading: **"Set their role, permissions, and payment limits."**
- [ ] Form fields:
  - **Full name** (required, labelled "Full name", placeholder "Enter full name")
  - **Email address** (required, labelled "Email address", placeholder "name@example.com", validated format)
  - **Role** dropdown (required)
- [ ] Role dropdown options: **Director**, **Accountant**, and implicitly custom via permissions configuration
  - Selecting **Director** triggers the director invitation flow (see `invite-director`)
- [ ] Six permission toggles are displayed in a **"Permissions"** section with labels and short descriptions:
  - **View account** — "See balances and transactions"
  - **Initiate payments** — "Create and submit payments"
  - **Approve payments** — "Approve payments within your signing rules"
  - **Manage beneficiaries** — "Add and edit payees"
  - **Manage team** — "Invite or remove people"
  - **Card access** — "Issue a debit card for this person"
- [ ] **When the Director role is selected, all six toggles default to ON**
- [ ] When **Approve payments** is toggled ON, a contextual **"KYC/AML screening required"** info box appears below the toggles with the text: *"This person can approve payments and must complete identity verification, sanctions screening, and digitally accept the mandate."*
- [ ] **"Set payment limits"** is displayed as a **collapsed accordion** below the permissions section; expanding it reveals per-user limit configuration (see `assign-payment-limits`)
- [ ] Primary CTA is **"Send invite"** (not "Save"); clicking it sends an invitation email and adds the person to the team table with status "Invited"
- [ ] Duplicate email check: if the email already exists on the mandate, show: "This person has already been added"
- [ ] Maximum of 15 non-director team members enforced; adding a 16th shows: "Maximum of 15 team members reached"

## Test Scenarios

### Happy Path

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Add Director — all permissions ON | Director role selected in form | Role dropdown set to "Director" | All six permission toggles automatically set to ON |
| Approve Payments — KYC box appears | Approve payments toggle is turned ON | — | "KYC/AML screening required" info box appears below toggles |
| Send invite | Director completes form and clicks "Send invite" | — | Invitation email sent; person appears in team table as "Invited" |
| Approve Payments becomes available | Team member has been invited | Member completes KYC and AML | Approve Payments toggle becomes activatable; director can turn it on |

### Failure Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Approve Payments toggle blocked | Director on add-member form for new (unverified) user | Attempts to enable Approve Payments | Toggle stays disabled; tooltip: "This user must complete identity verification before they can approve payments" |
| Manage Team for non-director | Director on custom permissions | Attempts to enable Manage Team for an Accountant role | Toggle disabled or error: "Only directors can be granted team management access" |
| Duplicate email | Team member already added | Director enters same email again | Inline error: "This person has already been added to your mandate" |
| 16th member | 15 non-director members already added | Director clicks "Add Team Member" | Message: "Maximum of 15 team members reached. You can add more after your account is active." |

## Technical Notes

- Director role default: all six permissions ON (matching prototype screen 4)
- Accountant role default: View account ON, Initiate payments ON, Approve payments OFF (KYC-gated), Manage beneficiaries OFF, Manage team OFF, Card access OFF
- The "Set payment limits" accordion in this form is implemented by the `assign-payment-limits` story component
- Permission state for each user is stored as a structured entitlement object in the BFF journey state; committed to the mandate record on activation
- Invitation tokens follow the same pattern as V1 employee invitations (single-use, 14-day expiry, Onfido for KYC)
- The team table must support real-time status updates via async webhooks without requiring a page refresh
