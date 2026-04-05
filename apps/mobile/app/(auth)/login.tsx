import { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing } from '../../lib/theme';
import { setTokens, api } from '../../lib/api';

export default function UnifiedLogin() {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const sendOtp = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    try {
      await api('/auth/patient/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      setOtpSent(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;
    setLoading(true);
    try {
      const res = await api('/auth/patient/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: `+91${phone}`, otp: otpCode }),
      });
      setTokens(res.accessToken, res.refreshToken);

      // Auto-detect role from JWT and route accordingly
      // Decode JWT payload to get role
      const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
      if (payload.role === 'DOCTOR') {
        router.replace('/(doctor)');
      } else {
        router.replace('/(patient)');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>

      <View style={styles.header}>
        <View style={styles.iconBg}>
          <Ionicons name="heart" size={28} color={colors.primary} />
        </View>
        <Text style={styles.title}>Welcome to BlinkCure</Text>
        <Text style={styles.subtitle}>
          {otpSent ? `Enter the 6-digit code sent to +91 ${phone}` : 'Enter your phone number to get started'}
        </Text>
      </View>

      {/* Phone input */}
      {!otpSent && (
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
          <Pressable style={[styles.btn, loading && { opacity: 0.6 }]} onPress={sendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : (
              <>
                <Text style={styles.btnText}>Send OTP</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </>
            )}
          </Pressable>
          <Text style={styles.hint}>Works for both patients and doctors. We auto-detect your account.</Text>
        </View>
      )}

      {/* OTP input */}
      {otpSent && (
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
          <Pressable style={[styles.btn, loading && { opacity: 0.6 }]} onPress={verifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : (
              <Text style={styles.btnText}>Verify & Continue</Text>
            )}
          </Pressable>
          <Pressable onPress={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }}>
            <Text style={styles.changePhone}>Change phone number</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing['2xl'] },
  back: { marginTop: 60, width: 40 },
  header: { marginTop: spacing['2xl'] },
  iconBg: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#e6f7f5', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  form: { marginTop: spacing['2xl'], gap: spacing.lg },
  phoneRow: { flexDirection: 'row', gap: spacing.md },
  countryCode: { height: 52, paddingHorizontal: spacing.lg, borderRadius: 14, backgroundColor: colors.gray100, justifyContent: 'center' },
  countryText: { fontSize: 14, fontWeight: '600', color: colors.text },
  phoneInput: { flex: 1, height: 52, borderRadius: 14, backgroundColor: colors.gray100, paddingHorizontal: spacing.lg, fontSize: 17, fontWeight: '600', color: colors.text, letterSpacing: 1 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, height: 54, borderRadius: 14, backgroundColor: colors.primary },
  btnText: { fontSize: 16, fontWeight: '700', color: colors.white },
  hint: { fontSize: 12, color: colors.gray400, textAlign: 'center', lineHeight: 18 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  otpBox: { width: 48, height: 56, borderRadius: 12, backgroundColor: colors.gray100, textAlign: 'center', fontSize: 22, fontWeight: '800', color: colors.text, borderWidth: 2, borderColor: 'transparent' },
  otpBoxFilled: { borderColor: colors.primary, backgroundColor: '#e6f7f5' },
  changePhone: { textAlign: 'center', color: colors.textSecondary, fontSize: 13 },
});
