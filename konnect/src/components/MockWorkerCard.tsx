import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface MockWorkerCardProps {
  name: string;
  distance: string;
  rating: number;
}

const MockWorkerCard: React.FC<MockWorkerCardProps> = ({ name, distance, rating }) => {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.row}>
          <Text style={styles.detailText}>📍 {distance}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.detailText}>⭐ {rating}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  avatarText: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  dot: {
    color: '#D1D1D6',
    marginHorizontal: 6,
    fontSize: 14,
  },
});

export default MockWorkerCard;
