import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../config/api';

export default function AdminSupervisorsScreen({ navigation }) {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const response = await api.get('/api/admin/supervisors');
      setSupervisors(response.data);
    } catch (error) {
      console.error('Failed to load supervisors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!email) {
      Alert.alert('Validation Error', 'Please provide a valid email address.');
      return;
    }

    setCreating(true);
    try {
      const response = await api.post('/api/admin/supervisors', { email: email.trim() });
      Alert.alert(
        'Invite Generated',
        `Token: ${response.data.token}\n\nProvide this token to the supervisor to activate their account.`
      );
      setModalVisible(false);
      setEmail('');
      fetchSupervisors();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create supervisor invitation';
      Alert.alert('Error', msg);
    } finally {
      setCreating(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AdminSupervisorDetail', { supervisorId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name || 'Pending Activation'}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: item.status === 'ACTIVE' ? '#065F46' : '#92400E' },
          ]}
        >
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.email}>{item.email}</Text>
      <Text style={styles.phone}>Phone: {item.phone || 'Not registered'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Supervisors ({supervisors.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Invite New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={supervisors}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No supervisors registered yet.</Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite New Supervisor</Text>

            <Text style={styles.label}>Supervisor Email</Text>
            <TextInput
              style={styles.input}
              placeholder="supervisor@example.com"
              placeholderTextColor="#8E8E93"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.submitBtn]}
                onPress={handleCreateInvite}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.btnText}>Generate Token</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  addBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
    color: '#38BDF8',
  },
  phone: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  label: {
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
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#475569',
  },
  submitBtn: {
    backgroundColor: '#0284C7',
  },
  btnText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
