import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { brandColors } from '@/constants/brand';
import { AuthoSecLogo } from './logo';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <AuthoSecLogo size={80} showText={false} />
      <ActivityIndicator 
        size="large" 
        color={brandColors.primary[500]} 
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.dark[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 24,
  },
});
