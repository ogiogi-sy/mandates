---
type: story
title: "Simulate Payment Approval Flow"
jira_key: NGCX-688
jira_status: Ready
original_estimate: 1d
release: friends-and-family
depends_on:
  - select-approval-model
  - configure-threshold-approval
blocked_by_adrs: []
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
---

## Context

Before confirming their approval rule configuration, directors benefit from seeing exactly how a real payment would be processed under the governance model they've set up. A payment simulation tool allows the director to enter a hypothetical payment amount and instantly see the approval path it would trigger. This builds confidence in the configuration and reduces the risk of directors activating a mandate with misunderstood governance rules.

## Acceptance Criteria

- [ ] A "Simulate a payment" section is presented on the approval rules confirmation screen, below the selected rule summary
- [ ] Director can enter a payment amount in a currency input field; the simulation updates in real time as they type (no submit button required)
- [ ] Simulation output displays:
  - The approval path as a visual step-by-step flow (e.g. "You initiate → Director 2 approves → Payment executes")
  - A clear label indicating whether the payment is **below threshold** or **at/above threshold** (for threshold-based rules)
  - The number of approvals required
- [ ] Simulation reflects the currently configured rule and threshold exactly; if the director changes the rule or threshold, the simulation updates immediately
- [ ] For **Any One Director** rule: simulation always shows single-approval path regardless of amount entered
- [ ] For **Two Directors Always** rule: simulation always shows dual-approval path regardless of amount entered
- [ ] For **Two Directors Above Threshold** rule: simulation shows single-approval path for amounts below the threshold and dual-approval path for amounts at or above
- [ ] The simulation is illustrative only; no backend call is made; a clear label states "This is a simulation and does not represent a real payment"
- [ ] The simulation tool is optional — the director can proceed without using it

## Test Scenarios

### Happy Path

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Below-threshold simulation | Rule: Two Directors Above £10,000 | Director enters £5,000 | Simulation shows: "1 approval required — you can approve and execute this payment" |
| Above-threshold simulation | Rule: Two Directors Above £10,000 | Director enters £15,000 | Simulation shows: "2 approvals required — you initiate, a second director must approve" |
| Any One Director simulation | Rule: Any One Director | Director enters any amount | Simulation always shows single-approval path |
| Simulation updates on rule change | Director has simulated £5,000 | Changes rule from Any One to Two Always | Simulation immediately updates to show dual-approval path for £5,000 |

### Failure Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Non-numeric amount entered | Director types "hello" in simulation field | — | Simulation shows placeholder state; no error (field gracefully handles non-numeric input without disrupting the journey) |

## Technical Notes

- Simulation logic is a pure client-side calculation; it mirrors the approval engine rules without any backend dependency
- The simulation component should be reusable for post-activation display in mandate settings (V3+)
- Do not use the simulation input as a data capture field; it is discarded on submission and does not affect the mandate configuration
