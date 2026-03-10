# Monday Feature: Story ↔ Prototype Coverage Analysis

## 1. Story Inventory

The `stories/` folder contains **4 feature specs** and **14 user stories** (including 1 design story):

| Feature | Stories | Total Estimate |
|---------|---------|----------------|
| **mandates-01** Payment Approval Rules | 00-design-mandates-ui-ux, declare-authority, select-approval-model, configure-threshold-approval, simulate-payment-flow | ~1w + 2w design |
| **mandates-02** Team & Access Control | invite-director, add-team-member, assign-payment-limits | ~1w |
| **mandates-03** Compliance Gating | enforce-kyc-for-approvers, track-mandate-acceptance | ~4d |
| **mandates-04** Governance Review & Signature | review-governance-summary, digital-sign-mandate | ~6d |

---

## 2. Screen-by-Screen: Story → Prototype Mapping

### Screen 1: Account Access (`ScreenAuthorityConfirmation.tsx`)
**Covered by:** `declare-authority` (NGCX-686)

| Story Requirement | Prototype Status | Notes |
|-------------------|-----------------|-------|
| "Who's authorised to manage this account?" heading | ✅ Present | |
| Business name + director count from Companies House | ✅ Present | Dynamic `{companyName}` and `{directorCount}` |
| "Beneficial ownership confirmed" info box | ✅ Present | Shield icon, KYC/AML/sanctions copy |
| Sole director / multi-director radio cards | ✅ Present | Two cards with icons, descriptions |
| "Acting on behalf of the board?" expandable | ✅ Present | Opens bottom sheet with upload + declaration |
| Confirmation checkbox with dynamic business name | ✅ Present | Exact copy matches story |
| Continue disabled until selection + checkbox ticked | ✅ Present | `canContinue` logic checks both |
| Back navigation preserves state | ✅ Present | `initialAuthorityType` prop |
| Companies House data unavailable fallback | ⚠️ Partial | Prototype doesn't show the empty-state fallback (no directors found) |
| Audit trail (identity, timestamp, session, text version) | ⏭️ Backend | Not visible in prototype — expected |

### Screen 2: Approval Rules (`ScreenApprovalRule.tsx`)
**Covered by:** `select-approval-model` (NGCX-687), `configure-threshold-approval` (NGCX-685), `simulate-payment-flow` (NGCX-688)

| Story Requirement | Prototype Status | Notes |
|-------------------|-----------------|-------|
| "How should payments be approved?" heading + sub-heading | ✅ Present | |
| Three rule cards with labels and descriptions | ✅ Present | Exact copy matches stories |
| Radio-card pattern (one at a time) | ✅ Present | |
| Sole-director: dual-approval cards disabled with message | ✅ Present | `isSoleDirector` prop, amber "Requires at least two directors" |
| Validation: "Please select an approval model" | ✅ Present | Shown on Continue without selection |
| Threshold chip selector (£1k/£5k/£10k/£25k/Custom) | ✅ Present | Animates open inline |
| £5,000 pre-selected default | ✅ Present | `defaultThreshold = 5000` |
| Custom amount input with validation | ✅ Present | Min £500, max £1M, decimal check |
| Real-time threshold preview (payment ranges) | ✅ Present | "£0 – £X: 1 Director / Above £X: 2 Directors" |
| Threshold stored in pence (minor currency) | ✅ Present | `Math.round(parsed * 100)` |
| Back navigation preserves selection | ⚠️ Partial | No `initialRule` prop — the `OnboardingFlow` would need to pass it back |
| **Payment simulation tool** | ❌ Missing from this screen | Story says simulation should be on the approval rules confirmation screen; it exists only on the **Mandate Review** screen (`ScreenMandateSummary`). This may be intentional (consolidated into review), but the story `simulate-payment-flow` implies it lives alongside the rule config |

### Screen 3: Your Team (`ScreenTeamMembers.tsx`)
**Covered by:** `invite-director` (NGCX-691)

| Story Requirement | Prototype Status | Notes |
|-------------------|-----------------|-------|
| "Set up your team" heading + sub-heading | ✅ Present | |
| Primary signatory card with Verified + AML badges | ✅ Present | Green badges, "Full access" label |
| "Directors from Companies House" section header | ✅ Present | Conditional on `isFromCompaniesHouse` |
| Not yet invited / Invited / Verified / Failed states | ✅ Present | Full status badge system with all states |
| "Invite ›" button per not-yet-invited director | ✅ Present | |
| Resend for already-invited directors | ✅ Present | |
| "+ Add another person" button | ✅ Present | |
| "You can add people later from your dashboard" note | ✅ Present | |
| "Continue to review →" primary CTA | ✅ Present | |
| "Skip for now" secondary action | ✅ Present | Conditional on no invited members |
| Verification timeline (expandable) | ✅ Present | Bonus: not in stories, but in prototype |
| Activity / Audit log tab (dashboard mode) | ✅ Present | Bonus: beyond current story scope |
| Dual-approval warning with insufficient directors | ⚠️ Not visible | Story says a contextual warning should show — not implemented in prototype |
| Duplicate invitation prevention (Invite → Resend) | ⚠️ Implicit | The prototype shows Resend for invited status, but doesn't explicitly prevent double-clicking |

### Screen 4: Add a Team Member (`ScreenAddTeamMember.tsx`)
**Covered by:** `add-team-member` (NGCX-689), `assign-payment-limits` (NGCX-690)

| Story Requirement | Prototype Status | Notes |
|-------------------|-----------------|-------|
| "Add a team member" heading + sub-heading | ✅ Present | |
| Full name, email, role fields | ✅ Present | |
| Role dropdown (Director, Accountant + more) | ✅ Present | Also includes Finance Manager, Employee, Custom |
| Six permission toggles with labels and descriptions | ✅ Present | Exact labels match stories |
| Director role: all six toggles default ON | ✅ Present | `DEFAULT_PERMISSIONS.director` |
| Accountant defaults | ✅ Present | View ON, Initiate ON, rest OFF (story says Initiate ON, but the prototype has Initiate OFF for accountant — **discrepancy**) |
| KYC/AML screening required info box | ✅ Present | Shows when Approve or Initiate payments ON |
| Approve Payments toggle disabled for unverified | ✅ Present | `isUnverifiedMember` check |
| Manage Team restricted to directors | ✅ Present | Toast error for non-directors |
| "Set payment limits" collapsed accordion | ✅ Present | |
| Preset limits (£1k–£100k + Unlimited + Custom) | ✅ Present | |
| Custom limit validation | ✅ Present | Min £1, max £10M |
| Governance threshold warning | ✅ Present | `mandateThresholdPence` prop comparison |
| Unlimited for non-director needs confirmation | ✅ Present | Amber warning displayed |
| "Send invite" CTA | ✅ Present | |
| Duplicate email check | ✅ Present | `existingEmails` prop |
| Max 15 team member cap | ❌ Missing | Not enforced in the prototype UI |
| Segregation of duties notice | ✅ Present | Bonus: "Payment roles separated" notice |

### Screen 5: Mandate Review (`ScreenMandateSummary.tsx`)
**Covered by:** `review-governance-summary` (NGCX-695), `digital-sign-mandate` (NGCX-694)

| Story Requirement | Prototype Status | Notes |
|-------------------|-----------------|-------|
| "Account governance summary" heading + sub-heading | ✅ Present | |
| Approval rule summary with threshold as ranges | ✅ Present | "£0–£5,000: 1 Director / £5,001+: 2 Directors" |
| Single payments / Bulk payments tabs | ✅ Present | |
| Sequential flow diagrams | ✅ Present | PaymentFlowPreview component + inline diagrams |
| "Edit rule" link | ✅ Present | `onEditRule` callback |
| "Simulate a payment" link | ✅ Present | Expandable simulator section |
| Team permissions matrix (icon-based) | ✅ Present | ✓/— pattern per permission |
| Compliance status badges per person | ✅ Present | Verified / Pending badges |
| Activation checklist with ✅/⚠️ states | ✅ Present | Dynamic checklist items |
| Resend action per pending item | ✅ Present | `onResendInvite` per member |
| Restricted mode informational note | ✅ Present | |
| **Sign to confirm section** | ✅ Present | Checkbox + script-style signature + date |
| Confirmation checkbox text | ✅ Present | Matches story exactly |
| "Confirm mandate" CTA (disabled until checkbox) | ✅ Present | |
| Digital signature (draw or upload) | ✅ Present | Canvas draw + file upload tabs |
| Submission error handling | ⚠️ Partial | Toast error on failure, but no retry UI beyond re-clicking |

---

## 3. Coverage Gaps: What the Stories Don't Cover

These are elements visible in the **prototype** that have **no corresponding story**:

| Gap | Screen | Description | Recommendation |
|-----|--------|-------------|----------------|
| **Board resolution upload flow** | Screen 1 | The bottom sheet for "Acting on behalf of the board?" includes file upload, declaration checkbox, and skip option. No story defines acceptance criteria for this interaction. | Add a story or at minimum an AC within `declare-authority` |
| **Verification timeline** | Screen 3 | Expandable per-member timeline showing step-by-step verification progress. Not mentioned in any story. | Add AC to `invite-director` or a new story |
| **Activity / Audit log tab** | Screen 3 (dashboard) | Full audit log view in dashboard mode. Not covered by any story. | Consider a `mandates-05-audit-trail` story or add to `track-mandate-acceptance` |
| **Dashboard vs. flow mode** | Screens 3, 4, 5 | Components support both "flow" (onboarding) and "dashboard" (post-setup) contexts with different layouts. Stories only describe the onboarding flow. | Clarify in design story or add dashboard stories for V3 |
| **Drawn signature capture** | Screen 5 | Full canvas drawing with undo, clear, and pen color/thickness. The story `digital-sign-mandate` describes a **click-to-agree** model with a displayed script-style name, explicitly noting drawn signature is only needed if the BDR changes. The prototype already implements the drawn/upload approach. | **Reconcile**: either update the story to match prototype, or simplify the prototype to click-to-agree as the story states |
| **Segregation of duties notice** | Screen 4 | "Payment roles separated" info box when Initiate ON + Approve OFF. Not in stories. | Add as an AC in `add-team-member` |
| **UBO badge** | Screen 3 | "UBO" badge appears on team member cards for persons of significant control. Not referenced in stories. | Add to `invite-director` ACs |

---

## 4. Coverage Gaps: What the Stories Require but the Prototype Doesn't Have

| Gap | Story | Description | Impact |
|-----|-------|-------------|--------|
| **Payment simulation on Approval Rules screen** | `simulate-payment-flow` | Story says the simulation lives on the "approval rules confirmation screen". Prototype only has it on Mandate Review (Screen 5). | Low — consolidating to Screen 5 may be a design decision, but the story should be updated to reflect this |
| **Max 15 team member cap** | `add-team-member` | Story requires enforcing a 15-member limit with messaging. Prototype doesn't implement this. | Medium — needs UI enforcement |
| **Companies House data unavailable fallback** | `declare-authority` | Story requires graceful fallback when CH data is unavailable. Prototype doesn't show this state. | Medium — edge case but important for resilience |
| **Dual-approval warning on team screen** | `invite-director` | Story requires a warning when dual-approval rule is configured but fewer than 2 directors are verified/invited. | Medium — governance safety net |
| **Reminder emails at day 7 and 12** | `track-mandate-acceptance` | Story defines automated reminder logic. Backend concern, but no UI indication of reminder schedule. | Low — backend-only |
| **Director decline flow** | `track-mandate-acceptance` | Story defines Decline status, notification to primary director, and remediation options. Not in prototype. | Medium — important edge case |
| **Accountant default permissions discrepancy** | `add-team-member` | Story says Accountant defaults: View ON, Initiate ON. Prototype has: View ON, Initiate OFF. | Low but should be reconciled |

---

## 5. New Story in `stories/` Not in `requirements/`

The `stories/` folder includes a new story: **`00-design-mandates-ui-ux.md`** (NGCX-697, "In Progress"). This is the design story covering all five screens across mobile and web. It acts as the prerequisite for all implementation stories and its acceptance criteria effectively serve as a screen-by-screen design checklist.

This is a good addition — it formalises the design handoff as a tracked deliverable.

---

## 6. Overall Assessment

**Coverage is strong.** The 13 implementation stories (plus 1 design story) comprehensively cover the five prototype screens. The story ↔ prototype alignment is tight, with exact copy, labels, and interaction patterns matching in most cases.

**Key actions to take:**

1. **Reconcile the signature approach** — the story says click-to-agree with script-style name; the prototype implements drawn/upload signature. Pick one and update the other.
2. **Add the 15-member cap** to the prototype or confirm it's deferred.
3. **Add the dual-approval warning** on the team screen when not enough directors are invited.
4. **Add ACs for the board resolution flow** — it's built in the prototype but has no story coverage.
5. **Confirm simulation placement** — story says approval rules screen; prototype puts it on mandate review. Update the story if the design decision has changed.
6. **Fix accountant defaults** — story and prototype disagree on `Initiate payments` default.
7. **Consider adding** a story for the Companies House unavailable fallback state.
