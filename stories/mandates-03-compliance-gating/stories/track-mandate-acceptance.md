---
type: story
title: "Track Director Mandate Acceptance"
jira_key: NGCX-693
jira_status: Ready
original_estimate: 2d
release: friends-and-family
depends_on:
  - enforce-kyc-for-approvers
  - mandates-02-team-access-control/invite-director
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/consent-audit-trail-architecture
  - customer-experience/acquisition-onboarding/mandate-backend-integration
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-e-signature-regulatory-validation
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-mandatee-role-decline
---

## Context

For the mandate to be legally binding, all directors on the mandate must individually accept the mandate terms before the account can become fully operational. This acceptance acts as each director's explicit, auditable consent to the governance rules that will govern the account. A mandate should not activate until every director has confirmed their agreement — either during onboarding or via their invitation link.

## Acceptance Criteria

- [ ] Each director on the mandate has an individual acceptance status: **Accepted**, **Pending Acceptance**, or **Declined**
- [ ] The primary director's acceptance is captured at the digital signature step (see `mandates-04-governance-review-signature`)
- [ ] Other directors receive an acceptance request via email when the primary director completes their signature step; the email contains: a summary of the mandate terms, their assigned role and permissions, and an Accept / Decline action
- [ ] Acceptance status is displayed per director in the mandate summary and governance review screens
- [ ] The mandate cannot transition to **Active** state until all directors show **Accepted** status
- [ ] If a director selects **Decline**:
  - Their status updates to "Declined"
  - Primary director is notified immediately
  - Mandate remains in **Pending Acceptance** state
  - Options presented to the primary director: remove the declining director, amend the mandate, or contact the bank
- [ ] Reminder emails are sent to directors with **Pending Acceptance** status at day 7 and day 12 after the acceptance request
- [ ] Acceptance records are immutable and include: director identity, timestamp, mandate version at the time of acceptance, and the exact terms text version

## Test Scenarios

### Happy Path

| Scenario | Given | When | Then |
|----------|-------|------|------|
| All directors accept | Two directors on mandate; primary has accepted | Second director receives email, clicks Accept | Status updates to "Accepted"; mandate transitions to Active |
| Acceptance status displayed | Director on governance review screen | — | Each director shown with acceptance badge: Accepted / Pending / Declined |
| Reminder sent | Second director has not accepted after 7 days | — | Reminder email sent automatically; status remains Pending Acceptance |

### Failure Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Director declines | Second director receives acceptance request | Clicks Decline | Status → "Declined"; primary director notified; mandate stays Pending Acceptance; remediation options shown |
| Activation blocked | One director status is Pending Acceptance | Primary director attempts activation | Blocker: "Mandate cannot activate until all directors have accepted the mandate terms" |
| Director declines then changes mind | Director has Declined status | Director contacts bank to re-accept | Out of scope for this story — requires manual process; flag as a known gap |

## Technical Notes

- Acceptance records must be stored immutably with the mandate record; retention period minimum 7 years
- The terms text version stored with each acceptance record must be sufficient to reconstruct exactly what the director agreed to at the time of acceptance
- Decline handling: do not auto-remove a director on decline — this is a significant action that should require the primary director to explicitly decide the next step
- Reminder logic: implement as a scheduled job triggered by the mandate service; reminders at T+7 and T+12 days from acceptance request sent date
- Mandate version: if the mandate configuration is amended after acceptance requests are sent, existing acceptances may be invalidated — define behaviour in `mandate-setup-scope-v1-v2-v3-ff` BDR (out of scope for V2)
