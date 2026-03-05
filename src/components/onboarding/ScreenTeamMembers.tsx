import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Clock, Plus, RotateCcw, UserX, User, Shield, ShieldCheck, ShieldAlert, Activity, FileText, CircleDot, PauseCircle, ArrowRight, XCircle, AlertTriangle } from 'lucide-react';
import { TeamMember, MandateAuditEntry } from './types';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { StickyFooter } from './StickyFooter';

interface ScreenTeamMembersProps {
  applicantName: string;
  teamMembers: TeamMember[];
  auditLog?: MandateAuditEntry[];
  context?: 'flow' | 'dashboard';
  onInviteMember: (memberId: string) => void;
  onAddNewMember: () => void;
  onResendInvite: (memberId: string) => void;
  onRevokeMember: (memberId: string) => void;
  onSuspendMember?: (memberId: string) => void;
  onEditPermissions: (memberId: string) => void;
  onReviewApproval: () => void;
  onDone: () => void;
  onSkip: () => void;
  onSimulateVerify: (memberId: string) => void;
  onSimulateVerifyFailed?: (memberId: string) => void;
}

export function ScreenTeamMembers({
  applicantName,
  teamMembers,
  auditLog = [],
  context = 'dashboard',
  onInviteMember,
  onAddNewMember,
  onResendInvite,
  onRevokeMember,
  onSuspendMember,
  onEditPermissions,
  onReviewApproval,
  onDone,
  onSkip,
  onSimulateVerify,
  onSimulateVerifyFailed,
}: ScreenTeamMembersProps) {
  const hasVerifiedMember = teamMembers.some(m => m.status === 'verified');
  const hasAnyInvited = teamMembers.some(m => m.status !== 'not_invited');
  const [activeTab, setActiveTab] = useState<'team' | 'activity'>('team');
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null);

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'verified':
        return (
          <span className="flex items-center gap-1 text-[var(--emerald-600)]" style={{ fontSize: '13px', fontWeight: 500 }}>
            <Check size={14} strokeWidth={3} />
            Verified
          </span>
        );
      case 'invited':
        return (
          <span className="flex items-center gap-1 text-[var(--amber-600)]" style={{ fontSize: '13px', fontWeight: 500 }}>
            <Clock size={14} />
            Invite sent
          </span>
        );
      case 'pending_verification':
        return (
          <span className="flex items-center gap-1 text-[var(--amber-600)]" style={{ fontSize: '13px', fontWeight: 500 }}>
            <Clock size={14} />
            Pending verification
          </span>
        );
      case 'verifying':
        return (
          <span className="flex items-center gap-1 text-[var(--amber-600)]" style={{ fontSize: '13px', fontWeight: 500 }}>
            <Clock size={14} />
            Verifying identity
          </span>
        );
      case 'verification_failed':
        return (
          <span className="flex items-center gap-1 text-[var(--accent-danger)]" style={{ fontSize: '13px', fontWeight: 500 }}>
            <XCircle size={14} />
            Verification failed
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center gap-1 text-[var(--accent-danger)]" style={{ fontSize: '13px', fontWeight: 500 }}>
            <PauseCircle size={14} />
            Suspended
          </span>
        );
      default:
        return (
          <span className="text-[var(--text-muted)]" style={{ fontSize: '13px', fontWeight: 500 }}>
            Not yet invited
          </span>
        );
    }
  };

  // Gap 1: Screening status badge
  const getScreeningBadge = (member: TeamMember) => {
    if (!member.screeningStatus || member.screeningStatus === 'not_started') return null;
    switch (member.screeningStatus) {
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-[var(--amber-600)] bg-[var(--amber-50)] px-2 py-0.5 rounded-[var(--radius-pill)]" style={{ fontSize: '11px', fontWeight: 600 }}>
            <ShieldAlert size={10} />
            Screening
          </span>
        );
      case 'cleared':
        return (
          <span className="flex items-center gap-1 text-[var(--emerald-600)] bg-[var(--emerald-50)] px-2 py-0.5 rounded-[var(--radius-pill)]" style={{ fontSize: '11px', fontWeight: 600 }}>
            <ShieldCheck size={10} />
            AML cleared
          </span>
        );
      case 'flagged':
        return (
          <span className="flex items-center gap-1 text-[var(--accent-danger)] bg-[var(--red-50)] px-2 py-0.5 rounded-[var(--radius-pill)]" style={{ fontSize: '11px', fontWeight: 600 }}>
            <ShieldAlert size={10} />
            Flagged
          </span>
        );
    }
  };

  const getPermissionSummary = (member: TeamMember) => {
    const perms: string[] = [];
    if (member.permissions.viewAccount) perms.push('View');
    if (member.permissions.initiatePayments) perms.push('Pay');
    if (member.permissions.approvePayments) perms.push('Approve');
    if (member.permissions.manageTeam) perms.push('Manage team');
    return perms.join(', ');
  };

  const getRoleLabel = (role: TeamMember['role']) => {
    switch (role) {
      case 'director': return 'Director';
      case 'finance_manager': return 'Finance Manager';
      case 'accountant': return 'Accountant';
      case 'employee': return 'Employee';
      case 'custom': return 'Custom Role';
    }
  };

  // Gap 5: Audit log type color
  const getAuditColor = (type: MandateAuditEntry['type']) => {
    switch (type) {
      case 'success': return 'text-[var(--emerald-600)]';
      case 'warning': return 'text-[var(--amber-600)]';
      case 'action': return 'text-[var(--accent-primary)]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  const getAuditBg = (type: MandateAuditEntry['type']) => {
    switch (type) {
      case 'success': return 'bg-[var(--emerald-50)]';
      case 'warning': return 'bg-[var(--amber-50)]';
      case 'action': return 'bg-[var(--blue-50)]';
      default: return 'bg-[var(--background-surface-soft)]';
    }
  };

  return (
    <>
      {context === 'flow' ? (
        /* ===== FLOW MODE: matches OnboardingLayout content style ===== */
        <div className="space-y-[var(--space-lg)]" style={{ fontFamily: 'var(--font-family)' }}>
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-[var(--text-primary)]">Set up your team</h2>
            <p className="text-[var(--text-secondary)]">Invite directors and team members who need access to this account.</p>
          </div>

          {/* Primary user card (Sophie) */}
          <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shrink-0">
                <User size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-primary)]" style={{ fontSize: '16px', fontWeight: 600 }}>{applicantName}</p>
                <p className="text-[var(--text-secondary)]" style={{ fontSize: '13px', fontWeight: 400 }}>
                  Primary signatory · Director
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-[var(--emerald-600)]" style={{ fontSize: '13px', fontWeight: 500 }}>
                    <Check size={14} strokeWidth={3} />
                    Verified
                  </span>
                  <span className="flex items-center gap-1 text-[var(--emerald-600)] bg-[var(--emerald-50)] px-2 py-0.5 rounded-[var(--radius-pill)]" style={{ fontSize: '11px', fontWeight: 600 }}>
                    <ShieldCheck size={10} />
                    AML cleared
                  </span>
                  <span className="text-[var(--text-muted)]" style={{ fontSize: '11px' }}>Full access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section label */}
          {teamMembers.some(m => m.isFromCompaniesHouse) && (
            <label className="text-[var(--text-muted)] ml-1 block">
              Directors from Companies House
            </label>
          )}

          {/* Team member cards */}
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] p-4">
              <div className="flex items-start gap-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center shrink-0
                  ${member.status === 'verified' ? 'bg-[var(--emerald-50)] text-[var(--emerald-600)]' : 'bg-[var(--background-surface-soft)] text-[var(--text-muted)]'}
                `}>
                  <User size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-primary)]" style={{ fontSize: '16px', fontWeight: 600 }}>{member.name}</p>
                  <p className="text-[var(--text-secondary)]" style={{ fontSize: '13px', fontWeight: 400 }}>
                    {getRoleLabel(member.role)}
                    {member.isUbo && <span className="ml-2 text-[var(--indigo-600)] bg-[var(--indigo-50)] px-1.5 py-0.5 rounded" style={{ fontSize: '10px', fontWeight: 600 }}>UBO</span>}
                  </p>

                  {/* Status + screening badges */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {getStatusBadge(member.status)}
                    {getScreeningBadge(member)}
                    {member.requiresIdv && member.status !== 'verified' && (
                      <span className="text-[var(--amber-600)] bg-[var(--amber-50)] px-2 py-0.5 rounded-[var(--radius-pill)]" style={{ fontSize: '11px', fontWeight: 600 }}>
                        ID&V required
                      </span>
                    )}
                    {member.hasAcceptedMandate && (
                      <span className="text-[var(--emerald-600)] bg-[var(--emerald-50)] px-2 py-0.5 rounded-[var(--radius-pill)]" style={{ fontSize: '11px', fontWeight: 600 }}>
                        Mandate accepted
                      </span>
                    )}
                  </div>

                  {member.status === 'invited' && member.invitedDate && (
                    <p className="text-[var(--text-muted)] mt-1" style={{ fontSize: '12px' }}>
                      Sent {member.invitedDate}
                    </p>
                  )}

                  {member.status === 'verified' && (
                    <p className="text-[var(--text-muted)] mt-1" style={{ fontSize: '12px' }}>
                      Can: {getPermissionSummary(member)}
                    </p>
                  )}

                  {/* Verification timeline — expandable */}
                  {member.verificationTimeline && member.verificationTimeline.length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => setExpandedTimeline(expandedTimeline === member.id ? null : member.id)}
                        className="text-[var(--accent-primary)] flex items-center gap-1"
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        <Activity size={12} />
                        {expandedTimeline === member.id ? 'Hide' : 'View'} verification progress
                      </button>
                      <AnimatePresence>
                        {expandedTimeline === member.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 pl-1 border-l-2 border-[var(--divider)] ml-1 space-y-2">
                              {member.verificationTimeline.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2 pl-3 relative">
                                  <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${
                                    step.status === 'complete' ? 'bg-[var(--emerald-600)]'
                                    : step.status === 'current' ? 'bg-[var(--amber-500)]'
                                    : 'bg-[var(--divider)]'
                                  }`} />
                                  <div>
                                    <p className={`${step.status === 'complete' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                                      {step.event}
                                    </p>
                                    <p className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 400 }}>{step.timestamp}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Action buttons based on status */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {member.status === 'not_invited' && (
                      <button
                        onClick={() => onInviteMember(member.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-[var(--radius-pill)] hover:opacity-90 transition-opacity"
                        style={{ fontSize: '13px', fontWeight: 600 }}
                      >
                        Invite
                        <ChevronRight size={14} />
                      </button>
                    )}

                    {member.status === 'invited' && (
                      <>
                        <button
                          onClick={() => onResendInvite(member.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-[var(--accent-primary)] border border-[var(--accent-primary)] rounded-[var(--radius-pill)] hover:bg-[var(--blue-50)] transition-colors"
                          style={{ fontSize: '13px', fontWeight: 600 }}
                        >
                          <RotateCcw size={12} />
                          Resend
                        </button>
                        <button
                          onClick={() => onRevokeMember(member.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-[var(--accent-danger)] border border-[var(--accent-danger)]/30 rounded-[var(--radius-pill)] hover:bg-[var(--red-50)] transition-colors"
                          style={{ fontSize: '13px', fontWeight: 600 }}
                        >
                          <UserX size={12} />
                          Revoke
                        </button>
                        <button
                          onClick={() => onSimulateVerify(member.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-[var(--emerald-600)] border border-[var(--emerald-600)]/30 rounded-[var(--radius-pill)] hover:bg-[var(--emerald-50)] transition-colors"
                          style={{ fontSize: '13px', fontWeight: 600 }}
                        >
                          <Shield size={12} />
                          Simulate verify
                        </button>
                        {onSimulateVerifyFailed && (
                          <button
                            onClick={() => onSimulateVerifyFailed(member.id)}
                            className="flex items-center gap-1.5 px-3 py-2 text-[var(--accent-danger)] border border-[var(--accent-danger)]/30 rounded-[var(--radius-pill)] hover:bg-[var(--red-50)] transition-colors"
                            style={{ fontSize: '13px', fontWeight: 600 }}
                          >
                            <XCircle size={12} />
                            Simulate fail
                          </button>
                        )}
                      </>
                    )}

                    {member.status === 'verification_failed' && (
                      <>
                        <button
                          onClick={() => onResendInvite(member.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-[var(--accent-primary)] border border-[var(--accent-primary)] rounded-[var(--radius-pill)] hover:bg-[var(--blue-50)] transition-colors"
                          style={{ fontSize: '13px', fontWeight: 600 }}
                        >
                          <RotateCcw size={12} />
                          Retry verification
                        </button>
                        <button
                          onClick={() => onRevokeMember(member.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-[var(--accent-danger)] border border-[var(--accent-danger)]/30 rounded-[var(--radius-pill)] hover:bg-[var(--red-50)] transition-colors"
                          style={{ fontSize: '13px', fontWeight: 600 }}
                        >
                          <UserX size={12} />
                          Remove
                        </button>
                      </>
                    )}

                    {member.status === 'verified' && (
                      <>
                        <button
                          onClick={() => onEditPermissions(member.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-[var(--accent-primary)] border border-[var(--accent-primary)] rounded-[var(--radius-pill)] hover:bg-[var(--blue-50)] transition-colors"
                          style={{ fontSize: '13px', fontWeight: 600 }}
                        >
                          Edit permissions
                        </button>
                        <button
                          onClick={() => onRevokeMember(member.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-[var(--accent-danger)] border border-[var(--accent-danger)]/30 rounded-[var(--radius-pill)] hover:bg-[var(--red-50)] transition-colors"
                          style={{ fontSize: '13px', fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add another person CTA */}
          <button
            onClick={onAddNewMember}
            className="w-full py-4 flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--brand-primary-navy)] text-[var(--brand-primary-navy)] hover:bg-[var(--background-surface-soft)] transition-all"
            style={{ fontSize: '16px', fontWeight: 600 }}
          >
            <Plus size={20} />
            Add another person
          </button>

          {/* Skip for now */}
          {!hasAnyInvited && (
            <p className="text-center text-[var(--text-muted)]" style={{ fontSize: '13px', fontWeight: 500 }}>
              You can add people later from your dashboard.
            </p>
          )}

          {/* Continue */}
          <StickyFooter>
            <button
              type="button"
              onClick={onDone}
              className="w-full h-[48px] rounded-[var(--radius-pill)] bg-[var(--brand-primary-navy)] text-[var(--text-on-dark)] hover:opacity-90 transition-all shadow-[var(--shadow-card-lg)] flex items-center justify-center gap-[var(--space-sm)]"
            >
              Continue to review
              <ArrowRight size={18} />
            </button>
            {!hasAnyInvited && (
              <button
                onClick={onSkip}
                className="w-full text-center text-[var(--text-muted)] py-3 hover:text-[var(--text-secondary)] transition-colors"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                Skip for now
              </button>
            )}
          </StickyFooter>
        </div>
      ) : (
        /* ===== DASHBOARD MODE: full-screen with own nav/tabs ===== */
        <div className="min-h-screen bg-[var(--background-app)] flex flex-col" style={{ fontFamily: 'var(--font-family)' }}>
          {/* Navigation bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between p-[var(--space-lg)] border-b border-[var(--divider)] bg-[var(--background-surface)]">
            <div className="flex items-center gap-[var(--space-md)]">
              <button type="button" onClick={onDone} className="text-[var(--text-primary)] hover:bg-[var(--background-surface-soft)] p-1 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h3 className="text-[var(--text-primary)]">{context === 'flow' ? 'Set up your team' : 'Your team'}</h3>
            </div>
            {context !== 'flow' && (
              <button
                type="button"
                onClick={onDone}
                className="text-[var(--accent-primary)]"
                style={{ fontSize: '16px', fontWeight: 600 }}
              >
                Done
              </button>
            )}
          </div>

          {/* Tab bar */}
          <div className="sticky top-[57px] z-20 flex border-b border-[var(--divider)] bg-[var(--background-surface)]">
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 py-3 text-center transition-colors relative ${activeTab === 'team' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              Team
              {activeTab === 'team' && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--accent-primary)] rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-3 text-center transition-colors relative ${activeTab === 'activity' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              Activity
              {auditLog.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-[var(--accent-primary)] text-white rounded-full" style={{ fontSize: '10px', fontWeight: 700 }}>
                  {auditLog.length}
                </span>
              )}
              {activeTab === 'activity' && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--accent-primary)] rounded-full" />}
            </button>
          </div>

          {/* Tab content — scrolls naturally via parent overflow-y-auto */}
          <div className="flex-1 p-[var(--space-xl)] space-y-[var(--space-lg)]">
            {activeTab === 'team' ? (
              <>
                {/* Primary user card (Sophie) */}
                <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shrink-0">
                      <User size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-primary)]" style={{ fontSize: '16px', fontWeight: 600 }}>{applicantName}</p>
                      <p className="text-[var(--text-secondary)]" style={{ fontSize: '13px', fontWeight: 400 }}>
                        Primary signatory · Director
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-[var(--emerald-600)]" style={{ fontSize: '13px', fontWeight: 500 }}>
                          <Check size={14} strokeWidth={3} />
                          Verified
                        </span>
                        <span className="flex items-center gap-1 text-[var(--emerald-600)] bg-[var(--emerald-50)] px-2 py-0.5 rounded-[var(--radius-pill)]" style={{ fontSize: '11px', fontWeight: 600 }}>
                          <ShieldCheck size={10} />
                          AML cleared
                        </span>
                        <span className="text-[var(--text-muted)]" style={{ fontSize: '11px' }}>Full access</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section label */}
                {teamMembers.some(m => m.isFromCompaniesHouse) && (
                  <label className="text-[var(--text-muted)] ml-1 mt-4 block">
                    Directors from Companies House
                  </label>
                )}

                {/* Team member cards */}
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] p-4">
                    <div className="flex items-start gap-4">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center shrink-0
                        ${member.status === 'verified' ? 'bg-[var(--emerald-50)] text-[var(--emerald-600)]' : 'bg-[var(--background-surface-soft)] text-[var(--text-muted)]'}
                      `}>
                        <User size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--text-primary)]" style={{ fontSize: '16px', fontWeight: 600 }}>{member.name}</p>
                        <p className="text-[var(--text-secondary)]" style={{ fontSize: '13px', fontWeight: 400 }}>
                          {getRoleLabel(member.role)}
                          {member.isUbo && <span className="ml-2 text-[var(--indigo-600)] bg-[var(--indigo-50)] px-1.5 py-0.5 rounded" style={{ fontSize: '10px', fontWeight: 600 }}>UBO</span>}
                        </p>

                        {/* Status + screening badges */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {getStatusBadge(member.status)}
                          {getScreeningBadge(member)}
                          {member.requiresIdv && member.status !== 'verified' && (
                            <span className="text-[var(--amber-600)] bg-[var(--amber-50)] px-2 py-0.5 rounded-[var(--radius-pill)]" style={{ fontSize: '11px', fontWeight: 600 }}>
                              ID&V required
                            </span>
                          )}
                          {member.hasAcceptedMandate && (
                            <span className="text-[var(--emerald-600)] bg-[var(--emerald-50)] px-2 py-0.5 rounded-[var(--radius-pill)]" style={{ fontSize: '11px', fontWeight: 600 }}>
                              Mandate accepted
                            </span>
                          )}
                        </div>

                        {member.status === 'invited' && member.invitedDate && (
                          <p className="text-[var(--text-muted)] mt-1" style={{ fontSize: '12px' }}>
                            Sent {member.invitedDate}
                          </p>
                        )}

                        {member.status === 'verified' && (
                          <p className="text-[var(--text-muted)] mt-1" style={{ fontSize: '12px' }}>
                            Can: {getPermissionSummary(member)}
                          </p>
                        )}

                        {/* Gap 8: Verification timeline — expandable */}
                        {member.verificationTimeline && member.verificationTimeline.length > 0 && (
                          <div className="mt-2">
                            <button
                              onClick={() => setExpandedTimeline(expandedTimeline === member.id ? null : member.id)}
                              className="text-[var(--accent-primary)] flex items-center gap-1"
                              style={{ fontSize: '12px', fontWeight: 600 }}
                            >
                              <Activity size={12} />
                              {expandedTimeline === member.id ? 'Hide' : 'View'} verification progress
                            </button>
                            <AnimatePresence>
                              {expandedTimeline === member.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 pl-1 border-l-2 border-[var(--divider)] ml-1 space-y-2">
                                    {member.verificationTimeline.map((step, idx) => (
                                      <div key={idx} className="flex items-start gap-2 pl-3 relative">
                                        <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${
                                          step.status === 'complete' ? 'bg-[var(--emerald-600)]'
                                          : step.status === 'current' ? 'bg-[var(--amber-500)]'
                                          : 'bg-[var(--divider)]'
                                        }`} />
                                        <div>
                                          <p className={`${step.status === 'complete' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                                            {step.event}
                                          </p>
                                          <p className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 400 }}>{step.timestamp}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Action buttons based on status */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {member.status === 'not_invited' && (
                            <button
                              onClick={() => onInviteMember(member.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-[var(--radius-pill)] hover:opacity-90 transition-opacity"
                              style={{ fontSize: '13px', fontWeight: 600 }}
                            >
                              Invite
                              <ChevronRight size={14} />
                            </button>
                          )}

                          {member.status === 'invited' && (
                            <>
                              <button
                                onClick={() => onResendInvite(member.id)}
                                className="flex items-center gap-1.5 px-3 py-2 text-[var(--accent-primary)] border border-[var(--accent-primary)] rounded-[var(--radius-pill)] hover:bg-[var(--blue-50)] transition-colors"
                                style={{ fontSize: '13px', fontWeight: 600 }}
                              >
                                <RotateCcw size={12} />
                                Resend
                              </button>
                              <button
                                onClick={() => onRevokeMember(member.id)}
                                className="flex items-center gap-1.5 px-3 py-2 text-[var(--accent-danger)] border border-[var(--accent-danger)]/30 rounded-[var(--radius-pill)] hover:bg-[var(--red-50)] transition-colors"
                                style={{ fontSize: '13px', fontWeight: 600 }}
                              >
                                <UserX size={12} />
                                Revoke
                              </button>
                              <button
                                onClick={() => onSimulateVerify(member.id)}
                                className="flex items-center gap-1.5 px-3 py-2 text-[var(--emerald-600)] border border-[var(--emerald-600)]/30 rounded-[var(--radius-pill)] hover:bg-[var(--emerald-50)] transition-colors"
                                style={{ fontSize: '13px', fontWeight: 600 }}
                              >
                                <Shield size={12} />
                                Simulate verify
                              </button>
                            </>
                          )}

                          {member.status === 'verified' && (
                            <>
                              <button
                                onClick={() => onEditPermissions(member.id)}
                                className="flex items-center gap-1.5 px-3 py-2 text-[var(--accent-primary)] border border-[var(--accent-primary)] rounded-[var(--radius-pill)] hover:bg-[var(--blue-50)] transition-colors"
                                style={{ fontSize: '13px', fontWeight: 600 }}
                              >
                                Edit permissions
                              </button>
                              <button
                                onClick={() => onRevokeMember(member.id)}
                                className="flex items-center gap-1.5 px-3 py-2 text-[var(--accent-danger)] border border-[var(--accent-danger)]/30 rounded-[var(--radius-pill)] hover:bg-[var(--red-50)] transition-colors"
                                style={{ fontSize: '13px', fontWeight: 600 }}
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add another person CTA */}
                <button
                  onClick={onAddNewMember}
                  className="w-full py-4 flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--brand-primary-navy)] text-[var(--brand-primary-navy)] hover:bg-[var(--background-surface-soft)] transition-all"
                  style={{ fontSize: '16px', fontWeight: 600 }}
                >
                  <Plus size={20} />
                  Add another person
                </button>

                {/* Review approval setup link */}
                {hasVerifiedMember && (
                  <button
                    onClick={onReviewApproval}
                    className="w-full flex items-center justify-center gap-2 text-[var(--accent-primary)] py-3 hover:opacity-80 transition-opacity"
                    style={{ fontSize: '16px', fontWeight: 600 }}
                  >
                    Review your approval setup
                    <ChevronRight size={18} />
                  </button>
                )}

                {/* Skip for now */}
                {!hasAnyInvited && context !== 'flow' && (
                  <button
                    onClick={onSkip}
                    className="w-full text-center text-[var(--text-muted)] py-3 hover:text-[var(--text-secondary)] transition-colors"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    Skip for now — you can add people later
                  </button>
                )}
              </>
            ) : (
              /* Gap 5: Activity / Audit Log Tab */
              <div className="space-y-3">
                {auditLog.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity size={32} className="text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-[var(--text-muted)]" style={{ fontSize: '14px', fontWeight: 500 }}>
                      No activity yet
                    </p>
                    <p className="text-[var(--text-muted)]" style={{ fontSize: '13px', fontWeight: 400 }}>
                      Actions taken on your mandate will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    <label className="text-[var(--text-muted)] ml-1 block">
                      Mandate activity log
                    </label>
                    {[...auditLog].reverse().map((entry) => (
                      <div key={entry.id} className={`${getAuditBg(entry.type)} rounded-[var(--radius-md)] p-3 border border-[var(--divider)]`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getAuditBg(entry.type)}`}>
                            <CircleDot size={12} className={getAuditColor(entry.type)} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[var(--text-primary)]" style={{ fontSize: '13px', fontWeight: 600 }}>
                              {entry.event}
                            </p>
                            {entry.detail && (
                              <p className="text-[var(--text-secondary)] mt-0.5" style={{ fontSize: '12px', fontWeight: 400 }}>
                                {entry.detail}
                              </p>
                            )}
                            <p className="text-[var(--text-muted)] mt-1" style={{ fontSize: '11px', fontWeight: 400 }}>
                              {entry.actor} · {entry.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Flow context: sticky continue footer */}
          {context === 'flow' && (
            <div className="sticky bottom-0 z-20 bg-[var(--background-app)] border-t border-[var(--divider)] p-[var(--space-xl)] pb-[var(--space-xxl)]">
              <button
                type="button"
                onClick={onDone}
                className="w-full h-[48px] rounded-[var(--radius-pill)] bg-[var(--brand-primary-navy)] text-[var(--text-on-dark)] hover:opacity-90 transition-all shadow-[var(--shadow-card-lg)] flex items-center justify-center gap-[var(--space-sm)]"
              >
                Continue to review
                <ArrowRight size={18} />
              </button>
              {!hasAnyInvited && (
                <button
                  onClick={onSkip}
                  className="w-full text-center text-[var(--text-muted)] py-3 hover:text-[var(--text-secondary)] transition-colors"
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  Skip for now — you can add people later
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}