import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import { createJob } from '../services/jobService';

const SERVICES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Cleaner'];
const ESTIMATES: Record<string, string> = {
  Plumber: '₹400 - ₹800',
  Electrician: '₹300 - ₹600',
  Carpenter: '₹500 - ₹1200',
  Painter: '₹1000 - ₹5000',
  Cleaner: '₹600 - ₹1500',
};

const PostJobScreen = ({ navigation, route }: any) => {
  const userId = route.params?.userId || 'sim-user';
  const preselected = route.params?.preselectedService || '';
  const [selectedService, setSelectedService] = useState(preselected);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedService) {
      Alert.alert('Error', 'Please select a service type');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const jobId = await createJob(userId, selectedService, description.trim());
      navigation.navigate('Matching', { jobId, userId, service: selectedService });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionLabel}>Service Location</Text>
        <TouchableOpacity style={styles.locationCard} activeOpacity={0.8}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={24} color="#8E8E93" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Home</Text>
            <Text style={styles.locationDesc}>123 Main Street, Downtown</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Select Category</Text>
        <View style={styles.serviceGrid}>
          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service}
              style={[
                styles.serviceChip,
                selectedService === service && styles.serviceChipActive,
              ]}
              onPress={() => setSelectedService(service)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.serviceChipText,
                  selectedService === service && styles.serviceChipTextActive,
                ]}
              >
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="What needs to be done?"
          placeholderTextColor="#C7C7CC"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
          {...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {})}
        />

        {selectedService ? (
          <View style={styles.estimateCard}>
            <Ionicons name="pricetag" size={16} color="#007AFF" />
            <Text style={styles.estimateText}>
              Est. Cost: <Text style={styles.estimateBold}>{ESTIMATES[selectedService]}</Text>
            </Text>
          </View>
        ) : null}

        <PrimaryButton
          title="Find Workers"
          onPress={handleSubmit}
          loading={loading}
          disabled={!selectedService || !description.trim()}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  content: { padding: 24 },
  sectionLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  mapPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationInfo: { flex: 1 },
  locationTitle: { fontSize: 15, fontWeight: '600', color: '#000000' },
  locationDesc: { fontSize: 13, color: '#8E8E93' },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  serviceChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  serviceChipActive: { backgroundColor: '#000000' },
  serviceChipText: { fontSize: 14, color: '#000000', fontWeight: '500' },
  serviceChipTextActive: { color: '#FFFFFF' },
  textArea: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    color: '#000000',
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
  },
  estimateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  estimateText: { marginLeft: 8, fontSize: 14, color: '#007AFF' },
  estimateBold: { fontWeight: '700' },
});

export default PostJobScreen;
