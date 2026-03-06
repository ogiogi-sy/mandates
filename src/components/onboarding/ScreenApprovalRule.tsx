import { useState } from 'react';
import { Check, CheckCheck, SplitSquareHorizontal, AlertCircle } from 'lucide-react';
import { StickyFooter } from './StickyFooter';
import { motion, AnimatePresence } from 'motion/react';

interface ScreenApprovalRuleProps {
  /** Callback: rule + threshold in pence (minor currency) */
  onContinue: (rule: 'any_one' | 'two_required' | 'threshold', thresholdAmount: number | null) => void;
  defaultThreshold?: number;
  /** If true, sole director — dual-approval options are disabled */
  isSoleDirector?: boolean;
}

const THRESHOLD_OPTIONS = [1000, 5000, 10000, 25000];
const THRESHOLD_MIN = 500;
const THRESHOLD_MAX = 1_000_000;

export function ScreenApprovalRule({ onContinue, defaultThreshold = 5000, isSoleDirector = false }: ScreenApprovalRuleProps) {
  const [selected, setSelected] = useState<'any_one' | 'two_required' | 'threshold' | null>(null);
  const [thresholdChip, setThresholdChip] = useState<number | 'custom'>(defaultThreshold);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [showValidationError, setShowValidationError] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);
  };

  const parseCustomAmount = (raw: string): number | null => {
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  const validateCustomAmount = (raw: string): string | null => {
    const value = parseCustomAmount(raw);
    if (value === null || raw.trim() === '') return null; // empty = no error yet
    if (value < THRESHOLD_MIN) return `Minimum threshold is ${formatCurrency(THRESHOLD_MIN)}`;
    if (value > THRESHOLD_MAX) return `Maximum threshold is ${formatCurrency(THRESHOLD_MAX)}`;
    // Check max 2 decimal places
    const parts = raw.replace(/,/g, '').split('.');
    if (parts.length > 1 && parts[1].length > 2) return 'Maximum 2 decimal places';
    return null;
  };

  const getThresholdValue = (): number | null => {
    if (selected !== 'threshold') return null;
    if (thresholdChip === 'custom') {
      const parsed = parseCustomAmount(customAmount);
      if (parsed === null) return null;
      const error = validateCustomAmount(customAmount);
      if (error) return null;
      // Store as pence (minor currency)
      return Math.round(parsed * 100);
    }
    // Preset options — convert to pence
    return thresholdChip * 100;
  };

  const canContinue = selected !== null && (selected !== 'threshold' || getThresholdValue() !== null);

  const handleContinue = () => {
    if (!selected) {
      setShowValidationError(true);
      return;
    }
    if (!canContinue) return;
    onContinue(selected, getThresholdValue());
  };

  const handleCustomAmountChange = (value: string) => {
    // Allow digits, commas, dots (for decimal)
    const cleaned = value.replace(/[^0-9.,]/g, '');
    setCustomAmount(cleaned);
    const error = validateCustomAmount(cleaned);
    setCustomError(error);
  };

  /** Real-time preview of payment ranges when threshold is selected */
  const renderThresholdPreview = () => {
    if (selected !== 'threshold') return null;
    let displayAmount: number | null = null;
    if (thresholdChip === 'custom') {
      displayAmount = parseCustomAmount(customAmount);
      if (displayAmount !== null && validateCustomAmount(customAmount)) displayAmount = null;
    } else {
      displayAmount = thresholdChip;
    }
    if (!displayAmount) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 rounded-[var(--radius-md)] bg-[var(--blue-50)] border border-[var(--accent-primary)]/15 p-3 space-y-1"
      >
        <p className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          How payments will be approved
        </p>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald-600)]" />
          <span className="text-[var(--text-primary)]" style={{ fontSize: '13px', fontWeight: 500 }}>
            £0 – {formatCurrency(displayAmount)}: <span className="text-[var(--emerald-600)]">1 Director</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          <span className="text-[var(--text-primary)]" style={{ fontSize: '13px', fontWeight: 500 }}>
            Above {formatCurrency(displayAmount)}: <span className="text-[var(--accent-primary)]">2 Directors</span>
          </span>
        </div>
      </motion.div>
    );
  };

  const cards = [
    {
      id: 'any_one' as const,
      icon: Check,
      label: 'Any one director',
      supporting: 'Any authorised director can approve payments independently.',
      disabled: false,
    },
    {
      id: 'two_required' as const,
      icon: CheckCheck,
      label: 'Two directors required',
      supporting: 'All payments need approval from two directors before they go through.',
      disabled: isSoleDirector,
    },
    {
      id: 'threshold' as const,
      icon: SplitSquareHorizontal,
      label: 'Two required above a threshold',
      supporting: 'One director for everyday payments. Two required above a set amount.',
      disabled: isSoleDirector,
    },
  ];

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-[var(--text-primary)]">How should payments be approved?</h2>
        <p className="text-[var(--text-secondary)]">Choose a starting rule. You can adjust this later in the app.</p>
      </div>

      {/* Selection Cards */}
      <div className="space-y-3">
        {cards.map((card) => {
          const isSelected = selected === card.id;
          const Icon = card.icon;
          return (
            <div key={card.id}>
              <button
                onClick={() => {
                  if (card.disabled) return;
                  setSelected(card.id);
                  setShowValidationError(false);
                  if (card.id !== 'threshold') setShowCustom(false);
                }}
                disabled={card.disabled}
                className={`
                  w-full p-5 rounded-[var(--radius-lg)] bg-[var(--background-surface)] text-left
                  flex items-center gap-4 transition-all
                  ${card.disabled
                    ? 'opacity-50 cursor-not-allowed border-2 border-[var(--divider)]'
                    : isSelected
                      ? 'border-2 border-[var(--accent-primary)] shadow-[var(--shadow-card-md)]'
                      : 'border-2 border-[var(--divider)] shadow-[var(--shadow-card-sm)] hover:border-[var(--accent-primary)]'}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors
                  ${isSelected ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--background-surface-soft)] text-[var(--text-primary)]'}
                `}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[var(--text-primary)]">{card.label}</h3>
                  <p className="text-[var(--text-secondary)] mt-0.5" style={{ fontSize: '13px', lineHeight: '16px' }}>
                    {card.supporting}
                  </p>
                  {card.disabled && (
                    <p className="text-[var(--amber-600)] mt-1" style={{ fontSize: '12px', fontWeight: 500 }}>
                      Requires at least two directors on the mandate
                    </p>
                  )}
                </div>
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                  ${isSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]' : 'border-[var(--divider)]'}
                `}>
                  {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
              </button>

              {/* Threshold selector — only when Card 3 is selected */}
              <AnimatePresence>
                {card.id === 'threshold' && isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-5 bg-[var(--background-surface)] border border-[var(--divider)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card-sm)]">
                      <label className="text-[var(--text-secondary)] mb-3 block">
                        Require two approvals for payments over:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {THRESHOLD_OPTIONS.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => { setThresholdChip(amount); setShowCustom(false); setCustomError(null); }}
                            className={`
                              px-4 py-2 rounded-[var(--radius-pill)] transition-all
                              ${thresholdChip === amount
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--background-surface-soft)] text-[var(--text-secondary)] border border-[var(--divider)] hover:border-[var(--accent-primary)]'}
                            `}
                            style={{ fontSize: '13px', fontWeight: 600 }}
                          >
                            {formatCurrency(amount)}
                          </button>
                        ))}
                        <button
                          onClick={() => { setThresholdChip('custom'); setShowCustom(true); }}
                          className={`
                            px-4 py-2 rounded-[var(--radius-pill)] transition-all
                            ${thresholdChip === 'custom'
                              ? 'bg-[var(--accent-primary)] text-white'
                              : 'bg-[var(--background-surface-soft)] text-[var(--text-secondary)] border border-[var(--divider)] hover:border-[var(--accent-primary)]'}
                          `}
                          style={{ fontSize: '13px', fontWeight: 600 }}
                        >
                          Custom
                        </button>
                      </div>

                      {/* Custom input */}
                      <AnimatePresence>
                        {showCustom && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" style={{ fontSize: '16px', fontWeight: 500 }}>
                                £
                              </span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={customAmount}
                                onChange={(e) => handleCustomAmountChange(e.target.value)}
                                placeholder="Enter amount (min £500, max £1,000,000)"
                                className={`w-full h-12 pl-8 pr-4 rounded-[var(--radius-md)] bg-[var(--background-surface-soft)] border outline-none transition-all text-[var(--text-primary)] ${
                                  customError
                                    ? 'border-[var(--accent-danger)] focus:border-[var(--accent-danger)]'
                                    : 'border-transparent focus:bg-white focus:border-[var(--accent-primary)]'
                                }`}
                              />
                              {customError && (
                                <p className="flex items-center gap-1 mt-1 text-[var(--accent-danger)]" style={{ fontSize: '12px', fontWeight: 500 }}>
                                  <AlertCircle size={12} />
                                  {customError}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Real-time preview */}
                      {renderThresholdPreview()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Validation error */}
      <AnimatePresence>
        {showValidationError && !selected && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center justify-center gap-1 text-[var(--accent-danger)]"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            <AlertCircle size={14} />
            Please select an approval model to continue
          </motion.p>
        )}
      </AnimatePresence>

      {/* Reassurance */}
      <p className="text-center text-[var(--text-muted)]" style={{ fontSize: '13px', lineHeight: '16px', fontWeight: 400 }}>
        You can change your approval rules anytime in the app.
      </p>

      {/* Continue */}
      <StickyFooter>
        <button
          onClick={handleContinue}
          className={`
            w-full h-[48px] rounded-[var(--radius-pill)] transition-all flex items-center justify-center
            ${canContinue
              ? 'bg-[var(--brand-primary-navy)] text-white hover:opacity-90 shadow-[var(--shadow-card-lg)]'
              : 'bg-[var(--divider)] text-[var(--text-muted)] cursor-not-allowed'}
          `}
        >
          Continue
        </button>
      </StickyFooter>
    </div>
  );
}
