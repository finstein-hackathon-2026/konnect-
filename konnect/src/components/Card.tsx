import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface CardProps extends ViewProps {
  padding?: number;
  radius?: number;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  padding = 20,
  radius = 18,
  ...props 
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card, 
          padding, 
          borderRadius: radius,
          shadowColor: '#000',
          shadowOpacity: isDark ? 0 : 0.05,
        }, 
        style
      ]} 
      {...props}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
});
