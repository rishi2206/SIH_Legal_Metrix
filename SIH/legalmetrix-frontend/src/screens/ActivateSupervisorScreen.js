import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ActivateSupervisorScreen({ navigation }) {
  const { activateSupervisor } = useContext(AuthContext);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!token || !password || !name) {
      Alert.alert('Required Fields', 'Please fill in token, password, and name.');
      return;
    }

    setLoading(true);
    const result = await activateSupervisor(token.trim(), password, name.trim(), phone.trim());
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Activation Successful',
        'Your supervisor account has been activated! Please sign in with your credentials.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Activation Error', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.logoTitle}>Account Activation</Text>
          <Text style={styles.subtitle}>Activate your assigned Supervisor credentials</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Invitation Token</Text>
          <TextInput
            style={styles.input}
            placeholder="Paste invite token here"
            placeholderTextColor="#8E8E93"
            value={token}
            onChangeText={setToken}
          />

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#8E8E93"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            placeholderTextColor="#8E8E93"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Set Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#8E8E93"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.activateButton}
            onPress={handleActivate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.activateButtonText}>Activate Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backLinkText}>← Back to Sign In</Text>
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
  scrollContainer: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#38BDF8',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 15,
    marginBottom: 16,
  },
  activateButton: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backLinkText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
