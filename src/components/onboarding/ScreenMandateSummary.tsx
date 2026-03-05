import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, AlertTriangle, RotateCcw, ShieldCheck, ArrowDown, Play, Lock, Eye, CreditCard, Users, UserCheck, Clock, ChevronDown, Zap, Shield, PenLine, Eraser, Upload, Image as ImageIcon, X } from 'lucide-react';
import { MandateState, TeamMember } from './types';
import { StickyFooter } from './StickyFooter';
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

  // ─── signature pad state ───
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const getCanvasPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    lastPointRef.current = point;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, [getCanvasPoint]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const point = getCanvasPoint(e);
    if (!point || !lastPointRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Smooth line with quadratic curve
    const midX = (lastPointRef.current.x + point.x) / 2;
    const midY = (lastPointRef.current.y + point.y) / 2;
    ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);
    ctx.stroke();
    lastPointRef.current = point;
    if (!hasSigned) setHasSigned(true);
  }, [isDrawing, getCanvasPoint, hasSigned]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPointRef.current = null;
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  }, []);

  // ─── upload signature handlers ───
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, or SVG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedSignature(dataUrl);
      setUploadFileName(file.name);
      setHasSigned(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const clearUploadedSignature = useCallback(() => {
    setUploadedSignature(null);
    setUploadFileName('');
    setHasSigned(false);
  }, []);

  const switchSignatureMode = useCallback((mode: 'draw' | 'upload') => {
    if (mode === signatureMode) return;
    // Clear both when switching
    if (mode === 'draw') {
      clearUploadedSignature();
    } else {
      clearSignature();
    }
    setSignatureMode(mode);
  }, [signatureMode, clearSignature, clearUploadedSignature]);

  // Set up canvas context style
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

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
  const canConfirm = declared && hasSigned && !mandate.locked;

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
                Threshold is applied per transaction. The initiating director counts toward the required approver count.
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
      { key: 'initiatePayments', label: 'Initiate', icon: <CreditCard size={12} /> },
      { key: 'approvePayments', label: 'Approve', icon: <UserCheck size={12} /> },
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
          <SectionLabel>Team &amp; permissions</SectionLabel>
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
                        {person.initiationLimit ? ` · Init ${formatCurrency(person.initiationLimit)}` : ''}
                        {person.approvalLimit ? ` · Appr ${formatCurrency(person.approvalLimit)}` : ''}
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
        label: 'All directors accepted mandate terms',
        done: mandate.teamMembers.every(m => m.role !== 'director' || m.hasAcceptedMandate),
        detail: mandate.teamMembers.every(m => m.role !== 'director' || m.hasAcceptedMandate)
          ? 'Digital acceptance recorded for all directors'
          : 'Pending acceptance from unverified directors',
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
                ? 'All conditions met — rule will activate on confirmation.'
                : 'Approval rule will not take full effect until all conditions are met.'}
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
        text: 'Approval protection is not active until all directors verify and accept.',
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
  const renderDeclaration = () => (
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
        I confirm this accurately reflects the authorised persons, approval rules, and governance controls for this account.
      </span>
    </label>
  );

  /* ─────────────────────────────────────────────────
   * SECTION 8: Digital Signature (Draw / Upload)
   * ───────────────────────────────────────────────── */
  const renderSignaturePad = () => (
    <div>
      <SectionLabel>Digital signature</SectionLabel>
      <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] overflow-hidden">
        {/* Header + mode tabs */}
        <div className="px-[var(--space-lg)] pt-[var(--space-lg)] pb-[var(--space-md)]">
          <div className="flex items-center gap-[var(--space-sm)] mb-1">
            <PenLine size={15} className="text-[var(--accent-primary)]" />
            <span className="text-[var(--text-primary)]" style={{ fontSize: '15px', fontWeight: 600 }}>Sign to confirm</span>
          </div>
          <p className="text-[var(--text-muted)] mb-[var(--space-md)]" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
            Draw or upload your signature to authorise this mandate. This constitutes your digital acceptance.
          </p>

          {/* Tab switcher */}
          <div className="flex rounded-[var(--radius-sm)] bg-[var(--background-surface-soft)] p-0.5 border border-[var(--divider)]">
            <button
              type="button"
              onClick={() => switchSignatureMode('draw')}
              className={`
                flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-[4px] transition-all
                ${signatureMode === 'draw'
                  ? 'bg-[var(--background-surface)] shadow-sm text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}
              `}
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              <PenLine size={13} />
              Draw
            </button>
            <button
              type="button"
              onClick={() => switchSignatureMode('upload')}
              className={`
                flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-[4px] transition-all
                ${signatureMode === 'upload'
                  ? 'bg-[var(--background-surface)] shadow-sm text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}
              `}
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              <Upload size={13} />
              Upload
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* ── Draw mode ── */}
        {signatureMode === 'draw' && (
          <>
            <div className="mx-[var(--space-lg)] mb-[var(--space-md)]">
              <div
                className={`
                  relative rounded-[var(--radius-md)] border-2 border-dashed transition-colors overflow-hidden
                  ${hasSigned
                    ? 'border-[var(--emerald-600)]/40 bg-white'
                    : isDrawing
                      ? 'border-[var(--accent-primary)] bg-white'
                      : 'border-[var(--divider)] bg-[var(--background-surface-soft)]'}
                `}
              >
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={180}
                  className="w-full cursor-crosshair touch-none"
                  style={{ height: '140px', display: 'block' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />

                {/* Signature baseline */}
                <div
                  className="absolute left-[var(--space-lg)] right-[var(--space-lg)] pointer-events-none"
                  style={{ bottom: '32px' }}
                >
                  <div className="w-full border-b border-[var(--divider)]" />
                </div>

                {/* Placeholder text */}
                {!hasSigned && !isDrawing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <PenLine size={20} className="text-[var(--text-muted)] opacity-40 mb-2" />
                    <span className="text-[var(--text-muted)] opacity-60" style={{ fontSize: '13px', fontWeight: 400 }}>
                      Draw your signature here
                    </span>
                  </div>
                )}

                {/* Signed indicator */}
                {hasSigned && (
                  <div className="absolute top-2 right-2 pointer-events-none">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--emerald-50)]">
                      <Check size={10} className="text-[var(--emerald-600)]" strokeWidth={3} />
                      <span className="text-[var(--emerald-600)]" style={{ fontSize: '10px', fontWeight: 600 }}>Signed</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with clear + name */}
            <div className="flex items-center justify-between px-[var(--space-lg)] pb-[var(--space-lg)] pt-[var(--space-sm)]">
              <button
                type="button"
                onClick={clearSignature}
                disabled={!hasSigned}
                className={`
                  flex items-center gap-1.5 transition-all min-h-[44px] py-2
                  ${hasSigned
                    ? 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
                    : 'text-[var(--text-muted)] cursor-not-allowed opacity-50'}
                `}
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                <Eraser size={13} />
                Clear signature
              </button>
              <div className="text-right">
                <span className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 400 }}>
                  {applicantName}
                </span>
                <span className="text-[var(--text-muted)] block" style={{ fontSize: '10px', fontWeight: 400 }}>
                  {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </>
        )}

        {/* ── Upload mode ── */}
        {signatureMode === 'upload' && (
          <div className="mx-[var(--space-lg)] mb-[var(--space-lg)]">
            {!uploadedSignature ? (
              /* Drop zone */
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative rounded-[var(--radius-md)] border-2 border-dashed transition-all cursor-pointer
                  ${isDragOver
                    ? 'border-[var(--accent-primary)] bg-[var(--blue-50)]'
                    : 'border-[var(--divider)] bg-[var(--background-surface-soft)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--blue-50)]/30'}
                `}
                style={{ height: '140px' }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-colors
                      ${isDragOver ? 'bg-[var(--blue-50)]' : 'bg-[var(--background-surface)]'}
                    `}
                  >
                    <Upload size={18} className={isDragOver ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'} />
                  </div>
                  <div className="text-center">
                    <p className="text-[var(--text-primary)]" style={{ fontSize: '13px', fontWeight: 600 }}>
                      {isDragOver ? 'Drop your signature here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-[var(--text-muted)] mt-0.5" style={{ fontSize: '11px', fontWeight: 400 }}>
                      PNG, JPG, SVG or WebP (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Uploaded preview */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-[var(--radius-md)] border-2 border-[var(--emerald-600)]/40 bg-white overflow-hidden"
                style={{ height: '140px' }}
              >
                <img
                  src={uploadedSignature}
                  alt="Uploaded signature"
                  className="w-full h-full object-contain p-4"
                />

                {/* Uploaded indicator */}
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--emerald-50)]">
                    <Check size={10} className="text-[var(--emerald-600)]" strokeWidth={3} />
                    <span className="text-[var(--emerald-600)]" style={{ fontSize: '10px', fontWeight: 600 }}>Uploaded</span>
                  </div>
                </div>

                {/* File info + actions */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent px-3 pb-2 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ImageIcon size={12} className="text-[var(--text-muted)] shrink-0" />
                      <span className="text-[var(--text-muted)] truncate" style={{ fontSize: '11px', fontWeight: 400, maxWidth: '160px' }}>
                        {uploadFileName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[var(--accent-primary)] hover:opacity-80 transition-opacity"
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={clearUploadedSignature}
                        className="w-6 h-6 rounded-full bg-[var(--background-surface)] border border-[var(--divider)] flex items-center justify-center hover:bg-[var(--red-50)] hover:border-[var(--red-600)]/20 transition-colors"
                      >
                        <X size={12} className="text-[var(--text-muted)]" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Name + date label for upload mode */}
            <div className="flex justify-end mt-[var(--space-sm)]">
              <div className="text-right">
                <span className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 400 }}>
                  {applicantName}
                </span>
                <span className="text-[var(--text-muted)] block" style={{ fontSize: '10px', fontWeight: 400 }}>
                  {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ─── confirm button ─── */
  const handleConfirmClick = () => {
    if (canConfirm) {
      onConfirm();
      return;
    }
    // Show reason why the button is disabled
    if (!declared && !hasSigned) {
      toast.error('Please tick the declaration and sign below to confirm.');
    } else if (!declared) {
      toast.error('Please tick the declaration checkbox to continue.');
    } else if (!hasSigned) {
      toast.error('Please draw or upload your signature to continue.');
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
  const summaryContent = (
    <div className="space-y-[var(--space-xl)]">
      {renderRulesSection()}
      {renderSimulator()}
      {renderApprovalFlow()}
      {renderPermissionsMatrix()}
      {renderActivationChecklist()}
      {renderPendingSection()}
      {renderGovernanceSummary()}
      {renderDeclaration()}
      {renderSignaturePad()}
    </div>
  );

  /* ─── FLOW MODE ─── */
  if (context === 'flow') {
    return (
      <div className="space-y-[var(--space-xl)]" style={{ fontFamily: 'var(--font-family)' }}>
        <div className="space-y-2">
          <h2 className="text-[var(--text-primary)]">Account governance summary</h2>
          <p className="text-[var(--text-secondary)]">Review your approval rules, team permissions, and mandate activation status.</p>
          {mandate.mandateVersion && (
            <p className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em' }}>
              Mandate ref: {mandate.mandateVersion}
            </p>
          )}
        </div>

        {summaryContent}

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
          <h3 className="text-[var(--text-primary)]">Account governance summary</h3>
          {mandate.mandateVersion && (
            <p className="text-[var(--text-muted)]" style={{ fontSize: '10px', fontWeight: 500 }}>
              {mandate.mandateVersion}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 p-[var(--space-xl)]">
        {summaryContent}
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