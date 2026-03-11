import { ArrowLeft, FileText, ShieldCheck, UserCheck, Check, Smartphone } from 'lucide-react';

interface ScreenSecondDirectorPreviewProps {
  directorName?: string;
  companyName?: string;
  onBack: () => void;
}

export function ScreenSecondDirectorPreview({
  directorName = 'James Carter',
  companyName = 'Bright Hospitality Ltd',
  onBack,
}: ScreenSecondDirectorPreviewProps) {
  const steps = [
    {
      icon: <Smartphone size={20} />,
      title: 'Receive invite',
      description: `${directorName} gets an email and SMS with a link to sign in.`,
    },
    {
      icon: <UserCheck size={20} />,
      title: 'Verify identity',
      description: 'Complete ID verification with a passport or driving licence.',
    },
    {
      icon: <FileText size={20} />,
      title: 'Review mandate',
      description: 'Read and accept the mandate terms, including approval rules and payment permissions.',
    },
    {
      icon: <ShieldCheck size={20} />,
      title: 'Account fully active',
      description: 'Once verified, the account moves to fully active with all payment limits unlocked.',
    },
  ];

  return (
    <div className="fixed inset-0 bg-[var(--background-app)] z-50 overflow-y-auto">
      <div className="px-6 pt-12 pb-8">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[var(--accent-primary)] mb-6"
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </button>

        <div className="mb-8">
          <h2 className="text-[var(--brand-primary-navy)] mb-2" style={{ fontSize: '24px', fontWeight: 700 }}>
            Second signatory journey
          </h2>
          <p className="text-[var(--text-secondary)]" style={{ fontSize: '15px', fontWeight: 400 }}>
            Here's what {directorName} will see when they sign in for the first time.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-0">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--blue-50)] text-[var(--accent-primary)] flex items-center justify-center shrink-0">
                  {step.icon}
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-[var(--divider)] my-1" />
                )}
              </div>

              {/* Content */}
              <div className="pb-6">
                <p className="text-[var(--text-primary)]" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                  {step.title}
                </p>
                <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '20px' }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Info card */}
        <div className="mt-6 bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--emerald-50)] text-[var(--emerald-600)] flex items-center justify-center shrink-0 mt-0.5">
              <Check size={16} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[var(--text-primary)]" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>
                No action needed from you
              </p>
              <p className="text-[var(--text-secondary)]" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '18px' }}>
                We'll send the invite automatically. You'll be notified when {directorName} has verified and accepted the mandate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
