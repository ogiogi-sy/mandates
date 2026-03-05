import { ArrowDown, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TeamMember } from './types';

interface PaymentFlowPreviewProps {
  teamMembers: TeamMember[];
  approvalRule: 'any_one' | 'two_required' | 'threshold' | null;
  thresholdAmount: number | null;
  primarySignatoryName: string;
}

interface FlowPerson {
  id: string;
  name: string;
  initials: string;
  canInitiate: boolean;
  canApprove: boolean;
  color: string;
}

const AVATAR_COLORS = [
  'var(--brand-primary-navy)',
  'var(--accent-primary)',
  'var(--emerald-700)',
  'var(--purple-600)',
  'var(--amber-600)',
  'var(--brand-red)',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function Avatar({ person, size = 32 }: { person: FlowPerson; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: person.color,
        fontFamily: 'var(--font-family)',
        fontSize: size * 0.38,
        fontWeight: 700,
        color: 'var(--text-on-dark)',
        letterSpacing: '0.02em',
      }}
      title={person.name}
    >
      {person.initials}
    </div>
  );
}

function AvatarStack({ people, size = 28 }: { people: FlowPerson[]; size?: number }) {
  if (people.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full border-2 border-dashed"
        style={{
          width: size,
          height: size,
          borderColor: 'var(--text-muted)',
        }}
      >
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>—</span>
      </div>
    );
  }

  return (
    <div className="flex items-center" style={{ paddingLeft: people.length > 1 ? 4 : 0 }}>
      {people.map((person, i) => (
        <div
          key={person.id}
          style={{ marginLeft: i > 0 ? -8 : 0, zIndex: people.length - i }}
        >
          <div
            className="flex items-center justify-center rounded-full ring-2 ring-[var(--background-surface)]"
            style={{
              width: size,
              height: size,
              backgroundColor: person.color,
              fontFamily: 'var(--font-family)',
              fontSize: size * 0.38,
              fontWeight: 700,
              color: 'var(--text-on-dark)',
              letterSpacing: '0.02em',
            }}
            title={person.name}
          >
            {person.initials}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PaymentFlowPreview({
  teamMembers,
  approvalRule,
  thresholdAmount,
  primarySignatoryName,
}: PaymentFlowPreviewProps) {
  // Build the people list from team members + primary signatory
  const people: FlowPerson[] = [];

  // Always include the primary signatory
  const primaryExists = teamMembers.some(
    m => m.name === primarySignatoryName
  );

  if (!primaryExists) {
    people.push({
      id: 'primary',
      name: primarySignatoryName,
      initials: getInitials(primarySignatoryName),
      canInitiate: true,
      canApprove: true,
      color: AVATAR_COLORS[0],
    });
  }

  teamMembers.forEach((m, i) => {
    const colorIndex = primaryExists ? i : i + 1;
    people.push({
      id: m.id,
      name: m.name,
      initials: getInitials(m.name),
      canInitiate: m.permissions.initiatePayments,
      canApprove: m.permissions.approvePayments,
      color: AVATAR_COLORS[colorIndex % AVATAR_COLORS.length],
    });
  });

  const initiators = people.filter(p => p.canInitiate);
  const approvers = people.filter(p => p.canApprove);

  // Determine the rule description for the middle step
  const getRuleText = () => {
    switch (approvalRule) {
      case 'any_one':
        return 'Single approval';
      case 'two_required':
        return 'Dual approval required';
      case 'threshold': {
        const amt = thresholdAmount
          ? new Intl.NumberFormat('en-GB', {
              style: 'currency',
              currency: 'GBP',
              maximumFractionDigits: 0,
            }).format(thresholdAmount)
          : '£5,000';
        return `Dual above ${amt}`;
      }
      default:
        return 'Single approval';
    }
  };

  const steps = [
    {
      id: 'initiate',
      icon: Send,
      label: 'Payment initiated',
      people: initiators,
      sublabel: `${initiators.length} ${initiators.length === 1 ? 'person' : 'people'}`,
    },
    {
      id: 'rule',
      icon: ShieldCheck,
      label: 'Rule triggered',
      people: [], // system step
      sublabel: getRuleText(),
      isSystem: true,
    },
    {
      id: 'approve',
      icon: CheckCircle2,
      label: 'Payment approved',
      people: approvers,
      sublabel: `${approvers.length} ${approvers.length === 1 ? 'approver' : 'approvers'}`,
    },
  ];

  return (
    <div
      className="rounded-[var(--radius-md)] overflow-hidden"
      style={{
        backgroundColor: 'var(--background-surface-soft)',
        padding: 'var(--space-lg)',
      }}
    >
      {/* Label */}
      <p
        className="text-[var(--accent-primary)]"
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-md)',
          fontFamily: 'var(--font-family)',
        }}
      >
        Payment flow preview
      </p>

      {/* Flow steps — vertical flowchart: block → arrow → block → arrow → block */}
      <div className="flex flex-col items-center">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex flex-col items-center w-full">
              {/* Step block — centered card */}
              <div
                className="w-full rounded-[var(--radius-md)] flex flex-col items-center text-center"
                style={{
                  backgroundColor: 'var(--background-surface)',
                  padding: 'var(--space-md) var(--space-lg)',
                  boxShadow: 'var(--shadow-card-sm)',
                }}
              >
                {/* Icon circle */}
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: step.isSystem ? 'var(--blue-50)' : 'var(--emerald-50)',
                    marginBottom: 8,
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      color: step.isSystem ? 'var(--accent-primary)' : 'var(--emerald-600)',
                    }}
                    strokeWidth={2}
                  />
                </div>

                {/* Label */}
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)',
                    lineHeight: '1.3',
                  }}
                >
                  {step.label}
                </p>

                {/* Sublabel / badge */}
                {step.isSystem ? (
                  <span
                    className="inline-flex rounded-[var(--radius-pill)] px-2 py-0.5 mt-1"
                    style={{
                      backgroundColor: 'var(--blue-50)',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                      fontFamily: 'var(--font-family)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.sublabel}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-family)',
                      marginTop: 2,
                    }}
                  >
                    {step.sublabel}
                  </span>
                )}

                {/* Avatars (non-system steps) */}
                {!step.isSystem && step.people.length > 0 && (
                  <div className="mt-2">
                    <AvatarStack people={step.people} size={26} />
                  </div>
                )}
              </div>

              {/* Arrow connector below block (not after last step) */}
              {i < steps.length - 1 && (
                <div className="flex items-center justify-center" style={{ padding: '6px 0' }}>
                  <ArrowDown
                    size={16}
                    style={{ color: 'var(--text-muted)' }}
                    strokeWidth={2}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend: who is who */}
      {people.length > 0 && (
        <div
          className="flex flex-wrap gap-2 mt-3"
          style={{ paddingTop: 'var(--space-sm)' }}
        >
          {people.map(person => (
            <div
              key={person.id}
              className="flex items-center gap-1.5"
              style={{ fontSize: '11px', fontFamily: 'var(--font-family)' }}
            >
              <div
                className="rounded-full shrink-0"
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: person.color,
                }}
              />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                {person.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
