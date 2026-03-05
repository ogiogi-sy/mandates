---
type: story
title: "Select Payment Approval Model"
jira_key: null
jira_status: null
original_estimate: 2d
depends_on:
  - declare-authority
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/mandate-backend-integration
  - customer-experience/acquisition-onboarding/rules-engine-technology
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-role-screen-differentiation
---

## Context

After confirming authority, the director selects the approval model that governs how payments are authorised on the account. This is the primary governance decision in the mandate flow. Three rule types are available, each reflecting a different risk appetite: sole authority, mandatory dual approval, or conditional dual approval above a threshold. The selected rule determines the approval path for every payment on the account.

The screen heading is **"How should payments be approved?"** with a sub-heading: **"Choose a starting rule. You can adjust this later in the app."** — making clear this is not a permanent, irreversible choice.

## Acceptance Criteria

- [ ] Screen title is **"Approval Rules"**; heading is **"How should payments be approved?"**; sub-heading is **"Choose a starting rule. You can adjust this later in the app."**
- [ ] Three rule options are presented as selectable cards with labels and plain-English descriptions:
  - **"Any one director"** — "Any authorised director can approve payments independently."
  - **"Two directors required"** — "All payments need approval from two directors before they go through."
  - **"Two required above a threshold"** — "One director for everyday payments. Two required above a set amount."
- [ ] Only one rule can be selected at a time (radio-card pattern); Continue is enabled once a selection is made
- [ ] Selecting **"Two required above a threshold"** expands the threshold configuration section inline (see `configure-threshold-approval`)
- [ ] If only one director exists on the mandate, **"Two directors required"** and **"Two required above a threshold"** are visible but disabled with an explanatory message (e.g. "Requires at least two directors on the mandate")
- [ ] The selected rule is stored in journey state; selections persist on back navigation
- [ ] Proceeding without a selection shows a validation message: "Please select an approval model to continue"

## Test Scenarios

### Happy Path

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Select Any one director | Director on rule selection screen | Selects "Any one director" | Flow preview shows single-step approval; Continue enabled |
| Select Two directors required | Two directors on mandate | Selects "Two directors required" | Flow preview shows two-step sequential approval; Continue enabled |
| Rule persists on back navigation | Director has selected a rule and proceeded | Clicks back | Previously selected rule still highlighted; no validation error |

### Failure Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Continue without selection | Director on rule selection screen | Clicks Continue without selecting | Validation message: "Please select an approval model to continue" |
| Dual-approval option unavailable | Only one director on mandate | Attempts to select "Two directors required" | Option shown as disabled with message: "Requires at least two directors on the mandate" |

## Technical Notes

- Rule selection feeds directly into the mandate configuration record; the downstream payments engine must receive the rule type in a structured format on mandate activation
- The flow preview diagrams are illustrative only; they do not represent real payment data
- Sole-director detection should be based on the mandate configuration at this point in the journey, not re-fetched from Companies House
- Analytics: track rule type selection rates by customer segment to inform product decisions
