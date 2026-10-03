import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../config/api';

export const AdminHomeScreen = () => {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, cRes, tRes] = await Promise.allSettled([
        adminApi.getStudents(),
        adminApi.getCompanies(),
        adminApi.getTrainingPrograms(),
      ]);

      if (sRes.status === 'fulfilled') setStudents(sRes.value.data?.data || []);
      if (cRes.status === 'fulfilled') setCompanies(cRes.value.data?.data || []);
      if (tRes.status === 'fulfilled') setTrainingPrograms(tRes.value.data?.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveStudent = async (id: number) => {
    try {
      await adminApi.approveStudent(id);
      Alert.alert('Success', 'Student approved successfully');
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to approve student');
    }
  };

  const handleBlockStudent = async (id: number) => {
    try {
      await adminApi.blockStudent(id);
      Alert.alert('Blocked', 'Student account has been suspended');
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to block student');
    }
  };

  const handleUnblockStudent = async (id: number) => {
    try {
      await adminApi.unblockStudent(id);
      Alert.alert('Unblocked', 'Student account restored');
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to unblock student');
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const name = (s.fullName || s.name || '').toLowerCase();
    const roll = (s.rollNumber || s.rollNo || '').toLowerCase();
    const matchesSearch = name.includes(term) || roll.includes(term);

    const status = (s.verificationStatus || s.status || '').toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.badge}>🛡️ SYSTEM PLACEMENT ADMIN</Text>
            <Text style={styles.title}>Admin Control Center</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* System Overview Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{students.length}</Text>
            <Text style={styles.metricLabel}>Total Students</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#10B981' }]}>{companies.length}</Text>
            <Text style={styles.metricLabel}>Tech Companies</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#F59E0B' }]}>{trainingPrograms.length}</Text>
            <Text style={styles.metricLabel}>Bootcamps</Text>
          </View>
        </View>

        {/* Student Governance Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎓 Student Accounts Governance (500 Enrolled)</Text>
        </View>

        {/* Search & Status Filter */}
        <View style={styles.filterBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by student name or roll..."
            placeholderTextColor="#78716C"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <View style={styles.statusRow}>
            {['ALL', 'APPROVED', 'PENDING', 'BLOCKED'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.statusChip, statusFilter === st && styles.statusChipActive]}
                onPress={() => setStatusFilter(st)}
              >
                <Text style={[styles.statusChipText, statusFilter === st && styles.statusChipTextActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Student Cards List */}
        {loading ? (
          <ActivityIndicator color="#5B6BF5" style={{ marginVertical: 20 }} />
        ) : filteredStudents.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No students match the criteria.</Text>
          </View>
        ) : (
          filteredStudents.slice(0, 15).map((st) => {
            const status = (st.verificationStatus || st.status || 'PENDING').toUpperCase();
            return (
              <View key={st.id} style={styles.studentCard}>
                <View style={styles.studentMain}>
                  <View>
                    <Text style={styles.studentName}>{st.fullName || st.name || 'Student'}</Text>
                    <Text style={styles.studentRoll}>{st.rollNumber || st.rollNo || '2026-ENG'}</Text>
                  </View>
                  <View style={[styles.badgeContainer, status === 'BLOCKED' && styles.badgeBlocked]}>
                    <Text style={styles.badgeText}>{status}</Text>
                  </View>
                </View>

                <View style={styles.studentMeta}>
                  <Text style={styles.metaText}>📚 {st.branch || 'Computer'}</Text>
                  <Text style={styles.metaText}>⭐ CGPA: {st.cgpa ? st.cgpa.toFixed(2) : '8.0'}</Text>
                </View>

                <View style={styles.actionsRow}>
                  {status !== 'APPROVED' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleApproveStudent(st.id)}
                    >
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  {status !== 'BLOCKED' ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.blockBtn]}
                      onPress={() => handleBlockStudent(st.id)}
                    >
                      <Text style={styles.blockBtnText}>Block User</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.unblockBtn]}
                      onPress={() => handleUnblockStudent(st.id)}
                    >
                      <Text style={styles.unblockBtnText}>Unblock</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0A09',
  },
  scrollContent: {
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    color: '#7C89FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: '#F5F5F4',
    fontSize: 22,
    fontWeight: '900',
  },
  logoutBtn: {
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#292524',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#292524',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  metricVal: {
    color: '#5B6BF5',
    fontSize: 20,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#A8A29E',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F5F5F4',
    fontSize: 15,
    fontWeight: '800',
  },
  filterBox: {
    backgroundColor: '#1C1917',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#292524',
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: '#0C0A09',
    borderWidth: 1,
    borderColor: '#292524',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F5F5F4',
    fontSize: 13,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#0C0A09',
    borderWidth: 1,
    borderColor: '#292524',
  },
  statusChipActive: {
    backgroundColor: '#5B6BF5',
    borderColor: '#5B6BF5',
  },
  statusChipText: {
    color: '#A8A29E',
    fontSize: 10,
    fontWeight: '700',
  },
  statusChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  studentCard: {
    backgroundColor: '#1C1917',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#292524',
    padding: 14,
    marginBottom: 10,
  },
  studentMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentName: {
    color: '#F5F5F4',
    fontSize: 15,
    fontWeight: '800',
  },
  studentRoll: {
    color: '#A8A29E',
    fontSize: 11,
    fontFamily: 'Platform',
  },
  badgeContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeBlocked: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  badgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  studentMeta: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 8,
  },
  metaText: {
    color: '#78716C',
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#292524',
    paddingTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  approveBtnText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  blockBtn: {
    backgroundColor: '#0C0A09',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  blockBtnText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '800',
  },
  unblockBtn: {
    backgroundColor: 'rgba(91, 107, 245, 0.2)',
  },
  unblockBtnText: {
    color: '#7C89FF',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyBox: {
    backgroundColor: '#1C1917',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#78716C',
    fontSize: 13,
  },
});
