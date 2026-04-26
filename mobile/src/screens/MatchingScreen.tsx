import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../services/api';

type JobStatus = 'pending' | 'accepted' | 'assigned' | 'in_progress' | 'on_the_way' | 'arrived' | 'verified' | 'completed';

const STATUS_DISPLAY: Record<string, { emoji: string; text: string }> = {
  pending:     { emoji: '🔍', text: 'Looking for a worker...' },
  assigned:    { emoji: '✅', text: 'Worker found!' },
  accepted:    { emoji: '✅', text: 'Worker found!' },
  on_the_way:  { emoji: '🚀', text: 'Worker is on the way!' },
  in_progress: { emoji: '🚀', text: 'Worker is on the way!' },
  arrived:     { emoji: '📍', text: 'Worker has arrived!' },
  verified:    { emoji: '🔒', text: 'Identity verified!' },
  completed:   { emoji: '🎉', text: 'Job completed!' },
};

export default function MatchingScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const [status, setStatus] = useState<JobStatus>('pending');
  const [isPaid, setIsPaid] = useState(false);
  const [paying, setPaying] = useState(false);

  const handlePayment = () => {
    setPaying(true);
    // Simulate network delay for payment processing
    setTimeout(() => {
      setPaying(false);
      setIsPaid(true);
      Alert.alert('Payment Successful', 'Thank you for using KoNNecT!');
    }, 1500);
  };

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    // Listen for updates on this specific job
    socket.on('job_updated', (job: any) => {
      const id = job._id || job.id;
      if (id === jobId) {
        setStatus(job.status);
      }
    });

    socket.on('job_created', (job: any) => {
      const id = job._id || job.id;
      if (id === jobId) {
        setStatus(job.status);
      }
    });

    socket.on('connect_error', (err: any) => {
      console.log('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [jobId]);

  const current = STATUS_DISPLAY[status] || STATUS_DISPLAY.pending;
  const isCompleted = status === 'completed';
  const isPending = status === 'pending';

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.emoji}>{current.emoji}</Text>
        <Text style={styles.statusText}>{current.text}</Text>

        {isPending && (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={styles.spinner}
          />
        )}

        {!isPending && !isCompleted && (
          <Text style={styles.hint}>Waiting for next update...</Text>
        )}

        {isCompleted && !isPaid && (
          <TouchableOpacity
            style={[styles.payButton, paying && styles.buttonDisabled]}
            onPress={handlePayment}
            activeOpacity={0.8}
            disabled={paying}
          >
            {paying ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.payText}>Pay Now</Text>
            )}
          </TouchableOpacity>
        )}

        {isCompleted && isPaid && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.8}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.jobId}>Job: {jobId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  center: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  spinner: {
    marginTop: 32,
  },
  hint: {
    color: '#555',
    fontSize: 14,
    marginTop: 20,
  },
  doneButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 36,
  },
  doneText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
  },
  payButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 36,
    minWidth: 160,
    alignItems: 'center',
  },
  payText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  jobId: {
    position: 'absolute',
    bottom: 40,
    color: '#333',
    fontSize: 12,
  },
});
