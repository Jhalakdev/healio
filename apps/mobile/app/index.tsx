import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../lib/theme';
import { getToken } from '../lib/api';

export default function Welcome() {
  useEffect(() => {
    // Auto-redirect if already logged in
    getToken().then((token) => {
      if (token) router.replace('/(patient)');
    });
  }, []);

  return (
    <LinearGradient colors={['#0d9488', '#059669', '#10b981']} style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="heart-outline" size={48} color={colors.white} />
          </View>
          <Text style={styles.logoText}>Healio</Text>
          <Text style={styles.tagline}>Your doctor, one tap away</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: 'videocam-outline' as const, text: 'HD Video Consultations' },
            { icon: 'shield-checkmark-outline' as const, text: 'Verified MBBS Doctors' },
            { icon: 'time-outline' as const, text: 'Available 24/7' },
          ].map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Ionicons name={f.icon} size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA Button — single entry for both patients and doctors */}
        <View style={styles.actions}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingTop: 100,
    paddingBottom: 50,
  },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: fontSize.lg,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.sm,
  },
  features: { gap: spacing.lg },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
  },
  featureText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: '600',
  },
  actions: { gap: spacing.md },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingVertical: 18,
    borderRadius: radius.xl,
  },
  primaryBtnText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  _unused: {
    color: colors.white,
  },
});
