import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { api } from '../../lib/api';

const documentTypes = [
  { key: 'mbbs_certificate', label: 'MBBS Certificate', icon: 'school-outline' as const, required: true },
  { key: 'registration_id', label: 'Registration ID', icon: 'card-outline' as const, required: true },
  { key: 'state_council', label: 'State Medical Council No.', icon: 'shield-checkmark-outline' as const, required: true },
];

export default function DoctorRegister() {
  const [step, setStep] = useState(1); // 1: info, 2: documents, 3: done
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [councilNo, setCouncilNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const register = async () => {
    if (!name || !email || !password) {
      return Alert.alert('Error', 'Please fill all required fields');
    }
    setLoading(true);
    try {
      await api('/auth/doctor/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setStep(2);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  const simulateDocUpload = (docKey: string) => {
    // In real app, this would use expo-document-picker + upload API
    setUploadedDocs((prev) => [...prev, docKey]);
  };

  const submitForReview = () => {
    if (uploadedDocs.length < 2) {
      return Alert.alert('Error', 'Please upload at least MBBS Certificate and Registration ID');
    }
    setStep(3);
  };

  if (step === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <LinearGradient
            colors={['#0d9488', '#059669']}
            style={styles.successIcon}
          >
            <Ionicons name="checkmark-circle" size={64} color={colors.white} />
          </LinearGradient>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successText}>
            Your documents are being verified by our team. This usually takes 24-48 hours.
          </Text>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={styles.statusLabel}>Account Created</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={styles.statusLabel}>Documents Uploaded</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.statusLabel}>Under Verification</Text>
              <Ionicons name="time-outline" size={18} color={colors.warning} />
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.gray300 }]} />
              <Text style={[styles.statusLabel, { color: colors.gray400 }]}>Profile Setup</Text>
              <Ionicons name="ellipse-outline" size={18} color={colors.gray300} />
            </View>
          </View>

          <Text style={styles.notifyText}>
            We'll notify you via email once your profile is approved.
          </Text>

          <Pressable style={styles.backToLoginBtn} onPress={() => router.replace('/(auth)/doctor-login')}>
            <Text style={styles.backToLoginText}>Go to Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>

      {/* Progress */}
      <View style={styles.progress}>
        <View style={[styles.progressStep, step >= 1 && styles.progressActive]}>
          <Text style={[styles.progressNum, step >= 1 && styles.progressNumActive]}>1</Text>
        </View>
        <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
        <View style={[styles.progressStep, step >= 2 && styles.progressActive]}>
          <Text style={[styles.progressNum, step >= 2 && styles.progressNumActive]}>2</Text>
        </View>
        <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
        <View style={[styles.progressStep, step >= 3 && styles.progressActive]}>
          <Text style={[styles.progressNum, step >= 3 && styles.progressNumActive]}>3</Text>
        </View>
      </View>

      {step === 1 && (
        <View style={styles.form}>
          <View style={styles.header}>
            <Text style={styles.title}>Join as a Doctor</Text>
            <Text style={styles.subtitle}>
              Register to start consulting patients on Healio
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Dr. Priya Sharma"
              placeholderTextColor={colors.gray400}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="doctor@example.com"
              placeholderTextColor={colors.gray400}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Min 8 characters"
              placeholderTextColor={colors.gray400}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 98765 43210"
              placeholderTextColor={colors.gray400}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={register}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Creating Account...' : 'Continue'}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/doctor-login')}>
            <Text style={styles.loginLink}>Already registered? Login</Text>
          </Pressable>
        </View>
      )}

      {step === 2 && (
        <View style={styles.form}>
          <View style={styles.header}>
            <Text style={styles.title}>Upload Documents</Text>
            <Text style={styles.subtitle}>
              Upload your medical credentials for verification
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>State Medical Council Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. MH/12345/2020"
              placeholderTextColor={colors.gray400}
              value={councilNo}
              onChangeText={setCouncilNo}
            />
          </View>

          {documentTypes.map((doc) => {
            const uploaded = uploadedDocs.includes(doc.key);
            return (
              <Pressable
                key={doc.key}
                style={[styles.docCard, uploaded && styles.docCardUploaded]}
                onPress={() => !uploaded && simulateDocUpload(doc.key)}
              >
                <View style={[styles.docIcon, uploaded && styles.docIconUploaded]}>
                  <Ionicons
                    name={uploaded ? 'checkmark-circle' : doc.icon}
                    size={24}
                    color={uploaded ? colors.success : colors.primary}
                  />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docLabel}>
                    {doc.label} {doc.required && '*'}
                  </Text>
                  <Text style={styles.docStatus}>
                    {uploaded ? 'Uploaded successfully' : 'Tap to upload PDF or image'}
                  </Text>
                </View>
                {!uploaded && (
                  <Ionicons name="cloud-upload-outline" size={22} color={colors.gray400} />
                )}
              </Pressable>
            );
          })}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Documents will be reviewed within 24-48 hours. Ensure all documents are clear and legible.
            </Text>
          </View>

          <Pressable style={styles.btn} onPress={submitForReview}>
            <Text style={styles.btnText}>Submit for Verification</Text>
          </Pressable>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing['2xl'] },
  back: { marginTop: 60, width: 40 },
  progress: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: spacing['2xl'], marginBottom: spacing.lg,
  },
  progressStep: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gray200,
    alignItems: 'center', justifyContent: 'center',
  },
  progressActive: { backgroundColor: colors.primary },
  progressNum: { fontSize: fontSize.sm, fontWeight: '700', color: colors.gray400 },
  progressNumActive: { color: colors.white },
  progressLine: { width: 40, height: 3, backgroundColor: colors.gray200, borderRadius: 2 },
  progressLineActive: { backgroundColor: colors.primary },
  form: { marginTop: spacing.lg, gap: spacing.lg },
  header: { marginBottom: spacing.sm },
  title: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 },
  inputGroup: { gap: spacing.sm },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  input: {
    height: 52, borderRadius: radius.lg, backgroundColor: colors.gray100,
    paddingHorizontal: spacing.lg, fontSize: fontSize.base, color: colors.text,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, height: 56, borderRadius: radius.lg, backgroundColor: colors.primary,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.white },
  loginLink: { textAlign: 'center', color: colors.primary, fontWeight: '600', fontSize: fontSize.sm },
  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.gray200, borderStyle: 'dashed',
  },
  docCardUploaded: { borderColor: colors.success, borderStyle: 'solid', backgroundColor: '#f0fdf4' },
  docIcon: {
    width: 48, height: 48, borderRadius: radius.md, backgroundColor: '#e6f7f5',
    alignItems: 'center', justifyContent: 'center',
  },
  docIconUploaded: { backgroundColor: '#dcfce7' },
  docInfo: { flex: 1 },
  docLabel: { fontSize: fontSize.base, fontWeight: '600', color: colors.text },
  docStatus: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  infoBox: {
    flexDirection: 'row', gap: spacing.md, padding: spacing.lg,
    backgroundColor: '#e6f7f5', borderRadius: radius.lg,
  },
  infoText: { flex: 1, fontSize: fontSize.sm, color: colors.primaryDark, lineHeight: 20 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing['2xl'], paddingTop: 100 },
  successIcon: {
    width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  successTitle: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.text, textAlign: 'center' },
  successText: {
    fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center',
    marginTop: spacing.md, lineHeight: 22, paddingHorizontal: spacing.xl,
  },
  statusCard: {
    width: '100%', backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xl, marginTop: spacing['2xl'],
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { flex: 1, fontSize: fontSize.base, fontWeight: '600', color: colors.text },
  statusDivider: { height: 20, width: 1, backgroundColor: colors.gray200, marginLeft: 4 },
  notifyText: {
    fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center',
    marginTop: spacing['2xl'],
  },
  backToLoginBtn: {
    marginTop: spacing.xl, paddingVertical: spacing.lg, paddingHorizontal: spacing['3xl'],
    borderRadius: radius.lg, backgroundColor: colors.primary,
  },
  backToLoginText: { fontSize: fontSize.base, fontWeight: '700', color: colors.white },
});
