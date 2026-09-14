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

export default function SupervisorDashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/dashboard/supervisor');
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching supervisor dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
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
          <Text style={styles.welcomeText}>Inspector Portal</Text>
          <Text style={styles.userEmail}>{user?.name} ({user?.email})</Text>
        </View>

        <TouchableOpacity
          style={styles.newInspectionBtn}
          onPress={() => navigation.navigate('CreateInspection')}
        >
          <Text style={styles.newInspectionBtnText}>+ Start New LMPC Inspection</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderColor: '#38BDF8' }]}>
                <Text style={styles.statNumber}>{metrics?.totalInspections ?? 0}</Text>
                <Text style={styles.statLabel}>My Total</Text>
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
                  {metrics?.processingCount ?? 0}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Inspection Workflows</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Inspections')}
            >
              <Text style={styles.actionTitle}>🔍 Active Inspections</Text>
              <Text style={styles.actionDesc}>
                Upload evidence images, trigger PaddleOCR & Gemini extraction, verify product info, and validate LMPC rules.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('History')}
            >
              <Text style={styles.actionTitle}>📚 Inspection History & Reports</Text>
              <Text style={styles.actionDesc}>
                View completed compliance reports and downloaded PDF inspection certificates.
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
  newInspectionBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  newInspectionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
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
