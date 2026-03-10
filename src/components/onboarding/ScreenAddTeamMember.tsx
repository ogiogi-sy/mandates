import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronDown, Info, ShieldAlert, Check, AlertCircle, Lock } from 'lucide-react';
import { TeamMember } from './types';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

import { StickyFooter } from './StickyFooter';

interface ScreenAddTeamMemberProps {
  prefillName?: string;
  prefillEmail?: string;
  prefillRole?: TeamMember['role'];
  isCompaniesHouseDirector?: boolean;
  context?: 'flow' | 'dashboard';
  /** Existing team member emails — used for duplicate detection */
  existingEmails?: string[];
  /** Account-level threshold (pence) — for governance warnings on limits */
  mandateThresholdPence?: number | null;
  /** Current verification status of the member being edited (undefined = new member) */
  memberStatus?: TeamMember['status'];
  onSendInvite: (member: Omit<TeamMember, 'id' | 'status' | 'invitedDate' | 'isFromCompaniesHouse'>) => void;
  onBack: () => void;
}

const ROLES: { value: TeamMember['role']; label: string }[] = [
  { value: 'director', label: 'Director' },
  { value: 'finance_manager', label: 'Finance Manager' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'employee', label: 'Employee' },
  { value: 'custom', label: 'Custom' },
];

const DEFAULT_PERMISSIONS: Record<TeamMember['role'], TeamMember['permissions']> = {
  director: {
    viewAccount: true,
    initiatePayments: true,
    approvePayments: true,
    manageBeneficiaries: true,
    manageTeam: true,
    cardAccess: true,
  },
  finance_manager: {
    viewAccount: true,
    initiatePayments: true,
    approvePayments: false,
    manageBeneficiaries: true,
    manageTeam: false,
    cardAccess: false,
  },
  accountant: {
    viewAccount: true,
    initiatePayments: true,
    approvePayments: false,
    manageBeneficiaries: false,
    manageTeam: false,
    cardAccess: false,
  },
  employee: {
    viewAccount: true,
    initiatePayments: false,
    approvePayments: false,
    manageBeneficiaries: false,
    manageTeam: false,
    cardAccess: false,
  },
  custom: {
    viewAccount: true,
    initiatePayments: false,
    approvePayments: false,
    manageBeneficiaries: false,
    manageTeam: false,
    cardAccess: false,
  },
};

const PERMISSION_LABELS: { key: keyof TeamMember['permissions']; label: string; description: string }[] = [
  { key: 'viewAccount', label: 'View account', description: 'See balances and transactions' },
  { key: 'initiatePayments', label: 'Initiate payments', description: 'Create and submit payments' },
  { key: 'approvePayments', label: 'Approve payments', description: 'Approve payments within your signing rules' },
  { key: 'manageBeneficiaries', label: 'Manage beneficiaries', description: 'Add and edit payees' },
  { key: 'manageTeam', label: 'Manage team', description: 'Invite or remove people' },
  { key: 'cardAccess', label: 'Card access', description: 'Issue a debit card for this person' },
];

/** Payment limit presets */
const LIMIT_PRESETS = [1000, 5000, 10000, 25000, 50000, 100000];
const LIMIT_MIN = 1;
const LIMIT_MAX = 10_000_000;

export function ScreenAddTeamMember({
  prefillName = '',
  prefillEmail = '',
  prefillRole = 'director',
  isCompaniesHouseDirector = false,
  context = 'dashboard',
  existingEmails = [],
  mandateThresholdPence = null,
  memberStatus,
  onSendInvite,
  onBack,
}: ScreenAddTeamMemberProps) {
  const [name, setName] = useState(prefillName);
  const [email, setEmail] = useState(prefillEmail);
  const [role, setRole] = useState<TeamMember['role']>(prefillRole);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [permissions, setPermissions] = useState<TeamMember['permissions']>(DEFAULT_PERMISSIONS[prefillRole]);
  const [hasManualOverride, setHasManualOverride] = useState(false);
  const [showLimitSection, setShowLimitSection] = useState(false);
  const [initiationLimit, setInitiationLimit] = useState('');
  const [approvalLimit, setApprovalLimit] = useState('');
  const [initiationLimitMode, setInitiationLimitMode] = useState<'preset' | 'custom' | 'unlimited'>('preset');
  const [approvalLimitMode, setApprovalLimitMode] = useState<'preset' | 'custom' | 'unlimited'>('preset');
  const [initiationPreset, setInitiationPreset] = useState<number | null>(null);
  const [approvalPreset, setApprovalPreset] = useState<number | null>(null);
  const [showApproveNote, setShowApproveNote] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasManualOverride) {
      setPermissions(DEFAULT_PERMISSIONS[role]);
    }
  }, [role, hasManualOverride]);

  const isDirector = role === 'director';

  const isUnverifiedMember = memberStatus !== undefined && memberStatus !== 'verified';

  const togglePermission = (key: keyof TeamMember['permissions']) => {
    // Manage Team restricted to directors only
    if (key === 'manageTeam' && !isDirector) {
      toast.error('Only directors can manage the team');
      return;
    }
    // Approve Payments requires identity verification
    if (key === 'approvePayments' && isUnverifiedMember) {
      toast.error('This person needs to verify their identity before they can approve payments');
      return;
    }
    setHasManualOverride(true);
    const newVal = !permissions[key];
    setPermissions(prev => ({ ...prev, [key]: newVal }));
    if (key === 'approvePayments' && newVal) {
      setShowApproveNote(true);
      setTimeout(() => setShowApproveNote(false), 3000);
    }
  };

  const handleRoleSelect = (r: TeamMember['role']) => {
    setRole(r);
    setHasManualOverride(false);
    setShowRoleDropdown(false);
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) { setEmailError(null); return; }
    if (!value.includes('@')) { setEmailError('Enter a valid email address'); return; }
    if (existingEmails.map(e => e.toLowerCase()).includes(value.toLowerCase().trim())) {
      setEmailError('This email has already been invited');
      return;
    }
    setEmailError(null);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);

  const parseLimitValue = (raw: string): number | undefined => {
    const parsed = parseInt(raw.replace(/[^0-9]/g, ''), 10);
    return isNaN(parsed) ? undefined : parsed;
  };

  const validateLimit = (raw: string): string | null => {
    const value = parseLimitValue(raw);
    if (!value) return null;
    if (value < LIMIT_MIN) return `Minimum £${LIMIT_MIN}`;
    if (value > LIMIT_MAX) return `Maximum ${formatCurrency(LIMIT_MAX)}`;
    return null;
  };

  const getResolvedInitiationLimit = (): number | undefined => {
    if (initiationLimitMode === 'unlimited') return undefined;
    if (initiationLimitMode === 'preset' && initiationPreset) return initiationPreset;
    return parseLimitValue(initiationLimit);
  };

  const getResolvedApprovalLimit = (): number | undefined => {
    if (approvalLimitMode === 'unlimited') return undefined;
    if (approvalLimitMode === 'preset' && approvalPreset) return approvalPreset;
    return parseLimitValue(approvalLimit);
  };

  const canSend = name.trim().length > 0 && email.trim().length > 0 && email.includes('@') && !emailError;

  const handleSend = () => {
    if (!canSend) return;
    const resolvedInitiation = getResolvedInitiationLimit();
    const resolvedApproval = getResolvedApprovalLimit();

    // Governance threshold warning
    const thresholdGBP = mandateThresholdPence ? mandateThresholdPence / 100 : null;
    if (thresholdGBP && resolvedInitiation && resolvedInitiation > thresholdGBP) {
      setLimitError(`Payment initiation limit exceeds the account threshold of ${formatCurrency(thresholdGBP)}`);
    }

    onSendInvite({
      name: name.trim(),
      email: email.trim(),
      role,
      permissions: {
        ...permissions,
        // Enforce Manage Team restriction for non-directors
        manageTeam: isDirector ? permissions.manageTeam : false,
      },
      dailyLimit: resolvedInitiation,
      transactionLimit: resolvedApproval,
      initiationLimit: resolvedInitiation,
      approvalLimit: resolvedApproval,
    });
    toast.success(`Invite sent to ${email.trim()}`);
  };

  // Should show limits section?
  const showLimits = permissions.initiatePayments || permissions.approvePayments;

  const renderLimitField = (
    label: string,
    mode: 'preset' | 'custom' | 'unlimited',
    setMode: (m: 'preset' | 'custom' | 'unlimited') => void,
    preset: number | null,
    setPreset: (v: number | null) => void,
    customValue: string,
    setCustomValue: (v: string) => void,
  ) => (
    <div className="space-y-[var(--space-sm)]">
      <label className="text-[var(--text-muted)] ml-1">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {LIMIT_PRESETS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => { setMode('preset'); setPreset(amount); }}
            className={`px-3 py-1.5 rounded-[var(--radius-pill)] transition-all ${
              mode === 'preset' && preset === amount
                ? 'bg-[var(--accent-primary)] text-white'
                : 'bg-[var(--background-surface-soft)] text-[var(--text-secondary)] border border-[var(--divider)] hover:border-[var(--accent-primary)]'
            }`}
            style={{ fontSize: '12px', fontWeight: 600 }}
          >
            {formatCurrency(amount)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => { setMode('unlimited'); setPreset(null); }}
          className={`px-3 py-1.5 rounded-[var(--radius-pill)] transition-all ${
            mode === 'unlimited'
              ? 'bg-[var(--amber-500)] text-white'
              : 'bg-[var(--background-surface-soft)] text-[var(--text-secondary)] border border-[var(--divider)] hover:border-[var(--amber-500)]'
          }`}
          style={{ fontSize: '12px', fontWeight: 600 }}
        >
          Unlimited
        </button>
        <button
          type="button"
          onClick={() => { setMode('custom'); setPreset(null); }}
          className={`px-3 py-1.5 rounded-[var(--radius-pill)] transition-all ${
            mode === 'custom'
              ? 'bg-[var(--accent-primary)] text-white'
              : 'bg-[var(--background-surface-soft)] text-[var(--text-secondary)] border border-[var(--divider)] hover:border-[var(--accent-primary)]'
          }`}
          style={{ fontSize: '12px', fontWeight: 600 }}
        >
          Custom
        </button>
      </div>
      {mode === 'custom' && (
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" style={{ fontSize: '14px', fontWeight: 500 }}>£</span>
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value.replace(/[^0-9,]/g, ''))}
            placeholder={`Min £${LIMIT_MIN}, max ${formatCurrency(LIMIT_MAX)}`}
            className="w-full h-10 pl-7 pr-3 rounded-[var(--radius-md)] bg-[var(--background-surface-soft)] border border-transparent focus:bg-white focus:border-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)]"
            style={{ fontSize: '14px' }}
          />
          {validateLimit(customValue) && (
            <p className="flex items-center gap-1 mt-1 text-[var(--accent-danger)]" style={{ fontSize: '11px', fontWeight: 500 }}>
              <AlertCircle size={11} />
              {validateLimit(customValue)}
            </p>
          )}
        </div>
      )}
      {mode === 'unlimited' && !isDirector && (
        <div className="flex items-start gap-1.5 p-2 bg-[var(--amber-50)] border border-[var(--amber-500)]/20 rounded-[var(--radius-sm)]">
          <AlertCircle size={12} className="text-[var(--amber-600)] mt-0.5 shrink-0" />
          <span className="text-[var(--amber-600)]" style={{ fontSize: '11px', lineHeight: '14px', fontWeight: 500 }}>
            Unlimited access for non-directors needs director confirmation
          </span>
        </div>
      )}
    </div>
  );

  // Shared form content used by both flow and dashboard modes
  const formContent = (
    <>
      {/* Name + Email fields */}
      <div className="space-y-[var(--space-lg)]">
        <div className="space-y-[var(--space-xs)]">
          <label className="text-[var(--text-secondary)] ml-1">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-[var(--space-lg)] rounded-[var(--radius-md)] bg-[var(--background-surface)] border border-[var(--divider)] focus:border-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)]"
            placeholder="Enter full name"
            readOnly={isCompaniesHouseDirector}
          />
        </div>

        <div className="space-y-[var(--space-xs)]">
          <label className="text-[var(--text-secondary)] ml-1">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`w-full h-12 px-[var(--space-lg)] rounded-[var(--radius-md)] bg-[var(--background-surface)] border outline-none transition-all text-[var(--text-primary)] ${
              emailError ? 'border-[var(--accent-danger)]' : 'border-[var(--divider)] focus:border-[var(--accent-primary)]'
            }`}
            placeholder="name@example.com"
          />
          {emailError && (
            <p className="flex items-center gap-1 text-[var(--accent-danger)] ml-1" style={{ fontSize: '12px', fontWeight: 500 }}>
              <AlertCircle size={12} />
              {emailError}
            </p>
          )}
        </div>

        {/* Role selector */}
        <div className="space-y-[var(--space-xs)] relative">
          <label className="text-[var(--text-secondary)] ml-1">Role</label>
          <button
            type="button"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="w-full h-12 px-[var(--space-lg)] rounded-[var(--radius-md)] bg-[var(--background-surface)] border border-[var(--divider)] flex items-center justify-between text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all"
          >
            <span>{ROLES.find(r => r.value === role)?.label}</span>
            <ChevronDown size={18} className={`text-[var(--text-muted)] transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showRoleDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 z-10 mt-1 bg-[var(--background-surface)] border border-[var(--divider)] rounded-[var(--radius-md)] shadow-[var(--shadow-floating)] overflow-hidden"
              >
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => handleRoleSelect(r.value)}
                    className={`w-full px-[var(--space-lg)] py-[var(--space-md)] text-left hover:bg-[var(--background-surface-soft)] transition-colors
                      ${role === r.value ? 'bg-[var(--blue-50)] text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}
                    `}
                    style={{ fontSize: '16px', fontWeight: role === r.value ? 600 : 400 }}
                  >
                    {r.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Permissions section */}
      <div className="space-y-[var(--space-md)]">
        <label className="text-[var(--text-secondary)] ml-1">Permissions</label>
        {(() => {
          const visiblePermissions = context === 'flow'
            ? PERMISSION_LABELS.filter(p => !['initiatePayments', 'approvePayments'].includes(p.key))
            : PERMISSION_LABELS;
          return (
        <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] overflow-hidden">
          {visiblePermissions.map((perm, idx) => {
            const isManageTeamRestricted = perm.key === 'manageTeam' && !isDirector;
            const isApproveKycRestricted = perm.key === 'approvePayments' && isUnverifiedMember;
            const isToggleDisabled = isManageTeamRestricted || isApproveKycRestricted;
            return (
              <div key={perm.key}>
                <div className="flex items-center justify-between px-[var(--space-lg)] py-3.5">
                  <div className="flex-1 min-w-0 mr-[var(--space-md)]">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[var(--text-primary)]" style={{ fontSize: '16px', fontWeight: 500 }}>{perm.label}</p>
                      {(isManageTeamRestricted || isApproveKycRestricted) && <Lock size={12} className="text-[var(--text-muted)]" />}
                    </div>
                    <p className="text-[var(--text-muted)]" style={{ fontSize: '13px', lineHeight: '16px', fontWeight: 400 }}>
                      {perm.description}
                      {isManageTeamRestricted && (
                        <span className="text-[var(--amber-600)]"> · Directors only</span>
                      )}
                      {isApproveKycRestricted && (
                        <span className="text-[var(--amber-600)]"> · Requires identity verification</span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePermission(perm.key)}
                    disabled={isToggleDisabled}
                    className={`
                      w-11 h-6 rounded-full relative transition-colors shrink-0
                      ${isToggleDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                      ${permissions[perm.key] ? 'bg-[var(--accent-primary)]' : 'bg-[var(--divider)]'}
                    `}
                    aria-label={`Toggle ${perm.label}`}
                  >
                    <div className={`
                      w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all
                      ${permissions[perm.key] ? 'left-[22px]' : 'left-0.5'}
                    `} />
                  </button>
                </div>
                {idx < visiblePermissions.length - 1 && <div className="h-px bg-[var(--divider)] mx-[var(--space-lg)]" />}
              </div>
            );
          })}
        </div>
          );
        })()}

        {/* Ephemeral approve note — only in dashboard context */}
        {context !== 'flow' && (
        <AnimatePresence>
          {showApproveNote && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-[var(--space-sm)] p-[var(--space-md)] bg-[var(--amber-50)] border border-[var(--amber-500)]/20 rounded-[var(--radius-sm)]"
            >
              <Info size={14} className="text-[var(--amber-600)] mt-0.5 shrink-0" />
              <span className="text-[var(--amber-600)]" style={{ fontSize: '13px', lineHeight: '16px', fontWeight: 400 }}>
                They'll need to verify their identity
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        )}

        {/* Persistent KYC/AML notice when payment permissions are on — only in dashboard context */}
        {context !== 'flow' && (permissions.approvePayments || permissions.initiatePayments) && (
          <div className="flex items-start gap-[var(--space-sm)] p-[var(--space-md)] bg-[var(--blue-50)] border border-[var(--accent-primary)]/15 rounded-[var(--radius-sm)]">
            <ShieldAlert size={14} className="text-[var(--accent-primary)] mt-0.5 shrink-0" />
            <div>
              <span className="text-[var(--accent-primary)]" style={{ fontSize: '13px', lineHeight: '16px', fontWeight: 600 }}>
                KYC/AML screening required
              </span>
              <p className="text-[var(--text-secondary)] mt-0.5" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
                {permissions.approvePayments
                  ? "This person can approve payments, so they'll need to verify their identity, pass screening checks, and accept the mandate."
                  : "This person can start payments, so they'll need to verify their identity and pass screening checks."}
              </p>
            </div>
          </div>
        )}

        {/* Segregation of duties notice — only in dashboard context */}
        {context !== 'flow' && permissions.initiatePayments && !permissions.approvePayments && (
          <div className="flex items-start gap-[var(--space-sm)] p-[var(--space-md)] bg-[var(--emerald-50)] border border-[var(--emerald-600)]/15 rounded-[var(--radius-sm)]">
            <ShieldAlert size={14} className="text-[var(--emerald-600)] mt-0.5 shrink-0" />
            <div>
              <span className="text-[var(--emerald-600)]" style={{ fontSize: '13px', lineHeight: '16px', fontWeight: 600 }}>
                Payment roles separated
              </span>
              <p className="text-[var(--text-secondary)] mt-0.5" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
                This person can create payments but can't approve them. A different approver will need to sign off before we release the funds.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Payment limits — collapsible, only shown when initiate/approve perms are on, hidden in flow context */}
      {showLimits && context !== 'flow' && (
        <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowLimitSection(!showLimitSection)}
            className="w-full px-[var(--space-lg)] py-3.5 flex items-center justify-between hover:bg-[var(--background-surface-soft)] transition-colors"
          >
            <span className="text-[var(--text-secondary)]" style={{ fontSize: '16px', fontWeight: 500 }}>
              Set payment limits
            </span>
            <ChevronDown size={18} className={`text-[var(--text-muted)] transition-transform ${showLimitSection ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showLimitSection && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-[var(--space-lg)] pb-[var(--space-lg)] space-y-[var(--space-lg)]">
                  {permissions.initiatePayments && renderLimitField(
                    'Payment initiation limit',
                    initiationLimitMode, setInitiationLimitMode,
                    initiationPreset, setInitiationPreset,
                    initiationLimit, setInitiationLimit,
                  )}
                  {permissions.approvePayments && renderLimitField(
                    'Payment approval limit',
                    approvalLimitMode, setApprovalLimitMode,
                    approvalPreset, setApprovalPreset,
                    approvalLimit, setApprovalLimit,
                  )}

                  {/* Governance threshold warning */}
                  {limitError && (
                    <div className="flex items-start gap-1.5 p-2 bg-[var(--amber-50)] border border-[var(--amber-500)]/20 rounded-[var(--radius-sm)]">
                      <AlertCircle size={12} className="text-[var(--amber-600)] mt-0.5 shrink-0" />
                      <span className="text-[var(--amber-600)]" style={{ fontSize: '11px', lineHeight: '14px', fontWeight: 500 }}>
                        {limitError}
                      </span>
                    </div>
                  )}

                  <p className="text-[var(--text-muted)]" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
                    Limits protect your business by capping how much this person can move per payment or per day. You can change these at any time.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );

  const sendButton = (
    <>
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className={`
          w-full h-[48px] rounded-[var(--radius-pill)] transition-all flex items-center justify-center gap-[var(--space-sm)]
          ${canSend
            ? 'bg-[var(--brand-primary-navy)] text-[var(--text-on-dark)] hover:opacity-90 shadow-[var(--shadow-card-lg)]'
            : 'bg-[var(--divider)] text-[var(--text-muted)] cursor-not-allowed'}
        `}
      >
        {canSend && <Check size={18} />}
        Send invite
      </button>
      {!canSend && (
        <p className="text-center text-[var(--text-muted)] mt-[var(--space-sm)]" style={{ fontSize: '12px', fontWeight: 400 }}>
          Enter a name and email address to send an invite
        </p>
      )}
    </>
  );

  // ===== FLOW MODE: inline content for OnboardingLayout wrapping =====
  if (context === 'flow') {
    return (
      <div className="space-y-[var(--space-xl)]" style={{ fontFamily: 'var(--font-family)' }}>
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-[var(--text-primary)]">Add a team member</h2>
          <p className="text-[var(--text-secondary)]">Set their role and account access permissions.</p>
        </div>

        {formContent}

        <StickyFooter>
          {sendButton}
        </StickyFooter>
      </div>
    );
  }

  // ===== DASHBOARD MODE: full-screen with own nav =====
  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: 'var(--font-family)' }}>
      {/* Sticky navigation bar */}
      <div className="sticky top-0 z-30 flex items-center gap-[var(--space-md)] p-[var(--space-lg)] border-b border-[var(--divider)] bg-[var(--background-surface)]">
        <button
          type="button"
          onClick={onBack}
          className="text-[var(--text-primary)] hover:bg-[var(--background-surface-soft)] p-1 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h3 className="text-[var(--text-primary)]">Add a team member</h3>
      </div>

      {/* Scrollable form content */}
      <div className="flex-1 p-[var(--space-xl)] space-y-[var(--space-xl)]">
        {formContent}
      </div>

      {/* Bottom action */}
      <div className="sticky bottom-0 z-20 bg-[var(--background-app)] border-t border-[var(--divider)] p-[var(--space-xl)] pb-[var(--space-xxl)]">
        {sendButton}
      </div>
    </div>
  );
}
