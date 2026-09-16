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

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please fill in both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Authentication Error', result.error);
    }
  };

  const prefillAdmin = () => {
    setEmail('admin@interconn.com');
    setPassword('AdminPassword123!');
  };

  const prefillSupervisor = () => {
    setEmail('supervisor@interconn.com');
    setPassword('SupervisorPassword123!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.logoTitle}>LegalMetrix</Text>
          <Text style={styles.subtitle}>
            Statutory LMPC Compliance & Inspection Mobile
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In to Account</Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. inspector@interconn.com"
            placeholderTextColor="#8E8E93"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#8E8E93"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activateLink}
            onPress={() => navigation.navigate('ActivateSupervisor')}
          >
            <Text style={styles.activateLinkText}>
              Have an invitation token? Activate Account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Quick Demo Credentials</Text>
          <View style={styles.demoButtonsRow}>
            <TouchableOpacity style={styles.demoBtn} onPress={prefillAdmin}>
              <Text style={styles.demoBtnText}>Fill Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.demoBtn} onPress={prefillSupervisor}>
              <Text style={styles.demoBtnText}>Fill Supervisor</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 32,
  },
  logoTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 20,
    textAlign: 'center',
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
  loginButton: {
    backgroundColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  activateLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  activateLinkText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  demoContainer: {
    marginTop: 28,
    alignItems: 'center',
  },
  demoTitle: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  demoBtnText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
});
