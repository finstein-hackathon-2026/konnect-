import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ThemedView: React.FC<ViewProps & { variant?: 'background' | 'card' }> = ({ 
  style, 
  variant = 'background', 
  ...props 
}) => {
  const { colors } = useTheme();
  return (
    <View 
      style={[{ backgroundColor: variant === 'card' ? colors.card : colors.background }, style]} 
      {...props} 
    />
  );
};
