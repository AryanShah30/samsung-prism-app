/**
 * Button – actionable element supporting variants, sizes, loading state and icons.
 *
 * Variants: primary | secondary | outline | ghost | danger
 * Sizes: small | medium | large
 * Loading: shows spinner, suppresses text/icons
 * Disabled: prevents press; dims style
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Typography, BorderRadius, Layout } from '../../constants/designSystem';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props 
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary[500] : Colors.text.white} 
        />
      );
    }

    return (
      <>
        {leftIcon && <>{leftIcon}</>}
        <Text style={buttonTextStyle}>{title}</Text>
        {rightIcon && <>{rightIcon}</>}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  primary: {
    backgroundColor: Colors.primary[500],
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  danger: {
    backgroundColor: Colors.danger[500],
    borderWidth: 0,
  },
  
  small: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: Layout.buttonHeight.sm,
  },
  medium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: Layout.buttonHeight.md,
  },
  large: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: Layout.buttonHeight.lg,
  },

  disabled: {
    backgroundColor: Colors.gray[100],
    borderColor: Colors.gray[200],
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  text: {
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  
  primaryText: {
    color: Colors.text.white,
  },
  secondaryText: {
    color: Colors.text.primary,
  },
  outlineText: {
    color: Colors.primary[500],
  },
  ghostText: {
    color: Colors.primary[500],
  },
  dangerText: {
    color: Colors.text.white,
  },
  
  smallText: {
    fontSize: Typography.fontSize.sm,
  },
  mediumText: {
    fontSize: Typography.fontSize.base,
  },
  largeText: {
    fontSize: Typography.fontSize.lg,
  },
  
  disabledText: {
    color: Colors.text.muted,
  },
});

export default Button;
