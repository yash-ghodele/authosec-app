import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { brandColors, borderRadius, shadows, spacing } from '@/constants/brand';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'primary' | 'success';
}

export function AnimatedCard({ children, onPress, style, variant = 'default' }: AnimatedCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const cardStyles = [
    styles.card,
    variant === 'primary' && styles.primaryCard,
    variant === 'success' && styles.successCard,
    style,
  ];

  if (onPress) {
    return (
      <Animated.View style={[animatedStyle, cardStyles]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.pressable}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return <Animated.View style={[animatedStyle, cardStyles]}>{children}</Animated.View>;
}

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15 });
    }
  };

  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.primaryButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'success' && styles.successButton,
    disabled && styles.disabledButton,
  ];

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={buttonStyles}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={[styles.buttonText, disabled && styles.disabledText]}>
          {loading ? 'Loading...' : title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function FadeInView({ children, delay = 0, duration = 600 }: FadeInViewProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Trigger animation on mount
  setTimeout(() => {
    opacity.value = withTiming(1, { duration });
    translateY.value = withTiming(0, { duration });
  }, delay);

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: brandColors.light[300],
    ...shadows.md,
  },
  primaryCard: {
    borderColor: brandColors.primary[500],
    backgroundColor: brandColors.primary[50],
  },
  successCard: {
    borderColor: brandColors.success[500],
    backgroundColor: '#ecfdf5',
  },
  pressable: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  primaryButton: {
    backgroundColor: brandColors.primary[600],
  },
  secondaryButton: {
    backgroundColor: brandColors.light[200],
    borderWidth: 1,
    borderColor: brandColors.light[300],
  },
  successButton: {
    backgroundColor: brandColors.success[600],
  },
  disabledButton: {
    backgroundColor: brandColors.light[300],
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: brandColors.light[500],
  },
  icon: {
    marginRight: spacing.sm,
  },
});
