import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { brandColors } from '@/constants/brand';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function AuthoSecLogo({ size = 40, showText = true }: LogoProps) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={brandColors.primary[500]} />
            <Stop offset="100%" stopColor={brandColors.primary[700]} />
          </LinearGradient>
        </Defs>
        
        {/* QR Code inspired design */}
        <Path
          d="M20 20 L20 45 L45 45 L45 20 Z M25 25 L25 40 L40 40 L40 25 Z"
          fill="url(#gradient)"
        />
        <Path
          d="M55 20 L55 45 L80 45 L80 20 Z M60 25 L60 40 L75 40 L75 25 Z"
          fill="url(#gradient)"
        />
        <Path
          d="M20 55 L20 80 L45 80 L45 55 Z M25 60 L25 75 L40 75 L40 60 Z"
          fill="url(#gradient)"
        />
        
        {/* Security lock */}
        <Path
          d="M70 60 C70 55 65 50 60 50 C55 50 50 55 50 60 L50 65 L50 80 L70 80 L70 65 Z M55 60 C55 57 57 55 60 55 C63 55 65 57 65 60 L65 65 L55 65 Z"
          fill={brandColors.success[500]}
        />
      </Svg>
      
      {showText && (
        <View style={styles.textContainer}>
          <Svg width={120} height={24} viewBox="0 0 120 24">
            <Defs>
              <LinearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={brandColors.primary[400]} />
                <Stop offset="100%" stopColor={brandColors.primary[600]} />
              </LinearGradient>
            </Defs>
          </Svg>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
  },
});
