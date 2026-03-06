import { useState } from 'react';
import { OnboardingLayout } from './OnboardingLayout';
import { ScreenStart } from './ScreenStart';
import { ScreenJourneySelection } from './ScreenJourneySelection';
import { ScreenWelcomeOptimised } from './ScreenWelcomeOptimised';
import { ScreenCompanySearchOptimised } from './ScreenCompanySearchOptimised';
import { ScreenConfirmCompany } from './ScreenConfirmCompany';
import { ScreenDirectorsList } from './ScreenDirectorsList';
import { ScreenDirectorEdit } from './ScreenDirectorEdit';
import { ScreenIdentityVerification } from './ScreenIdentityVerification';
import { ScreenCreatePassword } from './ScreenCreatePassword';
import { ScreenTradingAddressOptimised } from './ScreenTradingAddressOptimised';
import { ScreenReviewDetails } from './ScreenReviewDetails';
import { ScreenOpenBanking } from './ScreenOpenBanking';
import { ScreenReviewOptimised } from './ScreenReviewOptimised';
import { ScreenDashboard } from './ScreenDashboard';
import { ScreenVerify } from './ScreenVerify';
import { ScreenAboutYou } from './ScreenAboutYou';
import { ScreenLocation } from './ScreenLocation';
import { ScreenBusinessDetails } from './ScreenBusinessDetails';
import { ScreenConnectBank } from './ScreenConnectBank';
import { ScreenReview } from './ScreenReview';
import { ScreenSuccess } from './ScreenSuccess';
import { ScreenTermination } from './ScreenTermination';

// Ideal Flow Screens
import { ScreenWelcomeIdeal } from './ScreenWelcomeIdeal';
import { ScreenCreatePasskey } from './ScreenCreatePasskey';
import { ScreenReviewIdeal } from './ScreenReviewIdeal';

// Business Question Screens (Optimised Flow)
import { ScreenQuestionTurnover } from './ScreenQuestionTurnover';
import { ScreenQuestionEmployees } from './ScreenQuestionEmployees';
import { ScreenQuestionIntlPayments } from './ScreenQuestionIntlPayments';
import { ScreenQuestionRevenue } from './ScreenQuestionRevenue';
import { ScreenQuestionWebsite } from './ScreenQuestionWebsite';
import { ScreenQuestionMonthlyIncome } from './ScreenQuestionMonthlyIncome';
import { ScreenQuestionPaymentTypes } from './ScreenQuestionPaymentTypes';
import { ScreenQuestionCashDeposits } from './ScreenQuestionCashDeposits';

// Mandate Screens
import { ScreenAuthorityConfirmation } from './ScreenAuthorityConfirmation';
import { ScreenApprovalRule } from './ScreenApprovalRule';
import { ScreenTeamMembers } from './ScreenTeamMembers';
import { ScreenAddTeamMember } from './ScreenAddTeamMember';
import { ScreenMandateSummary, MandateSuccessScreen } from './ScreenMandateSummary';

import { OnboardingState, TerminationReason, TeamMember, MandateAuditEntry } from './types';
import { toast } from 'sonner@2.0.3';

/*
 * ==========================================
 * STEP MAP (mandates BEFORE celebration)
 * ==========================================
 *
 * IDEAL FLOW (15 steps):
 *   1  Welcome
 *   2  Find Business
 *   3  Confirm Company
 *   4  Directors
 *   5  Identity Verification (Onfido)
 *   6  Connect Bank
 *   7  Select Bank
 *   8  Authority Confirmation (Screen A)
 *   9  Approval Rule (Screen B)        — skipped for sole director
 *  10  Team Members (Screen C)          — skipped for sole director
 *  11  Mandate Summary (Screen E)       — sole director consent
 *  12  Create Passkey
 *  13  Review Application               — end of progress bar
 *  14  Celebration
 *  15  Dashboard
 *
 * OPTIMISED FLOW (26 steps):
 *   1  Welcome
 *   2  Find Business
 *   3  Confirm Company
 *   4  Directors
 *   5  Verify Contact (OTP)
 *   6  Create Password
 *   7  Identity Verification (Onfido)
 *   8  Connect Bank
 *   9  Select Bank
 *  10  Authority Confirmation (Screen A)
 *  11  Approval Rule (Screen B)        — skipped for sole director
 *  12  Team Members (Screen C)          — skipped for sole director
 *  13  Mandate Summary (Screen E)       — sole director consent
 *  14  Trading Address
 *  15  Review Details
 *  16-23  Business Questions
 *  24  Review & Submit                  — end of progress bar
 *  25  Celebration
 *  26  Dashboard
 *
 * Sole director (Ideal):    step 8 → jump to 11 (Mandate Summary for consent)
 * Multi director (Ideal):   step 8 → 9 → 10 → 11 → 12
 * Sole director (Optimised): step 10 → jump to 13 (Mandate Summary for consent)
 * Multi director (Optimised): step 10 → 11 → 12 → 13 → 14
 */

export function OnboardingFlow() {
  const [state, setState] = useState<OnboardingState>({
    step: 0,
    journeyType: 'ideal',
    companySearchQuery: '',
    selectedCompany: null,
    directors: [],
    verificationCode: '',
    tradingAddress: null,
    selectedBranch: null,
    businessDetails: null,
    bankConnected: false,
    idVerification: null,
    passkeyCreated: false,
    passwordCreated: false,
    openBanking: null,
    selectedBank: null,
    termination: undefined,
    mandate: {
      authorityType: null,
      boardResolutionUploaded: false,
      approvalRule: null,
      thresholdAmount: null,
      teamMembers: [],
      confirmed: false,
      locked: false,
      mandateVersion: null,
      confirmedAt: null,
      activationStatus: 'provisionally_active',
      auditLog: [],
      paymentRestrictions: undefined,
    },
    dashboardView: 'main',
    editingMemberId: null,
  });

  // =====================
  // PROGRESS BAR TOTALS
  // =====================
  const idealProgressSteps = 13;
  const optimisedProgressSteps = 24;

  const getProgressTotal = () => {
    if (state.journeyType === 'ideal') return idealProgressSteps;
    if (state.journeyType === 'optimised') return optimisedProgressSteps;
    return 8;
  };

  const getTitles = () => {
    if (state.journeyType === 'optimised') {
      return [
        "Welcome",           // 1
        "Find Business",     // 2
        "Confirm Company",   // 3
        "Directors",         // 4
        "Verify Contact",    // 5 (OTP)
        "Create Password",   // 6
        "Identity",          // 7 (Onfido)
        "Connect Bank",      // 8
        "Select Bank",       // 9
        "Account Access",    // 10 (Screen A)
        "Approval Rules",    // 11 (Screen B)
        "Your Team",         // 12 (Screen C)
        "Mandate Review",    // 13 (Screen E)
        "Trading Address",   // 14
        "Review Details",    // 15
        "Business Activity", // 16-23
        "Business Activity",
        "Business Activity",
        "Business Activity",
        "Business Activity",
        "Business Activity",
        "Business Activity",
        "Business Activity",
        "Review and submit",   // 24
      ];
    }
    if (state.journeyType === 'ideal') {
      return [
        "Welcome",           // 1
        "Find Business",     // 2
        "Confirm Company",   // 3
        "Directors",         // 4
        "Identity",          // 5 (Onfido)
        "Connect Bank",      // 6
        "Select Bank",       // 7
        "Account Access",    // 8 (Screen A)
        "Approval Rules",    // 9 (Screen B)
        "Your Team",         // 10 (Screen C)
        "Mandate Review",    // 11 (Screen E)
        "Create Passkey",    // 12
        "Review Application",// 13
      ];
    }
    return ["Start", "About You", "Verify You", "Your Location", "About Your Business", "Connect Bank", "Review and submit", "You're in"];
  };

  const titles = getTitles();

  const handleSaveExit = () => {
    toast.success('Progress saved', { description: 'You can resume your application later.' });
  };

  const nextStep = () => {
    if (state.isEditing) {
      const reviewStep = state.journeyType === 'optimised' ? 24 : (state.journeyType === 'ideal' ? 13 : 6);
      setState(prev => ({ ...prev, step: reviewStep, isEditing: false }));
    } else {
      setState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const prevStep = () => {
    if (state.editingDirectorId) {
      setState(prev => ({ ...prev, editingDirectorId: null }));
    } else {
      setState(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const goToStep = (step: number) => setState(prev => ({ ...prev, step, isEditing: true }));

  // Termination Helper
  const terminateJourney = (reason: TerminationReason, customTitle?: string, customDesc?: string) => {
    setState(prev => ({
      ...prev,
      termination: { isTerminated: true, reason, title: customTitle, description: customDesc },
    }));
  };

  // Business details helper
  const updateBusinessDetails = (key: string, value: any) => {
    setState(prev => ({
      ...prev,
      businessDetails: { ...prev.businessDetails, [key]: value },
    }));
    nextStep();
  };

  // =====================
  // MANDATE HELPERS
  // =====================
  const getApplicantName = () => {
    const primary = state.directors.find(d => d.isPrimaryHolder);
    return primary?.name || 'Sophie Carter';
  };

  const getApplicantFirstName = () => {
    const raw = getApplicantName().split(' ')[0];
    // Title-case: "SOPHIE" → "Sophie"
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  };

  const addAuditEntry = (event: string, actor: string, detail?: string, type: MandateAuditEntry['type'] = 'info') => {
    const entry: MandateAuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      event,
      actor,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      detail,
      type,
    };
    setState(prev => ({
      ...prev,
      mandate: { ...prev.mandate, auditLog: [...prev.mandate.auditLog, entry] },
    }));
    return entry;
  };

  /** Generate mandate version: MND-V2-YYYYMMDD-NNN */
  const generateMandateVersion = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `MND-V2-${dateStr}-${seq}`;
  };

  const MAX_NON_DIRECTOR_MEMBERS = 15;

  const addTeamMember = (member: Omit<TeamMember, 'id' | 'status' | 'invitedDate' | 'isFromCompaniesHouse'>): { success: boolean; error?: string } => {
    // Duplicate email check
    const emailLower = member.email.toLowerCase().trim();
    const existingEmails = state.mandate.teamMembers.map(m => m.email.toLowerCase().trim());
    if (existingEmails.includes(emailLower)) {
      toast.error('This email address has already been invited');
      return { success: false, error: 'duplicate_email' };
    }

    // Max 15 non-director members
    const nonDirectorCount = state.mandate.teamMembers.filter(m => m.role !== 'director' && !m.isFromCompaniesHouse).length;
    if (member.role !== 'director' && nonDirectorCount >= MAX_NON_DIRECTOR_MEMBERS) {
      toast.error(`Maximum ${MAX_NON_DIRECTOR_MEMBERS} non-director members allowed`);
      return { success: false, error: 'max_members' };
    }

    // Manage Team restricted to directors only
    if (member.role !== 'director' && member.permissions.manageTeam) {
      member = { ...member, permissions: { ...member.permissions, manageTeam: false } };
      toast.info('Manage Team permission is restricted to directors');
    }

    // Invitation expiry: 14 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const newMember: TeamMember = {
      ...member,
      id: Math.random().toString(36).substr(2, 9),
      status: 'invited',
      invitedDate: 'Today',
      isFromCompaniesHouse: false,
      screeningStatus: 'in_progress',
      requiresIdv: member.permissions.approvePayments || member.permissions.initiatePayments,
      invitationExpiresAt: expiresAt.toISOString(),
      verificationTimeline: [
        { event: 'Invite sent', timestamp: 'Now', status: 'complete' },
        { event: 'KYC/AML screening', timestamp: 'Pending', status: 'current' },
        { event: 'Identity verification', timestamp: 'Pending', status: 'pending' },
        { event: 'Mandate acceptance', timestamp: 'Pending', status: 'pending' },
      ],
    };
    setState(prev => ({
      ...prev,
      mandate: {
        ...prev.mandate,
        teamMembers: [...prev.mandate.teamMembers, newMember],
        auditLog: [...prev.mandate.auditLog, {
          id: Math.random().toString(36).substr(2, 9),
          event: `Invited ${member.name}`,
          actor: getApplicantName(),
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          detail: `Role: ${member.role} · Sanctions screening initiated`,
          type: 'action',
        }],
      },
      dashboardView: 'team',
    }));
    return { success: true };
  };

  const handleSendInviteForExisting = (editingMember: TeamMember, memberData: Omit<TeamMember, 'id' | 'status' | 'invitedDate' | 'isFromCompaniesHouse'>) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    setState(prev => ({
      ...prev,
      mandate: {
        ...prev.mandate,
        teamMembers: prev.mandate.teamMembers.map(m =>
          m.id === editingMember.id
            ? {
                ...m,
                ...memberData,
                status: 'invited' as const,
                invitedDate: 'Today',
                screeningStatus: 'in_progress' as const,
                requiresIdv: memberData.permissions.approvePayments || memberData.permissions.initiatePayments,
                verificationTimeline: [
                  { event: 'Invite sent', timestamp: 'Now', status: 'complete' as const },
                  { event: 'KYC/AML screening', timestamp: 'Pending', status: 'current' as const },
                  { event: 'Identity verification', timestamp: 'Pending', status: 'pending' as const },
                  { event: 'Mandate acceptance', timestamp: 'Pending', status: 'pending' as const },
                ],
              }
            : m
        ),
        auditLog: [...prev.mandate.auditLog, {
          id: Math.random().toString(36).substr(2, 9),
          event: `Invited ${editingMember.name}`,
          actor: getApplicantName(),
          timestamp,
          detail: `Role: ${memberData.role} · Sanctions screening initiated`,
          type: 'action' as const,
        }],
      },
      dashboardView: 'team',
      editingMemberId: null,
    }));
  };

  const inviteExistingMember = (memberId: string) => {
    setState(prev => ({ ...prev, editingMemberId: memberId, dashboardView: 'add-member' }));
  };

  const simulateVerify = (memberId: string) => {
    setState(prev => ({
      ...prev,
      mandate: {
        ...prev.mandate,
        teamMembers: prev.mandate.teamMembers.map(m =>
          m.id === memberId ? {
            ...m,
            status: 'verified' as const,
            screeningStatus: 'cleared' as const,
            sanctionsCleared: true,
            isPep: false,
            hasAcceptedMandate: true,
            mandateAcceptanceStatus: 'accepted' as const,
            acceptedMandateDate: 'Today',
            verificationTimeline: [
              { event: 'Invite sent', timestamp: 'Earlier', status: 'complete' as const },
              { event: 'KYC/AML screening', timestamp: 'Cleared', status: 'complete' as const },
              { event: 'Identity verified', timestamp: 'Just now', status: 'complete' as const },
              { event: 'Mandate accepted', timestamp: 'Just now', status: 'complete' as const },
            ],
          } : m
        ),
        activationStatus: prev.mandate.teamMembers.every(m => m.id === memberId || m.status === 'verified')
          ? 'fully_active' : prev.mandate.activationStatus,
        auditLog: [...prev.mandate.auditLog, {
          id: Math.random().toString(36).substr(2, 9),
          event: `${prev.mandate.teamMembers.find(m => m.id === memberId)?.name} verified & accepted mandate`,
          actor: 'System',
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          detail: 'KYC/AML cleared · Sanctions cleared · PEP: No · ID verified · Mandate accepted digitally',
          type: 'success',
        }],
      },
    }));
    toast.success('Member verified (simulated)');
  };

  /** Simulate KYC failure — auto-revokes Approve Payments permission (Gap mandates-03-S1) */
  const simulateVerifyFailed = (memberId: string) => {
    setState(prev => ({
      ...prev,
      mandate: {
        ...prev.mandate,
        teamMembers: prev.mandate.teamMembers.map(m =>
          m.id === memberId ? {
            ...m,
            status: 'verification_failed' as const,
            screeningStatus: 'flagged' as const,
            // Auto-revoke Approve Payments on KYC failure
            permissions: { ...m.permissions, approvePayments: false },
            verificationTimeline: [
              { event: 'Invite sent', timestamp: 'Earlier', status: 'complete' as const },
              { event: 'KYC/AML screening', timestamp: 'Failed', status: 'complete' as const },
              { event: 'Identity verification', timestamp: 'Failed', status: 'complete' as const },
              { event: 'Mandate acceptance', timestamp: 'Blocked', status: 'pending' as const },
            ],
          } : m
        ),
        auditLog: [...prev.mandate.auditLog, {
          id: Math.random().toString(36).substr(2, 9),
          event: `${prev.mandate.teamMembers.find(m => m.id === memberId)?.name} — verification failed`,
          actor: 'System',
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          detail: 'KYC/AML failed · Approve Payments permission automatically revoked',
          type: 'warning',
        }],
      },
    }));
    toast.error('Verification failed (simulated) — approval permission revoked');
  };

  const suspendMember = (memberId: string) => {
    setState(prev => ({
      ...prev,
      mandate: {
        ...prev.mandate,
        teamMembers: prev.mandate.teamMembers.map(m =>
          m.id === memberId ? { ...m, status: 'suspended' as const } : m
        ),
        auditLog: [...prev.mandate.auditLog, {
          id: Math.random().toString(36).substr(2, 9),
          event: `Suspended ${prev.mandate.teamMembers.find(m => m.id === memberId)?.name}`,
          actor: getApplicantName(),
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          detail: 'Access temporarily suspended. Can be reinstated at any time.',
          type: 'warning',
        }],
      },
    }));
    toast.info('Member access suspended');
  };

  const lastResendTimestamps: Record<string, number> = {};
  const RESEND_COOLDOWN_MS = 60_000; // 1 minute cooldown

  const resendInvite = (memberId: string) => {
    const now = Date.now();
    const lastSent = lastResendTimestamps[memberId] || 0;
    if (now - lastSent < RESEND_COOLDOWN_MS) {
      const secondsLeft = Math.ceil((RESEND_COOLDOWN_MS - (now - lastSent)) / 1000);
      toast.error(`Please wait ${secondsLeft}s before resending`);
      return;
    }
    lastResendTimestamps[memberId] = now;
    addAuditEntry(
      `Invite resent to ${state.mandate.teamMembers.find(m => m.id === memberId)?.name}`,
      getApplicantName(),
      undefined,
      'action'
    );
    toast.success('Invite resent');
  };

  const revokeMember = (memberId: string) => {
    setState(prev => ({
      ...prev,
      mandate: {
        ...prev.mandate,
        teamMembers: prev.mandate.teamMembers.map(m =>
          m.id === memberId ? { ...m, status: 'not_invited' as const } : m
        ),
      },
    }));
    toast.info('Invite revoked');
  };

  // =====================
  // MOCK DIRECTORS
  // =====================
  const createMockDirectors = () => [
    {
      id: '1',
      name: 'SOPHIE CARTER',
      role: 'Director',
      isPsc: true,
      appointmentDate: 'Jan 2020',
      selected: true,
      email: 'sophie.carter@brighthospitality.co.uk',
      phone: '07700900000',
      isPrimaryHolder: true,
    },
    {
      id: '2',
      name: 'JAMES CARTER',
      role: 'Director',
      isPsc: false,
      appointmentDate: 'Mar 2021',
      selected: false,
      email: 'james.carter@brighthospitality.co.uk',
      phone: '07700900001',
    },
  ];

  // =====================
  // SHARED: TEAM MEMBERS + ADD MEMBER SUB-VIEWS
  // =====================
  // Used by both flow step 7 and dashboard sub-views
  const renderTeamMembersScreen = (context: 'flow' | 'dashboard', onDone: () => void, onBack: () => void) => {
    const dashView = state.dashboardView;

    // Sub-view: Add team member form
    if (dashView === 'add-member') {
      const editingMember = state.editingMemberId
        ? state.mandate.teamMembers.find(m => m.id === state.editingMemberId)
        : null;

      if (context === 'flow') {
        return (
          <ScreenAddTeamMember
            prefillName={editingMember?.name || ''}
            prefillEmail={editingMember?.email || ''}
            prefillRole={editingMember?.role || 'director'}
            isCompaniesHouseDirector={editingMember?.isFromCompaniesHouse || false}
            context="flow"
            existingEmails={state.mandate.teamMembers.map(m => m.email)}
            mandateThresholdPence={state.mandate.thresholdAmount}
            memberStatus={editingMember?.status}
            onSendInvite={(memberData) => {
              if (editingMember) {
                handleSendInviteForExisting(editingMember, memberData);
              } else {
                addTeamMember(memberData);
              }
            }}
            onBack={() => setState(prev => ({ ...prev, dashboardView: 'team', editingMemberId: null }))}
          />
        );
      }

      return (
        <div className="fixed inset-0 bg-[var(--background-app)] z-50 overflow-y-auto">
          <ScreenAddTeamMember
            prefillName={editingMember?.name || ''}
            prefillEmail={editingMember?.email || ''}
            prefillRole={editingMember?.role || 'director'}
            isCompaniesHouseDirector={editingMember?.isFromCompaniesHouse || false}
            existingEmails={state.mandate.teamMembers.map(m => m.email)}
            mandateThresholdPence={state.mandate.thresholdAmount}
            memberStatus={editingMember?.status}
            onSendInvite={(memberData) => {
              if (editingMember) {
                handleSendInviteForExisting(editingMember, memberData);
              } else {
                addTeamMember(memberData);
              }
            }}
            onBack={() => setState(prev => ({ ...prev, dashboardView: 'team', editingMemberId: null }))}
          />
        </div>
      );
    }

    // Main team list view
    if (context === 'flow') {
      return (
        <ScreenTeamMembers
          applicantName={getApplicantName()}
          teamMembers={state.mandate.teamMembers}
          auditLog={state.mandate.auditLog}
          context={context}
          onInviteMember={inviteExistingMember}
          onAddNewMember={() => setState(prev => ({ ...prev, dashboardView: 'add-member', editingMemberId: null }))}
          onResendInvite={resendInvite}
          onRevokeMember={revokeMember}
          onSuspendMember={suspendMember}
          onEditPermissions={inviteExistingMember}
          onReviewApproval={() => setState(prev => ({ ...prev, dashboardView: 'mandate-summary' }))}
          onDone={onDone}
          onSkip={onDone}
          onSimulateVerify={simulateVerify}
          onSimulateVerifyFailed={simulateVerifyFailed}
        />
      );
    }

    return (
      <div className="fixed inset-0 bg-[var(--background-app)] z-50 overflow-y-auto">
        <ScreenTeamMembers
          applicantName={getApplicantName()}
          teamMembers={state.mandate.teamMembers}
          auditLog={state.mandate.auditLog}
          context={context}
          onInviteMember={inviteExistingMember}
          onAddNewMember={() => setState(prev => ({ ...prev, dashboardView: 'add-member', editingMemberId: null }))}
          onResendInvite={resendInvite}
          onRevokeMember={revokeMember}
          onSuspendMember={suspendMember}
          onEditPermissions={inviteExistingMember}
          onReviewApproval={() => setState(prev => ({ ...prev, dashboardView: 'mandate-summary' }))}
          onDone={onDone}
          onSkip={onDone}
          onSimulateVerify={simulateVerify}
          onSimulateVerifyFailed={simulateVerifyFailed}
        />
      </div>
    );
  };

  const handleMandateConfirm = (onSuccess: () => void) => {
    try {
      const version = generateMandateVersion();
      const confirmedAt = new Date().toISOString();
      const timestamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

      setState(prev => ({
        ...prev,
        mandate: {
          ...prev.mandate,
          confirmed: true,
          locked: true,
          mandateVersion: version,
          confirmedAt,
          auditLog: [...prev.mandate.auditLog, {
            id: Math.random().toString(36).substr(2, 9),
            event: 'Mandate confirmed',
            actor: getApplicantName(),
            timestamp,
            detail: `Version: ${version}. Approval rules and authorised persons confirmed. Digital acceptance recorded. Mandate locked.`,
            type: 'success' as const,
          }],
        },
      }));
      onSuccess();
    } catch {
      toast.error('Failed to confirm mandate. Please try again.');
    }
  };

  const renderMandateSummaryScreen = (onConfirm: () => void, onBack: () => void, context: 'flow' | 'dashboard' = 'dashboard') => {
    if (context === 'flow') {
      return (
        <ScreenMandateSummary
          mandate={state.mandate}
          applicantName={getApplicantName()}
          context="flow"
          onEditRule={() => {
            if (state.mandate.locked) { toast.error('Mandate is locked — cannot edit after confirmation'); return; }
            toast.info('In production, this would open the approval rule editor');
          }}
          onEditMember={(id) => {
            if (state.mandate.locked) { toast.error('Mandate is locked — cannot edit after confirmation'); return; }
            inviteExistingMember(id);
          }}
          onResendInvite={resendInvite}
          onConfirm={() => handleMandateConfirm(onConfirm)}
          onBack={onBack}
        />
      );
    }

    return (
      <div className="fixed inset-0 bg-[var(--background-app)] z-50 overflow-y-auto">
        <ScreenMandateSummary
          mandate={state.mandate}
          applicantName={getApplicantName()}
          onEditRule={() => {
            if (state.mandate.locked) { toast.error('Mandate is locked — cannot edit after confirmation'); return; }
            toast.info('In production, this would open the approval rule editor');
          }}
          onEditMember={(id) => {
            if (state.mandate.locked) { toast.error('Mandate is locked — cannot edit after confirmation'); return; }
            inviteExistingMember(id);
          }}
          onResendInvite={resendInvite}
          onConfirm={() => handleMandateConfirm(onConfirm)}
          onBack={onBack}
        />
      </div>
    );
  };

  // =====================
  // SHARED: AUTHORITY CONFIRMATION HANDLER
  // =====================
  const handleAuthorityConfirmation = (authorityType: string, boardResUploaded: boolean) => {
    const teamMembers = state.directors
      .filter(d => !d.isPrimaryHolder)
      .map(d => ({
        id: d.id,
        name: d.name,
        email: d.email || '',
        role: 'director' as const,
        permissions: {
          viewAccount: true, initiatePayments: true, approvePayments: true,
          manageBeneficiaries: true, manageTeam: true, cardAccess: true,
        },
        status: 'not_invited' as const,
        isFromCompaniesHouse: true,
      }));

    const timestamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const auditEntry: MandateAuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      event: `Authority type selected: ${authorityType.replace(/_/g, ' ')}`,
      actor: getApplicantName(),
      timestamp,
      detail: boardResUploaded ? 'Board resolution uploaded' : undefined,
      type: 'action',
    };

    // Sole director skip targets differ by flow:
    //   Ideal:     step 8 → 11 (Mandate Summary for consent)
    //   Optimised: step 10 → 13 (Mandate Summary for consent)
    const soleSkipTarget = state.journeyType === 'optimised' ? 13 : 11;
    // Multi-director next step (approval rule):
    //   Ideal:     step 8 → 9
    //   Optimised: step 10 → 11
    const multiNextStep = state.journeyType === 'optimised' ? 11 : 9;

    if (authorityType === 'sole_director') {
      // Sole director: skip approval rule & team members, but still show mandate summary for consent
      setState(prev => ({
        ...prev,
        mandate: {
          ...prev.mandate,
          authorityType: authorityType as any,
          boardResolutionUploaded: boardResUploaded,
          approvalRule: 'any_one',
          thresholdAmount: null,
          teamMembers,
          confirmed: false,
          auditLog: [...prev.mandate.auditLog, auditEntry],
        },
        step: soleSkipTarget,
      }));
    } else {
      setState(prev => ({
        ...prev,
        mandate: {
          ...prev.mandate,
          authorityType: authorityType as any,
          boardResolutionUploaded: boardResUploaded,
          teamMembers,
          auditLog: [...prev.mandate.auditLog, auditEntry],
        },
        step: multiNextStep,
      }));
    }
  };

  // =====================
  // RENDER: TERMINATION INTERCEPT
  // =====================
  if (state.termination?.isTerminated) {
    return (
      <ScreenTermination
        termination={state.termination}
        onPrimaryAction={() => toast.info('Redirecting to branch locator...')}
        onSecondaryAction={() => window.location.reload()}
      />
    );
  }

  // =====================
  // RENDER: JOURNEY SELECTION (Step 0)
  // =====================
  if (state.step === 0) {
    return (
      <ScreenJourneySelection
        onSelect={(journey) => {
          setState(prev => ({ ...prev, journeyType: journey }));
          nextStep();
        }}
      />
    );
  }

  // =============================================
  // IDEAL FLOW (15 steps)
  // =============================================
  if (state.journeyType === 'ideal') {
    const progressTotal = getProgressTotal();

    // Step 1: Welcome
    if (state.step === 1) return (
      <OnboardingLayout currentStep={1} totalSteps={progressTotal} title={titles[0]} onSaveExit={handleSaveExit}>
        <ScreenWelcomeIdeal onStart={nextStep} onResume={() => toast.info('Resume feature coming soon')} />
      </OnboardingLayout>
    );

    // Step 2: Find Business
    if (state.step === 2) return (
      <OnboardingLayout currentStep={2} totalSteps={progressTotal} title={titles[1]} onSaveExit={handleSaveExit}>
        <ScreenCompanySearchOptimised onSelect={(c) => { setState(prev => ({ ...prev, selectedCompany: c })); nextStep(); }} />
      </OnboardingLayout>
    );

    // Step 3: Confirm Company
    if (state.step === 3 && state.selectedCompany) return (
      <OnboardingLayout currentStep={3} totalSteps={progressTotal} title={titles[2]} onSaveExit={handleSaveExit} onBack={prevStep}>
        <ScreenConfirmCompany
          company={state.selectedCompany}
          onConfirm={() => {
            setState(prev => ({ ...prev, directors: createMockDirectors() }));
            nextStep();
          }}
          onBack={prevStep}
        />
      </OnboardingLayout>
    );

    // Step 4: Directors
    if (state.step === 4) return (
      <OnboardingLayout currentStep={4} totalSteps={progressTotal} title={titles[3]} onSaveExit={handleSaveExit} onBack={state.editingDirectorId ? prevStep : undefined}>
        {state.editingDirectorId === 'new' ? (
          <ScreenDirectorEdit
            director={null}
            onSave={(d) => {
              const newDirector = { id: Math.random().toString(36).substr(2, 9), name: 'NEW PERSON', ...d, selected: true, isManual: true, isPsc: false } as any;
              setState(prev => ({ ...prev, directors: [...prev.directors, newDirector], editingDirectorId: null }));
              toast.success('Person added');
            }}
            onRemove={() => setState(prev => ({ ...prev, editingDirectorId: null }))}
          />
        ) : (
          <ScreenDirectorsList
            directors={state.directors}
            onAdd={() => setState(prev => ({ ...prev, editingDirectorId: 'new' }))}
            onContinue={(d) => { setState(prev => ({ ...prev, directors: d })); nextStep(); }}
          />
        )}
      </OnboardingLayout>
    );

    // Step 5: Identity Verification (Onfido)
    if (state.step === 5) return (
      <OnboardingLayout currentStep={5} totalSteps={progressTotal} title={titles[4]} onSaveExit={handleSaveExit} onBack={prevStep}>
        <ScreenIdentityVerification
          firstName={getApplicantFirstName()}
          onVerified={() => { setState(prev => ({ ...prev, idVerification: { type: 'passport', status: 'verified' } })); nextStep(); }}
        />
      </OnboardingLayout>
    );

    // Step 6: Connect Bank
    if (state.step === 6) return (
      <OnboardingLayout currentStep={6} totalSteps={progressTotal} title={titles[5]} onSaveExit={handleSaveExit}>
        <ScreenConnectBank onConnect={nextStep} onSkip={() => setState(prev => ({ ...prev, step: 8 }))} />
      </OnboardingLayout>
    );

    // Step 7: Select Bank
    if (state.step === 7) return (
      <OnboardingLayout currentStep={7} totalSteps={progressTotal} title={titles[6]} onSaveExit={handleSaveExit}>
        <ScreenOpenBanking
          onConnect={(provider) => { setState(prev => ({ ...prev, selectedBank: provider, openBanking: { provider, connected: true } })); nextStep(); }}
          onSkip={() => nextStep()}
        />
      </OnboardingLayout>
    );

    // Step 8: Authority Confirmation (Screen A)
    if (state.step === 8) return (
      <OnboardingLayout currentStep={8} totalSteps={progressTotal} title={titles[7]} onSaveExit={handleSaveExit} onBack={prevStep}>
        <ScreenAuthorityConfirmation
          companyName={state.selectedCompany?.name || 'Bright Hospitality Ltd'}
          directorCount={state.directors.length}
          onContinue={handleAuthorityConfirmation}
          initialAuthorityType={state.mandate.authorityType}
        />
      </OnboardingLayout>
    );

    // Step 9: Approval Rule (Screen B) — skipped for sole director
    if (state.step === 9) return (
      <OnboardingLayout currentStep={9} totalSteps={progressTotal} title={titles[8]} onSaveExit={handleSaveExit} onBack={prevStep}>
        <ScreenApprovalRule
          defaultThreshold={5000}
          isSoleDirector={state.mandate.authorityType === 'sole_director'}
          onContinue={(rule, thresholdAmount) => {
            setState(prev => ({
              ...prev,
              mandate: { ...prev.mandate, approvalRule: rule, thresholdAmount },
              dashboardView: 'team', // Reset for team step
            }));
            nextStep();
          }}
        />
      </OnboardingLayout>
    );

    // Step 10: Team Members (Screen C) — in-flow, skipped for sole director
    if (state.step === 10) {
      // Sub-view: Add team member form
      if (state.dashboardView === 'add-member') {
        return (
          <OnboardingLayout currentStep={10} totalSteps={progressTotal} title={titles[9]} onSaveExit={handleSaveExit} onBack={() => setState(prev => ({ ...prev, dashboardView: 'team', editingMemberId: null }))}>
            {renderTeamMembersScreen(
              'flow',
              () => setState(prev => ({ ...prev, dashboardView: 'team', editingMemberId: null, step: 11 })),
              () => prevStep()
            )}
          </OnboardingLayout>
        );
      }
      return (
        <OnboardingLayout currentStep={10} totalSteps={progressTotal} title={titles[9]} onSaveExit={handleSaveExit} onBack={prevStep}>
          {renderTeamMembersScreen(
            'flow',
            () => setState(prev => ({ ...prev, dashboardView: 'team', editingMemberId: null, step: 11 })),
            () => prevStep()
          )}
        </OnboardingLayout>
      );
    }

    // Step 11: Mandate Summary (Screen E) — in-flow
    if (state.step === 11) {
      const isSoleDirector = state.mandate.authorityType === 'sole_director';
      const backStep = isSoleDirector ? 8 : 10; // sole → Authority Confirmation, multi → Team Members
      return (
        <OnboardingLayout currentStep={11} totalSteps={progressTotal} title={titles[10]} onSaveExit={handleSaveExit} onBack={() => setState(prev => ({ ...prev, dashboardView: 'team', step: backStep }))}>
          {renderMandateSummaryScreen(
            () => {
              // On confirm → advance to step 12 (passkey)
              setState(prev => ({ ...prev, step: 12 }));
            },
            () => {
              // Back → return to authority confirmation (sole) or team members (multi)
              setState(prev => ({ ...prev, dashboardView: 'team', step: backStep }));
            },
            'flow'
          )}
        </OnboardingLayout>
      );
    }

    // Step 12: Create Passkey
    if (state.step === 12) return (
      <OnboardingLayout currentStep={12} totalSteps={progressTotal} title={titles[11]} onSaveExit={handleSaveExit}>
        <ScreenCreatePasskey
          onContinue={() => { setState(prev => ({ ...prev, passkeyCreated: true })); nextStep(); }}
          onFallback={() => toast.info('Password fallback flow')}
        />
      </OnboardingLayout>
    );

    // Step 13: Review Application
    if (state.step === 13) return (
      <OnboardingLayout currentStep={13} totalSteps={progressTotal} title={titles[12]} onSaveExit={handleSaveExit}>
        <ScreenReviewIdeal state={state} onSubmit={() => setTimeout(() => nextStep(), 1500)} onEdit={goToStep} />
      </OnboardingLayout>
    );

    // Step 14: Celebration
    if (state.step === 14) return (
      <div className="fixed inset-0 bg-[var(--background-app)] z-50 overflow-y-auto">
        <ScreenDashboard
          mode="celebration"
          companyName={state.selectedCompany?.name || 'Bright Hospitality Ltd'}
          mandate={state.mandate}
          onGoToDashboard={() => setState(prev => ({ ...prev, step: 15, dashboardView: 'main' }))}
        />
      </div>
    );

    // Step 15: Dashboard (post-activation)
    if (state.step === 15) {
      const dashView = state.dashboardView;

      // Sub-view: Add team member
      if (dashView === 'add-member') {
        return renderTeamMembersScreen('dashboard',
          () => setState(prev => ({ ...prev, dashboardView: 'main' })),
          () => setState(prev => ({ ...prev, dashboardView: 'team', editingMemberId: null }))
        );
      }

      // Sub-view: Team members (ongoing management)
      if (dashView === 'team') {
        return renderTeamMembersScreen('dashboard',
          () => setState(prev => ({ ...prev, dashboardView: 'main' })),
          () => setState(prev => ({ ...prev, dashboardView: 'main' }))
        );
      }

      // Sub-view: Mandate summary
      if (dashView === 'mandate-summary') {
        return renderMandateSummaryScreen(
          () => setState(prev => ({ ...prev, dashboardView: 'mandate-success' })),
          () => setState(prev => ({ ...prev, dashboardView: 'team' }))
        );
      }

      // Sub-view: Mandate success
      if (dashView === 'mandate-success') {
        return (
          <MandateSuccessScreen
            onGoToDashboard={() => setState(prev => ({ ...prev, dashboardView: 'main' }))}
          />
        );
      }

      // Main dashboard
      return (
        <div className="fixed inset-0 bg-[var(--background-app)] z-50 overflow-y-auto">
          <ScreenDashboard
            mode="dashboard"
            companyName={state.selectedCompany?.name || 'Bright Hospitality Ltd'}
            mandate={state.mandate}
            onSetupTeam={() => setState(prev => ({ ...prev, dashboardView: 'team' }))}
            onViewTeamStatus={() => setState(prev => ({ ...prev, dashboardView: 'team' }))}
            onDismissBanner={() => toast.info('Banner dismissed')}
          />
        </div>
      );
    }
  }

  // =============================================
  // OPTIMISED FLOW (26 steps)
  // =============================================
  if (state.journeyType === 'optimised') {
    const progressTotal = getProgressTotal();

    // Steps 1–4: Welcome, Search, Confirm, Directors — identical to ideal
    if (state.step === 1) return <OnboardingLayout currentStep={1} totalSteps={progressTotal} title={titles[0]} onSaveExit={handleSaveExit}><ScreenWelcomeOptimised onStart={nextStep} onResume={() => toast.info('Resume feature coming soon')} /></OnboardingLayout>;

    if (state.step === 2) return <OnboardingLayout currentStep={2} totalSteps={progressTotal} title={titles[1]} onSaveExit={handleSaveExit}><ScreenCompanySearchOptimised onSelect={(c) => { setState(prev => ({ ...prev, selectedCompany: c })); nextStep(); }} /></OnboardingLayout>;

    if (state.step === 3 && state.selectedCompany) return <OnboardingLayout currentStep={3} totalSteps={progressTotal} title={titles[2]} onSaveExit={handleSaveExit} onBack={prevStep}><ScreenConfirmCompany company={state.selectedCompany} onConfirm={() => { setState(prev => ({ ...prev, directors: createMockDirectors() })); nextStep(); }} onBack={prevStep} /></OnboardingLayout>;

    if (state.step === 4) return (
      <OnboardingLayout currentStep={4} totalSteps={progressTotal} title={titles[3]} onSaveExit={handleSaveExit} onBack={state.editingDirectorId ? prevStep : undefined}>
        {state.editingDirectorId === 'new' ? (
          <ScreenDirectorEdit director={null} onSave={(d) => { const newDirector = { id: Math.random().toString(36).substr(2, 9), name: 'NEW PERSON', ...d, selected: true, isManual: true, isPsc: false } as any; setState(prev => ({ ...prev, directors: [...prev.directors, newDirector], editingDirectorId: null })); toast.success('Person added'); }} onRemove={() => setState(prev => ({ ...prev, editingDirectorId: null }))} />
        ) : (
          <ScreenDirectorsList directors={state.directors} onAdd={() => setState(prev => ({ ...prev, editingDirectorId: 'new' }))} onContinue={(d) => { setState(prev => ({ ...prev, directors: d })); nextStep(); }} />
        )}
      </OnboardingLayout>
    );

    // Step 5: Verify Contact (OTP)
    if (state.step === 5) return <OnboardingLayout currentStep={5} totalSteps={progressTotal} title={titles[4]} onSaveExit={handleSaveExit}><ScreenVerify email={state.directors.find(d => d.selected)?.email || 'email@example.com'} onVerified={() => { toast.success('Email verified'); nextStep(); }} onResend={() => toast.info('Code resent')} onChangeEmail={() => toast.info('Change email flow')} /></OnboardingLayout>;

    // Step 6: Create Password
    if (state.step === 6) return <OnboardingLayout currentStep={6} totalSteps={progressTotal} title={titles[5]} onSaveExit={handleSaveExit}><ScreenCreatePassword onContinue={() => { setState(prev => ({ ...prev, passwordCreated: true })); nextStep(); }} /></OnboardingLayout>;

    // Step 7: Identity Verification (Onfido)
    if (state.step === 7) return (
      <OnboardingLayout currentStep={7} totalSteps={progressTotal} title={titles[6]} onSaveExit={handleSaveExit} onBack={prevStep}>
        <ScreenIdentityVerification
          firstName={getApplicantFirstName()}
          onVerified={() => { setState(prev => ({ ...prev, idVerification: { type: 'passport', status: 'verified' } })); nextStep(); }}
        />
      </OnboardingLayout>
    );

    // Step 8: Connect Bank
    if (state.step === 8) return (
      <OnboardingLayout currentStep={8} totalSteps={progressTotal} title={titles[7]} onSaveExit={handleSaveExit}>
        <ScreenConnectBank onConnect={nextStep} onSkip={() => setState(prev => ({ ...prev, step: 10 }))} />
      </OnboardingLayout>
    );

    // Step 9: Select Bank
    if (state.step === 9) return (
      <OnboardingLayout currentStep={9} totalSteps={progressTotal} title={titles[8]} onSaveExit={handleSaveExit}>
        <ScreenOpenBanking
          onConnect={(provider) => { setState(prev => ({ ...prev, openBanking: { provider, connected: true }, selectedBank: provider, step: 10 })); }}
          onSkip={() => { setState(prev => ({ ...prev, openBanking: { provider: '', connected: false }, step: 10 })); }}
        />
      </OnboardingLayout>
    );

    // Step 10: Authority Confirmation (Screen A)
    if (state.step === 10) return (
      <OnboardingLayout currentStep={10} totalSteps={progressTotal} title={titles[9]} onSaveExit={handleSaveExit} onBack={prevStep}>
        <ScreenAuthorityConfirmation
          companyName={state.selectedCompany?.name || 'Bright Hospitality Ltd'}
          directorCount={state.directors.length}
          onContinue={handleAuthorityConfirmation}
          initialAuthorityType={state.mandate.authorityType}
        />
      </OnboardingLayout>
    );

    // Step 11: Approval Rule (Screen B) — skipped for sole director
    if (state.step === 11) return (
      <OnboardingLayout currentStep={11} totalSteps={progressTotal} title={titles[10]} onSaveExit={handleSaveExit} onBack={prevStep}>
        <ScreenApprovalRule defaultThreshold={5000} isSoleDirector={state.mandate.authorityType === 'sole_director'} onContinue={(rule, thresholdAmount) => {
          setState(prev => ({ ...prev, mandate: { ...prev.mandate, approvalRule: rule, thresholdAmount }, dashboardView: 'team' }));
          nextStep();
        }} />
      </OnboardingLayout>
    );

    // Step 12: Team Members (in-flow) — skipped for sole director
    if (state.step === 12) {
      // Sub-view: Add team member form
      if (state.dashboardView === 'add-member') {
        return (
          <OnboardingLayout currentStep={12} totalSteps={progressTotal} title={titles[11]} onSaveExit={handleSaveExit} onBack={() => setState(prev => ({ ...prev, dashboardView: 'team', editingMemberId: null }))}>
            {renderTeamMembersScreen(
              'flow',
              () => setState(prev => ({ ...prev, dashboardView: 'team', editingMemberId: null, step: 13 })),
              () => prevStep()
            )}
          </OnboardingLayout>
        );
      }
      return (
        <OnboardingLayout currentStep={12} totalSteps={progressTotal} title={titles[11]} onSaveExit={handleSaveExit} onBack={prevStep}>
          {renderTeamMembersScreen(
            'flow',
            () => setState(prev => ({ ...prev, dashboardView: 'team', editingMemberId: null, step: 13 })),
            () => prevStep()
          )}
        </OnboardingLayout>
      );
    }

    // Step 13: Mandate Summary (in-flow) — skipped for sole director
    if (state.step === 13) {
      const isSoleDirector = state.mandate.authorityType === 'sole_director';
      const backStep = isSoleDirector ? 10 : 12; // sole → Authority Confirmation, multi → Team Members
      return (
        <OnboardingLayout currentStep={13} totalSteps={progressTotal} title={titles[12]} onSaveExit={handleSaveExit} onBack={() => setState(prev => ({ ...prev, dashboardView: 'team', step: backStep }))}>
          {renderMandateSummaryScreen(
            () => setState(prev => ({ ...prev, step: 14 })),
            () => setState(prev => ({ ...prev, dashboardView: 'team', step: backStep })),
            'flow'
          )}
        </OnboardingLayout>
      );
    }

    // Step 14: Trading Address
    if (state.step === 14) return <OnboardingLayout currentStep={14} totalSteps={progressTotal} title={titles[13]} onSaveExit={handleSaveExit}><ScreenTradingAddressOptimised registeredAddress={state.selectedCompany?.address || '123 Business Rd, London'} onContinue={(type, value) => { setState(prev => ({ ...prev, tradingAddress: { type, value } })); nextStep(); }} /></OnboardingLayout>;

    // Step 15: Review Details
    if (state.step === 15) return <OnboardingLayout currentStep={15} totalSteps={progressTotal} title={titles[14]} onSaveExit={handleSaveExit}><ScreenReviewDetails tradingName={state.selectedCompany?.name || 'My Company Ltd'} tradingAddress={state.tradingAddress?.value || state.selectedCompany?.address || ''} onContinue={nextStep} onEdit={() => goToStep(14)} /></OnboardingLayout>;

    // Steps 16-23: Business Questions
    const isOBConnected = !!state.openBanking?.connected;

    if (state.step === 16) return (
      <OnboardingLayout currentStep={16} totalSteps={progressTotal} title="Business Activity" onSaveExit={handleSaveExit}>
        <ScreenQuestionTurnover onNext={(val) => { if (val === '£5M+') { terminateJourney('high_turnover'); } else { updateBusinessDetails('turnover', val); } }} onSaveExit={handleSaveExit} prefilled={isOBConnected} />
      </OnboardingLayout>
    );

    if (state.step === 17) return <OnboardingLayout currentStep={17} totalSteps={progressTotal} title="Business Activity" onSaveExit={handleSaveExit}><ScreenQuestionEmployees onNext={(val) => updateBusinessDetails('employees', val)} onSaveExit={handleSaveExit} prefilled={isOBConnected} /></OnboardingLayout>;

    if (state.step === 18) return <OnboardingLayout currentStep={18} totalSteps={progressTotal} title="Business Activity" onSaveExit={handleSaveExit}><ScreenQuestionIntlPayments onNext={(val) => updateBusinessDetails('internationalPayments', val)} onSaveExit={handleSaveExit} prefilled={isOBConnected} /></OnboardingLayout>;

    if (state.step === 19) return <OnboardingLayout currentStep={19} totalSteps={progressTotal} title="Business Activity" onSaveExit={handleSaveExit}><ScreenQuestionRevenue onNext={(val) => updateBusinessDetails('revenueSources', val)} onSaveExit={handleSaveExit} /></OnboardingLayout>;

    if (state.step === 20) return <OnboardingLayout currentStep={20} totalSteps={progressTotal} title="Business Activity" onSaveExit={handleSaveExit}><ScreenQuestionWebsite onNext={(val) => updateBusinessDetails('website', val)} onSaveExit={handleSaveExit} /></OnboardingLayout>;

    if (state.step === 21) return <OnboardingLayout currentStep={21} totalSteps={progressTotal} title="Business Activity" onSaveExit={handleSaveExit}><ScreenQuestionMonthlyIncome onNext={(val) => updateBusinessDetails('monthlyIncome', val)} onSaveExit={handleSaveExit} prefilled={isOBConnected} /></OnboardingLayout>;

    if (state.step === 22) return <OnboardingLayout currentStep={22} totalSteps={progressTotal} title="Business Activity" onSaveExit={handleSaveExit}><ScreenQuestionPaymentTypes onNext={(val) => updateBusinessDetails('paymentTypes', val)} onSaveExit={handleSaveExit} prefilled={isOBConnected} /></OnboardingLayout>;

    if (state.step === 23) return <OnboardingLayout currentStep={23} totalSteps={progressTotal} title="Business Activity" onSaveExit={handleSaveExit}><ScreenQuestionCashDeposits onNext={(val) => updateBusinessDetails('cashDeposits', val)} onSaveExit={handleSaveExit} prefilled={isOBConnected} /></OnboardingLayout>;

    // Step 24: Review & Submit
    if (state.step === 24) return <OnboardingLayout currentStep={24} totalSteps={progressTotal} title="Review and submit" onSaveExit={handleSaveExit}><ScreenReviewOptimised state={state} onSubmit={() => setTimeout(() => nextStep(), 1500)} onEdit={goToStep} /></OnboardingLayout>;

    // Step 25: Celebration
    if (state.step === 25) return (
      <div className="fixed inset-0 bg-[var(--background-app)] z-50 overflow-y-auto">
        <ScreenDashboard
          mode="celebration"
          companyName={state.selectedCompany?.name || 'Bright Hospitality Ltd'}
          mandate={state.mandate}
          onGoToDashboard={() => setState(prev => ({ ...prev, step: 26, dashboardView: 'main' }))}
        />
      </div>
    );

    // Step 26: Dashboard (post-activation, same sub-view pattern as ideal step 15)
    if (state.step === 26) {
      const dashView = state.dashboardView;

      if (dashView === 'add-member') {
        return renderTeamMembersScreen('dashboard',
          () => setState(prev => ({ ...prev, dashboardView: 'main' })),
          () => setState(prev => ({ ...prev, dashboardView: 'team', editingMemberId: null }))
        );
      }

      if (dashView === 'team') {
        return renderTeamMembersScreen('dashboard',
          () => setState(prev => ({ ...prev, dashboardView: 'main' })),
          () => setState(prev => ({ ...prev, dashboardView: 'main' }))
        );
      }

      if (dashView === 'mandate-summary') {
        return renderMandateSummaryScreen(
          () => setState(prev => ({ ...prev, dashboardView: 'mandate-success' })),
          () => setState(prev => ({ ...prev, dashboardView: 'team' }))
        );
      }

      if (dashView === 'mandate-success') {
        return <MandateSuccessScreen onGoToDashboard={() => setState(prev => ({ ...prev, dashboardView: 'main' }))} />;
      }

      return (
        <div className="fixed inset-0 bg-[var(--background-app)] z-50 overflow-y-auto">
          <ScreenDashboard
            mode="dashboard"
            companyName={state.selectedCompany?.name || 'Bright Hospitality Ltd'}
            mandate={state.mandate}
            onSetupTeam={() => setState(prev => ({ ...prev, dashboardView: 'team' }))}
            onViewTeamStatus={() => setState(prev => ({ ...prev, dashboardView: 'team' }))}
            onDismissBanner={() => toast.info('Banner dismissed')}
          />
        </div>
      );
    }
  }

  // Legacy/Standard Flow
  if (state.step === 1 && state.journeyType === 'standard') {
    return <ScreenStart onCompanySelect={(c) => { setState(prev => ({ ...prev, selectedCompany: c })); nextStep(); }} />;
  }

  if (state.journeyType === 'standard') {
    return (
      <OnboardingLayout currentStep={state.step} totalSteps={8} title="Standard" onSaveExit={handleSaveExit}>
        <div className="p-8 text-center">Standard Flow (Steps 2-8) would go here.</div>
      </OnboardingLayout>
    );
  }

  return null;
}