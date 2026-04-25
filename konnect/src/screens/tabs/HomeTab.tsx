import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Card } from '../../components/Card';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ServiceTile } from '../../components/ServiceTile';
import { getUserJobs, Job } from '../../services/jobService';
import { useTheme } from '../../context/ThemeContext';

const SERVICES = [
  { id: 'Plumber', icon: 'water', color: '#007AFF', bgLight: '#E5F1FF', bgDark: '#0A1A2E' },
  { id: 'Electrician', icon: 'flash', color: '#FF9500', bgLight: '#FFF4E5', bgDark: '#2E1D0A' },
  { id: 'Carpenter', icon: 'hammer', color: '#A2845E', bgLight: '#F6EFE8', bgDark: '#2E221A' },
  { id: 'Cleaner', icon: 'sparkles', color: '#34C759', bgLight: '#EBF9EE', bgDark: '#102E15' },
];

const HomeTab = ({ navigation, route }: any) => {
  const userId = route.params?.userId || 'sim-user';
  const { colors, isDark } = useTheme();
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const userJobs = await getUserJobs(userId);
      const active = userJobs.find(
        (j) => j.status !== 'completed' && j.status !== 'verified'
      );
      setActiveJob(active || null);
    } catch (error: any) {
      console.log('Failed to fetch jobs:', error.message);
    }
  }, [userId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchJobs();
    });
    return unsubscribe;
  }, [navigation, fetchJobs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const navigateToPostJob = (service?: string) => {
    navigation.navigate('PostJob', { userId, preselectedService: service });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.headerRow}>
          <View>
            <ThemedText secondary variant="caption" style={styles.greeting}>Good morning</ThemedText>
            <ThemedText variant="h1" style={styles.title}>What can we help you with?</ThemedText>
          </View>
          <ThemeToggle />
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <TouchableOpacity
            style={[styles.searchBar, { backgroundColor: colors.card }]}
            activeOpacity={0.8}
            onPress={() => navigateToPostJob()}
          >
            <Ionicons name="search" size={20} color={colors.secondaryText} />
            <ThemedText secondary style={styles.searchText}>Search for a service...</ThemedText>
          </TouchableOpacity>
        </Animated.View>

        {/* Service Grid */}
        <View style={styles.grid}>
          {SERVICES.map((s, index) => (
            <ServiceTile
              key={s.id}
              label={s.id}
              icon={s.icon as any}
              color={s.color}
              bgLight={s.bgLight}
              bgDark={s.bgDark}
              onPress={() => navigateToPostJob(s.id)}
              index={index}
            />
          ))}
        </View>

        {/* Guarantee Card */}
        <Animated.View entering={FadeInUp.delay(500).duration(600)}>
          <Card padding={24} radius={22} style={[styles.guaranteeCard, { backgroundColor: isDark ? colors.card : '#000000' }]}>
            <View style={styles.guaranteeContent}>
              <View style={styles.guaranteeTextContainer}>
                <ThemedText variant="h3" style={{ color: '#FFFFFF', marginBottom: 4 }}>Konnect Guarantee</ThemedText>
                <ThemedText variant="caption" style={{ color: '#A1A1A6', lineHeight: 18 }}>
                  Every service is backed by a 3-day quality protection.
                </ThemedText>
              </View>
              <View style={styles.shieldIcon}>
                <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Active Booking Card */}
        {activeJob && (
          <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="h3">Recent Jobs</ThemedText>
              <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
                <ThemedText variant="caption" style={{ color: colors.accent }}>History</ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (activeJob.status === 'matched') {
                  navigation.navigate('Matching', { jobId: activeJob.id, userId, service: activeJob.service });
                } else if (activeJob.status !== 'pending') {
                  navigation.navigate('ActiveJob', {
                    jobId: activeJob.id,
                    userId,
                    workerName: activeJob.workerName,
                    service: activeJob.service,
                  });
                }
              }}
            >
              <Card style={styles.activeJobCard}>
                <View style={styles.activeJobContent}>
                  <View style={[styles.activeIcon, { backgroundColor: colors.accent + '20' }]}>
                    <Ionicons name="construct" size={24} color={colors.accent} />
                  </View>
                  <View style={styles.activeText}>
                    <ThemedText variant="h3" style={{ fontSize: 18 }}>{activeJob.service}</ThemedText>
                    <ThemedText variant="caption" style={{ color: '#FF9500' }}>
                      {activeJob.status.replace('_', ' ').toUpperCase()}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.border} />
                </View>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        )}

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
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  greeting: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  title: {
    maxWidth: '85%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  searchText: {
    marginLeft: 12,
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeJobCard: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeJobContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activeText: {
    flex: 1,
  },
  guaranteeCard: {
    marginBottom: 40,
  },
  guaranteeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guaranteeTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  shieldIcon: {
    marginLeft: 8,
  },
});

export default HomeTab;
