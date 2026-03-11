import { useState } from 'react';
import { ScreenBusinessQuestionLayout } from './ScreenBusinessQuestionLayout';
import { Check } from 'lucide-react';

interface ScreenQuestionSourceOfWealthProps {
  onNext: (value: string[]) => void;
  onSaveExit: () => void;
}

const OPTIONS = [
  'Trading profits',
  'Property',
  'Investments',
  'Inheritance',
  'Sale of previous business',
  'Other',
];

export function ScreenQuestionSourceOfWealth({ onNext, onSaveExit }: ScreenQuestionSourceOfWealthProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');

  const toggle = (option: string) => {
    setSelected(prev =>
      prev.includes(option)
        ? prev.filter(p => p !== option)
        : [...prev, option]
    );
  };

  const getFinalValues = () => {
    return selected.map(s => s === 'Other' && otherText.trim() ? `Other: ${otherText.trim()}` : s);
  };

  return (
    <ScreenBusinessQuestionLayout
      title="Source of wealth"
      subtitle="Where does the business wealth come from? Select all that apply."
      onNext={() => onNext(getFinalValues())}
      onSaveExit={onSaveExit}
      isValid={selected.length > 0}
    >
      <div className="space-y-3">
        {OPTIONS.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <div key={option}>
              <button
                onClick={() => toggle(option)}
                className={`
                  w-full p-5 rounded-[16px] border text-left flex items-center justify-between transition-all
                  ${isSelected
                    ? 'border-brand-blue bg-[#E5ECF5] shadow-sm'
                    : 'border-divider bg-white hover:border-brand-blue/50'}
                `}
              >
                <span className={`font-bold text-lg ${isSelected ? 'text-brand-navy' : 'text-text-secondary'}`}>
                  {option}
                </span>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center">
                    <Check size={14} className="text-white stroke-[3px]" />
                  </div>
                )}
              </button>
              {option === 'Other' && isSelected && (
                <div className="mt-2 ml-2">
                  <input
                    type="text"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="Tell us more..."
                    className="w-full p-3 rounded-xl border border-divider bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScreenBusinessQuestionLayout>
  );
}
