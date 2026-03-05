import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, ArrowRight, Info, Users, ChevronRight, AlertTriangle, X, CreditCard, Send, ArrowUpRight, ArrowDownLeft, MoreHorizontal, ShieldCheck, Lock, Unlock, Clock, XCircle, CheckCircle2, Gift, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { StickyFooter } from './StickyFooter';
import { MandateState } from './types';
import { useState } from 'react';
import { ScreenSubscriptionSelection } from './ScreenSubscriptionSelection';
import { subscriptionPlans } from './data/plans';
import { toolkitAddons, addonIconMap } from './data/addons';

interface ScreenDashboardProps {
  mode?: 'celebration' | 'dashboard';
  companyName?: string;
  mandate?: MandateState;
  onGoToDashboard?: () => void;
  onSetupTeam?: () => void;
  onDismissBanner?: () => void;
  onViewTeamStatus?: () => void;
}

export function ScreenDashboard({
  mode = 'celebration',
  companyName = 'Bright Hospitality Ltd',
  mandate,
  onGoToDashboard,
  onSetupTeam,
  onDismissBanner,
  onViewTeamStatus,
}: ScreenDashboardProps) {

  if (mode === 'dashboard') {
    return <FullDashboard
      companyName={companyName}
      mandate={mandate}
      onSetupTeam={onSetupTeam}
      onDismissBanner={onDismissBanner}
      onViewTeamStatus={onViewTeamStatus}
    />;
  }

  // CELEBRATION MODE
  const [simOutcome, setSimOutcome] = useState<'success' | 'review' | 'declined'>('success');
  const isMultiDirector = mandate?.authorityType === 'multi_director' || mandate?.authorityType === 'board_authorised';

  const outcomeConfig = {
    success: {
      gradient: 'from-[var(--brand-primary-navy)] to-[var(--brand-blue)]',
      iconBg: 'bg-green-400',
      iconShadow: 'shadow-green-400/30',
      icon: <Check className="text-[var(--brand-primary-navy)] w-5 h-5 stroke-[4px]" />,
      heading: "You're all set!",
      subtitle: 'Your business account is now active and ready for use.',
      cardStatus: 'Under review',
      cardGradient: 'from-[var(--brand-red)] to-[#C4001A]',
      cardOpacity: '',
      infoIcon: <Info size={20} />,
      infoIconBg: 'bg-[var(--blue-50)] text-[var(--accent-primary)]',
      infoBorder: 'border-[var(--divider)]',
      infoTitle: 'What happens next?',
      infoText: "Your application is now being reviewed by our team. We'll send you a notification as soon as the review is complete. In the meantime, head into the app and start exploring — there's plenty to discover!",
      ctaLabel: 'Go to Dashboard',
      ctaStyle: 'bg-[var(--brand-primary-navy)] text-white',
    },
    review: {
      gradient: 'from-[var(--brand-primary-navy)] to-[var(--brand-blue)]',
      iconBg: 'bg-amber-400',
      iconShadow: 'shadow-amber-400/30',
      icon: <Clock className="text-[var(--brand-primary-navy)] w-5 h-5 stroke-[3px]" />,
      heading: 'Application in review',
      subtitle: "We're taking a closer look — this usually takes up to 2 business days.",
      cardStatus: 'In review',
      cardGradient: 'from-[var(--brand-red)] to-[#C4001A]',
      cardOpacity: 'opacity-75',
      infoIcon: <Clock size={20} />,
      infoIconBg: 'bg-[var(--amber-50)] text-[var(--amber-600)]',
      infoBorder: 'border-[var(--amber-500)]/20',
      infoTitle: 'Your application is being reviewed',
      infoText: "Our team is reviewing your application and it can take up to 2 business days. We'll notify you as soon as the review is complete. In the meantime, feel free to explore the app and get familiar with your new account features.",
      ctaLabel: 'Explore the app',
      ctaStyle: 'bg-[var(--brand-primary-navy)] text-white',
    },
    declined: {
      gradient: 'from-[#2D1B1B] to-[#4A2020]',
      iconBg: 'bg-red-400',
      iconShadow: 'shadow-red-400/30',
      icon: <XCircle className="text-white w-5 h-5 stroke-[2.5px]" />,
      heading: "We're unable to proceed",
      subtitle: "Unfortunately, we can't open an account at this time.",
      cardStatus: 'Declined',
      cardGradient: 'from-[#6B6B6B] to-[#4A4A4A]',
      cardOpacity: 'opacity-60 grayscale',
      infoIcon: <XCircle size={20} />,
      infoIconBg: 'bg-[var(--red-50)] text-[var(--accent-danger)]',
      infoBorder: 'border-[var(--accent-danger)]/20',
      infoTitle: 'Why was my application declined?',
      infoText: "After careful review, we're unable to proceed with your application as it doesn't meet our current account-opening criteria. This decision is based on our internal policies. If you believe this is an error, you can contact our support team for further information.",
      ctaLabel: 'Contact support',
      ctaStyle: 'bg-[var(--brand-primary-navy)] text-white',
    },
  };

  const cfg = outcomeConfig[simOutcome];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background-app)] relative" style={{ fontFamily: 'var(--font-family)' }}>

      {/* ── Simulation toggle (dev only) ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center bg-black/30 backdrop-blur-xl rounded-[var(--radius-pill)] p-0.5 border border-white/10">
          {([
            { key: 'success', label: 'Success' },
            { key: 'review', label: 'In Review' },
            { key: 'declined', label: 'Declined' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSimOutcome(key)}
              className={`
                px-3 py-1.5 rounded-[var(--radius-pill)] transition-all
                ${simOutcome === key
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/70'}
              `}
              style={{ fontSize: '11px', fontWeight: 600 }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Gradient Section */}
      <motion.div
        key={simOutcome}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`bg-gradient-to-b ${cfg.gradient} relative w-full pt-16 pb-32 px-6 flex flex-col items-center text-center overflow-hidden rounded-b-[32px]`}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            key={`icon-${simOutcome}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-2xl"
          >
            <div className={`w-8 h-8 rounded-full ${cfg.iconBg} flex items-center justify-center shadow-lg ${cfg.iconShadow}`}>
              {cfg.icon}
            </div>
          </motion.div>
          <motion.h1
            key={`h-${simOutcome}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white mb-2"
          >
            {cfg.heading}
          </motion.h1>
          <motion.p
            key={`p-${simOutcome}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-blue-100/90 max-w-xs mx-auto"
            style={{ fontSize: '15px', fontWeight: 500 }}
          >
            {cfg.subtitle}
          </motion.p>
        </div>
      </motion.div>

      {/* Overlapping Card Section */}
      <div className="flex-1 px-6 -mt-24 relative z-20 flex flex-col items-center pb-24">

        {/* The Card */}
        <motion.div
          key={`card-${simOutcome}`}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`w-full max-w-sm bg-gradient-to-br ${cfg.cardGradient} rounded-[var(--radius-xl)] shadow-2xl overflow-hidden text-white border-t border-white/10 ${cfg.cardOpacity} transition-all duration-500`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="p-6 pb-6 relative">
            <div className="flex justify-between items-start mb-10">
              <div className="flex flex-col">
                <span style={{ fontSize: '18px', fontWeight: 700 }} className="text-white tracking-wide">Metro Bank</span>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' }} className="text-white/60 uppercase">Business</span>
              </div>
              <div className="text-right">
                <span style={{ fontSize: '18px', fontWeight: 700 }} className="text-white tracking-wide">{companyName}</span>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' }} className="text-white/60 uppercase">Account Holder</div>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map(g => (
                    <div key={g} className="flex gap-1.5">
                      {[1, 2, 3, 4].map(i => <div key={`g${g}-${i}`} className="w-1.5 h-1.5 rounded-full bg-white/80" />)}
                    </div>
                  ))}
                  <span className="font-mono ml-2 text-white" style={{ fontSize: '20px', fontWeight: 700 }}>XXXX</span>
                </div>
                {simOutcome !== 'declined' && (
                  <button className="text-white/60 hover:text-white transition-colors p-1" aria-label="Copy card number">
                    <Copy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-md p-4 px-5 flex items-center justify-between">
            <div className="flex gap-6">
              <div>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em' }} className="text-white/50 uppercase mb-0.5">Status</div>
                <div className="font-mono text-white" style={{ fontSize: '14px', fontWeight: 700 }}>{cfg.cardStatus}</div>
              </div>
            </div>
            <div className="flex relative mr-1">
              <div className="w-8 h-8 rounded-full bg-[#EB001B]/90 mix-blend-screen shadow-sm" />
              <div className="w-8 h-8 rounded-full bg-[#F79E1B]/90 -ml-3 mix-blend-screen shadow-sm" />
            </div>
          </div>
        </motion.div>

        {/* Info cards */}
        <motion.div
          key={`info-${simOutcome}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 w-full max-w-sm space-y-3"
        >
          {/* Outcome info card */}
          <div className={`bg-[var(--background-surface)] rounded-[var(--radius-lg)] p-4 border ${cfg.infoBorder} shadow-[var(--shadow-card-sm)] flex gap-4 items-start`}>
            <div className={`w-10 h-10 rounded-full ${cfg.infoIconBg} flex items-center justify-center shrink-0`}>
              {cfg.infoIcon}
            </div>
            <div className="flex-1">
              <h3 className="text-[var(--text-primary)] mb-1" style={{ fontSize: '14px' }}>{cfg.infoTitle}</h3>
              <p className="text-[var(--text-secondary)]" style={{ fontSize: '12px', lineHeight: '18px', fontWeight: 400 }}>
                {cfg.infoText}
              </p>
            </div>
          </div>

          {/* Declined — additional support card */}
          {simOutcome === 'declined' && (
            <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] p-4 border border-[var(--divider)] shadow-[var(--shadow-card-sm)] flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-[var(--blue-50)] text-[var(--accent-primary)] flex items-center justify-center shrink-0">
                <Info size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-[var(--text-primary)] mb-1" style={{ fontSize: '14px' }}>Need help?</h3>
                <p className="text-[var(--text-secondary)]" style={{ fontSize: '12px', lineHeight: '18px', fontWeight: 400 }}>
                  You can reach our business banking team at <span className="text-[var(--accent-primary)]" style={{ fontWeight: 600 }}>0345 08 08 500</span> or visit any Metro Bank store for an in-person consultation.
                </p>
              </div>
            </div>
          )}

          {/* Mandate contextual card - only for multi-director on success/review */}
          {isMultiDirector && simOutcome !== 'declined' && (
            <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] p-4 border border-[var(--accent-primary)]/20 shadow-[var(--shadow-card-sm)] flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-[var(--emerald-50)] text-[var(--emerald-600)] flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-[var(--text-primary)] mb-1" style={{ fontSize: '14px' }}>Mandate confirmed</h3>
                <p className="text-[var(--text-secondary)]" style={{ fontSize: '12px', lineHeight: '18px', fontWeight: 400 }}>
                  Your approval rules and authorised persons are set. Team members will complete verification asynchronously — you'll be notified as each person verifies.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Fixed Footer Button */}
      <StickyFooter>
        <button
          onClick={onGoToDashboard}
          className={`w-full h-[56px] rounded-[var(--radius-pill)] ${cfg.ctaStyle} hover:opacity-90 active:scale-[0.99] transition-all shadow-[var(--shadow-card-lg)] flex items-center justify-center gap-2 group`}
        >
          {cfg.ctaLabel}
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </StickyFooter>
    </div>
  );
}

// ==========================================
// FULL DASHBOARD MODE
// ==========================================
function FullDashboard({
  companyName,
  mandate,
  onSetupTeam,
  onDismissBanner,
  onViewTeamStatus,
}: {
  companyName: string;
  mandate?: MandateState;
  onSetupTeam?: () => void;
  onDismissBanner?: () => void;
  onViewTeamStatus?: () => void;
}) {
  const [showSubscription, setShowSubscription] = useState(false);
  const [showFreeBanner, setShowFreeBanner] = useState(true);
  const [showPlansPreview, setShowPlansPreview] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const isMultiDirector = mandate?.authorityType === 'multi_director' || mandate?.authorityType === 'board_authorised';
  const isMandateConfirmed = mandate?.confirmed;
  const allVerified = mandate?.teamMembers.every(m => m.status === 'verified') ?? false;
  const verifiedCount = mandate?.teamMembers.filter(m => m.status === 'verified').length ?? 0;
  const totalDirectors = (mandate?.teamMembers.filter(m => m.role === 'director').length ?? 0) + 1;
  const thresholdAmount = mandate?.thresholdAmount ?? 5000;
  const activationStatus = mandate?.activationStatus ?? 'provisionally_active';
  const isFullyActive = activationStatus === 'fully_active' || (isMandateConfirmed && allVerified);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);

  // Mock transactions
  const transactions = [
    { id: '1', name: 'TfL', amount: -12.50, date: 'Today', type: 'out' },
    { id: '2', name: 'Client Invoice #1042', amount: 3500, date: 'Today', type: 'in' },
    { id: '3', name: 'Amazon Business', amount: -89.99, date: 'Yesterday', type: 'out' },
    { id: '4', name: 'Workspace Rent', amount: -1200, date: 'Yesterday', type: 'out' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background-app)] flex flex-col" style={{ fontFamily: 'var(--font-family)' }}>
      {/* Dashboard header */}
      <div className="bg-gradient-to-b from-[var(--brand-primary-navy)] to-[var(--brand-blue)] px-6 pt-12 pb-8 rounded-b-[var(--radius-xl)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/70" style={{ fontSize: '13px', fontWeight: 500 }}>Good morning</p>
            <h2 className="text-white">Sophie</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Gap 2: Account activation status pill */}
            {isMultiDirector && (
              <div className={`px-2.5 py-1 rounded-[var(--radius-pill)] flex items-center gap-1 ${
                isFullyActive
                  ? 'bg-[var(--emerald-600)]/20 border border-[var(--emerald-600)]/30'
                  : 'bg-white/10 border border-white/20'
              }`}>
                {isFullyActive
                  ? <Unlock size={10} className="text-[var(--emerald-600)]" />
                  : <Lock size={10} className="text-white/60" />
                }
                <span className={isFullyActive ? 'text-[var(--emerald-600)]' : 'text-white/60'} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.02em' }}>
                  {isFullyActive ? 'FULLY ACTIVE' : 'PROVISIONALLY ACTIVE'}
                </span>
              </div>
            )}
            <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <span style={{ fontSize: '16px', fontWeight: 600 }}>SC</span>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white/10 backdrop-blur-md rounded-[var(--radius-lg)] p-5 border border-white/10">
          <p className="text-white/60 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>Available balance</p>
          <h1 className="text-white mb-4" style={{ fontSize: '32px' }}>£24,580.00</h1>
          <div className="flex gap-3">
            <button className="flex-1 h-10 bg-white/15 hover:bg-white/20 text-white rounded-[var(--radius-pill)] flex items-center justify-center gap-2 transition-colors" style={{ fontSize: '13px', fontWeight: 600 }}>
              <Send size={14} /> Send
            </button>
            <button className="flex-1 h-10 bg-white/15 hover:bg-white/20 text-white rounded-[var(--radius-pill)] flex items-center justify-center gap-2 transition-colors" style={{ fontSize: '13px', fontWeight: 600 }}>
              <CreditCard size={14} /> Card
            </button>
            <button
              onClick={() => setShowSubscription(true)}
              className="flex-1 h-10 bg-white/15 hover:bg-white/20 text-white rounded-[var(--radius-pill)] flex items-center justify-center gap-2 transition-colors"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              <MoreHorizontal size={14} /> More
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-5 space-y-4">

        {/* Free trial banner */}
        <AnimatePresence>
          {showFreeBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--accent-primary)]/15 shadow-[var(--shadow-card-md)]"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary-navy)] via-[var(--brand-blue)] to-[var(--brand-primary-navy)]" />
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)',
                }}
              />

              {/* Dismiss button */}
              <button
                onClick={() => setShowFreeBanner(false)}
                className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={12} className="text-white/70" />
              </button>

              <div className="relative px-5 pt-5 pb-4">
                {/* Icon + badge */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-[var(--radius-md)] bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <Gift size={18} className="text-white" />
                  </div>
                  <div className="px-2.5 py-0.5 rounded-[var(--radius-pill)] bg-white/15 backdrop-blur-sm">
                    <span className="text-white" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em' }}>FREE FOR 3 MONTHS</span>
                  </div>
                </div>

                {/* Copy */}
                <h3 className="text-white mb-1.5" style={{ fontSize: '17px' }}>
                  Your first 3 months are on us
                </h3>
                <p className="text-white/70 mb-4" style={{ fontSize: '13px', lineHeight: '19px', fontWeight: 400 }}>
                  Enjoy full access to all features at no cost. After your trial, choose from 4 plans starting at just £9/mo to keep your account running.
                </p>

                {/* CTA row */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPlansPreview(true)}
                    className="h-[40px] px-5 rounded-[var(--radius-pill)] bg-white text-[var(--brand-primary-navy)] hover:bg-white/90 active:scale-[0.98] transition-all flex items-center gap-2"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    <Sparkles size={15} />
                    Explore plans
                  </button>
                  <span className="text-white/50" style={{ fontSize: '12px', fontWeight: 500 }}>
                    89 days remaining
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MANDATE BANNERS */}
        {isMultiDirector && !isMandateConfirmed && (
          <>
            {/* Activation card */}
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={onSetupTeam}
              className="w-full bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--accent-primary)]/20 shadow-[var(--shadow-card-md)] p-4 flex items-center gap-4 text-left hover:border-[var(--accent-primary)] transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--blue-50)] text-[var(--accent-primary)] flex items-center justify-center shrink-0 relative">
                <Users size={22} />
                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--accent-danger)] rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-primary)]" style={{ fontSize: '16px', fontWeight: 600 }}>Set up your team</p>
                <p className="text-[var(--text-secondary)]" style={{ fontSize: '13px', fontWeight: 400 }}>
                  Add directors and team members to your account.
                </p>
              </div>
              <ChevronRight size={20} className="text-[var(--text-muted)] shrink-0" />
            </motion.button>

            {/* Gap 4: Payment access card — shows what's restricted */}
            {mandate?.approvalRule === 'threshold' && (
              <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[var(--text-primary)]" />
                  <p className="text-[var(--text-primary)]" style={{ fontSize: '14px', fontWeight: 600 }}>Payment access</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--emerald-600)]" />
                      <span className="text-[var(--text-secondary)]" style={{ fontSize: '13px', fontWeight: 400 }}>
                        Payments up to {formatCurrency(thresholdAmount)}
                      </span>
                    </div>
                    <span className="text-[var(--emerald-600)]" style={{ fontSize: '12px', fontWeight: 600 }}>Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-danger)]" />
                      <span className="text-[var(--text-secondary)]" style={{ fontSize: '13px', fontWeight: 400 }}>
                        Payments above {formatCurrency(thresholdAmount)}
                      </span>
                    </div>
                    <span className="text-[var(--accent-danger)]" style={{ fontSize: '12px', fontWeight: 600 }}>Blocked</span>
                  </div>
                </div>
                <p className="text-[var(--text-muted)]" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
                  A second verified director is needed to unlock dual-approval payments.
                </p>
              </div>
            )}

            {/* Threshold warning banner */}
            {mandate?.approvalRule === 'threshold' && (
              <div className="bg-[var(--amber-50)] border border-[var(--amber-500)]/20 rounded-[var(--radius-md)] p-3 flex items-start gap-3">
                <AlertTriangle size={16} className="text-[var(--amber-600)] mt-0.5 shrink-0" />
                <p className="text-[var(--amber-600)]" style={{ fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
                  Payments above {formatCurrency(thresholdAmount)} are currently blocked. Add and verify a second director to enable full payments.
                </p>
              </div>
            )}
          </>
        )}

        {/* State 1: Mandate confirmed, all verified — green banner */}
        {isMultiDirector && isMandateConfirmed && allVerified && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[var(--emerald-50)] border border-[var(--emerald-600)]/20 rounded-[var(--radius-md)] p-3 flex items-start gap-3"
          >
            <Check size={16} className="text-[var(--emerald-600)] mt-0.5 shrink-0" strokeWidth={3} />
            <div className="flex-1">
              <p className="text-[var(--emerald-600)]" style={{ fontSize: '13px', fontWeight: 600 }}>Your mandate is active</p>
              <p className="text-[var(--emerald-700)]" style={{ fontSize: '12px', fontWeight: 400 }}>
                All authorised persons verified. Full payment access enabled.
              </p>
            </div>
            {onDismissBanner && (
              <button onClick={onDismissBanner} className="text-[var(--emerald-600)] hover:opacity-70 shrink-0">
                <X size={16} />
              </button>
            )}
          </motion.div>
        )}

        {/* State 2: Mandate confirmed but pending verifications — yellow banner */}
        {isMultiDirector && isMandateConfirmed && !allVerified && (
          <>
            <div className="bg-[var(--amber-50)] border border-[var(--amber-500)]/20 rounded-[var(--radius-md)] p-3 flex items-start gap-3">
              <AlertTriangle size={16} className="text-[var(--amber-600)] mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-[var(--amber-600)]" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Waiting for team verification
                </p>
                <p className="text-[var(--amber-600)]" style={{ fontSize: '12px', fontWeight: 400 }}>
                  {verifiedCount} of {totalDirectors} directors verified. Payments above {formatCurrency(thresholdAmount)} need a second director.
                </p>
                {onViewTeamStatus && (
                  <button
                    onClick={onViewTeamStatus}
                    className="flex items-center gap-1 text-[var(--accent-primary)] mt-1"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    View team status <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Payment access status — shows what's restricted until all verified */}
            {mandate?.approvalRule === 'threshold' && (
              <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[var(--text-primary)]" />
                  <p className="text-[var(--text-primary)]" style={{ fontSize: '14px', fontWeight: 600 }}>Payment access</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--emerald-600)]" />
                      <span className="text-[var(--text-secondary)]" style={{ fontSize: '13px', fontWeight: 400 }}>
                        Payments up to {formatCurrency(thresholdAmount)}
                      </span>
                    </div>
                    <span className="text-[var(--emerald-600)]" style={{ fontSize: '12px', fontWeight: 600 }}>Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-danger)]" />
                      <span className="text-[var(--text-secondary)]" style={{ fontSize: '13px', fontWeight: 400 }}>
                        Payments above {formatCurrency(thresholdAmount)}
                      </span>
                    </div>
                    <span className="text-[var(--accent-danger)]" style={{ fontSize: '12px', fontWeight: 600 }}>Blocked</span>
                  </div>
                </div>
                <p className="text-[var(--text-muted)]" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
                  Waiting for a second director to verify and accept the mandate before dual-approval payments are enabled.
                </p>
              </div>
            )}
          </>
        )}

        {/* Recent transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--text-primary)]">Recent transactions</h3>
            <button className="text-[var(--accent-primary)]" style={{ fontSize: '13px', fontWeight: 600 }}>See all</button>
          </div>
          <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] overflow-hidden">
            {transactions.map((tx, idx) => (
              <div key={tx.id}>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'in' ? 'bg-[var(--emerald-50)] text-[var(--emerald-600)]' : 'bg-[var(--background-surface-soft)] text-[var(--text-muted)]'}`}>
                      {tx.type === 'in' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="text-[var(--text-primary)]" style={{ fontSize: '14px', fontWeight: 500 }}>{tx.name}</p>
                      <p className="text-[var(--text-muted)]" style={{ fontSize: '12px', fontWeight: 400 }}>{tx.date}</p>
                    </div>
                  </div>
                  <span
                    className={tx.amount > 0 ? 'text-[var(--emerald-600)]' : 'text-[var(--text-primary)]'}
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    {tx.amount > 0 ? '+' : ''}£{Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
                {idx < transactions.length - 1 && <div className="h-px bg-[var(--divider)] mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Liquidity+ Line proposition */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--background-surface)] rounded-[var(--radius-xl)] border border-[var(--accent-primary)]/15 shadow-[var(--shadow-card-md)] overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[var(--text-primary)]" style={{ fontSize: '17px' }}>Liquidity+ Line</h3>
                <p className="text-[var(--accent-primary)]" style={{ fontSize: '13px', fontWeight: 500 }}>You're pre-approved</p>
              </div>
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--brand-primary-navy)]/8 flex items-center justify-center">
                <CreditCard size={20} className="text-[var(--brand-primary-navy)]" />
              </div>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <span className="text-[var(--text-primary)]" style={{ fontSize: '28px', fontWeight: 700 }}>£60,000</span>
              <span className="text-[var(--text-secondary)] ml-2" style={{ fontSize: '15px', fontWeight: 500 }}>available</span>
            </div>

            {/* Description */}
            <p className="text-[var(--text-secondary)] mb-5" style={{ fontSize: '13px', lineHeight: '20px', fontWeight: 400 }}>
              A universal credit limit across credit card, overdraft, and more — with transparent flat-fee pricing and competitive interest rates.
            </p>

            {/* Divider */}
            <div className="h-px bg-[var(--divider)] -mx-5" />
          </div>

          {/* Benefits */}
          <div className="px-5 py-4 space-y-3.5">
            {[
              'Intelligent credit line that adapts to your spending patterns',
              'Real-time cashflow insights and spending alerts',
              'Simple, transparent pricing — no hidden fees',
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--brand-primary-navy)]/8 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={16} className="text-[var(--brand-primary-navy)]" />
                </div>
                <p className="text-[var(--text-primary)]" style={{ fontSize: '13px', lineHeight: '19px', fontWeight: 400 }}>
                  {benefit}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-5 pb-5 pt-1">
            <button className="w-full h-[48px] rounded-[var(--radius-pill)] bg-[var(--brand-primary-navy)] text-white hover:opacity-90 active:scale-[0.99] transition-all shadow-[var(--shadow-card-sm)] flex items-center justify-center gap-2" style={{ fontSize: '15px', fontWeight: 600 }}>
              Apply for Liquidity+ Line
            </button>
          </div>
        </motion.div>
      </div>

      {/* Plans Preview Bottom Sheet */}
      <AnimatePresence>
        {showPlansPreview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => { setShowPlansPreview(false); setExpandedPlanId(null); }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--background-surface)] rounded-t-[24px] max-h-[85vh] flex flex-col"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[var(--divider)]" />
              </div>

              {/* Header */}
              <div className="px-6 pt-2 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[var(--text-primary)]" style={{ fontSize: '20px' }}>Choose your plan</h2>
                    <p className="text-[var(--text-secondary)] mt-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>
                      Your free trial ends in 89 days
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowPlansPreview(false); setExpandedPlanId(null); }}
                    className="w-8 h-8 rounded-full bg-[var(--background-surface-soft)] flex items-center justify-center hover:bg-[var(--divider)] transition-colors"
                  >
                    <X size={16} className="text-[var(--text-muted)]" />
                  </button>
                </div>
              </div>

              <div className="h-px bg-[var(--divider)]" />

              {/* Plans list */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {subscriptionPlans.map((plan) => {
                  const Icon = plan.icon;
                  const isExpanded = expandedPlanId === plan.id;
                  const isRecommended = plan.id === 'build';

                  return (
                    <motion.div
                      key={plan.id}
                      layout
                      className={`rounded-[var(--radius-lg)] border ${
                        isRecommended
                          ? 'border-[var(--accent-primary)]/30 shadow-[var(--shadow-card-md)]'
                          : 'border-[var(--divider)] shadow-[var(--shadow-card-sm)]'
                      } bg-[var(--background-surface)] overflow-hidden`}
                    >
                      {/* Recommended badge */}
                      {isRecommended && (
                        <div className="bg-[var(--accent-primary)] px-4 py-1.5 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-white" />
                          <span className="text-white" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em' }}>
                            RECOMMENDED FOR YOU
                          </span>
                        </div>
                      )}

                      {/* Plan row */}
                      <button
                        onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                        className="w-full px-4 py-4 flex items-center gap-3.5 text-left"
                      >
                        <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
                          isRecommended
                            ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                            : 'bg-[var(--background-surface-soft)] text-[var(--text-secondary)]'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[var(--text-primary)]" style={{ fontSize: '16px', fontWeight: 600 }}>
                              {plan.name}
                            </span>
                            <span className="text-[var(--text-secondary)]" style={{ fontSize: '14px', fontWeight: 500 }}>
                              £{plan.price}/mo
                            </span>
                          </div>
                          <p className="text-[var(--text-muted)] truncate" style={{ fontSize: '12px', fontWeight: 400 }}>
                            {plan.headline}
                          </p>
                        </div>
                        <div className="shrink-0 text-[var(--text-muted)]">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {/* Expanded features */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="h-px bg-[var(--divider)] mx-4" />
                            <div className="px-4 pt-3 pb-4 space-y-2.5">
                              {plan.allFeatures.map((feature, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                  <CheckCircle2 size={15} className="text-[var(--emerald-600)] shrink-0 mt-0.5" />
                                  <span className="text-[var(--text-secondary)]" style={{ fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
                                    {feature}
                                  </span>
                                </div>
                              ))}
                              {plan.freeAddons > 0 && (
                                <div className="flex items-start gap-2.5">
                                  <Gift size={15} className="text-[var(--accent-primary)] shrink-0 mt-0.5" />
                                  <span className="text-[var(--accent-primary)]" style={{ fontSize: '13px', lineHeight: '18px', fontWeight: 500 }}>
                                    {plan.freeAddons} free add-on{plan.freeAddons > 1 ? 's' : ''} included
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {/* Footer note */}
                <div className="h-px bg-[var(--divider)] my-2" />

                {/* Toolkit+ Add-ons preview */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[var(--text-primary)]" style={{ fontSize: '16px' }}>Toolkit+ Add-ons</h3>
                    <div className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--accent-primary)]/10">
                      <span className="text-[var(--accent-primary)]" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }}>
                        FROM £3/MO
                      </span>
                    </div>
                  </div>
                  <p className="text-[var(--text-muted)] mb-3" style={{ fontSize: '12px', fontWeight: 400 }}>
                    Supercharge your account with powerful extras
                  </p>

                  <div className="space-y-2">
                    {toolkitAddons.slice(0, 5).map((addon) => {
                      const Icon = addonIconMap[addon.icon];
                      return (
                        <div
                          key={addon.id}
                          className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--divider)] bg-[var(--background-surface)] hover:border-[var(--accent-primary)]/20 transition-colors"
                        >
                          <div
                            className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
                            style={{ backgroundColor: addon.iconBg }}
                          >
                            {Icon && <Icon size={18} style={{ color: addon.iconColor }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[var(--text-primary)] truncate" style={{ fontSize: '14px', fontWeight: 600 }}>
                              {addon.name}
                            </p>
                            <p className="text-[var(--text-muted)] truncate" style={{ fontSize: '11px', fontWeight: 400 }}>
                              {addon.description}
                            </p>
                          </div>
                          <ArrowRight size={14} className="text-[var(--text-muted)] shrink-0" />
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="w-full mt-3 h-[40px] rounded-[var(--radius-pill)] border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    View all {toolkitAddons.length} add-ons
                    <ArrowRight size={14} />
                  </button>
                </div>

                <p className="text-center text-[var(--text-muted)] pt-2 pb-4" style={{ fontSize: '12px', lineHeight: '17px', fontWeight: 400 }}>
                  You can change your plan at any time. No commitments, no cancellation fees.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Subscription Selection Sheet */}
      <ScreenSubscriptionSelection
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        onSelectPlan={(planId, addons) => {
          setShowSubscription(false);
        }}
        recommendedPlan="build"
      />
    </div>
  );
}