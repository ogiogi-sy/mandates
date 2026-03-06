# Figma Make prompt — Metro Bank mandate screens

> Paste this prompt into Figma Make to update the mandate screens with the copy, layout, and accessibility improvements from the React prototype.

---

## Global tone of voice rules

Apply these rules to every piece of copy on every screen. If Figma Make generates new text, it must follow these:

| Rule | Detail |
|------|--------|
| **Sentence case** | "Add a director" not "Add A Director". Only proper nouns are capitalised. |
| **No ampersands** | Write "and" in full. |
| **No exclamation marks** | Warmth comes from substance, not punctuation. |
| **Active voice** | "We'll review your details" not "Your details will be reviewed". |
| **Plain English** | No jargon. If a 16-year-old wouldn't understand it, rewrite it. Avoid: utilise, ascertain, commence, facilitate, leverage, herein. |
| **Contractions** | Use "we'll", "you're", "don't", "won't", "can't" — keeps it human. |
| **Use "you" and "we"** | Never "the customer" or "the bank". |
| **CTAs** | Verb-first, specific, one action: "Get started", "Send invite", "Confirm mandate". |
| **Error messages** | Always say what happened + what to do next. Warm but not cute. |
| **Numbers** | Write numerals: "3 directors" not "three directors". |
| **Mobile-first labels** | Headlines 3-6 words. Labels under 25 characters. Toasts 1 sentence max. |

---

## Design tokens

Use these exact values so the Figma frames match the production design system.

### Colours

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary-navy` | `#012B72` | Primary buttons, headers, hero backgrounds |
| `brand-blue` | `#0041AD` | Accent links, selected states, focus rings |
| `brand-red` | `#ED0322` | Destructive actions, danger badges |
| `emerald-600` | `#059669` | Success states, verified badges, active mandates |
| `emerald-50` | `#ECFDF5` | Success background tints |
| `amber-600` | `#D97706` | Warning states, pending badges |
| `amber-50` | `#FFFBEB` | Warning background tints |
| `text-primary` | `#031538` | Headings, primary body text |
| `text-secondary` | `#4B5F82` | Supporting body text, descriptions |
| `text-muted` | `#8D9ABC` | Labels, hints, timestamps |
| `text-on-dark` | `#FFFFFF` | Text on dark/navy backgrounds |
| `background-app` | `#F5F7FB` | Page background |
| `background-surface` | `#FFFFFF` | Card backgrounds |
| `background-surface-soft` | `#F1F6FC` | Subtle card backgrounds, input bgs |
| `divider` | `#F1F6FC` | Borders, separators |
| `blue-50` | `#EBF0F8` | Info tint backgrounds |

### Border radius

| Token | Value |
|-------|-------|
| `radius-sm` | `8px` |
| `radius-md` | `12px` |
| `radius-lg` | `16px` |
| `radius-xl` | `24px` |
| `radius-pill` | `999px` |

### Spacing

| Token | Value |
|-------|-------|
| `space-xs` | `4px` |
| `space-sm` | `8px` |
| `space-md` | `12px` |
| `space-lg` | `16px` |
| `space-xl` | `24px` |
| `space-xxl` | `32px` |

### Typography

| Element | Size | Line height | Weight |
|---------|------|-------------|--------|
| h1 (Display) | 32px | 38px | 600 |
| h2 (Title L) | 22px | 28px | 600 |
| h3 (Title M) | 18px | 22px | 600 |
| Body (p) | 16px | 22px | 400 |
| Label | 13px | 16px | 500 |
| Caption | 12px | 16px | 400 |
| Micro | 11px | 14px | 400-600 |
| Button | 16px | 22px | 600 |
| **Font family** | `Inter`, `-apple-system`, `system-ui`, `sans-serif` | | |

### Shadows

| Token | Value |
|-------|-------|
| `shadow-card-sm` | `0px 2px 8px rgba(0,0,0,0.04)` |
| `shadow-card-md` | `0px 2px 12px rgba(0,0,0,0.06)` |
| `shadow-card-lg` | `0px 4px 16px rgba(0,0,0,0.08)` |
| `shadow-floating` | `0px 4px 20px rgba(0,0,0,0.08)` |

---

## Screen 1 — Authority confirmation (`ScreenAuthorityConfirmation`)

### Copy

| Element | Text |
|---------|------|
| **Headline** | "Who's authorised to manage this account?" |
| **Subheadline** | "We've found {n} director{s} for {companyName}. Let us know how your business manages account access." |
| **UBO info banner title** | "Beneficial ownership confirmed" |
| **UBO info banner body** | "{n} director{s} and persons of significant control identified via Companies House. All authorised users will undergo KYC, AML and sanctions screening." |
| **Card 1 label** | "I'm the sole director" |
| **Card 1 description** | "You'll have full control of the account." |
| **Card 2 label** | "I'm one of several directors" |
| **Card 2 description** | "We'll help you set up shared access." |
| **Board auth link** | "Acting on behalf of the board?" |
| **Declaration** | "I confirm I'm authorised to open and manage this account on behalf of {companyName}." |
| **CTA** | "Continue" |

### Board authorisation bottom sheet

| Element | Text |
|---------|------|
| **Sheet title** | "Authorised by the board?" |
| **Body** | "Upload a board resolution confirming you've been authorised to open this account." |
| **Upload label** | "Tap to upload (PDF or image)" |
| **Declaration** | "I confirm I have been authorised by a board resolution to open and manage this account on behalf of {companyName}." |
| **Primary CTA** | "Continue" |
| **Skip CTA** | "Skip for now — we'll follow up" |

### Layout

- Two selectable cards with radio-button circles on the right edge
- Each card: 48px icon circle (left), label + description (centre), 24px radio (right), `padding: 20px`, `border-radius: 16px`, `border: 2px`
- Selected state: `border-color: brand-blue`, `shadow-card-md`; icon circle fills `brand-blue` with white icon
- UBO info banner at top with `ShieldCheck` icon, `blue-50` background, `border: accent-primary/15`
- Board auth link: min-height `44px` for touch target
- Declaration checkbox: `p-4 rounded-md`, visible focus ring with `ring-2 ring-offset-2`
- Bottom sheet: `rounded-t-24px`, spring animation `damping: 30 stiffness: 300`, drag handle `w-10 h-1`, `max-h: 80vh`, scroll, focus trap, Escape to dismiss

---

## Screen 2 — Approval rule (`ScreenApprovalRule`)

### Copy

| Element | Text |
|---------|------|
| **Headline** | "How should payments be approved?" |
| **Subheadline** | "Choose a starting rule. You can adjust this later in the app." |
| **Card 1 label** | "Any one director" |
| **Card 1 description** | "Any authorised director can approve payments independently." |
| **Card 2 label** | "Two directors required" |
| **Card 2 description** | "All payments need approval from two directors before they go through." |
| **Card 3 label** | "Two required above a threshold" |
| **Card 3 description** | "One director for everyday payments. Two required above a set amount." |
| **Disabled note** | "Requires at least two directors on the mandate" |
| **Threshold label** | "Require two approvals for payments over:" |
| **Threshold preview header** | "HOW PAYMENTS WILL BE APPROVED" |
| **Preview row 1** | "£0 - {threshold}: 1 Director" |
| **Preview row 2** | "Above {threshold}: 2 Directors" |
| **Custom placeholder** | "Enter amount (min £500, max £1,000,000)" |
| **Validation error** | "Please select an approval model to continue" |
| **Reassurance** | "You can change your approval rules anytime in the app." |
| **CTA** | "Continue" |

### Layout

- Three selectable cards stacked vertically, `gap: 12px`
- Card 3 "threshold": when selected, an inline panel expands below with preset chips (`£1,000`, `£5,000`, `£10,000`, `£25,000`, `Custom`) + optional custom input
- Threshold preview: `blue-50` background card with coloured dot indicators (emerald for single, blue for dual)
- Disabled cards: `opacity: 50%`, `cursor: not-allowed`, amber disabled note below description
- Animate expand/collapse with `height: auto` spring transition `duration: 0.25s`
- Custom input: `h-12`, `£` prefix inside, `inputMode: decimal`

---

## Screen 3 — Team members (`ScreenTeamMembers`)

### Copy

| Element | Text |
|---------|------|
| **Headline** | "Set up your team" |
| **Subheadline** | "Invite directors and team members who need access to this account." |
| **Primary user sublabel** | "Primary signatory · Director" |
| **CH section label** | "DIRECTORS FROM COMPANIES HOUSE" |
| **CH section helper** | "Inviting a director sends them an email to verify their identity and accept the mandate." |
| **Status: verified** | "Verified" (with check icon, emerald) |
| **Status: invited** | "Invite sent" (with clock icon, amber) |
| **Status: pending** | "Pending verification" (with clock icon, amber) |
| **Status: verifying** | "Verifying identity" (with clock icon, amber) |
| **Status: failed** | "Verification failed" (with x-circle icon, red) |
| **Status: suspended** | "Suspended" (with pause icon, red) |
| **Status: not invited** | "Not yet invited" (muted text) |
| **Screening: in progress** | "Screening" (amber pill) |
| **Screening: cleared** | "AML cleared" (emerald pill) |
| **Screening: flagged** | "Flagged" (red pill) |
| **Permissions line** | "Can: View, Pay, Approve, Manage team" |
| **Invite CTA** | "Invite" |
| **Resend CTA** | "Resend" |
| **Revoke CTA** | "Revoke" |
| **Remove CTA** | "Remove" |
| **Edit CTA** | "Edit permissions" |
| **Retry CTA** | "Retry verification" |
| **Add CTA** | "Add another person" |
| **Skip text** | "You can add people later from your dashboard." |
| **Skip CTA (dashboard)** | "Skip for now — you can add people later" |
| **Continue CTA** | "Continue to review" |
| **Activity empty title** | "No activity yet" |
| **Activity empty body** | "Actions taken on your mandate will appear here." |
| **Activity tab label** | "Activity" |
| **Review link** | "Review your approval setup" |

### Layout

- **Flow mode**: inline cards, no tab bar, sticky footer with "Continue to review" + optional "Skip for now"
- **Dashboard mode**: full-screen with sticky top bar ("Your team" + "Done" link), tab bar ("Team" / "Activity"), scrollable card list
- Primary user card at top with `accent-primary` avatar circle
- Each team member: card with `48px` avatar circle, name (16px/600), role (13px/400), status badges, action buttons row
- Status badges: pill-shaped, `radius-pill`, 11px/600 font, colour-coded backgrounds
- UBO badge: indigo background, "UBO" label
- Verification timeline: expandable, left border line with coloured dots (emerald complete, amber current, grey pending)
- "Add another person": full-width outline button, `radius-pill`, `border: brand-primary-navy`
- Tab bar underline indicator: `h-0.5`, `accent-primary`, `rounded-full`
- Activity log: reversed chronological, coloured background cards per type (success=emerald, warning=amber, action=blue)

---

## Screen 4 — Add team member (`ScreenAddTeamMember`)

### Copy

| Element | Text |
|---------|------|
| **Headline** | "Add a team member" |
| **Subheadline** | "Set their role, permissions, and payment limits." |
| **Name label** | "Full name" |
| **Name placeholder** | "Enter full name" |
| **Email label** | "Email address" |
| **Email placeholder** | "name@example.com" |
| **Role label** | "Role" |
| **Roles** | Director, Finance Manager, Accountant, Employee, Custom |
| **Permissions label** | "Permissions" |
| **Permission: View account** | "See balances and transactions" |
| **Permission: Initiate payments** | "Create and submit payments" |
| **Permission: Approve payments** | "Approve payments within your signing rules" |
| **Permission: Manage beneficiaries** | "Add and edit payees" |
| **Permission: Manage team** | "Invite or remove people" |
| **Permission: Card access** | "Issue a debit card for this person" |
| **Manage team restriction** | "Directors only" (amber, shown inline) |
| **Approve KYC restriction** | "Requires identity verification" (amber, shown inline) |
| **Approve note (ephemeral)** | "They'll need to verify their identity" |
| **KYC notice (approve perms on)** | Title: "KYC/AML screening required". Body: "This person can approve payments, so they'll need to verify their identity, pass screening checks, and accept the mandate." |
| **KYC notice (initiate only)** | Body: "This person can start payments, so they'll need to verify their identity and pass screening checks." |
| **Segregation notice** | Title: "Payment roles separated". Body: "This person can create payments but can't approve them. A different approver will need to sign off before we release the funds." |
| **Limits toggle** | "Set payment limits" |
| **Initiation limit label** | "Payment initiation limit" |
| **Approval limit label** | "Payment approval limit" |
| **Limit presets** | £1,000 / £5,000 / £10,000 / £25,000 / £50,000 / £100,000 / Unlimited / Custom |
| **Unlimited warning** | "Unlimited access for non-directors needs director confirmation" |
| **Limits helper** | "Limits protect your business by capping how much this person can move per payment or per day. You can change these at any time." |
| **CTA** | "Send invite" |
| **Disabled hint** | "Enter a name and email address to send an invite" |
| **Duplicate email error** | "This email has already been invited" |
| **Invalid email error** | "Enter a valid email address" |
| **Success toast** | "Invite sent to {email}" |

### Layout

- **Flow mode**: inline content wrapped by `OnboardingLayout`, sticky footer
- **Dashboard mode**: full-screen with sticky nav bar (back chevron + "Add a team member") and sticky bottom action bar
- Form fields: `h-12`, `radius-md`, `border: divider`, focus: `border: accent-primary`
- Role dropdown: custom button trigger, animated dropdown with `shadow-floating`, `ChevronDown` rotates on open
- Permissions list: card container with `radius-lg`, dividers between rows, toggle switches `w-11 h-6 rounded-full`, active: `accent-primary`, thumb `w-5 h-5`
- Lock icon on restricted permissions
- Info notices: coloured left-border style, icon + title + body
  - KYC/AML: `blue-50` bg, `accent-primary` icon
  - Segregation: `emerald-50` bg, `emerald-600` icon
  - Unlimited warning: `amber-50` bg, `amber-600` icon
- Limits section: collapsible with `ChevronDown`, preset chips in flex-wrap, `radius-pill`, selected: `accent-primary` bg white text
- Custom limit input: `£` prefix, `h-10`, numeric keyboard

---

## Screen 5 — Mandate summary (`ScreenMandateSummary`)

### Copy

| Element | Text |
|---------|------|
| **Headline** | "Account summary" |
| **Subheadline** | "Review your approval rules, team permissions, and mandate activation status." |
| **Section: rules** | "PAYMENT APPROVAL RULES" |
| **Rule header** | "Standard payments" |
| **Rule status (active)** | "Active" (emerald dot + pill) |
| **Rule status (pending)** | "Pending activation" (amber dot + pill) |
| **Table header: amount** | "PAYMENT AMOUNT" |
| **Table header: approval** | "REQUIRED APPROVAL" |
| **Table rows** | "All amounts → 1 Director" or "£0 - £5,000 → 1 Director" / "Above £5,000 → 2 Directors" |
| **Applies to tags** | "Single payments", "Bulk payments", "Scheduled payments" |
| **Threshold note** | "We apply the threshold per transaction. The initiating director counts toward the required approver count." |
| **Edit rule link** | "Edit rule" |
| **Locked label** | "Locked" (with lock icon) |
| **Simulate link** | "Simulate a payment" / "Hide simulator" |
| **Simulator title** | "Payment simulator" |
| **Simulator disclaimer** | "This is a simulation and does not represent a real payment." |
| **Section: flow** | "APPROVAL FLOW" |
| **Flow labels** | "Below {threshold}" / "Above {threshold}" |
| **Flow steps** | Initiator (Any team member) → 1 Director (Approves) → Executed (Payment sent) |
| **Flow footnote** | "If the initiator is a director, they count as the first approver. Approval is sequential — each approver is notified in turn." |
| **Section: team** | "TEAM AND PERMISSIONS" |
| **Permission pills** | "View", "Initiate", "Approve", "Manage" |
| **Section: activation** | "MANDATE ACTIVATION" |
| **Checklist item 1** | "Primary signatory verified" |
| **Checklist item 2** | "All directors verified" / "Second director verified" |
| **Checklist item 3** | "All directors accepted mandate terms" |
| **All met** | "All conditions met — your rule will activate when you confirm." |
| **Not all met** | "Your approval rule won't fully apply until all directors are verified and have accepted." |
| **Pending banner title** | "Approval protection not fully active" or "{n} person{s} awaiting verification" |
| **Resend link** | "Resend" |
| **Governance: dual** | "Your account requires dual approval for high-value payments." |
| **Governance: segregation** | "Non-directors cannot release funds without director approval." |
| **Governance: pending** | "Your approval protection won't be active until all directors have verified and accepted." |
| **Declaration** | "I confirm the people, approval rules, and controls for this account are correct." |
| **Signature section** | "DIGITAL SIGNATURE" |
| **Signature title** | "Sign to confirm" |
| **Signature body** | "Draw or upload your signature to authorise this mandate. This counts as your digital acceptance." |
| **Tab: Draw** | "Draw" |
| **Tab: Upload** | "Upload" |
| **Draw placeholder** | "Draw your signature here" |
| **Signed badge** | "Signed" / "Uploaded" |
| **Clear link** | "Clear signature" |
| **Upload prompt** | "Click to upload or drag and drop" |
| **Upload formats** | "PNG, JPG, SVG or WebP (max 5MB)" |
| **Upload drag** | "Drop your signature here" |
| **Replace link** | "Replace" |
| **CTA** | "Confirm mandate" |
| **Locked CTA** | "Mandate confirmed · {date}" |
| **Error: no declaration** | "Tick the declaration to continue." |
| **Error: no signature** | "Add your signature to continue." |
| **Error: both missing** | "Tick the declaration and add your signature to continue." |
| **File type error** | "That file type isn't supported. Please upload a PNG, JPG, or SVG." |
| **File size error** | "That file is too large. Please upload one under 5MB." |

### Layout

- Collapsible sections with `ChevronDown` toggle, animated expand/collapse
- **Rules card**: `radius-lg` card, header row with shield icon + status pill, mini table with `radius-sm` border, "Applies to" tag row with `blue-50` pills, edit/simulate links with min `44px` touch target
- **Simulator**: expandable card with `accent-primary/20` border, amount input + initiator select side-by-side on desktop, result in `blue-50` card
- **Approval flow**: vertical pipeline with coloured dots (blue=initiate, emerald=approve, emerald-solid=done), connecting lines, threshold view shows dual columns on desktop
- **Team matrix**: stacked person rows inside a `radius-lg` card, avatar (28px) + name + role + limits + status badge + permission pills row
- **Activation checklist**: conditions list with green check circles (done) or amber clock circles (pending), status footer strip (emerald or amber bg)
- **Pending section**: amber card with per-person rows, resend button per row
- **Signature pad**: tab switcher (Draw/Upload) with `radius-sm` segmented control, canvas `600x180` (displayed at 140px height), baseline guide line, signed/uploaded indicator badge, drag-and-drop upload zone with dashed border
- **Declaration**: checkbox with custom styled div, `focus-visible` ring
- **Confirm CTA**: full-width `radius-pill`, `48px` height, `brand-primary-navy` bg; locked state: emerald outline with check + date

---

## Screen 6 — Dashboard mandate sections (`ScreenDashboard`)

### Celebration mode copy

| Outcome | Heading | Subtitle |
|---------|---------|----------|
| **Success** | "You're all set" | "Your business account is now active and ready for use." |
| **In review** | "Application in review" | "We're taking a closer look — this usually takes up to 2 business days." |
| **Declined** | "We're unable to proceed" | "Unfortunately, we can't open an account at this time." |

| Outcome | Info title | Info body |
|---------|-----------|----------|
| **Success** | "What happens next?" | "We're reviewing your application now. We'll notify you as soon as it's complete. In the meantime, feel free to explore the app." |
| **In review** | "Your application is being reviewed" | "We're reviewing your application — this can take up to 2 business days. We'll let you know as soon as it's done. You can explore the app while you wait." |
| **Declined** | "Why was my application declined?" | "We've reviewed your application and we're not able to open an account right now. If you think something's not right, get in touch with our team and we'll look into it." |

| Outcome | CTA |
|---------|-----|
| **Success** | "Go to dashboard" |
| **In review** | "Explore the app" |
| **Declined** | "Contact support" |

| Element | Text |
|---------|------|
| **Mandate card (multi-director)** | Title: "Mandate confirmed". Body: "Your approval rules and team are set. We'll notify you as each team member verifies their identity." |
| **Declined support** | Title: "Need help?". Body: "You can reach our business banking team at 0345 08 08 500 or visit any Metro Bank store to chat in person." |

### Dashboard mode — mandate-related copy

| Element | Text |
|---------|------|
| **Account activation pill** | "FULLY ACTIVE" / "PROVISIONALLY ACTIVE" |
| **Setup team card title** | "Set up your team" |
| **Setup team card body** | "Add your directors and team members to get started." |
| **Payment access title** | "Payment access" |
| **Payment enabled** | "Payments up to {threshold} — Enabled" |
| **Payment blocked** | "Payments above {threshold} — Blocked" |
| **Payment unlock note** | "You'll need a second verified director to unlock dual-approval payments." |
| **Threshold warning** | "Payments above {threshold} are currently blocked. Add and verify a second director to enable full payments." |
| **Mandate active banner** | Title: "Your mandate is active". Body: "Everyone's verified. You now have full payment access." |
| **Waiting banner title** | "Waiting for team verification" |
| **Waiting banner body** | "{verified} of {total} directors verified. Payments above {threshold} need a second director." |
| **View team link** | "View team status" |
| **Waiting unlock note** | "We're waiting for a second director to verify and accept the mandate before we can enable dual-approval payments." |
| **Free trial banner title** | "Your first 3 months are on us" |
| **Free trial banner body** | "Full access to all features at no cost. After your trial, choose from 4 plans starting at £9/mo." |
| **Trial CTA** | "Explore plans" |
| **Trial badge** | "FREE FOR 3 MONTHS" |
| **Trial countdown** | "89 days remaining" |

### Celebration mode layout

- Full-screen gradient header (`brand-primary-navy → brand-blue`, declined: `#2D1B1B → #4A2020`), `rounded-b-32px`
- Animated icon: outer ring `w-16 h-16 rounded-full bg-white/10 backdrop-blur`, inner dot with outcome colour
- Bank card overlapping the gradient at `-mt-24`: gradient background (`brand-red → #C4001A`), Mastercard circles, masked card number dots, status row
- Info cards below card: `radius-lg`, `shadow-card-sm`, icon circle + title + body
- CTA footer: `h-56px`, `radius-pill`, arrow icon with hover translate

### Dashboard mode layout

- Status pill in header: `radius-pill`, lock/unlock icon, uppercase 10px/700 label
- Setup team card: `radius-lg`, `accent-primary/20` border, red notification dot on avatar, chevron right
- Payment access card: two rows with coloured dots (emerald=enabled, red=blocked) + status label
- Mandate active banner: `emerald-50` bg, check icon, dismissible with X button
- Waiting banner: `amber-50` bg, alert-triangle icon, "View team status" link
- Threshold warning: `amber-50` bg, alert-triangle icon
- Free trial banner: gradient navy background, `Gift` icon, badge pill, "Explore plans" white button

---

## Mandate success screen

| Element | Text |
|---------|------|
| **Headline** | "Your mandate is active" |
| **Body** | "Payments will follow your approval rules. You can manage your team anytime in Settings." |
| **CTA** | "Go to dashboard" |

### Layout

- Full-screen overlay `z-50`, centred content
- Animated emerald check circle `w-20 h-20`, spring animation
- Staggered text fade-in (heading delay 0.2s, body delay 0.3s, CTA delay 0.5s)
- CTA: `radius-pill`, `48px`, `brand-primary-navy`

---

## Shared components

### Sticky footer

- Sticky to bottom of scroll area, `z-20`, `bg: background-app`, `border-t: divider`, `padding: space-xl`, `padding-bottom: space-xxl`
- Primary button: `h-48px`, `radius-pill`, `brand-primary-navy` bg, `shadow-card-lg`
- Disabled state: `bg: divider`, `text: text-muted`, `cursor: not-allowed`

### Selection cards (reused across authority + approval screens)

- Full-width, `p-20px`, `radius-lg`, `border: 2px`
- Unselected: `border: divider`, `shadow-card-sm`, hover: `border: accent-primary`
- Selected: `border: accent-primary`, `shadow-card-md`
- Icon circle: `w-12 h-12 rounded-full`, unselected: `background-surface-soft`, selected: `accent-primary` bg + white icon
- Radio indicator: `w-6 h-6 rounded-full border-2`, selected: filled `accent-primary` + white check

---

## Accessibility checklist

Apply to every screen:

- All interactive elements have minimum `44px` touch targets (height or min-height)
- All buttons have `aria-label` when icon-only
- Bottom sheets have `role="dialog"`, `aria-modal="true"`, `aria-label`
- Checkbox inputs use `sr-only` class with visible custom checkbox that shows `peer-focus-visible:ring-2 ring-offset-2`
- All toggles have `aria-label="Toggle {permission name}"`
- Back buttons have `aria-label="Go back"`
- Close buttons have `aria-label="Close"`
- Collapsible sections use `ChevronDown` that rotates `180deg` when open
- Bottom sheets trap focus and close on `Escape`
- Disabled buttons use `aria-disabled` not `disabled` where the button still responds to clicks (to show toast errors)
- Colour is never the only indicator of status — always paired with icon or text label
