import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserJobs, Job } from '../../services/jobService';

const BookingsTab = ({ route, navigation }: any) => {
  const userId = route.params?.userId || 'sim-user';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const allJobs = await getUserJobs(userId);
      setJobs(allJobs);
    } catch (error: any) {
      console.log('Error fetching bookings:', error.message);
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

  const filteredJobs = jobs.filter((j) => {
    const isFinished = j.status === 'completed' || j.status === 'verified';
    return filter === 'active' ? !isFinished : isFinished;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#8E8E93';
      case 'matched': return '#FF9500';
      case 'assigned':
      case 'on_the_way': return '#007AFF';
      case 'arrived':
      case 'verified': return '#34C759';
      case 'completed': return '#8E8E93';
      default: return '#000000';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bookings</Text>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterBtn, filter === 'active' && styles.filterBtnActive]}
              onPress={() => setFilter('active')}
            >
              <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, filter === 'completed' && styles.filterBtnActive]}
              onPress={() => setFilter('completed')}
            >
              <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>Completed</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000000" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#E5E5EA" />
              <Text style={styles.emptyText}>No {filter} bookings yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.jobCard}
              activeOpacity={0.7}
              onPress={() => {
                if (item.status === 'matched') {
                  navigation.navigate('Matching', { jobId: item.id, userId, service: item.service });
                } else if (item.status !== 'pending' && item.status !== 'completed' && item.status !== 'verified') {
                  navigation.navigate('ActiveJob', {
                    jobId: item.id,
                    userId,
                    workerName: item.workerName,
                    service: item.service,
                  });
                }
              }}
            >
              <View style={styles.jobInfo}>
                <Text style={styles.jobService}>{item.service}</Text>
                <Text style={styles.jobDate}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#000000',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  jobInfo: {
    flex: 1,
  },
  jobService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  jobDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#C7C7CC',
  },
});

export default BookingsTab;
