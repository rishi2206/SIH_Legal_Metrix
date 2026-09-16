import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </Text>
        </View>

        <Text style={styles.name}>{user?.name || 'Authorized User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Architecture & System Details</Text>
          <Text style={styles.infoRow}>Mobile Frontend: React Native JavaScript CLI</Text>
          <Text style={styles.infoRow}>Core Backend: Spring Boot API & LMPC Engine</Text>
          <Text style={styles.infoRow}>Database: Supabase PostgreSQL</Text>
          <Text style={styles.infoRow}>Storage: Supabase Storage Buckets</Text>
          <Text style={styles.infoRow}>AI Microservice: FastAPI (OpenCV + PaddleOCR + Gemini)</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Log Out of Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  email: {
    fontSize: 14,
    color: '#38BDF8',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: {
    color: '#38BDF8',
    fontWeight: '700',
    marginBottom: 8,
  },
  infoRow: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  logoutBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 32,
  },
  logoutBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
