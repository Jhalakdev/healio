import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { setTokens } from '../../lib/api';

export default function PatientLogin() {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const sendOtp = () => {
    if (phone.length < 10) return;
    setOtpSent(true);
  };

  const verifyOtp = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;
    // Mock login — skip backend, go straight to home
    setTokens('mock-token-patient', 'mock-refresh');
    router.replace('/(patient)');
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
          <Ionicons name="call-outline" size={28} color={colors.primary} />
        </View>
        <Text style={styles.title}>
          {otpSent ? 'Enter OTP' : 'Welcome to Healio'}
        </Text>
        <Text style={styles.subtitle}>
          {otpSent
            ? `We sent a 6-digit code to +91 ${phone}`
            : 'Enter your phone number to get started'}
        </Text>
      </View>

      {!otpSent ? (
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
      ) : (
        <View style={styles.form}>
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
          <Text style={styles.devHint}>Enter any 6 digits to continue</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing['2xl'] },
  back: { marginTop: 60, width: 40 },
  header: { marginTop: spacing['3xl'] },
  iconBg: {
    width: 56, height: 56, borderRadius: radius.lg,
    backgroundColor: '#e6f7f5', alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: fontSize['3xl'], fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 },
  form: { marginTop: spacing['3xl'], gap: spacing.lg },
  phoneRow: { flexDirection: 'row', gap: spacing.md },
  countryCode: {
    height: 56, paddingHorizontal: spacing.lg, borderRadius: radius.lg,
    backgroundColor: colors.gray100, justifyContent: 'center',
  },
  countryText: { fontSize: fontSize.base, fontWeight: '600', color: colors.text },
  phoneInput: {
    flex: 1, height: 56, borderRadius: radius.lg, backgroundColor: colors.gray100,
    paddingHorizontal: spacing.lg, fontSize: fontSize.lg, fontWeight: '600',
    color: colors.text, letterSpacing: 1,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, height: 56, borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  btnText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.white },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  otpBox: {
    width: 50, height: 60, borderRadius: radius.md,
    backgroundColor: colors.gray100, textAlign: 'center',
    fontSize: fontSize['2xl'], fontWeight: '800', color: colors.text,
    borderWidth: 2, borderColor: 'transparent',
  },
  otpBoxFilled: { borderColor: colors.primary, backgroundColor: '#e6f7f5' },
  changePhone: { textAlign: 'center', color: colors.textSecondary, fontSize: fontSize.sm },
  devHint: { textAlign: 'center', color: colors.gray400, fontSize: fontSize.xs, marginTop: spacing.sm },
});
