import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Platform, View, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DesktopSidebar } from './src/components/DesktopSidebar';
import AuthScreen from './src/screens/AuthScreen';
import MainTabs from './src/screens/MainTabs';
import PostJobScreen from './src/screens/PostJobScreen';
import MatchingScreen from './src/screens/MatchingScreen';
import ActiveJobScreen from './src/screens/ActiveJobScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import CompletionScreen from './src/screens/CompletionScreen';
import GuaranteeScreen from './src/screens/GuaranteeScreen';
import IssueScreen from './src/screens/IssueScreen';

const Stack = createNativeStackNavigator();

const NavigationWrapper = () => {
  const { colors } = useTheme();

  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.primary,
    headerTitleStyle: {
      fontWeight: '600' as const,
      fontSize: 16,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_600SemiBold',
    },
    headerShadowVisible: false,
    contentStyle: {
      backgroundColor: colors.background,
    },
    headerBackTitleVisible: false,
    animation: 'fade' as const,
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth" screenOptions={screenOptions}>
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PostJob" component={PostJobScreen} options={{ title: 'Post a Job' }} />
        <Stack.Screen name="Matching" component={MatchingScreen} options={{ title: '', headerTransparent: true }} />
        <Stack.Screen name="ActiveJob" component={ActiveJobScreen} options={{ title: 'Active Job', headerBackVisible: false }} />
        <Stack.Screen name="Verify" component={VerifyScreen} options={{ title: 'Verify Worker' }} />
        <Stack.Screen name="Completion" component={CompletionScreen} options={{ title: 'Job Complete', headerBackVisible: false }} />
        <Stack.Screen name="Guarantee" component={GuaranteeScreen} options={{ title: 'Konnect Guarantee' }} />
        <Stack.Screen name="Issue" component={IssueScreen} options={{ title: 'Report Issue' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const AppContent = () => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {isDesktop ? (
        <View style={styles.desktopLayout}>
          <DesktopSidebar />
          <View style={styles.mainContent}>
            <View style={styles.desktopConstraint}>
              <NavigationWrapper />
            </View>
          </View>
        </View>
      ) : (
        <NavigationWrapper />
      )}
    </View>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
  },
  desktopConstraint: {
    width: '100%',
    maxWidth: 1200,
    height: '100%',
  },
});
