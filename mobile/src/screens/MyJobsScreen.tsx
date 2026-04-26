import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import api, { getUser, authHeaders } from '../services/api';

type Job = {
  _id: string;
  service: string;
  status: string;
  payout?: string;
  createdAt: string;
  id?: string;
};

export default function MyJobsScreen({ navigation }: any) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const user = await getUser();
        if (!user?.id) return;
        const headers = await authHeaders();
        const res = await api.get(`/jobs?userId=${user.id}`, { headers });
        setJobs(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleRehire = async (jobId: string) => {
    try {
      const headers = await authHeaders();
      const res = await api.post(`/jobs/rehire/${jobId}`, {}, { headers });
      const newJobId = res.data?.data?._id || res.data?._id || res.data?.id;
      if (newJobId) {
        navigation.navigate('Matching', { jobId: newJobId });
      } else {
        Alert.alert('Success', 'Rehire request sent.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to rehire. Try again.';
      Alert.alert('Error', msg);
    }
  };

  const renderItem = ({ item }: { item: Job }) => {
    const isCompleted = item.status === 'completed';
    const isWithinGuarantee = (Date.now() - new Date(item.createdAt).getTime()) <= 7 * 24 * 60 * 60 * 1000;
    const jobId = item._id || item.id || '';

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.service}>{item.service}</Text>
          <Text style={styles.status}>{item.status}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.payout && <Text style={styles.payout}>{item.payout}</Text>}
        </View>

        {isCompleted && isWithinGuarantee && (
          <TouchableOpacity
            style={styles.rehireButton}
            onPress={() => handleRehire(jobId)}
            activeOpacity={0.8}
          >
            <Text style={styles.rehireText}>Rehire</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Jobs</Text>

      {jobs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No jobs yet.</Text>
          <TouchableOpacity
            style={styles.goButton}
            onPress={() => navigation.navigate('PostJob')}
            activeOpacity={0.8}
          >
            <Text style={styles.goText}>Post Your First Job</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 24,
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  service: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  status: {
    color: '#888',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  date: {
    color: '#555',
    fontSize: 13,
  },
  payout: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#555',
    fontSize: 16,
    marginBottom: 20,
  },
  goButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  goText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  rehireButton: {
    backgroundColor: '#fff',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rehireText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
});
