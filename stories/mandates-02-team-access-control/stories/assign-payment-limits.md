---
type: story
title: "Assign Per-User Payment Limits"
jira_key: NGCX-690
jira_status: Ready
original_estimate: 2d
release: friends-and-family
depends_on:
  - add-team-member
  - mandates-01-payment-approval-rules/configure-threshold-approval
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/mandate-backend-integration
  - customer-experience/acquisition-onboarding/rules-engine-technology
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
---

## Context

When adding a team member (see `add-team-member`), the director can optionally set per-user payment limits via a **"Set payment limits"** collapsed accordion at the bottom of the add-member form. Per-user limits give businesses an additional layer of spending control on top of the account-level approval rule: a junior team member can be restricted to initiating payments up to £5,000, while a senior finance manager might have a £100,000 limit. These limits are enforced at the payments execution layer.

## Acceptance Criteria

- [ ] **"Set payment limits"** is displayed as a collapsed accordion at the bottom of the add-member form; it is optional and can be skipped
- [ ] Payment limit fields are shown within the accordion for users with **Initiate payments** or **Approve payments** permissions enabled
- [ ] Two configurable limit fields per eligible user:
  - **Payment Initiation Limit** — maximum value of a single payment the user can submit (applies to users with Initiate Payments ON)
  - **Payment Approval Limit** — maximum value of a payment the user can approve (applies to users with Approve Payments ON)
- [ ] Preset options available for each limit: **£1,000 / £5,000 / £10,000 / £25,000 / £50,000 / £100,000 / Unlimited** and **"Enter custom amount"**
- [ ] Custom amount validation: positive numeric value, minimum £1, maximum £10,000,000
- [ ] Per-user limit cannot exceed the account-level governance threshold (where a threshold rule is configured); system shows inline warning if the director attempts to set a per-user limit above the threshold: "This limit exceeds your account approval threshold of £X"
- [ ] Users with no payment-related permissions (View Account only) do not show limit fields
- [ ] **Unlimited** is permitted for directors; non-director team members can only select Unlimited with explicit confirmation prompt
- [ ] Limit values are stored per user in the mandate configuration record; displayed in the team summary table
- [ ] Back navigation preserves all limit entries

## Test Scenarios

### Happy Path

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Set initiation limit for accountant | Accountant has Initiate Payments ON | Director selects £25,000 from presets | Limit saved; shown in team table as "Up to £25,000" |
| Set custom approval limit | Finance manager has Approve Payments ON | Director enters £75,000 as custom amount | Limit saved; shown in team table |
| Unlimited for director | Director row | Director selects "Unlimited" for approval limit | No warning shown; Unlimited stored for director |

### Failure Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Per-user limit exceeds governance threshold | Account threshold set at £10,000 | Director sets employee approval limit to £25,000 | Inline warning: "This limit exceeds your account approval threshold of £10,000" (does not block; warns) |
| Non-numeric custom input | Director types "fifty thousand" | Clicks Save | Inline error: "Please enter a valid amount" |
| Unlimited for non-director without confirmation | Non-director team member | Director selects Unlimited | Confirmation prompt: "Are you sure? This allows [Name] to initiate/approve payments of any value." Director must confirm to proceed |

## Technical Notes

- Per-user limits are enforced at payments execution time, not at the UI layer — the limits must be propagated to the payments engine as part of mandate activation
- The limit model in the mandate configuration record should support both initiation and approval limits independently per user
- The "Unlimited" option for non-directors should require an explicit confirmation step to reduce the risk of accidental over-permissioning
- Analytics: track distribution of per-user limits to identify risk concentration patterns
