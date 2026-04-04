import { useState } from 'react';
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
import { api, setTokens } from '../../lib/api';

export default function DoctorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
    if (!email || !password) return Alert.alert('Error', 'Fill all fields');
    setLoading(true);
    try {
      const res = await api<any>('/auth/doctor/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await setTokens(res.accessToken, res.refreshToken);
      router.replace('/(doctor)');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
    }
    setLoading(false);
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
          <Ionicons name="medkit-outline" size={28} color={colors.primary} />
        </View>
        <Text style={styles.title}>Doctor Login</Text>
        <Text style={styles.subtitle}>Access your dashboard and consultations</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={20} color={colors.gray400} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="doctor@healio.in"
            placeholderTextColor={colors.gray400}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.gray400} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.gray400}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.gray400}
            />
          </Pressable>
        </View>

        <Pressable
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={login}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </Pressable>

        <Text style={styles.devHint}>Dev: doctor@healio.in / doctor123</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing['2xl'] },
  back: { marginTop: 60, width: 40 },
  header: { marginTop: spacing['3xl'] },
  iconBg: {
    width: 56, height: 56, borderRadius: radius.lg,
    backgroundColor: '#e6f7f5', alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: fontSize['3xl'], fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.sm },
  form: { marginTop: spacing['3xl'], gap: spacing.lg },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', height: 56,
    backgroundColor: colors.gray100, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  inputIcon: { marginRight: spacing.md },
  input: { flex: 1, fontSize: fontSize.base, color: colors.text },
  eyeBtn: { padding: spacing.sm },
  btn: {
    height: 56, borderRadius: radius.lg, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.white },
  devHint: { textAlign: 'center', color: colors.gray400, fontSize: fontSize.xs },
});
