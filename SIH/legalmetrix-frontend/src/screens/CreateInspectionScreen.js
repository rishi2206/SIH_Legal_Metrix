import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../config/api';

export default function CreateInspectionScreen({ navigation }) {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!location.trim()) {
      Alert.alert('Location Required', 'Please enter the retail/warehouse location name.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/inspections', { location: location.trim() });
      Alert.alert(
        'Inspection Initialized',
        'New inspection record created successfully.',
        [
          {
            text: 'Proceed to Upload Evidence',
            onPress: () =>
              navigation.replace('InspectionDetail', { inspectionId: response.data.id }),
          },
        ]
      );
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create inspection';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create LMPC Inspection</Text>
        <Text style={styles.subtitle}>
          Initialize a new packaged commodity inspection session for statutory verification.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Inspection Location / Store Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. D-Mart Central, Sector 18, Noida"
            placeholderTextColor="#8E8E93"
            value={location}
            onChangeText={setLocation}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Initialize Session</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    color: '#CBD5E1',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
  },
});
