import { CreditCard, TrendingUp, Building2, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  icon: LucideIcon;
  headline: string;
  features: string[];
  allFeatures: string[];
  freeAddons: number;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'start',
    name: 'Start',
    price: 9,
    icon: CreditCard,
    headline: 'Simple banking for getting started',
    features: [
      '2 free debit cards',
      '10 UK + 1 international payment/mo',
      'AI business assistant',
    ],
    allFeatures: [
      '2 free debit cards',
      '10 UK + 1 international payment/mo',
      'AI business assistant',
      'Mobile & online banking',
      'Instant notifications',
      'Basic spend categorisation',
      'FSCS protected up to £85,000',
    ],
    freeAddons: 0,
  },
  {
    id: 'build',
    name: 'Build',
    price: 19,
    icon: TrendingUp,
    headline: 'Support your next phase of growth',
    features: [
      'Up to 5 debit cards',
      '50 UK + 5 international payments/mo',
      'Cashflow insights & forecasts',
    ],
    allFeatures: [
      'Up to 5 debit cards',
      '50 UK + 5 international payments/mo',
      'Cashflow insights & forecasts',
      'Accounting software integration',
      'Multi-user access (2 users)',
      'Priority customer support',
      'Bulk payment uploads',
      'FSCS protected up to £85,000',
    ],
    freeAddons: 1,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 39,
    icon: Building2,
    headline: 'Full-featured banking for scaling businesses',
    features: [
      'Up to 15 debit cards',
      '200 UK + 20 international payments/mo',
      'Advanced cashflow management',
    ],
    allFeatures: [
      'Up to 15 debit cards',
      '200 UK + 20 international payments/mo',
      'Advanced cashflow management',
      'Accounting software integration',
      'Multi-user access (5 users)',
      'Dedicated relationship manager',
      'API access for integrations',
      'Bulk payment uploads',
      'Custom approval workflows',
      'FSCS protected up to £85,000',
    ],
    freeAddons: 2,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 79,
    icon: Rocket,
    headline: 'Tailored solutions for complex businesses',
    features: [
      'Unlimited debit cards',
      'Unlimited payments',
      'White-glove onboarding & support',
    ],
    allFeatures: [
      'Unlimited debit cards',
      'Unlimited payments',
      'White-glove onboarding & support',
      'Full API suite & webhooks',
      'Multi-entity management',
      'Unlimited users & roles',
      'Dedicated account manager',
      'Custom approval chains',
      'SLA-backed uptime guarantee',
      'FSCS protected up to £85,000',
    ],
    freeAddons: 4,
  },
];

export function getPlansByPrice(): SubscriptionPlan[] {
  return [...subscriptionPlans].sort((a, b) => a.price - b.price);
}
