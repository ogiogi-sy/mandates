---
type: story
title: "Configure Threshold-Based Dual Approval"
jira_key: null
jira_status: null
original_estimate: 2d
depends_on:
  - select-approval-model
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/mandate-backend-integration
  - customer-experience/acquisition-onboarding/rules-engine-technology
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
---

## Context

When the director selects the **Two Directors Above Threshold** approval rule, they must set the threshold value that determines when dual approval is required. This configuration is critical for risk management: it allows businesses to permit autonomy for routine low-value payments while enforcing oversight on significant transactions. The threshold applies per transaction across single, bulk, and scheduled payments.

## Acceptance Criteria

- [ ] Threshold configuration section is displayed inline when **"Two required above a threshold"** is selected; hidden for other rule types
- [ ] Five preset threshold options are presented as selectable chips: **£1,000**, **£5,000** (default pre-selected), **£10,000**, **£25,000**, and **"Custom"**
- [ ] **£5,000 is pre-selected by default** when the threshold rule is first chosen
- [ ] Selecting **"Custom"** reveals a numeric input field
- [ ] Custom amount validation:
  - Must be a positive integer or decimal (up to 2 decimal places)
  - Minimum value: £500
  - Maximum value: £1,000,000
  - Non-numeric input shows inline error: "Please enter a valid amount"
  - Below minimum shows: "Threshold must be at least £500"
- [ ] The threshold applies per transaction to: single payments and bulk payments (shown as labelled tabs on the mandate review screen)
- [ ] Initiator of a payment counts as the first approving director; a second director must approve separately for payments at or above the threshold
- [ ] Approval flow preview updates in real time when the threshold changes, showing example below-threshold and above-threshold paths with the selected amount reflected (e.g. "£0–£5,000: 1 Director / £5,001+: 2 Directors")
- [ ] Threshold value is stored in journey state alongside the rule type; persists on back navigation

## Test Scenarios

### Happy Path

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Default threshold pre-selected | Director has selected "Two required above a threshold" | Rule card selected | £5,000 chip highlighted by default; Continue enabled immediately |
| Select different preset | Director on threshold configuration | Clicks £10,000 chip | £10,000 highlighted; preview shows: £0–£10,000 → 1 Director / £10,001+ → 2 Directors |
| Enter custom threshold | Director on threshold configuration | Selects "Custom", types 7500 | Preview updates to £7,500 threshold; stored in journey state |
| Threshold persists on back | Director configured threshold and proceeded | Navigates back | Previously entered threshold pre-populated; no re-entry required |

### Failure Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Non-numeric custom input | Director enters "five thousand" in custom field | Clicks Continue | Inline error: "Please enter a valid amount" |
| Below minimum | Director enters £200 | Clicks Continue | Inline error: "Threshold must be at least £500" |
| No threshold selected | Director on threshold config without selecting preset or entering custom | Clicks Continue | Validation: "Please select or enter a threshold amount" |

## Technical Notes

- The threshold value is stored as a minor currency unit (pence) in the mandate configuration record to avoid floating-point issues
- Bulk payment threshold logic: the rule applies per individual transaction within the batch, not to the batch total — clarify with the payments squad if batch-level threshold is needed
- The rules engine must receive: `rule_type: TWO_ABOVE_THRESHOLD`, `threshold_amount: <pence>`, `initiator_counts_as_approver: true`
- Threshold presets are sourced from configuration service, not hardcoded; allows future adjustment without a code change
- The mandate review screen (screen 5) displays the threshold as actual payment ranges: "£0–[threshold]: 1 Director / [threshold+1]+: 2 Directors" — ensure the stored threshold value can produce this display format
