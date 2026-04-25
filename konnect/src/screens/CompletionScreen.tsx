import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { completeJob } from '../services/jobService';

const PRICES = [200, 500, 800, 1000, 1500, 2000];

const CompletionScreen = ({ navigation, route }: any) => {
  const { jobId, userId, workerName, service } = route.params;
  const [rating, setRating] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please give a rating');
      return;
    }
    if (selectedPrice === null) {
      Alert.alert('Error', 'Please select a price');
      return;
    }

    setLoading(true);
    try {
      await completeJob(jobId, rating, selectedPrice);
      navigation.replace('Guarantee', { jobId, userId, workerName, service });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>All done!</Text>
          <Text style={styles.subtitle}>
            How was your experience with {workerName}?
          </Text>
        </View>

        {/* Rating */}
        <Text style={styles.label}>Rate the service</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              activeOpacity={0.7}
            >
              <Text style={[styles.star, star <= rating && styles.starActive]}>
                {star <= rating ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price */}
        <Text style={styles.label}>Amount Paid</Text>
        <View style={styles.priceGrid}>
          {PRICES.map((price) => (
            <TouchableOpacity
              key={price}
              style={[
                styles.priceChip,
                selectedPrice === price && styles.priceChipActive,
              ]}
              onPress={() => setSelectedPrice(price)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.priceText,
                  selectedPrice === price && styles.priceTextActive,
                ]}
              >
                ₹{price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          title="Complete Job"
          onPress={handleComplete}
          loading={loading}
          disabled={rating === 0 || selectedPrice === null}
          style={styles.submitBtn}
        />
      </ScrollView>
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
    padding: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    alignSelf: 'flex-start',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
  },
  star: {
    fontSize: 48,
    color: '#E5E5EA',
  },
  starActive: {
    color: '#FF9500',
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginBottom: 40,
  },
  priceChip: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  priceChipActive: {
    backgroundColor: '#000000',
  },
  priceText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '600',
  },
  priceTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    width: '100%',
  },
});

export default CompletionScreen;
