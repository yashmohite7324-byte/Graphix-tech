import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../config/api';

type RoleTab = 'STUDENT' | 'RECRUITER' | 'ADMIN';

export const LoginScreen = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<RoleTab>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await authApi.login({ email: email.trim(), password });
      const data = res.data?.data || res.data;

      if (data.accessToken && data.accessToken.startsWith('REQUIRES_OTP:')) {
        setRequiresOtp(true);
      } else if (data.accessToken) {
        await login(
          data.accessToken,
          data.refreshToken,
          data.role || activeTab,
          data.email || email,
          data.name,
          data.designation,
          data.companyName
        );
      } else {
        setErrorMessage('Unexpected server response. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await authApi.verifyOtp({ email: email.trim(), otp: otpCode.trim() });
      const data = res.data?.data || res.data;

      await login(
        data.accessToken,
        data.refreshToken,
        data.role || activeTab,
        data.email || email,
        data.name,
        data.designation,
        data.companyName
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'OTP verification failed.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoGoogleLogin = async () => {
    setLoading(true);
    try {
      // Demo authentication flow for mobile preview
      const demoRole = activeTab === 'RECRUITER' ? 'RECRUITER' : activeTab === 'ADMIN' ? 'PLACEMENT_ADMIN' : 'STUDENT';
      await login(
        'demo-google-mobile-access-token',
        'demo-google-mobile-refresh-token',
        demoRole,
        `google.${activeTab.toLowerCase()}@graphix.edu.in`,
        'Google Mobile User'
      );
    } catch (err: any) {
      Alert.alert('Google Sign In Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>✨ GRAPHIX TECHHIRE MOBILE</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enterprise Campus Placement & Training Portal</Text>
        </View>

        {/* Role Selector Tabs */}
        <View style={styles.tabContainer}>
          {(['STUDENT', 'RECRUITER', 'ADMIN'] as RoleTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'STUDENT' ? '🎓 Student' : tab === 'RECRUITER' ? '💼 Recruiter' : '🏫 Admin'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Auth Card Form */}
        <View style={styles.card}>
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {!requiresOtp ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@graphix.edu.in"
                  placeholderTextColor="#78716C"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor="#78716C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLoginSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>SIGN IN TO PORTAL →</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.otpHeader}>Verification OTP Sent to {email}</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ENTER 6-DIGIT OTP</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="123456"
                  placeholderTextColor="#78716C"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleOtpSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>VERIFY & CONTINUE →</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Google Sign In Divider */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR SIGN IN WITH GMAIL</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleDemoGoogleLogin}>
            <Text style={styles.googleButtonText}>🌐 Continue with Google</Text>
          </TouchableOpacity>
        </View>
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
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    color: '#7C89FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: '#F5F5F4',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#A8A29E',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1917',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#292524',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#5B6BF5',
  },
  tabText: {
    color: '#A8A29E',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#1C1917',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#292524',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#A8A29E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0C0A09',
    borderWidth: 1,
    borderColor: '#292524',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F5F5F4',
    fontSize: 14,
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  otpHeader: {
    color: '#7C89FF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5B6BF5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#292524',
  },
  dividerText: {
    color: '#78716C',
    fontSize: 10,
    fontWeight: '800',
    marginHorizontal: 10,
  },
  googleButton: {
    backgroundColor: '#0C0A09',
    borderWidth: 1,
    borderColor: '#292524',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#F5F5F4',
    fontSize: 13,
    fontWeight: '700',
  },
});
