import React from 'react';
import { Text, TextProps, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme/theme';

interface ThemedTextProps extends TextProps {
  variant?: keyof typeof theme.typography;
  secondary?: boolean;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  style, 
  variant = 'body', 
  secondary = false,
  ...props 
}) => {
  const { colors } = useTheme();
  
  const textStyle = {
    color: secondary ? colors.secondaryText : colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_400Regular', // Will fallback if Inter not loaded
    ...theme.typography[variant],
  };

  return <Text style={[textStyle, style]} {...props} />;
};
