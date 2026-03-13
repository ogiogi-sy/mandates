import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, AlertTriangle, RotateCcw, ShieldCheck, ArrowDown, Play, Lock, Eye, CreditCard, Users, UserCheck, Clock, ChevronDown, Zap, Shield } from 'lucide-react';
import { MandateState, TeamMember } from './types';
import { StickyFooter } from './StickyFooter';
import { SignaturePad } from './SignaturePad';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

interface ScreenMandateSummaryProps {
  mandate: MandateState;
  applicantName: string;
  context?: 'flow' | 'dashboard';
  onEditRule: () => void;
  onEditMember: (memberId: string) => void;
  onResendInvite: (memberId: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

/* ─── tiny sub-components ─── */

const AVATAR_COLORS = [
  'var(--brand-blue)',
  'var(--emerald-600)',
  'var(--purple-600)',
  'var(--orange-400)',
  'var(--amber-600)',
  'var(--red-600)',
];

function Avatar({ name, index, size = 32 }: { name: string; index: number; size?: number }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
        color: 'white',
        fontSize: size * 0.38,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: 'verified' | 'pending' | 'inactive' }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--emerald-50)] text-[var(--emerald-600)]" style={{ fontSize: '12px', fontWeight: 600 }}>
        <Check size={11} strokeWidth={3} />
        Verified
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--amber-50)] text-[var(--amber-600)]" style={{ fontSize: '12px', fontWeight: 600 }}>
        <Clock size={11} strokeWidth={2.5} />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--gray-100)] text-[var(--text-muted)]" style={{ fontSize: '12px', fontWeight: 600 }}>
      Inactive
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[var(--text-muted)] ml-0.5 mb-[var(--space-sm)]" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {children}
    </p>
  );
}

/* ─── main component ─── */

export function ScreenMandateSummary({
  mandate,
  applicantName,
  context = 'dashboard',
  onEditRule,
  onEditMember,
  onResendInvite,
  onConfirm,
  onBack,
}: ScreenMandateSummaryProps) {
  const [declared, setDeclared] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simAmount, setSimAmount] = useState('');
  const [simInitiator, setSimInitiator] = useState<string>('non-director');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    approvalFlow: false,
    permissions: true,
    activation: true,
    governance: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [hasSigned, setHasSigned] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);

  // thresholdAmount is stored in pence — convert to pounds for display
  const threshold = mandate.thresholdAmount ? mandate.thresholdAmount / 100 : 5000;

  // ─── derived data ───
  const allPersons = useMemo(() => {
    const primary: (TeamMember & { isPrimary: boolean })[] = [{
      id: '__primary__',
      name: applicantName,
      email: '',
      role: 'director',
      permissions: { viewAccount: true, initiatePayments: true, approvePayments: true, manageBeneficiaries: true, manageTeam: true, cardAccess: true },
      status: 'verified',
      isFromCompaniesHouse: true,
      isPrimary: true,
    }];
    return [...primary, ...mandate.teamMembers.filter(m => m.status !== 'not_invited').map(m => ({ ...m, isPrimary: false }))];
  }, [mandate.teamMembers, applicantName]);

  const directors = allPersons.filter(p => p.role === 'director');
  const nonDirectors = allPersons.filter(p => p.role !== 'director');
  const verifiedDirectors = directors.filter(d => d.status === 'verified');
  const pendingPersons = allPersons.filter(p => p.status !== 'verified');
  const allDirectorsVerified = directors.every(d => d.status === 'verified');

  const getRoleLabel = (role: TeamMember['role']) => {
    switch (role) {
      case 'director': return 'Director';
      case 'finance_manager': return 'Finance Manager';
      case 'accountant': return 'Accountant';
      case 'employee': return 'Employee';
      case 'custom': return 'Custom Role';
    }
  };

  // ─── rule status ───
  const ruleIsActive = allDirectorsVerified && mandate.confirmed;
  const ruleStatusLabel = ruleIsActive ? 'Active' : 'Pending activation';
  const ruleStatusColor = ruleIsActive ? 'var(--emerald-600)' : 'var(--amber-600)';
  const ruleStatusBg = ruleIsActive ? 'var(--emerald-50)' : 'var(--amber-50)';

  // ─── payment simulator ───
  const getSimulationResult = () => {
    const amount = parseInt(simAmount.replace(/[^0-9]/g, ''), 10);
    if (!amount || isNaN(amount)) return null;

    const isDirectorInitiator = simInitiator === 'director';

    if (mandate.approvalRule === 'any_one') {
      return {
        approversNeeded: isDirectorInitiator ? 0 : 1,
        description: isDirectorInitiator
          ? 'Payment auto-approved (initiator is an authorised director)'
          : 'Requires approval from any 1 director',
        approvers: isDirectorInitiator ? [] : [directors[0]?.name || 'Any Director'],
      };
    }
    if (mandate.approvalRule === 'two_required') {
      return {
        approversNeeded: isDirectorInitiator ? 1 : 2,
        description: isDirectorInitiator
          ? 'Requires 1 additional director (initiator counts as first)'
          : 'Requires approval from 2 directors',
        approvers: isDirectorInitiator
          ? directors.filter(d => d.name !== applicantName).slice(0, 1).map(d => d.name)
          : directors.slice(0, 2).map(d => d.name),
      };
    }
    if (mandate.approvalRule === 'threshold') {
      if (amount < threshold) {
        return {
          approversNeeded: isDirectorInitiator ? 0 : 1,
          description: isDirectorInitiator
            ? `Below ${formatCurrency(threshold)} — auto-approved (director initiated)`
            : `Below ${formatCurrency(threshold)} — requires 1 director`,
          approvers: isDirectorInitiator ? [] : [directors[0]?.name || 'Any Director'],
        };
      } else {
        return {
          approversNeeded: isDirectorInitiator ? 1 : 2,
          description: isDirectorInitiator
            ? `Above ${formatCurrency(threshold)} — requires 1 additional director`
            : `Above ${formatCurrency(threshold)} — requires 2 directors`,
          approvers: isDirectorInitiator
            ? directors.filter(d => d.name !== applicantName).slice(0, 1).map(d => d.name)
            : directors.slice(0, 2).map(d => d.name),
        };
      }
    }
    return null;
  };

  const simResult = getSimulationResult();
  const canConfirm = context === 'flow'
    ? declared && !mandate.locked
    : declared && hasSigned && !mandate.locked;

  /* ─────────────────────────────────────────────────
   * SECTION 1: Payment Approval Rules
   * ───────────────────────────────────────────────── */
  const renderRulesSection = () => {
    const rows: { range: string; approval: string }[] = [];
    if (mandate.approvalRule === 'any_one') {
      rows.push({ range: 'All amounts', approval: '1 Director' });
    } else if (mandate.approvalRule === 'two_required') {
      rows.push({ range: 'All amounts', approval: '2 Directors' });
    } else if (mandate.approvalRule === 'threshold') {
      rows.push({ range: `£0 – ${formatCurrency(threshold)}`, approval: '1 Director' });
      rows.push({ range: `Above ${formatCurrency(threshold)}`, approval: '2 Directors' });
    }

    return (
      <div>
        <SectionLabel>Payment approval rules</SectionLabel>
        <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] overflow-hidden">
          {/* Rule header */}
          <div className="px-[var(--space-lg)] pt-[var(--space-lg)] pb-[var(--space-md)] flex items-center justify-between">
            <div className="flex items-center gap-[var(--space-sm)]">
              <Shield size={16} className="text-[var(--accent-primary)]" />
              <span className="text-[var(--text-primary)]" style={{ fontSize: '15px', fontWeight: 600 }}>Standard payments</span>
            </div>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)]"
              style={{ fontSize: '11px', fontWeight: 600, backgroundColor: ruleStatusBg, color: ruleStatusColor }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ruleStatusColor }} />
              {ruleStatusLabel}
            </span>
          </div>

          {/* Threshold table */}
          <div className="mx-[var(--space-lg)] mb-[var(--space-md)]">
            <div className="rounded-[var(--radius-sm)] border border-[var(--divider)] overflow-hidden">
              {/* Table header */}
              <div className="flex bg-[var(--background-surface-soft)]">
                <div className="flex-1 px-3 py-2">
                  <span className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Payment amount</span>
                </div>
                <div className="flex-1 px-3 py-2">
                  <span className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Required approval</span>
                </div>
              </div>
              {rows.map((row, i) => (
                <div key={i} className={`flex ${i > 0 ? 'border-t border-[var(--divider)]' : ''}`}>
                  <div className="flex-1 px-3 py-2.5">
                    <span className="text-[var(--text-primary)]" style={{ fontSize: '14px', fontWeight: 500 }}>{row.range}</span>
                  </div>
                  <div className="flex-1 px-3 py-2.5">
                    <span className="text-[var(--text-primary)]" style={{ fontSize: '14px', fontWeight: 500 }}>{row.approval}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applies to */}
          <div className="px-[var(--space-lg)] pb-[var(--space-md)]">
            <span className="text-[var(--text-muted)]" style={{ fontSize: '12px', fontWeight: 500 }}>Applies to: </span>
            {['Single payments', 'Bulk payments', 'Scheduled payments'].map((tag) => (
              <span key={tag} className="inline-flex items-center mr-1.5 mb-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--blue-50)] text-[var(--accent-primary)]" style={{ fontSize: '11px', fontWeight: 500 }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Threshold clarification */}
          {mandate.approvalRule === 'threshold' && (
            <div className="px-[var(--space-lg)] pb-[var(--space-md)]">
              <p className="text-[var(--text-muted)]" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
                We apply the threshold per transaction. The initiating director counts toward the required approver count.
              </p>
            </div>
          )}

          {/* Edit + Simulate */}
          <div className="flex items-center gap-[var(--space-lg)] px-[var(--space-lg)] pb-[var(--space-md)] border-t border-[var(--divider)] pt-[var(--space-xs)]">
            {!mandate.locked && (
              <button
                onClick={onEditRule}
                className="flex items-center gap-1 text-[var(--accent-primary)] hover:opacity-80 transition-opacity min-h-[44px] py-2"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                Edit rule
                <ChevronRight size={14} />
              </button>
            )}
            {mandate.locked && (
              <span className="flex items-center gap-1 text-[var(--text-muted)] min-h-[44px]" style={{ fontSize: '12px', fontWeight: 500 }}>
                <Lock size={12} />
                Locked
              </span>
            )}
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors min-h-[44px] py-2"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              <Play size={12} />
              {showSimulator ? 'Hide simulator' : 'Simulate a payment'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────
   * SECTION 1b: Payment Simulator
   * ───────────────────────────────────────────────── */
  const renderSimulator = () => {
    if (!showSimulator) return null;
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--accent-primary)]/20 shadow-[var(--shadow-card-sm)] p-[var(--space-lg)] space-y-[var(--space-md)]">
            <div className="flex items-center gap-[var(--space-sm)]">
              <Zap size={14} className="text-[var(--accent-primary)]" />
              <span className="text-[var(--text-primary)]" style={{ fontSize: '14px', fontWeight: 600 }}>Payment simulator</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-[var(--space-md)]">
              {/* Amount */}
              <div className="flex-1 space-y-[var(--space-xs)]">
                <label className="text-[var(--text-muted)] ml-0.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" style={{ fontSize: '14px', fontWeight: 500 }}>£</span>
                  <input
                    type="text"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value.replace(/[^0-9,]/g, ''))}
                    placeholder="7,000"
                    className="w-full h-10 pl-7 pr-3 rounded-[var(--radius-sm)] bg-[var(--background-surface-soft)] border border-[var(--divider)] focus:border-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)]"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Initiator type */}
              <div className="flex-1 space-y-[var(--space-xs)]">
                <label className="text-[var(--text-muted)] ml-0.5">Initiated by</label>
                <select
                  value={simInitiator}
                  onChange={(e) => setSimInitiator(e.target.value)}
                  className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--background-surface-soft)] border border-[var(--divider)] focus:border-[var(--accent-primary)] outline-none text-[var(--text-primary)] appearance-none"
                  style={{ fontSize: '14px', fontWeight: 400 }}
                >
                  <option value="non-director">Non-director</option>
                  <option value="director">Director</option>
                </select>
              </div>
            </div>

            {/* Simulation result */}
            {simResult && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[var(--radius-sm)] bg-[var(--blue-50)] border border-[var(--accent-primary)]/15 p-3"
              >
                <p className="text-[var(--accent-primary)]" style={{ fontSize: '13px', fontWeight: 600 }}>
                  {simResult.description}
                </p>
                {simResult.approvers.length > 0 && (
                  <p className="text-[var(--text-secondary)] mt-1" style={{ fontSize: '12px', fontWeight: 400 }}>
                    Approval from: {simResult.approvers.join(' + ')}
                  </p>
                )}
              </motion.div>
            )}

            {/* Disclaimer */}
            <p className="text-[var(--text-muted)] text-center" style={{ fontSize: '11px', fontWeight: 400, fontStyle: 'italic' }}>
              This is a simulation and does not represent a real payment.
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  /* ─────────────────────────────────────────────────
   * SECTION 2: Approval Flow Visualization
   * ───────────────────────────────────────────────── */
  const renderApprovalFlow = () => {
    // Build flow steps based on rule
    const isThreshold = mandate.approvalRule === 'threshold';
    const isTwoRequired = mandate.approvalRule === 'two_required';
    const isOpen = expandedSections.approvalFlow;

    return (
      <div>
        <button
          type="button"
          onClick={() => toggleSection('approvalFlow')}
          className="w-full flex items-center justify-between mb-[var(--space-sm)] ml-0.5 min-h-[44px]"
        >
          <SectionLabel>Approval flow</SectionLabel>
          <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
        {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
        <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] p-[var(--space-lg)]">
          {isThreshold && (
            <div className="flex flex-col sm:flex-row gap-[var(--space-md)]">
              {/* Low value flow */}
              <div className="flex-1">
                <span className="text-[var(--text-muted)] mb-[var(--space-md)] block" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Below {formatCurrency(threshold)}
                </span>
                <FlowPipeline steps={[
                  { label: 'Initiator', sublabel: 'Any team member', icon: 'initiate' },
                  { label: '1 Director', sublabel: 'Approves', icon: 'approve' },
                  { label: 'Executed', sublabel: 'Payment sent', icon: 'done' },
                ]} />
              </div>
              {/* Divider — horizontal on mobile, vertical on desktop */}
              <div className="h-px sm:h-auto sm:w-px bg-[var(--divider)]" />
              {/* High value flow */}
              <div className="flex-1">
                <span className="text-[var(--text-muted)] mb-[var(--space-md)] block" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Above {formatCurrency(threshold)}
                </span>
                <FlowPipeline steps={[
                  { label: 'Initiator', sublabel: 'Any team member', icon: 'initiate' },
                  { label: 'Director 1', sublabel: 'Approves', icon: 'approve' },
                  { label: 'Director 2', sublabel: 'Co-approves', icon: 'approve' },
                  { label: 'Executed', sublabel: 'Payment sent', icon: 'done' },
                ]} />
              </div>
            </div>
          )}

          {!isThreshold && (
            <FlowPipeline steps={[
              { label: 'Initiator', sublabel: 'Any team member', icon: 'initiate' },
              ...(isTwoRequired ? [
                { label: 'Director 1', sublabel: 'Approves', icon: 'approve' as const },
                { label: 'Director 2', sublabel: 'Co-approves', icon: 'approve' as const },
              ] : [
                { label: '1 Director', sublabel: 'Approves', icon: 'approve' as const },
              ]),
              { label: 'Executed', sublabel: 'Payment sent', icon: 'done' as const },
            ]} />
          )}

          {/* Footnote about initiator */}
          <p className="text-[var(--text-muted)] mt-[var(--space-md)] pt-[var(--space-md)] border-t border-[var(--divider)]" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
            If the initiator is a director, they count as the first approver. Approval is sequential — each approver is notified in turn.
          </p>
        </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────
   * SECTION 3: Team & Permissions Matrix
   * ───────────────────────────────────────────────── */
  const renderPermissionsMatrix = () => {
    const permCols: { key: keyof TeamMember['permissions']; label: string; icon: React.ReactNode }[] = [
      { key: 'viewAccount', label: 'View', icon: <Eye size={12} /> },
      ...(context !== 'flow' ? [
        { key: 'initiatePayments' as const, label: 'Initiate', icon: <CreditCard size={12} /> },
        { key: 'approvePayments' as const, label: 'Approve', icon: <UserCheck size={12} /> },
      ] : []),
      { key: 'manageTeam', label: 'Manage', icon: <Users size={12} /> },
    ];
    const isOpen = expandedSections.permissions;

    return (
      <div>
        <button
          type="button"
          onClick={() => toggleSection('permissions')}
          className="w-full flex items-center justify-between mb-[var(--space-sm)] ml-0.5 min-h-[44px]"
        >
          <SectionLabel>{context === 'flow' ? 'Team and account access' : 'Team and permissions'}</SectionLabel>
          <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
        {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
        <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] overflow-hidden">
          {/* Person cards - mobile-friendly stacked layout */}
          {allPersons.map((person, idx) => {
            const isClickable = person.id !== '__primary__';
            const Row = isClickable ? 'button' : 'div';
            return (
              <Row
                key={person.id}
                {...(isClickable ? { onClick: () => onEditMember(person.id) } : {})}
                className={`
                  w-full text-left transition-colors
                  ${idx > 0 ? 'border-t border-[var(--divider)]' : ''}
                  ${isClickable ? 'hover:bg-[var(--background-surface-soft)] cursor-pointer' : ''}
                `}
              >
                <div className="px-[var(--space-lg)] py-3">
                  {/* Person info row */}
                  <div className="flex items-center gap-[var(--space-sm)] mb-2">
                    <Avatar name={person.name} index={idx} size={28} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[var(--text-primary)] truncate" style={{ fontSize: '14px', fontWeight: 500 }}>
                        {person.name}
                        {'isPrimary' in person && person.isPrimary && (
                          <span className="text-[var(--text-muted)] ml-1" style={{ fontSize: '11px', fontWeight: 400 }}>(you)</span>
                        )}
                      </p>
                      <p className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 400 }}>
                        {getRoleLabel(person.role)}
                        {context !== 'flow' && person.initiationLimit ? ` · Init ${formatCurrency(person.initiationLimit)}` : ''}
                        {context !== 'flow' && person.approvalLimit ? ` · Appr ${formatCurrency(person.approvalLimit)}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={person.status === 'verified' ? 'verified' : 'pending'} />
                  </div>
                  {/* Permissions row */}
                  <div className="flex items-center gap-1.5 ml-9">
                    {permCols.map(col => (
                      <span
                        key={col.key}
                        className={`
                          inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)]
                          ${person.permissions[col.key]
                            ? 'bg-[var(--emerald-50)] text-[var(--emerald-600)]'
                            : 'bg-[var(--background-surface-soft)] text-[var(--text-muted)]'}
                        `}
                        style={{ fontSize: '11px', fontWeight: 500 }}
                      >
                        {person.permissions[col.key] ? col.icon : null}
                        {col.label}
                      </span>
                    ))}
                  </div>
                </div>
              </Row>
            );
          })}
        </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────
   * SECTION 4: Mandate Activation Checklist
   * ───────────────────────────────────────────────── */
  const renderActivationChecklist = () => {
    const conditions = [
      {
        label: 'Primary signatory verified',
        done: true,
        detail: applicantName,
      },
      {
        label: directors.length > 1 ? 'All directors verified' : 'Second director verified',
        done: allDirectorsVerified,
        detail: allDirectorsVerified
          ? 'All directors have completed verification'
          : `${directors.filter(d => d.status !== 'verified').map(d => d.name).join(', ')} — verification in progress`,
      },
      {
        label: mandate.teamMembers.every(m => m.role !== 'director' || m.hasAcceptedMandate)
          ? 'All directors accepted mandate terms'
          : 'Directors will be asked to review mandate terms',
        done: mandate.teamMembers.every(m => m.role !== 'director' || m.hasAcceptedMandate),
        detail: mandate.teamMembers.every(m => m.role !== 'director' || m.hasAcceptedMandate)
          ? 'All directors have accepted digitally'
          : 'Each director will review and accept the mandate when they first sign in',
      },
    ];

    const allComplete = conditions.every(c => c.done);
    const isOpen = expandedSections.activation;

    return (
      <div>
        <button
          type="button"
          onClick={() => toggleSection('activation')}
          className="w-full flex items-center justify-between mb-[var(--space-sm)] ml-0.5 min-h-[44px]"
        >
          <SectionLabel>Mandate activation</SectionLabel>
          <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
        {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
        <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] overflow-hidden">
          {conditions.map((cond, idx) => (
            <div key={idx} className={`flex items-start gap-[var(--space-md)] px-[var(--space-lg)] py-3 ${idx > 0 ? 'border-t border-[var(--divider)]' : ''}`}>
              <div className="mt-0.5 shrink-0">
                {cond.done ? (
                  <div className="w-5 h-5 rounded-full bg-[var(--emerald-600)] flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--amber-500)] flex items-center justify-center">
                    <Clock size={10} className="text-[var(--amber-500)]" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cond.done ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'} style={{ fontSize: '14px', fontWeight: 500 }}>
                  {cond.label}
                </p>
                <p className="text-[var(--text-muted)]" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
                  {cond.detail}
                </p>
              </div>
            </div>
          ))}

          {/* Status footer */}
          <div className={`px-[var(--space-lg)] py-[var(--space-md)] border-t border-[var(--divider)] ${allComplete ? 'bg-[var(--emerald-50)]' : 'bg-[var(--amber-50)]'}`}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: allComplete ? 'var(--emerald-600)' : 'var(--amber-600)' }}>
              {allComplete
                ? 'All conditions met — your rule will activate when you confirm.'
                : "Your approval rule won't fully apply until all directors are verified and have accepted."}
            </p>
          </div>
        </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────
   * SECTION 5: Pending Persons (with operational impact)
   * ───────────────────────────────────────────────── */
  const renderPendingSection = () => {
    if (pendingPersons.length === 0) return null;

    const pendingDirectors = pendingPersons.filter(p => p.role === 'director');
    const hasBlockingDirectors = pendingDirectors.length > 0;

    return (
      <div className="bg-[var(--amber-50)] border border-[var(--amber-500)]/20 rounded-[var(--radius-lg)] overflow-hidden">
        <div className="p-[var(--space-lg)]">
          <div className="flex items-start gap-[var(--space-sm)]">
            <AlertTriangle size={16} className="text-[var(--amber-600)] mt-0.5 shrink-0" />
            <div>
              <p className="text-[var(--amber-600)]" style={{ fontSize: '14px', fontWeight: 600 }}>
                {hasBlockingDirectors ? 'Approval protection not fully active' : `${pendingPersons.length} person${pendingPersons.length !== 1 ? 's' : ''} awaiting verification`}
              </p>
              {hasBlockingDirectors && mandate.approvalRule === 'threshold' && (
                <p className="text-[var(--text-secondary)] mt-1" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
                  Until {pendingDirectors.map(d => d.name).join(' and ')} verify, payments above {formatCurrency(threshold)} cannot require dual approval.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Per-person details */}
        <div className="border-t border-[var(--amber-500)]/10">
          {pendingPersons.map((m, idx) => (
            <div key={m.id} className={`flex items-center justify-between px-[var(--space-lg)] py-[var(--space-md)] ${idx > 0 ? 'border-t border-[var(--amber-500)]/10' : ''}`}>
              <div className="flex items-center gap-[var(--space-sm)] min-w-0">
                <Avatar name={m.name} index={allPersons.indexOf(m)} size={24} />
                <div className="min-w-0">
                  <p className="text-[var(--text-primary)] truncate" style={{ fontSize: '13px', fontWeight: 500 }}>{m.name}</p>
                  <p className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 400 }}>
                    {getRoleLabel(m.role)} · Invited {m.invitedDate || 'today'}
                    {m.screeningStatus === 'in_progress' && ' · Screening in progress'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { onResendInvite(m.id); toast.success('Invite resent'); }}
                className="flex items-center gap-1 text-[var(--accent-primary)] hover:opacity-80 shrink-0 ml-[var(--space-sm)]"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                <RotateCcw size={11} />
                Resend
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────
   * SECTION 6: Governance Summary
   * ───────────────────────────────────────────────── */
  const renderGovernanceSummary = () => {
    const bullets: { icon: React.ReactNode; text: string; color: string }[] = [];

    if (mandate.approvalRule === 'threshold' || mandate.approvalRule === 'two_required') {
      bullets.push({
        icon: <Lock size={13} />,
        text: 'Your account requires dual approval for high-value payments.',
        color: 'var(--accent-primary)',
      });
    }

    if (nonDirectors.length > 0 && nonDirectors.every(nd => !nd.permissions.approvePayments)) {
      bullets.push({
        icon: <Shield size={13} />,
        text: 'Non-directors cannot release funds without director approval.',
        color: 'var(--emerald-600)',
      });
    }

    if (!allDirectorsVerified) {
      bullets.push({
        icon: <AlertTriangle size={13} />,
        text: "Your approval protection won't be active until all directors have verified and accepted.",
        color: 'var(--amber-600)',
      });
    }

    if (bullets.length === 0) return null;

    return (
      <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] p-[var(--space-lg)] space-y-[var(--space-sm)]">
        {bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-[var(--space-sm)]">
            <span className="mt-0.5 shrink-0" style={{ color: b.color }}>{b.icon}</span>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>{b.text}</p>
          </div>
        ))}
      </div>
    );
  };

  /* ─────────────────────────────────────────────────
   * SECTION 7: Declaration
   * ───────────────────────────────────────────────── */
  const isSoleDirectorMandate = mandate.authorityType === 'sole_director';

  const renderDeclaration = () => (
    <div className="space-y-3">
      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-[var(--radius-md)] bg-[var(--background-surface)] border border-[var(--divider)]">
        <div className="mt-0.5 relative">
          <input
            type="checkbox"
            checked={declared}
            onChange={() => setDeclared(!declared)}
            className="peer sr-only"
          />
          <div className={`
            w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all shrink-0
            peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-primary)] peer-focus-visible:ring-offset-2
            ${declared
              ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
              : 'bg-white border-[var(--text-muted)]'}
          `}>
            {declared && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
        </div>
        <span className="text-[var(--text-secondary)]" style={{ fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
          {isSoleDirectorMandate
            ? "I confirm I'm authorised to manage this account on behalf of the business."
            : "I confirm I'm authorised to set up account access. All additional signatories will be asked to review and accept the mandate terms."}
        </span>
      </label>
      {!isSoleDirectorMandate && (
        <p className="text-[var(--text-muted)] px-1" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
          Other signatories will review the mandate when they first sign in.
        </p>
      )}
    </div>
  );

  /* ─── confirm button ─── */
  const handleConfirmClick = () => {
    if (canConfirm) {
      onConfirm();
      return;
    }
    // Show reason why the button is disabled
    if (context !== 'flow') {
      if (!declared && !hasSigned) {
        toast.error('Tick the declaration and add your signature to continue.');
      } else if (!declared) {
        toast.error('Tick the declaration to continue.');
      } else if (!hasSigned) {
        toast.error('Add your signature to continue.');
      }
    } else {
      if (!declared) {
        toast.error('Tick the declaration to continue.');
      }
    }
  };

  const confirmButton = mandate.locked ? (
    <div className="flex items-center justify-center gap-2 w-full h-[48px] rounded-[var(--radius-pill)] bg-[var(--emerald-50)] border border-[var(--emerald-600)]/20">
      <Check size={18} className="text-[var(--emerald-600)]" strokeWidth={3} />
      <span className="text-[var(--emerald-600)]" style={{ fontSize: '15px', fontWeight: 600 }}>
        Mandate confirmed
        {mandate.confirmedAt && (
          <span className="font-normal ml-1" style={{ fontSize: '12px' }}>
            · {new Date(mandate.confirmedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </span>
    </div>
  ) : (
    <button
      type="button"
      onClick={handleConfirmClick}
      className={`
        w-full h-[48px] rounded-[var(--radius-pill)] transition-all flex items-center justify-center
        ${canConfirm
          ? 'bg-[var(--brand-primary-navy)] text-[var(--text-on-dark)] hover:opacity-90 shadow-[var(--shadow-card-lg)]'
          : 'bg-[var(--divider)] text-[var(--text-muted)]'}
      `}
      aria-disabled={!canConfirm}
    >
      Confirm mandate
    </button>
  );

  /* ─────────────────────────────────────────────────
   * ASSEMBLED CONTENT
   * ───────────────────────────────────────────────── */
  const summaryContent = (isFlowContext: boolean) => (
    <div className="space-y-[var(--space-xl)]">
      {/* Payment rules, simulator, approval flow — only shown in dashboard context */}
      {!isFlowContext && renderRulesSection()}
      {!isFlowContext && renderSimulator()}
      {!isFlowContext && renderApprovalFlow()}
      {renderPermissionsMatrix()}
      {renderActivationChecklist()}
      {renderPendingSection()}
      {!isFlowContext && renderGovernanceSummary()}
      {renderDeclaration()}
      {!isFlowContext && (
        <SignaturePad applicantName={applicantName} onSignatureChange={setHasSigned} />
      )}
    </div>
  );

  /* ─── FLOW MODE ─── */
  if (context === 'flow') {
    return (
      <div className="space-y-[var(--space-xl)]" style={{ fontFamily: 'var(--font-family)' }}>
        <div className="space-y-2">
          <h2 className="text-[var(--text-primary)]">Review account access</h2>
          <p className="text-[var(--text-secondary)]">Check who has access to this account, their permissions, and confirm the mandate.</p>
          {mandate.mandateVersion && (
            <p className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em' }}>
              Mandate ref: {mandate.mandateVersion}
            </p>
          )}
        </div>

        {summaryContent(true)}

        <StickyFooter>
          {confirmButton}
        </StickyFooter>
      </div>
    );
  }

  /* ─── DASHBOARD MODE ─── */
  return (
    <div className="min-h-screen bg-[var(--background-app)] flex flex-col" style={{ fontFamily: 'var(--font-family)' }}>
      <div className="sticky top-0 z-30 flex items-center gap-[var(--space-md)] p-[var(--space-lg)] border-b border-[var(--divider)] bg-[var(--background-surface)]">
        <button type="button" onClick={onBack} className="w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--background-surface-soft)] rounded-full transition-colors" aria-label="Go back">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h3 className="text-[var(--text-primary)]">Account summary</h3>
          {mandate.mandateVersion && (
            <p className="text-[var(--text-muted)]" style={{ fontSize: '10px', fontWeight: 500 }}>
              {mandate.mandateVersion}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 p-[var(--space-xl)]">
        {summaryContent(false)}
      </div>

      <div className="sticky bottom-0 z-20 bg-[var(--background-app)] border-t border-[var(--divider)] p-[var(--space-xl)] pb-[var(--space-xxl)]">
        {confirmButton}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
 * FlowPipeline — vertical approval flow visualisation
 * ───────────────────────────────────────────────── */
function FlowPipeline({ steps }: { steps: { label: string; sublabel: string; icon: 'initiate' | 'approve' | 'done' }[] }) {
  const getStepStyle = (icon: string) => {
    switch (icon) {
      case 'initiate': return { bg: 'var(--blue-50)', color: 'var(--accent-primary)' };
      case 'approve': return { bg: 'var(--emerald-50)', color: 'var(--emerald-600)' };
      case 'done': return { bg: 'var(--emerald-600)', color: 'white' };
      default: return { bg: 'var(--gray-100)', color: 'var(--text-muted)' };
    }
  };

  return (
    <div className="flex flex-col items-start">
      {steps.map((step, idx) => {
        const style = getStepStyle(step.icon);
        return (
          <div key={idx} className="flex items-start gap-[var(--space-md)]">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: style.bg, color: style.color }}
              >
                {step.icon === 'initiate' && <CreditCard size={13} />}
                {step.icon === 'approve' && <UserCheck size={13} />}
                {step.icon === 'done' && <Check size={13} strokeWidth={3} />}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-px h-5" style={{ backgroundColor: 'var(--divider)' }}>
                  <div className="w-px h-full mx-auto" style={{ backgroundColor: 'var(--blue-300)', opacity: 0.4 }} />
                </div>
              )}
            </div>
            <div className="pb-1">
              <p className="text-[var(--text-primary)]" style={{ fontSize: '13px', fontWeight: 500, lineHeight: '16px' }}>{step.label}</p>
              <p className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 400 }}>{step.sublabel}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────
 * MandateSuccessScreen (unchanged)
 * ───────────────────────────────────────────────── */
export function MandateSuccessScreen({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  return (
    <div className="fixed inset-0 bg-[var(--background-app)] z-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-[var(--emerald-50)] flex items-center justify-center mb-6"
      >
        <Check size={40} className="text-[var(--emerald-600)]" strokeWidth={3} />
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[var(--text-primary)] mb-3"
      >
        Your mandate is active
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[var(--text-secondary)] max-w-xs mb-10"
      >
        Payments will follow your approval rules. You can manage your team anytime in Settings.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={onGoToDashboard}
          className="w-full h-[48px] rounded-[var(--radius-pill)] bg-[var(--brand-primary-navy)] text-white hover:opacity-90 transition-all shadow-[var(--shadow-card-lg)]"
        >
          Go to dashboard
        </button>
      </motion.div>
    </div>
  );
}