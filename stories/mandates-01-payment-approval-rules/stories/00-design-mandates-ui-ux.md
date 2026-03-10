---
type: story
title: "Design: Mandates UI/UX — Mobile and Web"
jira_key: NGCX-697
jira_status: In Progress
original_estimate: 2w
release: friends-and-family
depends_on: []
blocked_by_adrs:
  - customer-experience/acquisition-onboarding/mandate-backend-integration
blocked_by_bdrs:
  - customer-experience/acquisition-onboarding/mandate-setup-scope-v1-v2-v3-ff
  - customer-experience/acquisition-onboarding/mandate-e-signature-regulatory-validation
  - customer-experience/acquisition-onboarding/mandate-role-screen-differentiation
  - customer-experience/acquisition-onboarding/mandate-default-roles
  - customer-experience/acquisition-onboarding/mandate-entitlement-scope
---

## Context

Before engineering can build any part of the mandates journey, the design team must produce final, reviewed UI/UX designs for the entire mandates capability across both mobile and web channels. This story is a prerequisite for all implementation stories across `mandates-01` through `mandates-04`.

The mandates journey spans five distinct screens — Account Access, Approval Rules, Your Team, Add a Team Member, and Mandate Review — and must be designed consistently across channels while respecting platform conventions (native mobile vs. responsive web). A working prototype already exists and serves as the primary reference, but designs must be refined, edge cases resolved, and a production-ready design handoff produced in Paper (the bank's design tool).

## Acceptance Criteria

- [ ] **Account Access screen** (mobile + web)
  - Sole director vs. multi-director radio selection
  - "Beneficial ownership confirmed" info box
  - "Acting on behalf of the board?" expandable section with its content defined
  - Confirmation checkbox with dynamic business name
  - Empty state (Companies House data unavailable)

- [ ] **Approval Rules screen** (mobile + web)
  - All three rule cards: Any one director, Two directors required, Two required above a threshold
  - Selected state for each card
  - Threshold chip selector (£1,000 / £5,000 / £10,000 / £25,000 / Custom) with £5,000 as default
  - Custom amount input state
  - Disabled rule cards for sole-director scenario with explanatory messaging

- [ ] **Your Team screen** (mobile + web)
  - Primary signatory card with Verified + AML cleared badges
  - "Directors from Companies House" section with Not yet invited / Invited / Verified states
  - "+ Add another person" entry point
  - Empty state (no additional directors found)
  - Warning state for dual-approval rule with insufficient verified directors
  - "Skip for now" secondary action

- [ ] **Add a Team Member screen** (mobile + web)
  - Role dropdown with all options
  - All six permission toggles with labels and descriptions
  - Default ON state for Director role
  - KYC/AML screening required info box (contextual, appears when Approve payments is ON)
  - "Set payment limits" collapsed accordion — expanded state with preset and custom limit options
  - "Send invite" CTA

- [ ] **Mandate Review screen** (mobile + web)
  - Approval rule summary with threshold displayed as payment ranges (e.g. £0–£5,000: 1 Director / £5,001+: 2 Directors)
  - Single payments / Bulk payments tabs
  - Sequential flow diagrams for below-threshold and above-threshold paths
  - Team permissions matrix with icon-based columns
  - Activation checklist with ✅ and ⚠️ states; Resend action per pending item
  - Restricted mode informational note
  - "Sign to confirm" section: confirmation checkbox + script-style displayed signature + date
  - "Confirm mandate" CTA — disabled and enabled states

- [ ] **Edge case and error states** designed for all screens:
  - Verification Failed state per team member
  - Invitation Expired state
  - Activation blocked states (unverified approver, pending director acceptance)
  - Submission error on Confirm mandate

- [ ] Designs produced for both **mobile** (390px) and **web** (1440px) breakpoints
- [ ] All designs reviewed and signed off by the product owner before handoff
- [ ] Design handoff complete in Paper with all components, states, and annotations accessible to engineering
- [ ] Component inventory produced listing any new or modified components required (for the common library)

## Technical Notes

- Reference the existing prototype screens (5 screens) as the primary design direction; this story is about producing production-ready designs, not exploring new concepts
- Flag any interactions or states that are ambiguous in the prototype to the product owner for decision before finalising
- Coordinate with the platform engineering team on any new components required in the common library (`onboarding-common-library` or equivalent)
- The "Acting on behalf of the board?" expandable content is currently undefined — this must be resolved with legal/product as part of this story before designs are finalised
