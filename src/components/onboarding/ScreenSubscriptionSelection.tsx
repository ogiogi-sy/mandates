import { useEffect, useState, useRef } from 'react';
import { Check, ChevronDown, ChevronUp, Star, ArrowLeft, ArrowRight, ShieldCheck, Loader2, Sparkles, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { slideUp, fadeIn, buttonPress, staggerContainer, fadeInUp } from './utils/motionVariants';
import { toolkitAddons, addonCategories, addonIconMap } from './data/addons';
import { subscriptionPlans, getPlansByPrice, type SubscriptionPlan } from './data/plans';

interface ScreenSubscriptionSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string, addons?: string[]) => void;
  recommendedPlan?: string;
  currentPlan?: string;
}

// Count-Up Price Animation
function CountUpPrice({ target, duration = 800 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <>{display}</>;
}

export function ScreenSubscriptionSelection({
  isOpen,
  onClose,
  onSelectPlan,
  recommendedPlan = 'build',
  currentPlan,
}: ScreenSubscriptionSelectionProps) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isConfirming, setIsConfirming] = useState(false);
  const [showPlanFeatures, setShowPlanFeatures] = useState(false);
  const [consents, setConsents] = useState({ terms: false, billing: false, cancellation: false });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep(1);
      setSelectedPlan(null);
      setSelectedAddons([]);
      setIsProcessing(false);
      setIsConfirming(false);
      setShowPlanFeatures(false);
      setConsents({ terms: false, billing: false, cancellation: false });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsProcessing(false);
    setStep(2);
  };

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleConfirm = () => {
    setStep(3);
    setConsents({ terms: false, billing: false, cancellation: false });
  };

  const handleFinalConfirm = async () => {
    if (selectedPlan) {
      setIsConfirming(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      onSelectPlan(selectedPlan, selectedAddons);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setSelectedPlan(null);
  };

  const toggleExpanded = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const sortedPlans = getPlansByPrice();
  const chosenPlan = subscriptionPlans.find(p => p.id === selectedPlan);
  const freeAddonCount = chosenPlan?.freeAddons || 0;
  const paidAddonCount = Math.max(0, selectedAddons.length - freeAddonCount);
  const addonCost = paidAddonCount * 7;
  const freeSlotsUsed = Math.min(selectedAddons.length, freeAddonCount);
  const freeSlotsRemaining = Math.max(0, freeAddonCount - selectedAddons.length);

  const selectedAddonsSorted = [...selectedAddons].sort((a, b) => {
    const idxA = toolkitAddons.findIndex(t => t.id === a);
    const idxB = toolkitAddons.findIndex(t => t.id === b);
    return idxA - idxB;
  });
  const freeAddonIds = new Set(selectedAddonsSorted.slice(0, freeAddonCount));

  const filteredAddons = activeCategory === 'all'
    ? toolkitAddons
    : toolkitAddons.filter(addon => addon.category.includes(activeCategory));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: '95%' }}
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: 'var(--gray-300)' }} />
            </div>

            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">
                {/* ======================== STEP 1: Choose Plan ======================== */}
                {step === 1 ? (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full overflow-y-auto"
                  >
                    {/* Header */}
                    <div className="px-6 py-4 border-b sticky top-0 bg-white z-10" style={{ borderColor: 'var(--divider)' }}>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: 'var(--brand-primary-navy)', fontWeight: 600 }}>1</div>
                        <h2 style={{ color: 'var(--text-primary)' }}>
                          {currentPlan ? 'Manage Your Plan' : 'Choose Your Plan'}
                        </h2>
                      </div>
                      <p className="text-xs mt-2 ml-8" style={{ color: 'var(--text-muted)' }}>You can change or cancel anytime</p>
                    </div>

                    {/* Plan Cards */}
                    <motion.div
                      className="px-6 py-6 space-y-3 pb-24"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {sortedPlans.map((plan, index) => {
                        const IconComponent = plan.icon;
                        const isRecommended = plan.id === recommendedPlan && !currentPlan;
                        const isCurrent = plan.id === currentPlan;
                        const isExpanded = expandedPlan === plan.id;
                        const isSelected = selectedPlan === plan.id;

                        return (
                          <motion.div
                            key={plan.id}
                            className="relative"
                            variants={fadeInUp}
                            custom={index}
                          >
                            {/* Recommended Badge */}
                            {isRecommended && (
                              <div
                                className="absolute -top-2 left-4 z-10 px-3 py-1 rounded-full flex items-center gap-1.5"
                                style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE047', boxShadow: 'var(--shadow-card-sm)' }}
                              >
                                <Star size={12} style={{ color: 'var(--amber-500)', fill: 'var(--amber-500)' }} />
                                <span className="text-xs" style={{ color: '#92400E', fontWeight: 600 }}>Recommended for you</span>
                              </div>
                            )}

                            {/* Current Plan Badge */}
                            {isCurrent && (
                              <div
                                className="absolute -top-2 left-4 z-10 px-3 py-1 rounded-full flex items-center gap-1.5"
                                style={{ backgroundColor: '#DBEAFE', border: '1px solid #93C5FD', boxShadow: 'var(--shadow-card-sm)' }}
                              >
                                <Check size={12} style={{ color: '#1D4ED8', strokeWidth: 3 }} />
                                <span className="text-xs" style={{ color: '#1E40AF', fontWeight: 600 }}>Current Plan</span>
                              </div>
                            )}

                            {/* Plan Card */}
                            <motion.div
                              className={`rounded-2xl p-5 border-2 transition-all relative overflow-hidden ${(isRecommended || isCurrent) ? 'pt-6' : ''}`}
                              style={{
                                backgroundColor: isCurrent ? '#F0F9FF' : isRecommended ? 'var(--amber-50)' : 'var(--background-surface)',
                                borderColor: isCurrent ? '#0EA5E9' : isRecommended ? '#FDE68A' : 'var(--divider)',
                                boxShadow: isCurrent
                                  ? '0px 4px 16px rgba(96, 165, 250, 0.15)'
                                  : isRecommended
                                    ? '0px 4px 16px rgba(251, 191, 36, 0.15)'
                                    : 'var(--shadow-card-sm)',
                              }}
                              initial={{ scale: 1 }}
                              whileHover={{ scale: 1.005 }}
                              transition={{ scale: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } }}
                            >
                              {/* Plan Header */}
                              <div className="flex items-start gap-4 mb-4">
                                <div
                                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: isRecommended ? '#FEF3C7' : 'var(--blue-50)' }}
                                >
                                  <IconComponent size={24} style={{ color: isRecommended ? 'var(--amber-600)' : 'var(--brand-primary-navy)' }} />
                                </div>
                                <div className="flex-1">
                                  <h3 style={{ color: 'var(--text-primary)' }} className="mb-0.5">{plan.name}</h3>
                                  <div className="flex items-baseline gap-1">
                                    <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--brand-primary-navy)' }}>
                                      £{plan.price}
                                    </span>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>/month</span>
                                  </div>
                                </div>
                              </div>

                              {/* Headline */}
                              <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {plan.headline}
                              </p>

                              {/* Features */}
                              <div className="space-y-2.5 mb-4">
                                {(isExpanded ? plan.allFeatures : plan.features).map((feature, idx) => (
                                  <div key={idx} className="flex items-start gap-2.5">
                                    <div
                                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                      style={{ backgroundColor: '#D1FAE5' }}
                                    >
                                      <Check size={12} style={{ color: 'var(--emerald-600)', strokeWidth: 3 }} />
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{feature}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Expand/Collapse */}
                              {plan.allFeatures.length > plan.features.length && (
                                <motion.button
                                  onClick={() => toggleExpanded(plan.id)}
                                  className="flex items-center gap-1.5 text-sm mb-4 transition"
                                  style={{ color: 'var(--brand-blue)' }}
                                  variants={buttonPress}
                                  initial="initial"
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                  {isExpanded ? (
                                    <>
                                      <span>Show less</span>
                                      <ChevronUp size={16} />
                                    </>
                                  ) : (
                                    <>
                                      <span>See all features</span>
                                      <ChevronDown size={16} />
                                    </>
                                  )}
                                </motion.button>
                              )}

                              {/* Select Button */}
                              <motion.button
                                onClick={() => !isCurrent && handleSelectPlan(plan.id)}
                                disabled={(isProcessing && isSelected) || isCurrent}
                                className="w-full py-3.5 rounded-full transition-all flex items-center justify-center gap-2"
                                style={{
                                  backgroundColor: isCurrent ? '#F1F5F9' : isRecommended ? 'var(--brand-blue)' : 'var(--brand-primary-navy)',
                                  color: isCurrent ? '#64748B' : '#FFFFFF',
                                  opacity: (isProcessing && isSelected) ? 0.7 : 1,
                                  cursor: isCurrent ? 'default' : 'pointer',
                                }}
                                variants={buttonPress}
                                initial="initial"
                                whileHover={!(isProcessing && isSelected) && !isCurrent ? 'hover' : 'initial'}
                                whileTap={!(isProcessing && isSelected) && !isCurrent ? 'tap' : 'initial'}
                              >
                                {isProcessing && isSelected ? (
                                  <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Selecting...</span>
                                  </>
                                ) : isCurrent ? (
                                  <span>Current Plan</span>
                                ) : (
                                  <span>Choose {plan.name}</span>
                                )}
                              </motion.button>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    {/* Sticky help */}
                    <div className="sticky bottom-0 bg-white px-6 py-4" style={{ borderTop: '1px solid var(--divider)' }}>
                      <motion.button
                        className="w-full flex items-center justify-center gap-2 text-sm transition"
                        style={{ color: 'var(--brand-blue)' }}
                        variants={buttonPress}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <span>Need help choosing? Chat with Metro Assistant</span>
                      </motion.button>
                    </div>
                  </motion.div>

                ) : step === 2 ? (
                  /* ======================== STEP 2: Add-ons ======================== */
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full overflow-y-auto"
                  >
                    {/* Header */}
                    <div className="px-6 py-4 border-b sticky top-0 bg-white z-10" style={{ borderColor: 'var(--divider)' }}>
                      <div className="flex items-center gap-3 mb-1">
                        <motion.button
                          onClick={handleBackToStep1}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition"
                          style={{ backgroundColor: 'var(--gray-100)', color: 'var(--text-secondary)' }}
                          variants={buttonPress}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <ArrowLeft size={16} />
                        </motion.button>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: 'var(--brand-primary-navy)', fontWeight: 600 }}>2</div>
                          <h2 style={{ color: 'var(--text-primary)' }}>Choose Toolkit+ add-ons</h2>
                        </div>
                      </div>
                      <p className="text-xs mt-2 ml-11" style={{ color: 'var(--text-muted)' }}>
                        £7/month per tool
                        {freeAddonCount > 0 && (
                          <span className="ml-1" style={{ color: 'var(--emerald-600)' }}>
                            — {freeAddonCount} free with your {chosenPlan?.name} plan
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Selected Plan Summary */}
                    <div className="px-6 pt-4 pb-2">
                      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--blue-50)', border: '1px solid var(--blue-100)' }}>
                        <div className="flex items-center gap-3 p-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-navy)' }}>
                            <Check size={16} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{chosenPlan?.name} plan selected</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>£{chosenPlan?.price}/month</p>
                          </div>
                          <button
                            onClick={() => setShowPlanFeatures(!showPlanFeatures)}
                            className="flex items-center gap-1 text-xs transition"
                            style={{ color: 'var(--brand-blue)' }}
                          >
                            <span>{showPlanFeatures ? 'Hide' : "What's included"}</span>
                            {showPlanFeatures ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                        <AnimatePresence>
                          {showPlanFeatures && chosenPlan && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 pt-1 space-y-2" style={{ borderTop: '1px solid var(--blue-100)' }}>
                                {chosenPlan.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#D1FAE5' }}>
                                      <Check size={10} style={{ color: 'var(--emerald-600)', strokeWidth: 3 }} />
                                    </div>
                                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{feature}</p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Free Slots Indicator */}
                    {freeAddonCount > 0 && (
                      <div className="px-6 pt-3 pb-1">
                        <motion.div
                          className="rounded-xl p-3.5"
                          style={{
                            background: freeSlotsRemaining > 0
                              ? 'linear-gradient(135deg, var(--emerald-50) 0%, #D1FAE5 100%)'
                              : 'linear-gradient(135deg, #F0F9FF 0%, #DBEAFE 100%)',
                            border: freeSlotsRemaining > 0 ? '1px solid #A7F3D0' : '1px solid #BFDBFE',
                          }}
                          layout
                        >
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                              <Sparkles size={14} style={{ color: freeSlotsRemaining > 0 ? 'var(--emerald-600)' : '#2563EB' }} />
                              <span className="text-xs" style={{ fontWeight: 600, color: freeSlotsRemaining > 0 ? '#065F46' : '#1E40AF' }}>
                                {freeSlotsRemaining > 0
                                  ? `${freeSlotsRemaining} free slot${freeSlotsRemaining !== 1 ? 's' : ''} remaining`
                                  : 'All free slots used'}
                              </span>
                            </div>
                            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{freeSlotsUsed}/{freeAddonCount} used</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: freeAddonCount }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="h-2 rounded-full flex-1"
                                style={{ backgroundColor: i < freeSlotsUsed ? 'var(--emerald-600)' : 'var(--gray-300)' }}
                                initial={false}
                                animate={{
                                  backgroundColor: i < freeSlotsUsed ? '#059669' : '#D1D5DB',
                                  scale: i === freeSlotsUsed - 1 && freeSlotsUsed > 0 ? [1, 1.15, 1] : 1,
                                }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              />
                            ))}
                            {paidAddonCount > 0 && (
                              <div className="flex items-center gap-1 ml-1">
                                {Array.from({ length: Math.min(paidAddonCount, 5) }).map((_, i) => (
                                  <motion.div
                                    key={`paid-${i}`}
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: '#3B82F6' }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.05, duration: 0.2 }}
                                  />
                                ))}
                                {paidAddonCount > 5 && (
                                  <span className="text-[10px] ml-0.5" style={{ color: '#2563EB', fontWeight: 500 }}>+{paidAddonCount - 5}</span>
                                )}
                              </div>
                            )}
                          </div>
                          {paidAddonCount > 0 && (
                            <p className="text-[11px] mt-2" style={{ color: '#1E40AF' }}>
                              +{paidAddonCount} paid add-on{paidAddonCount !== 1 ? 's' : ''} at £7/mo each = <span style={{ fontWeight: 600 }}>£{addonCost}/mo</span>
                            </p>
                          )}
                        </motion.div>
                      </div>
                    )}

                    {/* Section Header */}
                    <div className="px-6 pt-3 pb-1">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} style={{ color: 'var(--brand-primary-navy)' }} />
                        <p className="text-xs tracking-wide" style={{ fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>TOOLKIT+ ADD-ONS</p>
                      </div>
                      <p className="text-[11px] mt-1 ml-5" style={{ color: 'var(--text-muted)' }}>£7/month each — cancel individually anytime</p>
                    </div>

                    {/* Category Filter */}
                    <div className="px-6 pt-3 pb-2">
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
                        {addonCategories.map(cat => (
                          <motion.button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className="px-3.5 py-2 rounded-full text-xs whitespace-nowrap border transition-all"
                            style={{
                              backgroundColor: activeCategory === cat.id ? 'var(--brand-primary-navy)' : 'var(--background-surface)',
                              color: activeCategory === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
                              borderColor: activeCategory === cat.id ? 'var(--brand-primary-navy)' : 'var(--gray-300)',
                              fontWeight: activeCategory === cat.id ? 600 : 400,
                            }}
                            variants={buttonPress}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                          >
                            {cat.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Add-ons List */}
                    <motion.div
                      className="px-6 py-4 space-y-3 pb-28"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {filteredAddons.map((addon, index) => {
                        const AddonIcon = addonIconMap[addon.icon] || Target;
                        const isActive = selectedAddons.includes(addon.id);
                        const isFree = isActive && freeAddonIds.has(addon.id);
                        const wouldBeFree = !isActive && freeAddonCount > 0 && selectedAddons.length < freeAddonCount;

                        return (
                          <motion.button
                            key={addon.id}
                            onClick={() => handleToggleAddon(addon.id)}
                            className="w-full text-left rounded-2xl p-4 border-2 transition-all"
                            style={{
                              borderColor: isActive ? (isFree ? '#34D399' : 'var(--brand-blue)') : 'var(--gray-100)',
                              backgroundColor: isActive ? (isFree ? 'rgba(236, 253, 245, 0.5)' : 'rgba(235, 240, 248, 0.5)') : 'var(--background-surface)',
                              boxShadow: isActive
                                ? (isFree ? '0px 2px 12px rgba(5, 150, 105, 0.08)' : '0px 2px 12px rgba(0, 65, 173, 0.08)')
                                : '0px 1px 4px rgba(0, 0, 0, 0.04)',
                            }}
                            variants={fadeInUp}
                            custom={index}
                            whileTap={{ scale: 0.98 }}
                            transition={{ scale: { duration: 0.12 } }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: addon.iconBg }}
                              >
                                <AddonIcon size={20} style={{ color: addon.iconColor }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-sm" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{addon.name}</p>
                                  {isActive && isFree && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#D1FAE5', color: 'var(--emerald-700)', fontWeight: 600 }}>FREE</span>
                                  )}
                                  {isActive && !isFree && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--blue-100)', color: 'var(--brand-blue)', fontWeight: 600 }}>£7/mo</span>
                                  )}
                                  {!isActive && wouldBeFree && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--emerald-50)', color: 'var(--emerald-600)', border: '1px solid #A7F3D0', fontWeight: 500 }}>Free slot</span>
                                  )}
                                  {!isActive && !wouldBeFree && freeAddonCount > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--text-muted)', border: '1px solid var(--gray-300)', fontWeight: 500 }}>£7/mo</span>
                                  )}
                                </div>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{addon.description}</p>
                              </div>
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                                style={{
                                  backgroundColor: isActive ? (isFree ? 'var(--emerald-600)' : 'var(--brand-blue)') : 'transparent',
                                  border: isActive ? 'none' : '2px solid var(--gray-300)',
                                }}
                              >
                                {isActive && <Check size={14} className="text-white" strokeWidth={3} />}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>

                    {/* Sticky Bottom */}
                    <div className="sticky bottom-0 bg-white px-6 py-4 space-y-3" style={{ borderTop: '1px solid var(--divider)' }}>
                      {selectedAddons.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {selectedAddons.length} add-on{selectedAddons.length !== 1 ? 's' : ''}
                            {freeAddonCount > 0 && selectedAddons.length > 0 && (
                              <span className="ml-1" style={{ color: 'var(--emerald-600)' }}>
                                ({Math.min(selectedAddons.length, freeAddonCount)} free)
                              </span>
                            )}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {addonCost > 0 ? `+£${addonCost}/mo` : 'Included'}
                          </span>
                        </div>
                      )}
                      <motion.button
                        onClick={handleConfirm}
                        className="w-full py-3.5 rounded-full text-white flex items-center justify-center gap-2 transition"
                        style={{ backgroundColor: 'var(--brand-primary-navy)' }}
                        variants={buttonPress}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <span>
                          {selectedAddons.length > 0
                            ? `Review plan + ${selectedAddons.length} add-on${selectedAddons.length !== 1 ? 's' : ''}`
                            : 'Continue without add-ons'}
                        </span>
                        <ArrowRight size={18} />
                      </motion.button>
                      {selectedAddons.length === 0 && (
                        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>You can always add these later from Settings</p>
                      )}
                    </div>
                  </motion.div>

                ) : (
                  /* ======================== STEP 3: Confirm ======================== */
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full overflow-y-auto flex flex-col"
                  >
                    {/* Header */}
                    <div className="px-6 py-4 border-b sticky top-0 bg-white z-10" style={{ borderColor: 'var(--divider)' }}>
                      <div className="flex items-center gap-3 mb-1">
                        <motion.button
                          onClick={() => setStep(2)}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition"
                          style={{ backgroundColor: 'var(--gray-100)', color: 'var(--text-secondary)' }}
                          variants={buttonPress}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <ArrowLeft size={16} />
                        </motion.button>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: 'var(--brand-primary-navy)', fontWeight: 600 }}>3</div>
                          <h2 style={{ color: 'var(--text-primary)' }}>Confirm your subscription</h2>
                        </div>
                      </div>
                      <p className="text-xs mt-2 ml-11" style={{ color: 'var(--text-muted)' }}>Review your monthly charges</p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="px-6 pt-5 pb-4 flex-1 flex flex-col">
                      <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--gray-100)' }}>
                        {/* Plan Line */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--blue-50)' }}>
                              {chosenPlan && (() => {
                                const PlanIcon = chosenPlan.icon;
                                return <PlanIcon size={16} style={{ color: 'var(--brand-primary-navy)' }} />;
                              })()}
                            </div>
                            <p className="text-sm" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{chosenPlan?.name} plan</p>
                          </div>
                          <span className="text-sm" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>£{chosenPlan?.price}/mo</span>
                        </div>

                        {/* Add-on Lines */}
                        {selectedAddons.length > 0 && (
                          <>
                            <div className="h-px" style={{ backgroundColor: 'var(--gray-300)' }} />
                            {selectedAddons.map(addonId => {
                              const addon = toolkitAddons.find(a => a.id === addonId);
                              if (!addon) return null;
                              const AddonIcon = addonIconMap[addon.icon] || Target;
                              const isFree = freeAddonIds.has(addonId);

                              return (
                                <div key={addonId} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: addon.iconBg }}>
                                      <AddonIcon size={14} style={{ color: addon.iconColor }} />
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{addon.name}</p>
                                  </div>
                                  <span className="text-sm" style={{ color: isFree ? 'var(--emerald-600)' : 'var(--text-secondary)', fontWeight: isFree ? 600 : 500 }}>
                                    {isFree ? 'Free' : '£7/mo'}
                                  </span>
                                </div>
                              );
                            })}
                          </>
                        )}

                        {/* Total */}
                        <div className="h-px" style={{ backgroundColor: 'var(--gray-300)' }} />
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Monthly total</span>
                          <motion.span
                            style={{ fontSize: '22px', fontWeight: 700, color: 'var(--brand-primary-navy)' }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          >
                            £<CountUpPrice target={(chosenPlan?.price || 0) + addonCost} duration={900} />/mo
                          </motion.span>
                        </div>
                      </div>

                      {/* Reassurance */}
                      <div className="mt-5 space-y-3">
                        {freeAddonCount > 0 && selectedAddons.length > 0 && (
                          <motion.div
                            className="flex items-center gap-2.5 p-3 rounded-xl"
                            style={{ backgroundColor: 'var(--emerald-50)', border: '1px solid #A7F3D0' }}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                          >
                            <Sparkles size={14} style={{ color: 'var(--emerald-600)' }} />
                            <p className="text-xs" style={{ color: '#065F46' }}>
                              You're saving <span style={{ fontWeight: 600 }}>£{Math.min(selectedAddons.length, freeAddonCount) * 7}/mo</span> with {Math.min(selectedAddons.length, freeAddonCount)} free add-on{Math.min(selectedAddons.length, freeAddonCount) !== 1 ? 's' : ''}
                            </p>
                          </motion.div>
                        )}
                        <motion.div
                          className="flex items-start gap-2.5 p-3 rounded-xl"
                          style={{ backgroundColor: 'var(--gray-100)' }}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                        >
                          <ShieldCheck size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            Cancel or change your plan anytime from Settings. No lock-in, no exit fees.
                          </p>
                        </motion.div>
                      </div>
                    </div>

                    {/* Sticky Bottom — Consent + Actions */}
                    <div className="sticky bottom-0 bg-white px-6 py-4 space-y-3 z-10" style={{ borderTop: '1px solid var(--divider)' }}>
                      <div className="space-y-2.5">
                        <p className="text-[11px]" style={{ fontWeight: 600, letterSpacing: '0.02em', color: 'var(--text-muted)' }}>Please confirm to continue:</p>
                        {[
                          { key: 'terms' as const, label: 'I agree to the Terms & Conditions' },
                          { key: 'billing' as const, label: 'I consent to recurring monthly billing' },
                          { key: 'cancellation' as const, label: 'I can cancel anytime with no exit fees' },
                        ].map(item => (
                          <button
                            key={item.key}
                            onClick={() => setConsents(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                            className="flex items-center gap-2.5 w-full text-left"
                          >
                            <div
                              className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-all"
                              style={{
                                backgroundColor: consents[item.key] ? 'var(--emerald-600)' : 'transparent',
                                border: consents[item.key] ? 'none' : '2px solid var(--gray-300)',
                              }}
                            >
                              {consents[item.key] && <Check size={11} className="text-white" strokeWidth={3} />}
                            </div>
                            <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                          </button>
                        ))}
                      </div>

                      <motion.button
                        onClick={handleFinalConfirm}
                        disabled={isConfirming || !consents.terms || !consents.billing || !consents.cancellation}
                        className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: isConfirming
                            ? 'var(--brand-primary-navy)'
                            : (consents.terms && consents.billing && consents.cancellation)
                              ? 'linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-primary-navy) 100%)'
                              : 'var(--gray-300)',
                          color: (consents.terms && consents.billing && consents.cancellation) || isConfirming ? '#FFFFFF' : '#9CA3AF',
                          opacity: isConfirming ? 0.8 : 1,
                          boxShadow: (consents.terms && consents.billing && consents.cancellation) ? '0 4px 16px rgba(0, 65, 173, 0.25)' : 'none',
                        }}
                        variants={buttonPress}
                        initial="initial"
                        whileHover={!isConfirming ? 'hover' : 'initial'}
                        whileTap={!isConfirming ? 'tap' : 'initial'}
                      >
                        {isConfirming ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Setting up your account...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={18} />
                            <span style={{ fontWeight: 600 }}>Agree & Confirm</span>
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => setStep(2)}
                        disabled={isConfirming}
                        className="w-full py-2.5 rounded-full transition text-sm"
                        style={{
                          backgroundColor: 'var(--gray-100)',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                          opacity: isConfirming ? 0.5 : 1,
                        }}
                        variants={buttonPress}
                        initial="initial"
                        whileHover={!isConfirming ? 'hover' : 'initial'}
                        whileTap={!isConfirming ? 'tap' : 'initial'}
                      >
                        Go back & edit
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
