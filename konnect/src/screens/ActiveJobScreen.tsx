import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking, Alert, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import PrimaryButton from '../components/PrimaryButton';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { updateJob, subscribeToJob, Job } from '../services/jobService';

const STATUSES = ['assigned', 'on_the_way', 'arrived'] as const;

const STATUS_CONFIG: Record<string, { label: string; icon: string }> = {
  assigned: { label: 'Worker Assigned', icon: 'checkmark-circle' },
  on_the_way: { label: 'On the Way', icon: 'car' },
  arrived: { label: 'Worker Arrived', icon: 'location' },
};

const ActiveJobScreen = ({ navigation, route }: any) => {
  const { jobId, workerName, workerPhone, workerRating, service } = route.params;
  const { colors, isDark } = useTheme();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToJob(jobId, (updatedJob) => {
      setJob(updatedJob);
    });
    return () => unsubscribe();
  }, [jobId]);

  if (!job) return null;

  const currentStatus = job.status;
  let statusIndex = STATUSES.indexOf(currentStatus as any);
  if (statusIndex === -1 && (currentStatus === 'verified' || currentStatus === 'completed')) {
    statusIndex = 2;
  } else if (statusIndex === -1) {
    statusIndex = 0;
  }

  const handleCall = () => {
    Linking.openURL(`tel:${workerPhone}`).catch(() => {
      Alert.alert('Error', 'Could not open phone dialer');
    });
  };

  const handleNextStatus = async () => {
    if (statusIndex < STATUSES.length - 1) {
      const nextStatus = STATUSES[statusIndex + 1];
      try {
        await updateJob(jobId, { status: nextStatus });
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Map Mock */}
        <Card padding={0} radius={24} style={styles.mapCard}>
          <View style={[styles.mapPlaceholder, { backgroundColor: isDark ? colors.card : '#E5F1FF' }]}>
            <View style={styles.mapRoute}>
              <Ionicons name="car" size={24} color={colors.primary} />
              <View style={[styles.mapLine, { backgroundColor: colors.border }]} />
              <Ionicons name="home" size={24} color={colors.accent} />
            </View>
            <ThemedText variant="caption" style={styles.etaText}>7 min away</ThemedText>
          </View>
        </Card>

        <ThemedText variant="h2" style={styles.title}>Track Job</ThemedText>
        <ThemedText secondary style={styles.subtitle}>{service}</ThemedText>

        {/* Worker Info */}
        <Card style={styles.workerCard}>
          <View style={styles.workerRow}>
            <View style={[styles.avatar, { backgroundColor: colors.background }]}>
              <ThemedText variant="h3">{workerName.charAt(0)}</ThemedText>
            </View>
            <View style={styles.workerDetails}>
              <ThemedText variant="h3">{workerName}</ThemedText>
              <ThemedText variant="caption" secondary>⭐ {workerRating} Rating</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.callBtn, { backgroundColor: colors.accent }]}
              onPress={handleCall}
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Timeline */}
        <View style={styles.timeline}>
          {STATUSES.map((status, index) => {
            const isActive = index <= statusIndex;
            const config = STATUS_CONFIG[status];
            return (
              <View key={status} style={styles.timelineItem}>
                <View style={styles.indicatorCol}>
                  <View style={[
                    styles.dot, 
                    { backgroundColor: isActive ? colors.accent : colors.border }
                  ]}>
                    <Ionicons 
                      name={config.icon as any} 
                      size={14} 
                      color={isActive ? '#FFFFFF' : colors.secondaryText} 
                    />
                  </View>
                  {index < STATUSES.length - 1 && (
                    <View style={[
                      styles.line, 
                      { backgroundColor: index < statusIndex ? colors.accent : colors.border }
                    ]} />
                  )}
                </View>
                <View style={styles.labelCol}>
                  <ThemedText 
                    variant="h3" 
                    style={[
                      styles.statusLabel, 
                      { color: isActive ? colors.primary : colors.secondaryText, fontSize: 16 }
                    ]}
                  >
                    {config.label}
                  </ThemedText>
                  {isActive && index === statusIndex && (
                    <ThemedText variant="caption" style={{ color: colors.accent }}>Current Status</ThemedText>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.footer}>
          {statusIndex < STATUSES.length - 1 ? (
            <PrimaryButton
              title={`Simulate: ${STATUS_CONFIG[STATUSES[statusIndex + 1]].label}`}
              onPress={handleNextStatus}
              variant="secondary"
            />
          ) : (
            <PrimaryButton
              title="Verify Worker Arrived"
              onPress={() => navigation.navigate('Verify', { jobId, workerName, service })}
            />
          )}
        </View>

      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  mapCard: {
    height: 180,
    marginBottom: 32,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapLine: {
    width: 60,
    height: 3,
    marginHorizontal: 12,
    borderRadius: 2,
  },
  etaText: {
    fontWeight: '700',
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 24,
  },
  workerCard: {
    marginBottom: 32,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workerDetails: {
    flex: 1,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: {
    paddingLeft: 8,
    marginBottom: 40,
  },
  timelineItem: {
    flexDirection: 'row',
    height: 70,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 16,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: -4,
    marginBottom: -4,
    zIndex: 1,
  },
  labelCol: {
    justifyContent: 'center',
  },
  statusLabel: {
    marginBottom: 2,
  },
  footer: {
    marginTop: 'auto',
  },
});

export default ActiveJobScreen;
