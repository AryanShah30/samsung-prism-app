/**
 * Input – text field with optional label, helper/error text, icons and secure toggle.
 *
 * Features:
 *  - Size variants (small|medium|large)
 *  - Secure text visibility toggle for passwords
 *  - Inline error state & helper messaging
 *  - Optional left/right icon slots
 *  - Multiline support
 */
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Typography, BorderRadius, Layout } from '../../constants/designSystem';
import { Eye, EyeOff } from 'lucide-react-native';

const Input = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  error,
  helperText,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  disabled = false,
  size = 'medium',
  variant = 'default',
  ...props 
}) => {
  const [isSecureTextVisible, setIsSecureTextVisible] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const toggleSecureText = () => {
    setIsSecureTextVisible(!isSecureTextVisible);
  };

  const inputContainerStyle = [
    styles.inputContainer,
    styles[`size_${size}`],
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
    inputStyle,
  ];

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            styles[`inputSize_${size}`],
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            multiline && styles.multilineInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.muted}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry && !isSecureTextVisible}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={toggleSecureText}
          >
            {isSecureTextVisible ? (
              <EyeOff size={20} color={Colors.gray[500]} />
            ) : (
              <Eye size={20} color={Colors.gray[500]} />
            )}
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
    color: Colors.text.primary,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.primary,
  },
  
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  size_small: {
    minHeight: Layout.inputHeight.sm,
  },
  size_medium: {
    minHeight: Layout.inputHeight.md,
  },
  size_large: {
    minHeight: Layout.inputHeight.lg,
  },
  
  inputSize_small: {
    fontSize: Typography.fontSize.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  inputSize_medium: {
    fontSize: Typography.fontSize.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputSize_large: {
    fontSize: Typography.fontSize.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  
  focused: {
    borderColor: Colors.border.focus,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  error: {
    borderColor: Colors.danger[500],
  },
  
  disabled: {
    backgroundColor: Colors.gray[50],
    borderColor: Colors.gray[200],
  },
  
  leftIconContainer: {
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
  },
  
  rightIconContainer: {
    paddingRight: Spacing.md,
    paddingLeft: Spacing.sm,
  },

  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  
  inputWithRightIcon: {
    paddingRight: 0,
  },
  
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
    paddingTop: Spacing.sm,
  },

  helperText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  
  errorText: {
    color: Colors.danger[500],
  },
});

export default Input;
