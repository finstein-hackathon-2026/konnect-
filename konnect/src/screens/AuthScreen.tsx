import React, { useState } from 'react';
import {
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import PrimaryButton from '../components/PrimaryButton';
import { InputField } from '../components/InputField';
import { ThemeToggle } from '../components/ThemeToggle';
import { sendOtp, verifyOtp } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

const AuthScreen = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const { spacing } = useTheme();

  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phoneNumber);
      setStep('otp');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      Alert.alert('Error', 'Please enter a 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const user = await verifyOtp(phoneNumber, otp);
      navigation.replace('Home', { userId: user.uid });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerToggle}>
        <ThemeToggle />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <ThemedText variant="h1" style={styles.logo}>konnect</ThemedText>
            <ThemedText secondary style={styles.subtitle}>
              {step === 'phone'
                ? 'Find trusted workers near you.'
                : `Enter the code sent to +91 ${phoneNumber}`}
            </ThemedText>
          </View>

          {step === 'phone' ? (
            <View style={styles.inputSection}>
              <InputField
                icon="call-outline"
                placeholder="Phone number"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={10}
                autoFocus
              />
              <PrimaryButton
                title="Continue"
                onPress={handleSendOtp}
                loading={loading}
                disabled={phoneNumber.length < 10}
              />
            </View>
          ) : (
            <View style={styles.inputSection}>
              <InputField
                icon="key-outline"
                placeholder="000000"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                maxLength={6}
                autoFocus
                style={styles.otpInput}
              />
              <PrimaryButton
                title="Verify OTP"
                onPress={handleVerifyOtp}
                loading={loading}
                disabled={otp.length < 6}
              />
              <PrimaryButton
                title="Change phone number"
                onPress={() => setStep('phone')}
                variant="text"
                style={styles.backBtn}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 24,
    zIndex: 10,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  textContainer: {
    marginBottom: 48,
  },
  logo: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  inputSection: {
    width: '100%',
  },
  otpInput: {
    letterSpacing: 8,
    fontSize: 24,
    fontWeight: '700',
  },
  backBtn: {
    marginTop: 12,
  },
});

export default AuthScreen;
