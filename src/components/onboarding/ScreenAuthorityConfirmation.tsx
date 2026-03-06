import { useState, useEffect, useRef } from 'react';
import { User, Users, ChevronRight, Upload, Check, X, FileText, ShieldCheck } from 'lucide-react';
import { StickyFooter } from './StickyFooter';
import { motion, AnimatePresence } from 'motion/react';

interface ScreenAuthorityConfirmationProps {
  companyName: string;
  directorCount: number;
  onContinue: (authorityType: 'sole_director' | 'multi_director' | 'board_authorised', boardResUploaded: boolean) => void;
  /** Pre-populate selection when navigating back */
  initialAuthorityType?: 'sole_director' | 'multi_director' | 'board_authorised' | null;
}

export function ScreenAuthorityConfirmation({ companyName, directorCount, onContinue, initialAuthorityType }: ScreenAuthorityConfirmationProps) {
  const mapInitial = (type: typeof initialAuthorityType): 'sole' | 'multi' | null => {
    if (type === 'sole_director') return 'sole';
    if (type === 'multi_director' || type === 'board_authorised') return 'multi';
    return null;
  };
  const [selected, setSelected] = useState<'sole' | 'multi' | null>(mapInitial(initialAuthorityType ?? null));
  const [declared, setDeclared] = useState(!!initialAuthorityType);
  const [showBoardSheet, setShowBoardSheet] = useState(false);
  const [boardFile, setBoardFile] = useState<string | null>(null);
  const [boardDeclared, setBoardDeclared] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Focus trap + Escape key for bottom sheet
  useEffect(() => {
    if (!showBoardSheet) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowBoardSheet(false);
        return;
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    // Focus first focusable element on open
    requestAnimationFrame(() => {
      const first = sheetRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    });
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showBoardSheet]);

  const canContinue = selected !== null && declared;

  const handleContinue = () => {
    if (!canContinue) return;
    const type = selected === 'sole' ? 'sole_director' : 'multi_director';
    onContinue(type, false);
  };

  const handleBoardContinue = () => {
    setShowBoardSheet(false);
    onContinue('board_authorised', !!boardFile);
  };

  const handleBoardSkip = () => {
    setShowBoardSheet(false);
    // Proceed as multi-director but flag for RM review
    onContinue('multi_director', false);
  };

  const cards = [
    {
      id: 'sole' as const,
      icon: User,
      label: "I'm the sole director",
      supporting: "You'll have full control of the account.",
    },
    {
      id: 'multi' as const,
      icon: Users,
      label: "I'm one of several directors",
      supporting: "We'll help you set up shared access.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-[var(--text-primary)]">Who's authorised to manage this account?</h2>
        <p className="text-[var(--text-secondary)]">
          We've found {directorCount} director{directorCount !== 1 ? 's' : ''} for {companyName}.
          Let us know how your business manages account access.
        </p>
      </div>

      {/* Selection Cards */}
      <div className="space-y-3">
        {/* UBO/PSC disclosure — Gap 3 */}
        <div className="bg-[var(--blue-50)] border border-[var(--accent-primary)]/15 rounded-[var(--radius-md)] p-3 flex items-start gap-3">
          <ShieldCheck size={16} className="text-[var(--accent-primary)] mt-0.5 shrink-0" />
          <div>
            <p className="text-[var(--text-primary)]" style={{ fontSize: '13px', fontWeight: 600 }}>
              Beneficial ownership confirmed
            </p>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
              {directorCount} director{directorCount !== 1 ? 's' : ''} and persons of significant control identified via Companies House. All authorised users will undergo KYC, AML and sanctions screening.
            </p>
          </div>
        </div>

        {cards.map((card) => {
          const isSelected = selected === card.id;
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => setSelected(card.id)}
              className={`
                w-full p-5 rounded-[var(--radius-lg)] bg-[var(--background-surface)] text-left 
                flex items-center gap-4 transition-all
                ${isSelected
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
              </div>
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                ${isSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]' : 'border-[var(--divider)]'}
              `}>
                {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Board authorisation link — min 44px touch target */}
      <button
        onClick={() => setShowBoardSheet(true)}
        className="text-[var(--accent-primary)] flex items-center gap-1 hover:opacity-80 transition-opacity min-h-[44px] py-2"
        style={{ fontSize: '13px', lineHeight: '16px', fontWeight: 500 }}
      >
        Acting on behalf of the board?
        <ChevronRight size={14} />
      </button>

      {/* Declaration checkbox */}
      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-[var(--radius-md)] bg-[var(--background-surface)] border border-[var(--divider)]">
        <div className="mt-0.5 relative">
          <input
            type="checkbox"
            checked={declared}
            onChange={() => setDeclared(!declared)}
            className="peer sr-only"
          />
          <div className={`
            w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all
            peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-primary)] peer-focus-visible:ring-offset-2
            ${declared
              ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
              : 'bg-white border-[var(--text-muted)]'}
          `}>
            {declared && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
        </div>
        <span className="text-[var(--text-secondary)]" style={{ fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
          I confirm I'm authorised to open and manage this account on behalf of {companyName}.
        </span>
      </label>

      {/* Continue */}
      <StickyFooter>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`
            w-full h-[48px] rounded-[var(--radius-pill)] transition-all flex items-center justify-center gap-2
            ${canContinue
              ? 'bg-[var(--brand-primary-navy)] text-white hover:opacity-90 shadow-[var(--shadow-card-lg)]'
              : 'bg-[var(--divider)] text-[var(--text-muted)] cursor-not-allowed'}
          `}
        >
          Continue
        </button>
      </StickyFooter>

      {/* Board Authorisation Bottom Sheet */}
      <AnimatePresence>
        {showBoardSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowBoardSheet(false)}
            />
            {/* Sheet */}
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Board authorisation"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[var(--background-surface)] rounded-t-[var(--radius-xl)] z-50 p-6 pb-10 max-h-[80vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-[var(--divider)] rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[var(--text-primary)]">Authorised by the board?</h3>
                <button onClick={() => setShowBoardSheet(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--background-surface-soft)] transition-colors" aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              <p className="mb-6">
                Upload a board resolution confirming you've been authorised to open this account.
              </p>

              {/* Upload area */}
              {!boardFile ? (
                <button
                  onClick={() => setBoardFile('board-resolution.pdf')}
                  className="w-full border-2 border-dashed border-[var(--divider)] rounded-[var(--radius-md)] p-8 flex flex-col items-center gap-3 hover:border-[var(--accent-primary)] hover:bg-[var(--background-surface-soft)] transition-all"
                >
                  <Upload size={24} className="text-[var(--text-muted)]" />
                  <span style={{ fontSize: '13px', fontWeight: 500 }} className="text-[var(--text-secondary)]">
                    Tap to upload (PDF or image)
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-[var(--emerald-50)] border border-[var(--emerald-600)]/20 rounded-[var(--radius-md)] mb-4">
                  <Check size={18} className="text-[var(--emerald-600)]" />
                  <FileText size={18} className="text-[var(--text-secondary)]" />
                  <span className="flex-1 text-[var(--text-primary)]" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {boardFile}
                  </span>
                  <button
                    onClick={() => setBoardFile(null)}
                    className="text-[var(--accent-danger)]"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Board declaration */}
              <label className="flex items-start gap-3 cursor-pointer mt-6 mb-6">
                <div className="mt-0.5 relative shrink-0">
                  <input
                    type="checkbox"
                    checked={boardDeclared}
                    onChange={() => setBoardDeclared(!boardDeclared)}
                    className="peer sr-only"
                  />
                  <div className={`
                    w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all
                    peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-primary)] peer-focus-visible:ring-offset-2
                    ${boardDeclared
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                      : 'bg-white border-[var(--text-muted)]'}
                  `}>
                    {boardDeclared && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
                <span className="text-[var(--text-secondary)]" style={{ fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
                  I confirm I have been authorised by a board resolution to open and manage this account on behalf of {companyName}.
                </span>
              </label>

              <div className="space-y-3">
                <button
                  onClick={handleBoardContinue}
                  disabled={!boardFile || !boardDeclared}
                  className={`
                    w-full h-[48px] rounded-[var(--radius-pill)] transition-all
                    ${boardFile && boardDeclared
                      ? 'bg-[var(--brand-primary-navy)] text-white hover:opacity-90'
                      : 'bg-[var(--divider)] text-[var(--text-muted)] cursor-not-allowed'}
                  `}
                >
                  Continue
                </button>
                <button
                  onClick={handleBoardSkip}
                  className="w-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  style={{ fontSize: '13px', fontWeight: 500, lineHeight: '48px' }}
                >
                  Skip for now — we'll follow up
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}