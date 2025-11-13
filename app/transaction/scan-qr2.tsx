import { View, Text, StyleSheet } from 'react-native';

export default function ScanQR2() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Scan QR2 Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
});
