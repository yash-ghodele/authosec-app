import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
}

/**
 * Register a new user with email and password
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName?: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to register user');
  }
};

/**
 * Sign in existing user
 */
export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user: FirebaseUser | null) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
      };
      callback(user);
    } else {
      callback(null);
    }
  });
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
};

/**
 * Get Firebase ID token for API authentication
 */
export const getIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
};

/**
 * Send OTP to phone number
 * For React Native, we need to use Firebase Admin SDK on backend
 * or @react-native-firebase/auth package for native phone auth
 * 
 * This is a placeholder that will work with test phone numbers in Firebase Console
 */
export const sendOTP = async (
  phoneNumber: string,
  recaptchaVerifier?: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  try {
    // Format phone number to E.164 format if needed
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      // Assume India by default if no country code
      formattedPhone = '+91' + formattedPhone.replace(/^0+/, '');
    }
    
    // Note: For React Native, signInWithPhoneNumber requires special setup
    // Option 1: Use test phone numbers in Firebase Console (no SMS sent)
    // Option 2: Use @react-native-firebase/auth native module
    // Option 3: Backend sends OTP via Firebase Admin SDK
    
    // For now, this will only work with test phone numbers configured in Firebase Console
    // Production requires either native module or backend API
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      recaptchaVerifier as any
    );
    
    return confirmationResult;
  } catch (error: any) {
    console.error('Send OTP error:', error);
    
    // Better error messages for React Native
    if (error.code === 'auth/argument-error') {
      throw new Error('Phone authentication requires additional setup for React Native. Please use test phone numbers configured in Firebase Console or implement backend OTP.');
    }
    
    throw new Error(error.message || 'Failed to send OTP');
  }
};

/**
 * Verify OTP and sign in
 */
export const verifyOTP = async (
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await confirmationResult.confirm(otp);
    return userCredential.user;
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    throw new Error(error.message || 'Invalid OTP. Please try again.');
  }
};

/**
 * Sign in with phone number credential (alternative method)
 */
export const signInWithPhone = async (
  verificationId: string,
  verificationCode: string
): Promise<FirebaseUser> => {
  try {
    const credential = PhoneAuthProvider.credential(
      verificationId,
      verificationCode
    );
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error: any) {
    console.error('Sign in with phone error:', error);
    throw new Error(error.message || 'Failed to sign in with phone');
  }
};
