import React from 'react';
import { View, TextInput, StyleSheet, Platform, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface InputFieldProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ icon, error, style, ...props }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputWrapper, 
        { backgroundColor: colors.card, borderColor: error ? colors.error : colors.border }
      ]}>
        {icon && (
          <Ionicons name={icon} size={20} color={colors.secondaryText} style={styles.icon} />
        )}
        <TextInput
          style={[styles.input, { color: colors.primary }, style]}
          placeholderTextColor={colors.secondaryText}
          {...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {})}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    padding: 0,
  },
});
