import { useState } from 'react';
import { Users, User, Check, ShieldCheck } from 'lucide-react';
import { StickyFooter } from './StickyFooter';

interface ScreenAuthorityConfirmationProps {
  companyName: string;
  directorCount: number;
  onContinue: (authorityType: 'sole_director' | 'multi_director', boardResUploaded: boolean) => void;
  /** Pre-populate selection when navigating back */
  initialAuthorityType?: 'sole_director' | 'multi_director' | null;
}

export function ScreenAuthorityConfirmation({ companyName, directorCount, onContinue, initialAuthorityType }: ScreenAuthorityConfirmationProps) {
  const [selectedType, setSelectedType] = useState<'sole_director' | 'multi_director' | null>(initialAuthorityType ?? null);
  const [declared, setDeclared] = useState(!!initialAuthorityType);

  const canContinue = declared && selectedType !== null;

  const handleContinue = () => {
    if (!canContinue || !selectedType) return;
    onContinue(selectedType, false);
  };

  const options: { id: 'sole_director' | 'multi_director'; icon: typeof User; label: string; supporting: string }[] = [
    {
      id: 'sole_director',
      icon: User,
      label: 'Just me',
      supporting: "I'll be the only person with access to this account.",
    },
    {
      id: 'multi_director',
      icon: Users,
      label: 'Multiple people',
      supporting: 'Add directors and team members who need account access in the next step.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-[var(--text-primary)]">Set up account access</h2>
        <p className="text-[var(--text-secondary)]">
          We've found {directorCount} directors for {companyName}.
          Choose how you'd like to manage access to this account.
        </p>
      </div>

      {/* UBO/PSC disclosure */}
      <div className="bg-[var(--blue-50)] border border-[var(--accent-primary)]/15 rounded-[var(--radius-md)] p-3 flex items-start gap-3">
        <ShieldCheck size={16} className="text-[var(--accent-primary)] mt-0.5 shrink-0" />
        <div>
          <p className="text-[var(--text-primary)]" style={{ fontSize: '13px', fontWeight: 600 }}>
            Beneficial ownership confirmed
          </p>
          <p className="text-[var(--text-secondary)]" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
            {directorCount} directors and persons of significant control identified via Companies House. All authorised users will undergo KYC, AML and sanctions screening.
          </p>
        </div>
      </div>

      {/* Authority type selection */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedType === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => setSelectedType(option.id)}
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
                <h3 className="text-[var(--text-primary)]">{option.label}</h3>
                <p className="text-[var(--text-secondary)] mt-0.5" style={{ fontSize: '13px', lineHeight: '16px' }}>
                  {option.supporting}
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
          I confirm I'm authorised to access and manage this account on behalf of {companyName}.
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
    </div>
  );
}
