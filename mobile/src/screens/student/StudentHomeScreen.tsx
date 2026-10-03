import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../config/api';

export const StudentHomeScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pRes, aRes, jRes] = await Promise.allSettled([
          studentApi.getProfile(),
          studentApi.getApplications(),
          studentApi.getJobs(),
        ]);

        if (pRes.status === 'fulfilled') setProfile(pRes.value.data?.data || pRes.value.data);
        if (aRes.status === 'fulfilled') setApplications(aRes.value.data?.data || []);
        if (jRes.status === 'fulfilled') setJobs(jRes.value.data?.data?.content || jRes.value.data?.data || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fields = ['fullName', 'rollNumber', 'branch', 'cgpa', 'resumeUrl', 'photoUrl'];
  const filledCount = fields.filter((f) => profile && profile[f]).length;
  const completionPct = Math.round((filledCount / fields.length) * 100);

  const shortlistedCount = applications.filter((a) =>
    ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'OFFERED'].includes(a.status)
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Good day 👋</Text>
            <Text style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'Student'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Completion Meter */}
        <View style={styles.banner}>
          <View style={styles.bannerHeader}>
            <Text style={styles.bannerTitle}>Profile Completeness</Text>
            <Text style={styles.bannerPct}>{completionPct}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${completionPct}%` }]} />
          </View>
          <Text style={styles.bannerSub}>
            {completionPct < 80
              ? 'Complete CGPA, branch, & resume to get shortlisted faster.'
              : 'Great job! Your profile is verified for campus drives.'}
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{applications.length}</Text>
            <Text style={styles.metricLabel}>Applied Jobs</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#10B981' }]}>{shortlistedCount}</Text>
            <Text style={styles.metricLabel}>Shortlisted</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#F59E0B' }]}>{jobs.length}</Text>
            <Text style={styles.metricLabel}>Open Drives</Text>
          </View>
        </View>

        {/* Open Campus Drives Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Active Campus Placement Drives</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#5B6BF5" style={{ marginVertical: 20 }} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No active campus drives posted yet.</Text>
          </View>
        ) : (
          jobs.slice(0, 5).map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobMain}>
                <View>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobCompany}>{job.company?.name || 'Tech hiring client'}</Text>
                </View>
                <Text style={styles.jobCtc}>₹{job.ctc ? (job.ctc / 100000).toFixed(1) + 'L' : 'Best in Industry'}</Text>
              </View>

              <View style={styles.jobFooter}>
                <Text style={styles.jobBranch}>📍 {job.location || 'Pan India / Hybrid'}</Text>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => navigation.navigate('StudentJobs')}
                >
                  <Text style={styles.applyBtnText}>View Details →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  greeting: {
    color: '#A8A29E',
    fontSize: 12,
  },
  userName: {
    color: '#F5F5F4',
    fontSize: 20,
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
  banner: {
    backgroundColor: '#1C1917',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#292524',
    marginBottom: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bannerTitle: {
    color: '#F5F5F4',
    fontSize: 14,
    fontWeight: '800',
  },
  bannerPct: {
    color: '#5B6BF5',
    fontSize: 16,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#292524',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5B6BF5',
    borderRadius: 4,
  },
  bannerSub: {
    color: '#A8A29E',
    fontSize: 11,
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
    padding: 14,
    alignItems: 'center',
  },
  metricVal: {
    color: '#5B6BF5',
    fontSize: 22,
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
    fontSize: 16,
    fontWeight: '800',
  },
  jobCard: {
    backgroundColor: '#1C1917',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#292524',
    padding: 14,
    marginBottom: 10,
  },
  jobMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobTitle: {
    color: '#F5F5F4',
    fontSize: 15,
    fontWeight: '800',
  },
  jobCompany: {
    color: '#A8A29E',
    fontSize: 12,
    marginTop: 2,
  },
  jobCtc: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#292524',
    pt: 8,
    paddingTop: 8,
  },
  jobBranch: {
    color: '#78716C',
    fontSize: 11,
  },
  applyBtn: {
    backgroundColor: '#5B6BF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
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
