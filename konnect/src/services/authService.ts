import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  ConfirmationResult,
  ApplicationVerifier,
} from 'firebase/auth';
import { auth } from './firebase';

let confirmationResult: ConfirmationResult | null = null;

/**
 * Send OTP to the given phone number.
 * On web, requires a RecaptchaVerifier passed as appVerifier.
 * On native with Expo, phone auth is limited — we simulate it here.
 */
export const sendOtp = async (
  phoneNumber: string,
  appVerifier?: ApplicationVerifier
): Promise<void> => {
  try {
    if (appVerifier) {
      confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    } else {
      // Simulated OTP send for environments without RecaptchaVerifier
      console.log(`[SIM] OTP sent to ${phoneNumber}`);
      confirmationResult = null;
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send OTP');
  }
};

/**
 * Verify the OTP code.
 * If we have a real confirmationResult, use it. Otherwise simulate.
 */
export const verifyOtp = async (code: string): Promise<any> => {
  try {
    if (confirmationResult) {
      const result = await confirmationResult.confirm(code);
      return result.user;
    } else {
      // Simulated verification — accepts any 6-digit code
      if (code.length === 6) {
        console.log('[SIM] OTP verified successfully');
        return { uid: 'sim-user-' + Date.now(), phoneNumber: '+91XXXXXXXXXX' };
      }
      throw new Error('Invalid OTP');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to verify OTP');
  }
};

/**
 * Get currently signed in user.
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Sign out current user.
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};
