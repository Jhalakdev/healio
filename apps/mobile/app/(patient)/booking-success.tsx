import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';

export default function BookingSuccessScreen() {
  const { bookingId, doctorName, scheduledAt, amount, paymentMethod, patientName } =
    useLocalSearchParams<{
      bookingId: string;
      doctorName: string;
      scheduledAt: string;
      amount: string;
      paymentMethod: string;
      patientName: string;
    }>();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const dateObj = scheduledAt ? new Date(scheduledAt) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      {/* Confetti dots */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 120;
        return (
          <Animated.View
            key={i}
            style={[
              styles.confettiDot,
              {
                top: 220 + Math.sin(angle) * radius,
                left: '50%',
                marginLeft: Math.cos(angle) * radius - 6,
                backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'][i % 4],
                opacity: confettiAnim,
                transform: [
                  { scale: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
                ],
              },
            ]}
          />
        );
      })}

      {/* Success icon */}
      <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient colors={['#10b981', '#059669']} style={styles.successGradient}>
          <Ionicons name="checkmark" size={56} color={colors.white} />
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your consultation with {doctorName || 'the doctor'} has been booked successfully.
        </Text>

        {/* Booking summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={styles.summaryText}>{dateStr} at {timeStr}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Ionicons name="person" size={16} color={colors.primary} />
            <Text style={styles.summaryText}>{patientName || 'You'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Ionicons name="wallet" size={16} color={colors.primary} />
            <Text style={styles.summaryText}>₹{Number(amount || 0).toLocaleString('en-IN')} paid via {paymentMethod === 'wallet' ? 'Wallet' : 'Online'}</Text>
          </View>
          {bookingId && (
            <>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Ionicons name="receipt" size={16} color={colors.primary} />
                <Text style={styles.summaryLabel}>Booking ID:</Text>
                <Text style={styles.bookingId}>{bookingId.slice(0, 8).toUpperCase()}</Text>
              </View>
            </>
          )}
        </View>

        {/* What's next */}
        <View style={styles.nextCard}>
          <Text style={styles.nextTitle}>What happens next?</Text>
          {[
            { icon: 'notifications-outline' as const, text: "You'll get a reminder 15 minutes before" },
            { icon: 'document-text-outline' as const, text: 'Upload any reports before the consultation' },
            { icon: 'videocam-outline' as const, text: 'Join the video call at your scheduled time' },
          ].map((item, i) => (
            <View key={i} style={styles.nextRow}>
              <View style={styles.nextIcon}>
                <Ionicons name={item.icon} size={16} color={colors.primary} />
              </View>
              <Text style={styles.nextText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={() => router.replace('/(patient)')}>
            <Text style={styles.primaryBtnText}>Go to Home</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => router.push('/(patient)/appointments')}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.secondaryBtnText}>View Appointments</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, alignItems: 'center', paddingTop: 120 },
  confettiDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6 },
  successCircle: { marginBottom: 24 },
  successGradient: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#10b981', shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  content: { flex: 1, width: '100%', paddingHorizontal: 24, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.gray500, textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 20 },

  summaryCard: {
    width: '100%', backgroundColor: '#f8fafc', borderRadius: 18, padding: 18,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  summaryText: { fontSize: 14, fontWeight: '600', color: colors.text },
  summaryLabel: { fontSize: 14, color: colors.gray500 },
  bookingId: { fontSize: 14, fontWeight: '700', color: colors.primary, marginLeft: 4 },
  divider: { height: 1, backgroundColor: '#e2e8f0' },

  nextCard: {
    width: '100%', backgroundColor: '#f0fdfa', borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: '#99f6e4', marginBottom: 24,
  },
  nextTitle: { fontSize: 14, fontWeight: '700', color: colors.primaryDark, marginBottom: 12 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  nextIcon: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: '#ccfbf1',
    alignItems: 'center', justifyContent: 'center',
  },
  nextText: { flex: 1, fontSize: 13, color: colors.primary, lineHeight: 18 },

  actions: { width: '100%', gap: 10, paddingBottom: 30 },
  primaryBtn: {
    height: 54, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
  secondaryBtn: {
    height: 50, borderRadius: 16, backgroundColor: '#e6f7f5',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
