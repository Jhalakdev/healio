import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { setTokens } from '../../lib/api';

type LoginMode = 'phone' | 'email';

export default function UnifiedLogin() {
  const [mode, setMode] = useState<LoginMode>('phone');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Patient: phone OTP flow
  const sendOtp = () => {
    if (phone.length < 10) return;
    setOtpSent(true);
  };

  const verifyOtp = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;
    // Mock: in production, call POST /auth/patient/verify-otp
    // Backend returns { accessToken, refreshToken, isNewUser, familyPlan }
    setTokens('mock-token-patient', 'mock-refresh');
    router.replace('/(patient)');
  };

  // Doctor: email/password flow
  const doctorLogin = () => {
    if (!email || !password) return Alert.alert('Error', 'Fill all fields');
    // Mock: in production, call POST /auth/doctor/login
    // Backend checks role → returns tokens
    // If role is DOCTOR → route to doctor dashboard
    setTokens('mock-token-doctor', 'mock-refresh');
    router.replace('/(doctor)');
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>

      <View style={styles.header}>
        <View style={styles.iconBg}>
          <Ionicons name="heart" size={28} color={colors.primary} />
        </View>
        <Text style={styles.title}>Welcome to Healio</Text>
        <Text style={styles.subtitle}>
          {mode === 'phone'
            ? 'Enter your phone number to get started'
            : 'Login with your credentials'}
        </Text>
      </View>

      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeBtn, mode === 'phone' && styles.modeBtnActive]}
          onPress={() => { setMode('phone'); setOtpSent(false); }}
        >
          <Ionicons name="call-outline" size={16} color={mode === 'phone' ? colors.white : colors.gray500} />
          <Text style={[styles.modeBtnText, mode === 'phone' && styles.modeBtnTextActive]}>Phone</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === 'email' && styles.modeBtnActive]}
          onPress={() => setMode('email')}
        >
          <Ionicons name="mail-outline" size={16} color={mode === 'email' ? colors.white : colors.gray500} />
          <Text style={[styles.modeBtnText, mode === 'email' && styles.modeBtnTextActive]}>Email</Text>
        </Pressable>
      </View>

      {/* Phone OTP (for patients) */}
      {mode === 'phone' && !otpSent && (
        <View style={styles.form}>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="98765 43210"
              placeholderTextColor={colors.gray400}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <Pressable style={styles.btn} onPress={sendOtp}>
            <Text style={styles.btnText}>Send OTP</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </Pressable>
        </View>
      )}

      {/* OTP entry */}
      {mode === 'phone' && otpSent && (
        <View style={styles.form}>
          <Text style={styles.otpInfo}>Code sent to +91 {phone}</Text>
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(v) => handleOtpChange(v, i)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !digit && i > 0) {
                    otpRefs.current[i - 1]?.focus();
                  }
                }}
              />
            ))}
          </View>
          <Pressable style={styles.btn} onPress={verifyOtp}>
            <Text style={styles.btnText}>Verify & Login</Text>
          </Pressable>
          <Pressable onPress={() => setOtpSent(false)}>
            <Text style={styles.changePhone}>Change phone number</Text>
          </Pressable>
        </View>
      )}

      {/* Email/Password (for doctors) */}
      {mode === 'email' && (
        <View style={styles.form}>
          <View style={styles.infoBox}>
            <Ionicons name="medkit" size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              Doctors: use the credentials sent to your registered email after admin approval.
            </Text>
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={colors.gray400} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={colors.gray400}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.gray400} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.gray400}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray400} />
            </Pressable>
          </View>

          <Pressable style={styles.btn} onPress={doctorLogin}>
            <Text style={styles.btnText}>Login</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </Pressable>
        </View>
      )}

      <Text style={styles.devHint}>
        {mode === 'phone' ? 'Enter any 6 digits to continue' : 'Dev: doctor@healio.in / doctor123'}
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing['2xl'] },
  back: { marginTop: 60, width: 40 },
  header: { marginTop: spacing['2xl'] },
  iconBg: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#e6f7f5', alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row', marginTop: spacing['2xl'],
    backgroundColor: colors.gray100, borderRadius: 14, padding: 4,
  },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 10,
  },
  modeBtnActive: { backgroundColor: colors.primary },
  modeBtnText: { fontSize: 14, fontWeight: '600', color: colors.gray500 },
  modeBtnTextActive: { color: colors.white },

  form: { marginTop: spacing['2xl'], gap: spacing.lg },
  phoneRow: { flexDirection: 'row', gap: spacing.md },
  countryCode: {
    height: 52, paddingHorizontal: spacing.lg, borderRadius: 14,
    backgroundColor: colors.gray100, justifyContent: 'center',
  },
  countryText: { fontSize: 14, fontWeight: '600', color: colors.text },
  phoneInput: {
    flex: 1, height: 52, borderRadius: 14, backgroundColor: colors.gray100,
    paddingHorizontal: spacing.lg, fontSize: 17, fontWeight: '600',
    color: colors.text, letterSpacing: 1,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, height: 54, borderRadius: 14,
    backgroundColor: colors.primary,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: colors.white },
  otpInfo: { fontSize: 13, color: colors.gray500, textAlign: 'center' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  otpBox: {
    width: 48, height: 56, borderRadius: 12,
    backgroundColor: colors.gray100, textAlign: 'center',
    fontSize: 22, fontWeight: '800', color: colors.text,
    borderWidth: 2, borderColor: 'transparent',
  },
  otpBoxFilled: { borderColor: colors.primary, backgroundColor: '#e6f7f5' },
  changePhone: { textAlign: 'center', color: colors.textSecondary, fontSize: 13 },

  // Email
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#e6f7f5', padding: 14, borderRadius: 12,
  },
  infoText: { flex: 1, fontSize: 12, color: colors.primary, lineHeight: 18 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', height: 52,
    backgroundColor: colors.gray100, borderRadius: 14, paddingHorizontal: spacing.lg,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: colors.text },
  eyeBtn: { padding: spacing.sm },

  devHint: {
    textAlign: 'center', color: colors.gray400, fontSize: 11,
    marginTop: spacing['2xl'],
  },
});
