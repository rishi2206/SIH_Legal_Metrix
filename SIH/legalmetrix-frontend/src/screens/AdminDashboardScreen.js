import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/api/dashboard/admin');
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching admin dashboard metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Admin Overview</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderColor: '#38BDF8' }]}>
                <Text style={styles.statNumber}>
                  {metrics?.totalInspections ?? 0}
                </Text>
                <Text style={styles.statLabel}>Total Inspections</Text>
              </View>

              <View style={[styles.statCard, { borderColor: '#10B981' }]}>
                <Text style={[styles.statNumber, { color: '#10B981' }]}>
                  {metrics?.compliantCount ?? 0}
                </Text>
                <Text style={styles.statLabel}>Compliant</Text>
              </View>

              <View style={[styles.statCard, { borderColor: '#EF4444' }]}>
                <Text style={[styles.statNumber, { color: '#EF4444' }]}>
                  {metrics?.nonCompliantCount ?? 0}
                </Text>
                <Text style={styles.statLabel}>Violations</Text>
              </View>

              <View style={[styles.statCard, { borderColor: '#F59E0B' }]}>
                <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                  {metrics?.activeSupervisors ?? 0}
                </Text>
                <Text style={styles.statLabel}>Supervisors</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Quick Management Actions</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminSupervisors')}
            >
              <Text style={styles.actionTitle}>👥 Supervisor Management</Text>
              <Text style={styles.actionDesc}>
                View active supervisors, track performance, or issue new invite tokens.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AuditLog')}
            >
              <Text style={styles.actionTitle}>📋 Audit Logs & Trail</Text>
              <Text style={styles.actionDesc}>
                Inspect security events, login attempts, inspection edits, and AI extractions.
              </Text>
            </TouchableOpacity>
          </>
        )}
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
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  userEmail: {
    fontSize: 14,
    color: '#38BDF8',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#38BDF8',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
});
