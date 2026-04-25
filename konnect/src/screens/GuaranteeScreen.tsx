import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

const GUARANTEE_HOURS = 72;

const GuaranteeScreen = ({ navigation, route }: any) => {
  const { jobId, userId, workerName, service } = route.params;
  const [timeLeft, setTimeLeft] = useState(GUARANTEE_HOURS * 3600);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };

  const time = formatTime(timeLeft);

  const handleReportIssue = () => {
    navigation.navigate('Issue', { jobId, userId });
  };

  const handleGoHome = () => {
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.shield}>🛡️</Text>
          <Text style={styles.title}>Guarantee Active</Text>
          <Text style={styles.subtitle}>
            Your job is covered by our 3-day service guarantee.
          </Text>

          {/* Countdown Timer */}
          <View style={styles.timerContainer}>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>{String(time.days).padStart(2, '0')}</Text>
              <Text style={styles.timerLabel}>Days</Text>
            </View>
            <Text style={styles.timerSeparator}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>{String(time.hours).padStart(2, '0')}</Text>
              <Text style={styles.timerLabel}>Hours</Text>
            </View>
            <Text style={styles.timerSeparator}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>{String(time.minutes).padStart(2, '0')}</Text>
              <Text style={styles.timerLabel}>Mins</Text>
            </View>
            <Text style={styles.timerSeparator}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>{String(time.seconds).padStart(2, '0')}</Text>
              <Text style={styles.timerLabel}>Secs</Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Coverage Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>✓</Text>
              <Text style={styles.infoText}>Work quality issues</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>✓</Text>
              <Text style={styles.infoText}>Incomplete work</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>✓</Text>
              <Text style={styles.infoText}>Material defects</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              title="Report an Issue"
              onPress={handleReportIssue}
              variant="danger"
            />
            <PrimaryButton
              title="Go to Home"
              onPress={handleGoHome}
              variant="text"
            />
          </View>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  shield: {
    fontSize: 64,
    marginBottom: 24,
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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  timerBox: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 72,
  },
  timerValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  timerLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 4,
  },
  timerSeparator: {
    fontSize: 28,
    fontWeight: '700',
    color: '#C7C7CC',
  },
  infoCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '700',
    marginRight: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#3A3A3C',
  },
  actions: {
    width: '100%',
    gap: 16,
  },
});

export default GuaranteeScreen;
