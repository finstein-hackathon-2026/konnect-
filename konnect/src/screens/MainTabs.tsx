import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, useWindowDimensions } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import HomeTab from './tabs/HomeTab';
import BookingsTab from './tabs/BookingsTab';
import MessagesTab from './tabs/MessagesTab';
import ProfileTab from './tabs/ProfileTab';

const Tab = createBottomTabNavigator();

const MainTabs = ({ route }: any) => {
  const userId = route.params?.userId || 'sim-user';
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  
  const isDesktop = Platform.OS === 'web' && width >= 768;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'alert';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: isDesktop ? { display: 'none' } : {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_600SemiBold',
          fontSize: 10,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeTab} 
        options={{ tabBarLabel: 'Home' }}
        initialParams={{ userId }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsTab} 
        initialParams={{ userId }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesTab} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileTab} 
        initialParams={{ userId }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
