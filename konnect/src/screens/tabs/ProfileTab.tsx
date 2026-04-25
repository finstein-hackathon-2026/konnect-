import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOutUser } from '../../services/authService';

const ProfileTab = ({ navigation }: any) => {

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigation.replace('Auth');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderSettingRow = (icon: string, title: string, showChevron = true) => (
    <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon as any} size={20} color="#000000" />
      </View>
      <Text style={styles.settingTitle}>{title}</Text>
      {showChevron && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>John Doe</Text>
            <Text style={styles.phone}>+91 98765 43210</Text>
            <TouchableOpacity>
              <Text style={styles.editProfile}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet / Credits Card */}
        <View style={styles.walletCard}>
          <View>
            <Text style={styles.walletLabel}>Konnect Credits</Text>
            <Text style={styles.walletBalance}>₹1,250</Text>
          </View>
          <TouchableOpacity style={styles.addMoneyBtn}>
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingGroup}>
          {renderSettingRow('location-outline', 'Saved Addresses')}
          {renderSettingRow('card-outline', 'Payment Methods')}
          {renderSettingRow('notifications-outline', 'Notifications')}
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.settingGroup}>
          {renderSettingRow('help-circle-outline', 'Help Center')}
          {renderSettingRow('shield-checkmark-outline', 'Guarantee & Claims')}
          {renderSettingRow('document-text-outline', 'Terms of Service')}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Konnect v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  content: { padding: 24 },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: -1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  phone: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 4,
  },
  editProfile: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  walletCard: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  walletLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 4,
  },
  walletBalance: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  addMoneyBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addMoneyText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  settingGroup: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 32,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  settingIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    flex: 1,
    fontSize: 17,
    color: '#000000',
  },
  signOutBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  signOutText: {
    fontSize: 17,
    color: '#FF3B30',
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#C7C7CC',
    marginTop: 16,
  },
});

export default ProfileTab;
