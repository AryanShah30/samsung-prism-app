import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Layout } from '../../constants/designSystem';

const Card = ({ 
  children, 
  style, 
  variant = 'default',
  padding = 'default',
  onPress,
  disabled = false,
  ...props 
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  const cardStyle = [
    styles.card,
    styles[variant],
    styles[`padding_${padding}`],
    disabled && styles.disabled,
    style,
  ];

  return (
    <CardComponent 
      style={cardStyle} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.95 : 1}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  default: {
    backgroundColor: Colors.background.card,
    borderColor: Colors.border.light,
  },
  elevated: {
    backgroundColor: Colors.background.card,
    borderColor: 'transparent',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  outlined: {
    backgroundColor: Colors.background.card,
    borderColor: Colors.border.medium,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  filled: {
    backgroundColor: Colors.gray[50],
    borderColor: Colors.gray[200],
  },
  
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: Spacing.md,
  },
  padding_default: {
    padding: Spacing.lg,
  },
  padding_lg: {
    padding: Spacing.xl,
  },
  
  disabled: {
    opacity: 0.6,
  },
});

export default Card;
