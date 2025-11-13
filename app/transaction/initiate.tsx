import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function InitiateTransaction() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInitiate = async () => {
    if (!amount || !receiverId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call backend API to initiate transaction
      Alert.alert('Success', 'Transaction initiated successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Initiate Transaction</Text>
        <Text style={styles.subtitle}>Start a new secure payment</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Amount *</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#6b7280"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Receiver ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter receiver ID"
          placeholderTextColor="#6b7280"
          value={receiverId}
          onChangeText={setReceiverId}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Add a note (optional)"
          placeholderTextColor="#6b7280"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleInitiate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Initiating...' : 'Generate QR Code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  form: {
    padding: 24,
    paddingTop: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
});
