import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { submitIssue } from '../services/jobService';

const ISSUES = [
  { id: 'not_fixed', label: 'Not Fixed', icon: '❌', description: 'The problem was not resolved' },
  { id: 'poor_quality', label: 'Poor Quality', icon: '👎', description: 'Work quality is below expectations' },
  { id: 'incomplete', label: 'Incomplete Work', icon: '⚠️', description: 'Work was left unfinished' },
  { id: 'damage', label: 'Property Damage', icon: '🏠', description: 'Damage caused during work' },
];

const IssueScreen = ({ navigation, route }: any) => {
  const { jobId, userId } = route.params;
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedIssue) {
      Alert.alert('Error', 'Please select an issue type');
      return;
    }

    setLoading(true);
    try {
      await submitIssue(jobId, userId, selectedIssue);
      setSubmitted(true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigation.popToTop();
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.successContent}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Report Submitted</Text>
            <Text style={styles.successSubtitle}>
              We have received your report. Our team will review the details and contact you within 24 hours with a resolution.
            </Text>
            <PrimaryButton
              title="Return to Home"
              onPress={handleGoHome}
              style={styles.homeBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Report an Issue</Text>
          <Text style={styles.subtitle}>
            Please let us know what went wrong with your service.
          </Text>

          <View style={styles.issueList}>
            {ISSUES.map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={[
                  styles.issueCard,
                  selectedIssue === issue.id && styles.issueCardActive,
                ]}
                onPress={() => setSelectedIssue(issue.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.issueIcon}>{issue.icon}</Text>
                <View style={styles.issueInfo}>
                  <Text
                    style={[
                      styles.issueLabel,
                      selectedIssue === issue.id && styles.issueLabelActive,
                    ]}
                  >
                    {issue.label}
                  </Text>
                  <Text style={styles.issueDesc}>{issue.description}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    selectedIssue === issue.id && styles.radioActive,
                  ]}
                >
                  {selectedIssue === issue.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <PrimaryButton
            title="Submit Report"
            onPress={handleSubmit}
            loading={loading}
            disabled={!selectedIssue}
            style={styles.submitBtn}
          />
        </View>
      </View>
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
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
    marginBottom: 32,
    lineHeight: 22,
  },
  issueList: {
    gap: 12,
    marginBottom: 40,
  },
  issueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  issueCardActive: {
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  issueIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  issueInfo: {
    flex: 1,
  },
  issueLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  issueLabelActive: {
    color: '#000000',
  },
  issueDesc: {
    fontSize: 14,
    color: '#8E8E93',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  radioActive: {
    borderColor: '#000000',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
  },
  submitBtn: {
    marginTop: 'auto',
    marginBottom: 16,
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  successSubtitle: {
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  homeBtn: {
    width: '100%',
  },
});

export default IssueScreen;
