import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api, { getUser } from '../services/api';

const SERVICES = ['Plumber', 'Electrician', 'Cleaner', 'Carpenter', 'Painter'];

export default function PostJobScreen({ navigation }: any) {
  const [selected, setSelected] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  // Default to 30 minutes from now so it's never instantly stale
  const [date, setDate] = useState(new Date(Date.now() + 30 * 60000));
  const [tempDate, setTempDate] = useState(new Date(Date.now() + 30 * 60000));
  const [dateChanged, setDateChanged] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const openPicker = () => {
    setTempDate(date);
    setMode('date');
    setShowPicker(true);
  };

  const handleConfirmPicker = () => {
    if (mode === 'date') {
      setMode('time');
    } else {
      if (tempDate < new Date()) {
        Alert.alert('Error', 'Cannot select past date/time');
        return;
      }
      setDate(tempDate);
      setDateChanged(true);
      setShowPicker(false);
    }
  };

  const handlePost = async () => {
    if (!selected) {
      Alert.alert('Select a service', 'Please choose a service type.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Add details', 'Please describe what you need help with.');
      return;
    }
    // Only block if the user explicitly picked a past time
    if (dateChanged && date < new Date()) {
      Alert.alert('Error', 'Cannot select past date/time');
      return;
    }

    setLoading(true);
    try {
      const user = await getUser();
      if (!user?.id) {
        Alert.alert('Error', 'You must be logged in.');
        navigation.replace('Login');
        return;
      }

      const res = await api.post('/jobs', {
        service: selected,
        description: description.trim(),
        scheduledFor: date.toISOString(),
        userId: user.id,
      });

      const jobId = res.data?.data?._id || res.data?._id || res.data?.id;

      if (jobId) {
        navigation.navigate('Matching', { jobId });
      } else {
        Alert.alert('Success', 'Job posted! Waiting for a worker.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Failed to post job. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>What do you need?</Text>
        <Text style={styles.sub}>Select a service</Text>

        <View style={styles.grid}>
          {SERVICES.map((svc) => (
            <TouchableOpacity
              key={svc}
              style={[
                styles.chip,
                selected === svc && styles.chipSelected,
              ]}
              onPress={() => setSelected(svc)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  selected === svc && styles.chipTextSelected,
                ]}
              >
                {svc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Describe the problem</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Leaking pipe under kitchen sink..."
          placeholderTextColor="#555"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>When do you need it?</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={openPicker}
          activeOpacity={0.7}
        >
          <Text style={styles.dateButtonText}>
            {date.toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  Select {mode === 'date' ? 'Date' : 'Time'}
                </Text>
                <TouchableOpacity onPress={handleConfirmPicker}>
                  <Text style={styles.modalConfirm}>
                    {mode === 'date' ? 'Next' : 'Confirm'}
                  </Text>
                </TouchableOpacity>
              </View>

              {Platform.OS === 'web' ? (
                <input
                  type="datetime-local"
                  defaultValue={new Date(tempDate.getTime() - tempDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setTempDate(new Date(e.target.value));
                    }
                  }}
                  style={{
                    backgroundColor: '#111',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '14px',
                    border: '1px solid #222',
                    margin: '20px',
                    fontFamily: 'system-ui',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={tempDate}
                  mode={mode}
                  is24Hour={false}
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(e, selectedDate) => {
                    if (selectedDate) setTempDate(selectedDate);
                  }}
                  themeVariant="dark"
                  textColor="#fff"
                />
              )}
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handlePost}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Post Job</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
  },
  sub: {
    fontSize: 15,
    color: '#888',
    marginTop: 6,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#111',
  },
  chipSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  chipText: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#000',
  },
  label: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    fontSize: 16,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222',
    minHeight: 120,
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: '#111',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 28,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderColor: '#222',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancel: {
    color: '#888',
    fontSize: 16,
  },
  modalConfirm: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '600',
  },
});
