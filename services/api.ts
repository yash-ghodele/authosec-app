import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_URL = __DEV__ 
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:3001' // Android emulator
    : 'http://localhost:3001' // iOS simulator / physical device (use your IP)
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
  try {
    // Get auth token from AsyncStorage
    const token = await AsyncStorage.getItem('supabase.auth.token');
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw error;
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

  getAll: (page = 1, limit = 20) =>
    apiFetch(`/api/transactions?page=${page}&limit=${limit}`),

  getById: (id: string) =>
    apiFetch(`/api/transactions/${id}`),

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

  getNotifications: () =>
    apiFetch('/api/users/notifications')
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
  healthApi
};
