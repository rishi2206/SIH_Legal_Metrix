import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import api from '../config/api';

export default function AdminSupervisorDetailScreen({ route }) {
  const { supervisorId } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupervisorDetails();
  }, []);

  const fetchSupervisorDetails = async () => {
    try {
      const response = await api.get(`/api/admin/supervisors/${supervisorId}`);
      setDetails(response.data);
    } catch (error) {
      console.error('Failed to load supervisor details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const supervisor = details?.supervisor || {};
  const metrics = details?.metrics || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.name}>{supervisor.name || 'Pending Supervisor'}</Text>
          <Text style={styles.email}>{supervisor.email}</Text>
          <Text style={styles.phone}>Phone: {supervisor.phone || 'N/A'}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={styles.statusVal}>{supervisor.status}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Performance Metrics</Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricNum}>{metrics.totalInspections ?? 0}</Text>
            <Text style={styles.metricLabel}>Total Inspections</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={[styles.metricNum, { color: '#10B981' }]}>
              {metrics.compliantInspections ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Compliant</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={[styles.metricNum, { color: '#EF4444' }]}>
              {metrics.nonCompliantInspections ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Violations</Text>
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
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  email: {
    fontSize: 15,
    color: '#38BDF8',
    marginTop: 4,
  },
  phone: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusLabel: {
    color: '#CBD5E1',
    fontWeight: '600',
    marginRight: 6,
  },
  statusVal: {
    color: '#10B981',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricNum: {
    fontSize: 24,
    fontWeight: '800',
    color: '#38BDF8',
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
});
