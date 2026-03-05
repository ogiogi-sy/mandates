import {
  Receipt, FileText, Calculator, BarChart3, Globe, Shield,
  Wallet, Users, Zap, Clock, Target, Landmark, PiggyBank, Briefcase
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ToolkitAddon {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  category: string[];
}

export const toolkitAddons: ToolkitAddon[] = [
  {
    id: 'invoicing',
    name: 'Smart Invoicing',
    description: 'Create, send, and track invoices with automatic payment matching.',
    icon: 'Receipt',
    iconBg: '#EBF0F8',
    iconColor: '#0041AD',
    category: ['finance', 'productivity'],
  },
  {
    id: 'expense',
    name: 'Expense Management',
    description: 'Snap receipts, auto-categorise expenses, and generate reports.',
    icon: 'FileText',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    category: ['finance'],
  },
  {
    id: 'tax',
    name: 'Tax Estimator',
    description: 'Real-time corporation tax and VAT estimates based on your activity.',
    icon: 'Calculator',
    iconBg: '#F5F3FF',
    iconColor: '#7C3AED',
    category: ['finance'],
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Deep-dive dashboards with revenue trends, burn rate, and benchmarks.',
    icon: 'BarChart3',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    category: ['insights'],
  },
  {
    id: 'fx',
    name: 'FX & Multi-Currency',
    description: 'Hold, send, and receive in 30+ currencies with live rates.',
    icon: 'Globe',
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    category: ['payments'],
  },
  {
    id: 'fraud',
    name: 'Fraud Protection+',
    description: 'Enhanced fraud detection with real-time transaction screening.',
    icon: 'Shield',
    iconBg: '#FEF2F2',
    iconColor: '#DC2626',
    category: ['security'],
  },
  {
    id: 'cashflow',
    name: 'Cashflow Coach',
    description: 'AI-powered cashflow forecasting with actionable recommendations.',
    icon: 'Wallet',
    iconBg: '#ECFDF5',
    iconColor: '#047857',
    category: ['insights', 'finance'],
  },
  {
    id: 'payroll',
    name: 'Payroll Connect',
    description: 'Integrate payroll providers and automate salary payments.',
    icon: 'Users',
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    category: ['productivity', 'payments'],
  },
  {
    id: 'automation',
    name: 'Payment Automations',
    description: 'Set up recurring payments, scheduled transfers, and smart rules.',
    icon: 'Zap',
    iconBg: '#FEF3C7',
    iconColor: '#B45309',
    category: ['payments', 'productivity'],
  },
  {
    id: 'scheduler',
    name: 'Bill Scheduler',
    description: 'Never miss a payment — schedule bills and get reminders.',
    icon: 'Clock',
    iconBg: '#F0F9FF',
    iconColor: '#0284C7',
    category: ['productivity', 'finance'],
  },
];

export const addonCategories = [
  { id: 'all', label: 'All' },
  { id: 'finance', label: 'Finance' },
  { id: 'payments', label: 'Payments' },
  { id: 'insights', label: 'Insights' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'security', label: 'Security' },
];

export const addonIconMap: Record<string, LucideIcon> = {
  Receipt,
  FileText,
  Calculator,
  BarChart3,
  Globe,
  Shield,
  Wallet,
  Users,
  Zap,
  Clock,
  Target,
  Landmark,
  PiggyBank,
  Briefcase,
};
