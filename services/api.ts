import { Platform } from 'react-native';
import { getIdToken } from './auth';

// API Configuration
// Use your local network IP for testing on physical devices and emulators
// Android emulator: use 10.0.2.2:3001
// Physical devices: use your computer's IP address (currently 10.54.136.189)
const API_URL = __DEV__ 
  ? Platform.OS === 'android' && !Platform.isTV
    ? 'http://10.0.2.2:3001'  // Android emulator
    : 'http://10.54.136.189:3001'  // Physical devices and iOS simulator
  : process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.authosec.com';

// API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Generic API fetch wrapper with auth
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  // Build full URL and headers up-front for better logging
  const url = `${API_URL}${endpoint}`;
  const token = await getIdToken().catch((e) => {
    console.warn('Failed to get auth token (continuing without token):', e?.message || e);
    return null;
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Try parse JSON safely (some endpoints may return empty body)
    let data: any = undefined;
    try {
      data = await response.json();
    } catch (jsonErr) {
      // non-JSON response
      data = undefined;
    }

    if (!response.ok) {
      // Get detailed error message from validation errors if available
      let errorMsg = data?.error || data?.message || response.statusText || 'API request failed';
      
      // If it's a validation error, try to get detailed validation messages
      if (response.status === 400 && data?.errors && Array.isArray(data.errors)) {
        const validationErrors = data.errors.map((e: any) => 
          e.path ? `${e.path.join('.')}: ${e.message}` : e.message
        ).join('\n');
        if (validationErrors) {
          errorMsg = `Validation error:\n${validationErrors}`;
        }
      } else if (response.status === 400 && data?.error && typeof data.error === 'string') {
        errorMsg = data.error;
      }
      
      const err = new Error(`${errorMsg} (status: ${response.status})`);
      (err as any).response = { status: response.status, data };
      throw err;
    }

    return data as ApiResponse<T>;
  } catch (err: any) {
    // Improve network error logging (helps diagnose emulator/device issues)
    if (err?.message && err.message.toLowerCase().includes('network request failed')) {
      console.error('Network request failed for URL:', url);
      console.error('Platform:', Platform.OS, 'DEV:', __DEV__, 'API_URL:', API_URL);
      console.error('Headers:', headers);
    }
    console.error('API Error:', err);
    throw err;
  }
}

/**
 * Authentication APIs
 */
export const authApi = {
  sendOTP: (phone: string) =>
    apiFetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    }),

  verifyOTP: (phone: string, token: string) =>
    apiFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, token })
    }),

  logout: () =>
    apiFetch('/api/auth/logout', {
      method: 'POST'
    })
};

/**
 * Transaction APIs
 */
export const transactionApi = {
  initiate: (data: { receiverPhone: string; amount: number; description?: string }) =>
    apiFetch('/api/transactions/initiate', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  scanQR1: (qrCode: string) =>
    apiFetch('/api/transactions/scan-qr1', {
      method: 'POST',
      body: JSON.stringify({ qrCode })
    }),

  generateQR2: (transactionId: string) =>
    apiFetch('/api/transactions/generate-qr2', {
      method: 'POST',
      body: JSON.stringify({ transactionId })
    }),

  scanQR2: (qrCode: string) =>
    apiFetch('/api/transactions/scan-qr2', {
      method: 'POST',
      body: JSON.stringify({ qrCode })
    }),

  sendOTP: (transactionId: string) =>
    apiFetch('/api/transactions/send-otp', {
      method: 'POST',
      body: JSON.stringify({ transactionId })
    }),

  verifyOTP: (transactionId: string, otp: string) =>
    apiFetch('/api/transactions/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ transactionId, otp })
    }),

  completePayment: (transactionId: string) =>
    apiFetch(`/api/transactions/${transactionId}/complete`, {
      method: 'POST',
    }),

  getAll: (page = 1, limit = 20) =>
    apiFetch(`/api/transactions?page=${page}&limit=${limit}`).then((response) => {
      // Backend returns array directly
      if (response.success && response.data) {
        const transactions = Array.isArray(response.data) ? response.data : response.data.transactions || [];
        // Map snake_case to camelCase if needed
        const mapped = transactions.map((t: any) => ({
          ...t,
          initiatedAt: t.initiatedAt || t.initiated_at,
          completedAt: t.completedAt || t.completed_at,
          createdAt: t.createdAt || t.created_at,
          updatedAt: t.updatedAt || t.updated_at,
          senderId: t.senderId || t.sender_id || t.sender?.id,
          receiverId: t.receiverId || t.receiver_id || t.receiver?.id,
          sender: t.sender || t.users_transactions_sender_idTousers,
          receiver: t.receiver || t.users_transactions_receiver_idTousers,
        }));
        return {
          ...response,
          data: mapped,
        };
      }
      return response;
    }),

  getById: (id: string) =>
    apiFetch(`/api/transactions/${id}`).then((response) => {
      // Backend may return { transaction: {...} } or just the transaction
      if (response.success && response.data) {
        const data = response.data as any;
        const transaction = data.transaction || data;
        
        // Map snake_case to camelCase for date fields
        const mapped = {
          ...transaction,
          createdAt: transaction.createdAt || transaction.created_at,
          updatedAt: transaction.updatedAt || transaction.updated_at,
          initiatedAt: transaction.initiatedAt || transaction.createdAt || transaction.created_at,
          completedAt: transaction.completedAt || transaction.completed_at,
          qr1GeneratedAt: transaction.qr1GeneratedAt || transaction.qr1_generated_at,
          qr2GeneratedAt: transaction.qr2GeneratedAt || transaction.qr2_generated_at,
          qr1ExpiresAt: transaction.qr1ExpiresAt || transaction.qr1_expires_at,
          qr2ExpiresAt: transaction.qr2ExpiresAt || transaction.qr2_expires_at,
          qr1Code: transaction.qr1Code || transaction.qr1_code,
          qr2Code: transaction.qr2Code || transaction.qr2_code,
        };
        
        return {
          ...response,
          data: mapped,
        };
      }
      return response;
    }),

  getHistory: () =>
    apiFetch('/api/transactions/history')
};

/**
 * User APIs
 */
export const userApi = {
  getProfile: () =>
    apiFetch('/api/users/profile'),

  updateProfile: (data: any) =>
    apiFetch('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getTransactions: () =>
    apiFetch('/api/users/transactions'),

  sync: (data?: { firstName?: string; lastName?: string; phone?: string; companyName?: string; businessType?: string; registrationId?: string }) =>
    apiFetch('/api/users/sync', {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
};

/**
 * Notification APIs
 * Note: Backend may need to implement these endpoints
 */
export const notificationApi = {
  getAll: () =>
    apiFetch('/api/users/notifications').catch(() => {
      // Fallback if endpoint doesn't exist yet
      return { success: true, data: [] };
    }),

  getUnreadCount: async () => {
    try {
      const profile = await userApi.getProfile();
      if (profile.success && profile.data) {
        return { success: true, data: (profile.data as any)._count?.notifications || 0 };
      }
      return { success: true, data: 0 };
    } catch {
      return { success: true, data: 0 };
    }
  },

  markAsRead: (id: string) =>
    apiFetch(`/api/users/notifications/${id}/read`, {
      method: 'PATCH'
    }).catch(() => ({ success: true })),

  markAllAsRead: () =>
    apiFetch('/api/users/notifications/read-all', {
      method: 'PATCH'
    }).catch(() => ({ success: true }))
};

/**
 * Health Check
 */
export const healthApi = {
  check: () => apiFetch('/api/health')
};

export default {
  authApi,
  transactionApi,
  userApi,
  notificationApi,
  healthApi
};
