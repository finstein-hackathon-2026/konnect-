import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, Platform } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { verifyJob } from '../services/jobService';

const VerifyScreen = ({ navigation, route }: any) => {
  const { jobId, userId, workerName, service } = route.params;
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScanQR = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await verifyJob(jobId);
      setVerified(true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigation.replace('Completion', { jobId, userId, workerName, service });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          {!verified ? (
            <>
              <View style={styles.qrPlaceholder}>
                <View style={styles.qrBox}>
                  <View style={styles.qrCorner1} />
                  <View style={styles.qrCorner2} />
                  <View style={styles.qrCorner3} />
                  <View style={styles.qrCorner4} />
                  <Text style={styles.qrIcon}>📱</Text>
                </View>
              </View>
              <Text style={styles.title}>Scan to Verify</Text>
              <Text style={styles.subtitle}>
                Ask {workerName} to show their QR code to verify their identity.
              </Text>
              <PrimaryButton
                title="Scan QR Code"
                onPress={handleScanQR}
                loading={loading}
                style={styles.scanBtn}
              />
            </>
          ) : (
            <>
              <View style={styles.successContainer}>
                <View style={styles.successCircle}>
                  <Text style={styles.successIcon}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Verified</Text>
                <Text style={styles.successSubtitle}>
                  {workerName} has been verified successfully.
                </Text>
              </View>
              <PrimaryButton
                title="Continue"
                onPress={handleContinue}
                style={styles.continueBtn}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  qrPlaceholder: {
    alignItems: 'center',
    marginBottom: 40,
  },
  qrBox: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  qrIcon: {
    fontSize: 48,
  },
  qrCorner1: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#000000',
    borderTopLeftRadius: 24,
  },
  qrCorner2: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#000000',
    borderTopRightRadius: 24,
  },
  qrCorner3: {
    position: 'absolute',
    bottom: -1,
    left: -1,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#000000',
    borderBottomLeftRadius: 24,
  },
  qrCorner4: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#000000',
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  scanBtn: {
    width: '100%',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  successTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: -1,
  },
  successSubtitle: {
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  continueBtn: {
    width: '100%',
  },
});

export default VerifyScreen;
