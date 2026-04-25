import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

export const DesktopSidebar = () => {
  const { colors } = useTheme();
  // Using a simplified navigation approach for the custom sidebar
  // In a real app, you'd sync this with React Navigation state
  
  const navItems = [
    { name: 'HomeTab', label: 'Home', icon: 'home' },
    { name: 'Bookings', label: 'Bookings', icon: 'document-text' },
    { name: 'Messages', label: 'Messages', icon: 'chatbubbles' },
    { name: 'Profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <ThemedView style={styles.sidebar}>
      <View style={styles.header}>
        <ThemedText variant="h2" style={styles.logo}>konnect</ThemedText>
      </View>

      <View style={styles.navContainer}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[styles.navItem, { borderLeftColor: 'transparent' }]}
          >
            <Ionicons name={item.icon as any} size={24} color={colors.secondaryText} style={styles.navIcon} />
            <ThemedText style={{ color: colors.secondaryText, fontWeight: '600' }}>
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <ThemeToggle />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    height: '100%',
    paddingVertical: 32,
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  logo: {
    letterSpacing: -1,
  },
  navContainer: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderLeftWidth: 3,
  },
  navIcon: {
    marginRight: 16,
  },
  footer: {
    paddingHorizontal: 24,
  },
});
