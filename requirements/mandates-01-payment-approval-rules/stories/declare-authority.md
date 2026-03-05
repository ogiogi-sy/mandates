---
type: story
title: "Declare Authority to Configure Account Governance"
jira_key: null
jira_status: null
original_estimate: 1d
depends_on: []
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/consent-audit-trail-architecture
  - customer-experience/acquisition-onboarding/companies-house-integration
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
---

## Context

The "Account Access" screen is the entry point to the mandate setup journey. It surfaces the director structure detected from Companies House and asks the applicant to declare the basis on which they are managing the account — as sole director or as one of several directors. This declaration drives the branching logic for the rest of the mandate journey: sole director takes a streamlined path, while multi-director triggers shared governance configuration.

A "Beneficial ownership confirmed" info banner reassures the applicant that Companies House data has been verified and explains that all authorised users will undergo KYC, AML, and sanctions screening.

The applicant must confirm a legally binding statement before they can continue. Without this confirmation, the bank cannot rely on the authority of any subsequent mandate decisions.

## Acceptance Criteria

- [ ] Screen title is **"Account Access"**; heading is **"Who's authorised to manage this account?"**
- [ ] The business name detected from Companies House is displayed in the body copy (e.g. "We've found 2 directors for BRIGHT HOSPITALITY GROUP PLC. Let us know how your business manages account access.")
- [ ] A **"Beneficial ownership confirmed"** info box is shown, stating that directors and persons of significant control have been identified via Companies House and that all authorised users will undergo KYC, AML, and sanctions screening
- [ ] Two radio-style selection options are presented:
  - **"I'm the sole director"** with sub-label "You'll have full control of the account."
  - **"I'm one of several directors"** with sub-label "We'll help you set up shared access."
- [ ] An **"Acting on behalf of the board?"** expandable/link is shown beneath the radio options for applicants acting under a board resolution rather than as a named director
- [ ] A confirmation checkbox is displayed below the selection options with the exact text: **"I confirm I'm authorised to open and manage this account on behalf of [BUSINESS NAME]."**  (business name populated dynamically from Companies House data)
- [ ] **Continue is disabled** until both a director type option is selected AND the confirmation checkbox is ticked
- [ ] Selecting **"I'm the sole director"** routes the journey to a simplified mandate flow (no multi-signatory approval rules)
- [ ] Selecting **"I'm one of several directors"** routes to the approval rules selection screen (`select-approval-model`)
- [ ] The confirmation is stored with full audit metadata: confirming user identity, timestamp, session ID, selected option, and the exact declaration text version shown
- [ ] On back navigation, the previously selected option and checkbox state are preserved

## Test Scenarios

### Happy Path

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Sole director path | Applicant selects "I'm the sole director" and ticks confirmation | Clicks Continue | Journey routes to simplified sole-director mandate flow |
| Multi-director path | Applicant selects "I'm one of several directors" and ticks confirmation | Clicks Continue | Journey routes to approval rules selection screen |
| Business name displayed | Companies House data available | Screen loads | Business name shown in body copy and confirmation checkbox text |

### Failure Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Continue blocked — no selection | Applicant has not selected an option | Attempts to click Continue | Button remains disabled |
| Continue blocked — no checkbox | Applicant has selected an option but not ticked the checkbox | Attempts to click Continue | Button remains disabled |
| Companies House data unavailable | Company lookup returns no director data | Screen loads | Graceful fallback: body copy omits director count; beneficial ownership box not shown; manual entry path offered |

## Technical Notes

- The director count and business name shown on this screen come from the Companies House data fetched during the earlier `onboarding-business-search-selection` step — do not re-fetch here
- The "Acting on behalf of the board?" path is a known edge case; its detailed flow is out of scope for this story — link to the relevant ADR or BDR if one is created
- The sole director vs. multi-director branching must be implemented in the journey orchestrator, not the UI component, so the same screen can be reused regardless of how the routing changes
- Audit record must be immutable once written; retain for minimum 7 years
