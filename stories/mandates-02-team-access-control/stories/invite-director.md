---
type: story
title: "Invite Director to Mandate"
jira_key: NGCX-691
jira_status: Ready
original_estimate: 2d
release: friends-and-family
depends_on:
  - mandate-setup/assign-director-authority
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/mandate-backend-integration
  - idv-provider-onfido
  - async-verification-events
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
---

## Context

For multi-director businesses, all registered directors must be present on the mandate before it can be activated with dual-approval rules. The team configuration screen auto-displays registered directors from Companies House so the primary signatory can invite any who are not yet on the mandate. Each invited director must complete identity verification before their approval rights become active, and the mandate cannot activate with unverified approvers.

## Acceptance Criteria

- [ ] Screen title is **"Your Team"**; heading is **"Set up your team"**; sub-heading is **"Invite directors and team members who need access to this account."**
- [ ] The primary signatory (current applicant) is displayed at the top of the team list with:
  - Name, role label **"Primary signatory · Director"**
  - **"Verified"** badge (green)
  - **"AML cleared"** badge (separate, teal/blue)
  - **"Full access"** label
- [ ] A **"Directors from Companies House"** section header groups directors identified via Companies House who are not yet on the mandate
- [ ] Each not-yet-invited Companies House director is displayed with their name, role ("Director"), status label **"Not yet invited"**, and an **"Invite ›"** button
- [ ] Clicking **"Invite ›"** triggers an invitation email with a secure tokenised link (14-day expiry); the director's status updates to **"Invited"**
- [ ] Invited director status progresses through: **Not yet invited** → **Invited** → **Pending Verification** → **Verified** + **AML cleared** / **Verification Failed**
- [ ] Status updates are reflected in real time via async webhook notifications
- [ ] An **"+ Add another person"** button is available below the directors list for adding non-director team members
- [ ] A helper note is shown: **"You can add people later from your dashboard."**
- [ ] Primary CTA is **"Continue to review →"**; secondary action is **"Skip for now"** (link/text button)
  - "Skip for now" allows the director to proceed without inviting additional directors or team members; the mandate can be activated with only the primary signatory initially
- [ ] If a dual-approval rule is configured and fewer than two directors have been invited, a contextual warning is shown (but does not block "Skip for now")
- [ ] Duplicate invitations are prevented: if a director has already been invited, the "Invite ›" button changes to "Resend" with a confirmation step
- [ ] Audit record is created for each invitation sent: inviting director identity, timestamp, invited director identity

## Test Scenarios

### Happy Path

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Invite second director | Two directors from Companies House; one already on mandate | Primary director clicks "Invite ›" on second director | Email sent; second director shown as "Invited" in team table |
| Director completes KYC | Second director receives invitation | Clicks link, completes Onfido KYC | Status updates to "Verified" + "AML cleared" badges; dual-approval rule now satisfiable |
| Resend invitation | Director has already been invited | Primary director clicks Resend | Confirmation prompt displayed; on confirm, new invitation sent with refreshed 14-day expiry |
| Skip for now | No additional directors invited | Director clicks "Skip for now" | Journey proceeds to mandate review; mandate flagged for pending team completion |

### Failure Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Dual-approval rule with only one verified director | Two directors on mandate; one pending verification | Director attempts to proceed to governance review | Warning banner: "Your approval rule requires two verified directors before you can activate" |
| Director KYC fails | Invited director attempts Onfido verification | All attempts fail | Status updates to "Verification Failed"; primary director notified; option to remove or contact bank for assistance |

## Technical Notes

- The Companies House director list is fetched during onboarding via the existing integration in `onboarding-business-search-selection`; use the cached result rather than re-fetching at this stage
- Invitation tokens must be single-use, cryptographically secure, and stored with expiry metadata
- Async status updates: use webhook notifications from KYC provider to update director status without requiring the primary director to refresh the page
- If a director invitation expires (14 days), the status should update to "Invitation Expired" with a Resend Invite option
