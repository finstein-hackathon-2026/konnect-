import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import PrimaryButton from '../components/PrimaryButton';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { 
  Job, 
  subscribeToJob, 
  assignWorker, 
  addWorkerResponse, 
  MOCK_WORKER_TEMPLATES, 
  getWorkerDetails,
  WorkerResponse
} from '../services/jobService';

const PulseCircle = ({ delay = 0 }) => {
  const { colors } = useTheme();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.5, 2]) }],
    opacity: interpolate(pulse.value, [0, 0.5, 1], [0, 0.4, 0]),
  }));

  return (
    <Animated.View style={[
      styles.pulse, 
      { backgroundColor: colors.accent }, 
      animatedStyle
    ]} />
  );
};

const MatchingScreen = ({ navigation, route }: any) => {
  const { jobId, userId, service } = route.params;
  const { colors, isDark } = useTheme();
  const [job, setJob] = useState<Job | null>(null);
  const [workerIndex, setWorkerIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const simulationStarted = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToJob(jobId, (updatedJob) => {
      setJob(updatedJob);
    });
    return () => unsubscribe();
  }, [jobId]);

  useEffect(() => {
    if (simulationStarted.current) return;
    simulationStarted.current = true;

    const timers: NodeJS.Timeout[] = [];
    const shuffledWorkers = [...MOCK_WORKER_TEMPLATES].sort(() => 0.5 - Math.random());

    timers.push(setTimeout(() => {
      addWorkerResponse(jobId, shuffledWorkers[0].id, shuffledWorkers[0].name).catch(console.error);
    }, 2000));

    timers.push(setTimeout(() => {
      addWorkerResponse(jobId, shuffledWorkers[1].id, shuffledWorkers[1].name).catch(console.error);
    }, 5000));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [jobId]);

  const sortedResponses: WorkerResponse[] = job?.responses 
    ? [...job.responses].sort((a, b) => a.timestamp - b.timestamp)
    : [];

  const currentResponse = sortedResponses[workerIndex];
  const isSearching = !currentResponse;

  const handleAccept = async () => {
    if (!currentResponse) return;
    setLoading(true);
    try {
      const details = getWorkerDetails(currentResponse.workerId);
      await assignWorker(jobId, currentResponse.workerId, currentResponse.workerName);
      
      navigation.replace('ActiveJob', {
        jobId,
        userId,
        workerName: details.name,
        workerPhone: details.phone,
        workerRating: details.rating,
        service,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    if (workerIndex < sortedResponses.length - 1) {
      setWorkerIndex(prev => prev + 1);
    } else {
      setWorkerIndex(0); // Cycle back or alert
    }
  };

  return (
    <ThemedView style={styles.container}>
      {isSearching ? (
        <View style={styles.searchingArea}>
          <View style={styles.animationContainer}>
            <PulseCircle />
            <PulseCircle />
            <View style={[styles.centerIcon, { backgroundColor: colors.accent }]}>
              <Ionicons name="search" size={32} color="#FFFFFF" />
            </View>
          </View>
          <ThemedText variant="h2" style={styles.searchingText}>Finding workers…</ThemedText>
          <ThemedText secondary style={styles.searchingSubtext}>
            Contacting top-rated {service.toLowerCase()}s near your location.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.content}>
          <ThemedText variant="h2" style={styles.matchedTitle}>Worker Found</ThemedText>
          <ThemedText secondary style={styles.matchedSubtitle}>
            {workerIndex + 1} of {sortedResponses.length} responders
          </ThemedText>

          <Card padding={24} radius={24} style={styles.workerCard}>
            <View style={styles.workerHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                <ThemedText variant="h3">{currentResponse.workerName.charAt(0)}</ThemedText>
              </View>
              <View style={styles.workerInfo}>
                <ThemedText variant="h3">{currentResponse.workerName}</ThemedText>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#FF9500" />
                  <ThemedText variant="caption" style={styles.ratingText}>
                    {getWorkerDetails(currentResponse.workerId).rating} rating
                  </ThemedText>
                  <ThemedText variant="caption" secondary> • </ThemedText>
                  <ThemedText variant="caption" secondary>
                    {getWorkerDetails(currentResponse.workerId).distance} away
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>

          <View style={styles.actions}>
            <PrimaryButton
              title="Confirm Worker"
              onPress={handleAccept}
              loading={loading}
            />
            <PrimaryButton
              title="Find Another"
              onPress={handleReject}
              variant="secondary"
              style={styles.findAnotherBtn}
            />
          </View>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  searchingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  centerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  searchingText: {
    marginBottom: 8,
  },
  searchingSubtext: {
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  matchedTitle: {
    marginBottom: 4,
  },
  matchedSubtitle: {
    marginBottom: 32,
  },
  workerCard: {
    marginBottom: 40,
  },
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  workerInfo: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: '700',
    color: '#FF9500',
  },
  actions: {
    gap: 12,
  },
  findAnotherBtn: {
    backgroundColor: 'transparent',
  },
});

export default MatchingScreen;
