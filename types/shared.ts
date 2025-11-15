// ============================================
// USER TYPES
// ============================================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin',
  ACCOUNT_USER = 'account_user'
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  fullName?: string;
  role: UserRole;
  companyId?: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COMPANY TYPES
// ============================================

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  businessType: string;
  registrationId: string;
  address?: string;
  adminUserId?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt?: Date;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export enum TransactionStatus {
  INITIATED = 'initiated',
  QR1_SCANNED = 'qr1_scanned',
  QR2_GENERATED = 'qr2_generated',
  QR2_SCANNED = 'qr2_scanned',
  OTP_SENT = 'otp_sent',
  OTP_VERIFIED = 'otp_verified',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  
  // Parties
  senderCompanyId?: string;
  senderUserId?: string;
  receiverCompanyId?: string;
  receiverUserId?: string;
  
  // Details
  amount: number;
  currency: string;
  description?: string;
  metadata: Record<string, any>;
  
  // Status
  status: TransactionStatus;
  
  // QR Codes
  qr1Code?: string;
  qr1ExpiresAt?: Date;
  qr2Code?: string;
  qr2ExpiresAt?: Date;
  
  // Timestamps
  initiatedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionInitiation {
  receiverPhone: string;
  amount: number;
  currency?: string;
  description?: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export enum NotificationType {
  TRANSACTION = 'transaction',
  SECURITY = 'security',
  SYSTEM = 'system',
  ALERT = 'alert'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface AuthSession {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface LoginRequest {
  phone: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  pending: number;
  completed: number;
  totalAmount: number;
  thisMonth: number;
  recentTransactions: Transaction[];
}

export interface UserDashboardData {
  stats: DashboardStats;
  user: UserProfile;
}