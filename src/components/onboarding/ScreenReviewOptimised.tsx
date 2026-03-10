import { Check, Pencil, FileText, ChevronRight, CheckCircle2, Shield } from 'lucide-react';
import { OnboardingState } from './types';
import { StickyFooter } from './StickyFooter';

import { useState } from 'react';

interface ScreenReviewOptimisedProps {
  state: OnboardingState;
  onSubmit: () => void;
  onEdit: (step: number) => void;
}

export function ScreenReviewOptimised({ state, onSubmit, onEdit }: ScreenReviewOptimisedProps) {
  const [agreed, setAgreed] = useState(false);

  const getApplicantName = () => {
    const primary = state.directors.find(d => d.isPrimaryHolder);
    return primary?.name || 'Sophie Carter';
  };

  const getApprovalRuleLabel = () => {
    switch (state.mandate.approvalRule) {
      case 'any_one': return 'Any one authorised user';
      case 'two_required': return 'Two directors required for all payments';
      case 'threshold': {
        const amount = state.mandate.thresholdAmount
          ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(state.mandate.thresholdAmount)
          : '£5,000';
        return `Two directors required above ${amount}`;
      }
      default: return 'Any one authorised user';
    }
  };

  const getAuthorityLabel = () => {
    switch (state.mandate.authorityType) {
      case 'sole_director': return 'Sole Director';
      case 'multi_director': return 'Multiple Directors';
      default: return 'Sole Director';
    }
  };

  const isMultiDirector = state.mandate.authorityType === 'multi_director';

  const sections = [
    {
      id: 'company',
      title: 'Company Details',
      step: 3,
      content: (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Name</span>
            <span className="text-[var(--brand-primary-navy)]" style={{ fontWeight: 700 }}>{state.selectedCompany?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Number</span>
            <span className="text-[var(--brand-primary-navy)]" style={{ fontWeight: 700 }}>{state.selectedCompany?.number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Registered Address</span>
            <span className="text-[var(--brand-primary-navy)] text-right max-w-[200px]" style={{ fontWeight: 700 }}>{state.selectedCompany?.address}</span>
          </div>
        </div>
      )
    },
    {
      id: 'address',
      title: 'Trading Address',
      step: 12,
      content: (
        <div className="space-y-3 text-sm">
           <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Type</span>
            <span className="text-[var(--brand-primary-navy)] capitalize" style={{ fontWeight: 700 }}>{state.tradingAddress?.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Address</span>
            <span className="text-[var(--brand-primary-navy)] text-right max-w-[200px] truncate" style={{ fontWeight: 700 }}>
              {state.tradingAddress?.value || 'Same as registered'}
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'people',
      title: 'Directors and shareholders',
      step: 4,
      content: (
        <div className="space-y-3">
          {state.directors.map(d => (
            <div key={d.id} className="text-sm border-b border-[var(--divider)] last:border-0 pb-3 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                   <p className="text-[var(--brand-primary-navy)]" style={{ fontWeight: 700 }}>{d.name}</p>
                   <p className="text-[var(--text-secondary)]" style={{ fontSize: '12px' }}>{d.role}</p>
                </div>
                <div className="flex items-center gap-1 bg-[var(--emerald-50)] text-[var(--emerald-600)] px-2 py-0.5 rounded-[var(--radius-pill)]" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <Check size={10} strokeWidth={4} />
                  Verified
                </div>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-[var(--divider)]">
             <div className="flex items-center gap-2 text-[var(--brand-primary-navy)] text-sm" style={{ fontWeight: 700 }}>
               <div className="w-5 h-5 bg-[var(--emerald-50)] rounded-full flex items-center justify-center text-[var(--emerald-600)]">
                 <Check size={12} strokeWidth={3} />
               </div>
               ID Verified (Passport)
             </div>
          </div>
        </div>
      )
    },
    {
      id: 'access',
      title: 'Account Access',
      step: 6,
      content: (
        <div className="space-y-[var(--space-lg)]">
          {/* Primary Signatory */}
          <div>
            <p className="text-[var(--accent-primary)]" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Primary Signatory
            </p>
            <p className="text-[var(--text-primary)]" style={{ fontSize: '15px', fontWeight: 600 }}>
              {getApplicantName()}
            </p>
          </div>

          {/* Authority Type */}
          <div>
            <p className="text-[var(--accent-primary)]" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Authority
            </p>
            <p className="text-[var(--text-primary)]" style={{ fontSize: '15px', fontWeight: 600 }}>
              {getAuthorityLabel()}
            </p>
          </div>

          {/* Approval Rule — editable card matching reference image */}
          <div>
            <p className="text-[var(--accent-primary)]" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>
              Payment approval rule
            </p>
            <div
              className="rounded-[var(--radius-md)]"
              style={{
                backgroundColor: 'var(--background-surface)',
                border: '1px solid var(--divider)',
                padding: 'var(--space-md) var(--space-lg)',
              }}
            >
              <p className="text-[var(--text-primary)]" style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', fontFamily: 'var(--font-family)' }}>
                {getApprovalRuleLabel()}
              </p>
              <button
                onClick={() => onEdit(7)}
                className="flex items-center gap-0.5 cursor-pointer"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                  fontFamily: 'var(--font-family)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                Edit rule
                <ChevronRight size={14} style={{ color: 'var(--accent-primary)' }} />
              </button>
            </div>
          </div>

          {/* Team Members — only shown if multi-director with members */}
          {isMultiDirector && state.mandate.teamMembers.length > 0 && (
            <div>
              <p className="text-[var(--accent-primary)]" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Authorised Persons
              </p>
              <div className="space-y-2">
                {state.mandate.teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-[var(--text-primary)]" style={{ fontSize: '14px', fontWeight: 600 }}>{member.name}</p>
                      <p className="text-[var(--text-muted)]" style={{ fontSize: '12px', fontWeight: 400 }}>
                        {member.role === 'director' ? 'Director' : member.role === 'finance_manager' ? 'Finance Manager' : member.role === 'accountant' ? 'Accountant' : member.role}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-[var(--radius-pill)] ${
                        member.status === 'verified'
                          ? 'bg-[var(--emerald-50)] text-[var(--emerald-600)]'
                          : member.status === 'invited' || member.status === 'verifying'
                          ? 'bg-[var(--amber-50)] text-[var(--amber-600)]'
                          : 'bg-[var(--background-surface-soft)] text-[var(--text-muted)]'
                      }`}
                      style={{ fontSize: '11px', fontWeight: 600 }}
                    >
                      {member.status === 'verified' ? 'Verified' : member.status === 'invited' ? 'Invited' : member.status === 'verifying' ? 'Verifying' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Flow Preview — moved to dashboard activation */}
        </div>
      )
    },
    {
      id: 'business',
      title: 'Business Activity',
      step: 15,
      content: (
        <div className="space-y-3 text-sm">
          {state.businessDetails && (
            <>
               <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Turnover</span>
                <span className="text-[var(--brand-primary-navy)]" style={{ fontWeight: 700 }}>{state.businessDetails.turnover}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Employees</span>
                <span className="text-[var(--brand-primary-navy)]" style={{ fontWeight: 700 }}>{state.businessDetails.employees}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Intl. Payments</span>
                <span className="text-[var(--brand-primary-navy)]" style={{ fontWeight: 700 }}>{state.businessDetails.internationalPayments ? 'Yes' : 'No'}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Monthly Income</span>
                <span className="text-[var(--brand-primary-navy)]" style={{ fontWeight: 700 }}>{state.businessDetails.monthlyIncome}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Website</span>
                <span className="text-[var(--brand-primary-navy)] truncate max-w-[150px]" style={{ fontWeight: 700 }}>{state.businessDetails.website || '-'}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Cash Deposits</span>
                <span className="text-[var(--brand-primary-navy)]" style={{ fontWeight: 700 }}>{state.businessDetails.cashDeposits}</span>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-brand-navy">Check your details</h2>
        <p className="text-text-secondary">Make sure everything is correct before submitting.</p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div 
            key={section.id}
            className="bg-white rounded-[20px] shadow-sm border border-divider overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-divider">
              <h3 className="font-bold text-brand-navy">{section.title}</h3>
              <button 
                onClick={() => onEdit(section.step)}
                className="text-brand-blue hover:bg-blue-50 p-2 rounded-full transition-colors"
                aria-label={`Edit ${section.title}`}
              >
                <Pencil size={20} />
              </button>
            </div>
            
            <div className="p-5">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Legal Terms Checkbox */}
      <div className="bg-white rounded-[20px] p-5 border border-divider shadow-sm">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative flex items-center mt-0.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="peer h-6 w-6 cursor-pointer appearance-none rounded-[6px] border border-gray-300 shadow-sm checked:border-brand-blue checked:bg-brand-blue transition-all"
            />
            <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" size={16} strokeWidth={3} />
          </div>
          <div className="text-sm text-text-secondary leading-relaxed">
            I confirm that the information provided is accurate and I agree to the <a href="#" className="text-brand-blue font-bold hover:underline">terms and conditions</a> and <a href="#" className="text-brand-blue font-bold hover:underline">Privacy Policy</a>.
          </div>
        </label>
      </div>

      <StickyFooter>
        <button
          onClick={onSubmit}
          disabled={!agreed}
          className={`
            w-full h-[48px] rounded-full font-bold text-[16px] transition-all shadow-lg
            ${agreed 
              ? 'bg-brand-navy text-white hover:opacity-90' 
              : 'bg-divider text-text-secondary cursor-not-allowed shadow-none'}
          `}
        >
          Submit application
        </button>
      </StickyFooter>
    </div>
  );
}