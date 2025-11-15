import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { brandColors, spacing, typography } from '@/constants/brand';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  style?: ViewStyle;
  dark?: boolean;
}

export function LoadingSpinner({ size = 'large', text, style, dark = true }: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={dark ? brandColors.primary[500] : brandColors.primary[600]} />
      {text && <Text style={[styles.text, dark && styles.darkText]}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: '#FFFFFF',
  },
  text: {
    ...typography.body,
    color: brandColors.light[600],
    marginTop: spacing.md,
  },
  darkText: {
    color: brandColors.light[500],
  },
});

