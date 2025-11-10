/**
 * StatusIcon – visual indicator for item freshness/expiry with animated pulse.
 *
 * Variants:
 *  - 'dot': simple colored circle (default)
 *  - 'badge': pill + dot + label
 *  - 'pill': pill + label only
 *
 * Pulsing behavior triggers for critical/expiring states to attract attention.
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Typography, BorderRadius } from '../../constants/designSystem';

const StatusIcon = ({ 
  daysUntilExpiry, 
  size = 'medium',
  showText = false,
  variant = 'dot' 
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getSizeValue = () => {
    const sizeMap = {
      xs: 8,
      sm: 12,
      medium: 16,
      lg: 20,
      xl: 24,
    };
    return sizeMap[size] || sizeMap.medium;
  };

  const getStatusInfo = () => {
    if (daysUntilExpiry < 0) {
      return {
        color: Colors.status.expired,
        backgroundColor: Colors.danger[50],
        textColor: Colors.danger[700],
        shouldPulse: true,
        label: 'Expired',
      };
    } else if (daysUntilExpiry === 0) {
      return {
        color: Colors.status.critical,
        backgroundColor: Colors.danger[50],
        textColor: Colors.danger[700],
        shouldPulse: true,
        label: 'Today',
      };
    } else if (daysUntilExpiry <= 3) {
      return {
        color: Colors.status.expiring,
        backgroundColor: Colors.warning[50],
        textColor: Colors.warning[700],
        shouldPulse: true,
        label: `${daysUntilExpiry}d`,
      };
    } else {
      return {
        color: Colors.status.fresh,
        backgroundColor: Colors.success[50],
        textColor: Colors.success[700],
        shouldPulse: false,
        label: `${daysUntilExpiry}d`,
      };
    }
  };

  const { color, backgroundColor, textColor, shouldPulse, label } = getStatusInfo();
  const sizeValue = getSizeValue();

  useEffect(() => {
    if (shouldPulse) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [shouldPulse, pulseAnim]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (variant === 'badge') {
    return (
      <Animated.View
        style={[
          styles.badge,
          {
            backgroundColor,
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.badgeDot,
            {
              backgroundColor: color,
              width: 6,
              height: 6,
              borderRadius: 3,
            },
          ]}
        />
        <Text
          style={[
            styles.badgeText,
            {
              color: textColor,
              fontSize: Typography.fontSize.xs,
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    );
  }

  if (variant === 'pill') {
    return (
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor,
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Text
          style={[
            styles.pillText,
            {
              color: textColor,
              fontSize: Typography.fontSize.xs,
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: color,
            width: sizeValue,
            height: sizeValue,
            borderRadius: sizeValue / 2,
            transform: [{ scale: pulseAnim }],
            opacity: fadeAnim,
          },
        ]}
      />
      {showText && (
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: Typography.fontSize.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  dot: {
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  text: {
    marginTop: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  
  badgeDot: {
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  badgeText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  
  pillText: {
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
});

export default StatusIcon;
