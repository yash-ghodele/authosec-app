import { Image, View, StyleSheet, Text } from 'react-native';
import { brandColors } from '@/constants/brand';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function AuthoSecLogo({ size = 40, showText = true }: LogoProps) {
  const logoSize = size;
  const textSize = size * 0.4;

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/ChatGPT Image Nov 14, 2025, 01_39_54 PM.png')}
        style={[styles.logo, { width: logoSize, height: logoSize }]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.text, { fontSize: textSize }]}>AUTHOSEC</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginBottom: 4,
  },
  text: {
    color: brandColors.primary[600],
    fontWeight: '700',
    letterSpacing: 1,
  },
});
