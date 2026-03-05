import { useState } from 'react';
import { Building2, CreditCard, Landmark, ArrowRight, ChevronDown, FlaskConical } from 'lucide-react';
import { StickyFooter } from './StickyFooter';
import Mlogo from '../../imports/Mlogo';

interface ScreenJourneySelectionProps {
  onSelect: (journey: 'optimised' | 'ideal') => void;
}

type ProductId = 'current_account' | 'current_plus_loan' | 'credit_card' | 'loan_only';

interface Product {
  id: ProductId;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Building2;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  disabled: boolean;
}

const products: Product[] = [
  {
    id: 'current_account',
    title: 'Business Current Account',
    subtitle: 'Everyday banking for your business',
    description: 'Free digital banking with instant payments, Open Banking integration, multi-signatory mandates, and real-time notifications.',
    icon: Building2,
    badge: 'Available now',
    badgeColor: 'var(--emerald-700)',
    badgeBg: 'var(--emerald-50)',
    disabled: false,
  },
  {
    id: 'current_plus_loan',
    title: 'Current Account + Business Loan',
    subtitle: 'Banking plus unsecured lending',
    description: 'Everything in the Current Account, plus an unsecured business loan with flexible repayment terms and competitive rates.',
    icon: Landmark,
    badge: 'Coming soon',
    badgeColor: 'var(--amber-600)',
    badgeBg: 'var(--amber-50)',
    disabled: true,
  },
  {
    id: 'loan_only',
    title: 'Business Loan',
    subtitle: 'Standalone unsecured lending',
    description: 'An unsecured business loan without a current account. Flexible terms from £1,000 to £500,000 with fixed monthly repayments.',
    icon: Landmark,
    badge: 'Coming soon',
    badgeColor: 'var(--amber-600)',
    badgeBg: 'var(--amber-50)',
    disabled: true,
  },
  {
    id: 'credit_card',
    title: 'Business Credit Card',
    subtitle: 'Flexible spending for your team',
    description: 'Business credit card with expense controls, virtual cards for employees, cashback rewards, and real-time spend alerts.',
    icon: CreditCard,
    badge: 'Coming soon',
    badgeColor: 'var(--amber-600)',
    badgeBg: 'var(--amber-50)',
    disabled: true,
  },
];

export function ScreenJourneySelection({ onSelect }: ScreenJourneySelectionProps) {
  const [selected, setSelected] = useState<ProductId>('current_account');
  const [showDevToggle, setShowDevToggle] = useState(false);
  const [journeyVariant, setJourneyVariant] = useState<'optimised' | 'ideal'>('optimised');

  const handleContinue = () => {
    if (selected === 'current_account') {
      onSelect(journeyVariant);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: 'var(--font-family)' }}
    >
      {/* Hero Header */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{
          background: 'linear-gradient(180deg, var(--brand-blue) 0%, var(--brand-primary-navy) 100%)',
          padding: 'var(--space-xl) var(--space-xl) var(--space-xxl)',
        }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10 max-w-xl mx-auto">
          {/* Logo */}
          <div
            className="flex items-center justify-center rounded-[var(--radius-lg)] mb-5 backdrop-blur-md"
            style={{
              width: 48,
              height: 48,
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="w-7 h-7 text-[var(--text-on-dark)]">
              <Mlogo />
            </div>
          </div>

          <h1
            style={{
              color: 'var(--text-on-dark)',
              fontWeight: 700,
              fontSize: '26px',
              lineHeight: '1.2',
              marginBottom: 'var(--space-sm)',
              letterSpacing: '-0.01em',
            }}
          >
            Choose a product
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 500,
              fontSize: '15px',
              lineHeight: '1.5',
            }}
          >
            Select the product that best fits your business. You can always add more later.
          </p>
        </div>
      </div>

      {/* Product Cards */}
      <div
        className="flex-1"
        style={{
          backgroundColor: 'var(--background-app)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          marginTop: '-16px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          className="max-w-xl mx-auto"
          style={{ padding: 'var(--space-xl) var(--space-xl) 120px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {products.map((product) => {
              const Icon = product.icon;
              const isSelected = selected === product.id;
              const isDisabled = product.disabled;

              return (
                <button
                  key={product.id}
                  onClick={() => {
                    if (!isDisabled) setSelected(product.id);
                  }}
                  disabled={isDisabled}
                  className="text-left w-full transition-all"
                  style={{
                    backgroundColor: 'var(--background-surface)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-xl)',
                    border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'}`,
                    boxShadow: isSelected ? '0 0 0 3px rgba(0, 65, 173, 0.08), var(--shadow-card)' : 'var(--shadow-card-sm)',
                    opacity: isDisabled ? 0.65 : 1,
                    cursor: isDisabled ? 'default' : 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Disabled overlay shimmer */}
                  {isDisabled && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, transparent 60%, rgba(255,255,255,0.4) 100%)',
                      }}
                    />
                  )}

                  <div className="flex gap-4 items-start">
                    {/* Icon */}
                    <div
                      className="shrink-0 flex items-center justify-center rounded-[var(--radius-md)]"
                      style={{
                        width: 44,
                        height: 44,
                        backgroundColor: isSelected ? 'var(--blue-50)' : 'var(--background-surface-soft)',
                      }}
                    >
                      <Icon
                        size={22}
                        style={{
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                        }}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3
                          style={{
                            fontWeight: 700,
                            fontSize: '16px',
                            color: isDisabled ? 'var(--text-muted)' : 'var(--text-primary)',
                            lineHeight: '1.3',
                          }}
                        >
                          {product.title}
                        </h3>
                        {product.badge && (
                          <span
                            className="shrink-0 rounded-[var(--radius-pill)]"
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: product.badgeColor,
                              backgroundColor: product.badgeBg,
                              padding: '2px 8px',
                            }}
                          >
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {/* Subtitle */}
                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--text-secondary)',
                          marginBottom: 'var(--space-sm)',
                        }}
                      >
                        {product.subtitle}
                      </p>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: 400,
                          color: 'var(--text-muted)',
                          lineHeight: '1.5',
                        }}
                      >
                        {product.description}
                      </p>
                    </div>

                    {/* Selection radio */}
                    {!isDisabled && (
                      <div
                        className="shrink-0 flex items-center justify-center rounded-full mt-1"
                        style={{
                          width: 22,
                          height: 22,
                          border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--gray-300)'}`,
                          backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isSelected && (
                          <div
                            className="rounded-full"
                            style={{
                              width: 8,
                              height: 8,
                              backgroundColor: 'var(--text-on-dark)',
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dev toggle — nearly hidden, for internal use */}
          <div className="mt-6">
            <button
              onClick={() => setShowDevToggle(!showDevToggle)}
              className="flex items-center gap-1.5 mx-auto"
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-xs) var(--space-sm)',
                borderRadius: 'var(--radius-pill)',
                opacity: 0.5,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
            >
              <FlaskConical size={12} />
              Flow variant
              <ChevronDown
                size={12}
                style={{
                  transform: showDevToggle ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>

            {showDevToggle && (
              <div
                className="mx-auto mt-2 rounded-[var(--radius-md)] flex overflow-hidden"
                style={{
                  maxWidth: 280,
                  border: '1px solid var(--divider)',
                  backgroundColor: 'var(--background-surface)',
                }}
              >
                {(['optimised', 'ideal'] as const).map((variant) => (
                  <button
                    key={variant}
                    onClick={() => setJourneyVariant(variant)}
                    className="flex-1 text-center transition-all"
                    style={{
                      padding: 'var(--space-sm) var(--space-md)',
                      fontSize: '12px',
                      fontWeight: journeyVariant === variant ? 700 : 500,
                      color: journeyVariant === variant ? 'var(--text-on-dark)' : 'var(--text-secondary)',
                      backgroundColor: journeyVariant === variant ? 'var(--accent-primary)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {variant === 'optimised' ? 'Optimised' : 'Ideal'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <StickyFooter>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <button
            onClick={handleContinue}
            disabled={selected !== 'current_account'}
            className="w-full flex items-center justify-center gap-2 transition-all"
            style={{
              height: 48,
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '16px',
              fontFamily: 'var(--font-family)',
              backgroundColor: selected === 'current_account' ? 'var(--brand-primary-navy)' : 'var(--divider)',
              color: selected === 'current_account' ? 'var(--text-on-dark)' : 'var(--text-muted)',
              border: 'none',
              cursor: selected === 'current_account' ? 'pointer' : 'not-allowed',
              boxShadow: selected === 'current_account' ? 'var(--shadow-card-lg)' : 'none',
            }}
          >
            Get started
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>

          <div className="text-center">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400 }}>
              Already have an account?{' '}
              <button
                style={{
                  fontWeight: 700,
                  color: 'var(--brand-primary-navy)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-family)',
                }}
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </StickyFooter>
    </div>
  );
}