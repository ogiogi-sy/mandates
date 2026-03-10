export type TerminationReason = 'high_turnover' | 'identity_failed' | 'risk_flag' | 'otp_failed' | 'generic';

export interface TerminationState {
  isTerminated: boolean;
  reason: TerminationReason;
  title?: string;
  description?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export interface OnboardingState {
  step: number;
  companySearchQuery: string;
  selectedCompany: Company | null;
  directors: Director[];
  verificationCode: string;
  
  tradingAddress: {
    type: 'registered' | 'custom' | 'document';
    value: string;
  } | null;
  
  selectedBranch: Branch | null;
  
  // Refactored Business Details
  businessDetails: {
    turnover?: string;
    employees?: string;
    internationalPayments?: boolean;
    revenueSources?: string[];
    website?: string;
    monthlyIncome?: string;
    paymentTypes?: string[];
    cashDeposits?: string;
    industry?: string; // Legacy field, might keep for compatibility
    cashHandling?: string; // Legacy field
    paymentVolume?: string; // Legacy
  } | null;
  
  bankConnected: boolean; // Legacy?
  
  journeyType: 'optimised' | 'standard' | 'ideal';
  
  idVerification: {
    type: 'passport' | 'license';
    status: 'pending' | 'verified';
  } | null;
  
  passkeyCreated: boolean;
  passwordCreated: boolean;
  
  openBanking: {
    provider: string;
    connected: boolean;
  } | null;
  
  selectedBank: string | null;
  
  isEditing?: boolean;
  editingDirectorId?: string | 'new' | null;
  
  customAddressStr?: string; 
  
  termination?: TerminationState;
  mandate: MandateState;
  dashboardView: 'main' | 'team' | 'add-member' | 'mandate-summary' | 'mandate-success' | 'approval-rules';
  editingMemberId?: string | null;
}

export interface Company {
  name: string;
  number: string;
  address: string;
  status: 'Active' | 'Dissolved' | 'Liquidation';
  incorporationDate: string;
}

export interface Director {
  id: string;
  name: string;
  role: string;
  isPsc: boolean;
  email?: string;
  phone?: string;
  selected: boolean;
  isManual?: boolean;
  isPrimaryHolder?: boolean;
  appointmentDate?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'director' | 'finance_manager' | 'accountant' | 'employee' | 'custom';
  permissions: {
    viewAccount: boolean;
    initiatePayments: boolean;
    approvePayments: boolean;
    manageBeneficiaries: boolean;
    manageTeam: boolean;
    cardAccess: boolean;
  };
  dailyLimit?: number;
  transactionLimit?: number;
  // Per-user payment limits (spec: initiation/approval rather than daily/transaction)
  initiationLimit?: number;
  approvalLimit?: number;
  status: 'not_invited' | 'invited' | 'pending_verification' | 'verifying' | 'verified' | 'verification_failed' | 'suspended';
  invitedDate?: string;
  isFromCompaniesHouse: boolean;
  // KYC/AML screening (Gap 1)
  screeningStatus?: 'not_started' | 'in_progress' | 'cleared' | 'flagged';
  isPep?: boolean;
  sanctionsCleared?: boolean;
  // UBO tracking (Gap 3)
  isUbo?: boolean;
  ownershipPercentage?: number;
  // Async orchestration (Gap 8)
  verificationTimeline?: {
    event: string;
    timestamp: string;
    status: 'complete' | 'pending' | 'current';
  }[];
  // Digital acceptance (Gap 7)
  hasAcceptedMandate?: boolean;
  mandateAcceptanceStatus?: 'pending' | 'accepted' | 'declined';
  acceptedMandateDate?: string;
  declineReason?: string;
  requiresIdv?: boolean;
  // Invitation expiry
  invitationExpiresAt?: string;
}

export interface MandateAuditEntry {
  id: string;
  event: string;
  actor: string;
  timestamp: string;
  detail?: string;
  type: 'info' | 'success' | 'warning' | 'action';
}

export interface MandateState {
  authorityType: 'sole_director' | 'multi_director' | null;
  boardResolutionUploaded: boolean;
  approvalRule: 'any_one' | 'two_required' | 'threshold' | null;
  /** Stored in pence (minor currency) — divide by 100 for display */
  thresholdAmount: number | null;
  teamMembers: TeamMember[];
  confirmed: boolean;
  /** Prevents edits after mandate is signed */
  locked: boolean;
  /** Mandate version identifier (MND-V2-YYYYMMDD-NNN) */
  mandateVersion: string | null;
  /** ISO timestamp of when mandate was confirmed */
  confirmedAt: string | null;
  // Account activation gating (Gap 2)
  activationStatus: 'provisionally_active' | 'restricted' | 'fully_active';
  // Audit trail (Gap 5)
  auditLog: MandateAuditEntry[];
  // Payment restrictions (Gap 4)
  paymentRestrictions?: {
    singleApprovalLimit: number | null;
    requiresDualAbove: number | null;
    isFullyEnabled: boolean;
  };
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  distance: string;
}