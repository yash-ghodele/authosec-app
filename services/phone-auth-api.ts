import { getIdToken } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';

/**
 * API Service for backend communication
 */

/**
 * Send OTP to phone number via backend
 * Backend will use Firebase Admin SDK to send SMS
 */
export const sendOTPViaBackend = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Format phone number
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/^0+/, '');
    }

    const response = await fetch(`${API_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber: formattedPhone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    return data;
  } catch (error: any) {
    console.error('API: Send OTP error:', error);
    throw error;
  }
};

/**
 * Verify OTP via backend
 * Backend will create custom Firebase token
 */
export const verifyOTPViaBackend = async (
  phoneNumber: string,
  otp: string
): Promise<{ token: string; user: any }> => {
  try {
    // Format phone number
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/^0+/, '');
    }

    const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        otp: otp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid OTP');
    }

    return data;
  } catch (error: any) {
    console.error('API: Verify OTP error:', error);
    throw error;
  }
};

/**
 * Sign in with custom Firebase token
 */
export const signInWithCustomToken = async (customToken: string) => {
  const { signInWithCustomToken: firebaseSignIn } = await import('firebase/auth');
  const { auth } = await import('../config/firebase');
  
  const userCredential = await firebaseSignIn(auth, customToken);
  return userCredential.user;
};

/**
 * Get user profile from backend
 */
export const getUserProfile = async (): Promise<any> => {
  try {
    const token = await getIdToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get profile');
    }

    return data;
  } catch (error: any) {
    console.error('API: Get profile error:', error);
    throw error;
  }
};

export default {
  sendOTPViaBackend,
  verifyOTPViaBackend,
  signInWithCustomToken,
  getUserProfile,
};
