import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { clearTokens } from '../../lib/api';

const upcomingBookings = [
  {
    id: '1', patient: 'Rahul Kumar', age: 28, gender: 'M',
    symptoms: 'Persistent headache, mild fever', time: 'Now', isIncoming: true, reports: 2,
  },
  {
    id: '2', patient: 'Anita Mishra', age: 35, gender: 'F',
    symptoms: 'Skin rash on arms', time: '2:30 PM', isIncoming: false, reports: 1,
  },
  {
    id: '3', patient: 'Suresh Patil', age: 45, gender: 'M',
    symptoms: 'Back pain, difficulty sleeping', time: '3:00 PM', isIncoming: false, reports: 0,
  },
];

export default function DoctorDashboard() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good afternoon</Text>
          <Text style={styles.name}>Dr. Priya Sharma</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.onlineToggle}>
            <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
            <Text style={[styles.statusText, isOnline ? styles.textOnline : styles.textOffline]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ true: colors.success, false: colors.gray300 }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Today's", value: '4', icon: 'calendar-outline' as const, color: '#3b82f6' },
          { label: 'Earnings', value: '₹2.8K', icon: 'wallet-outline' as const, color: '#10b981' },
          { label: 'Monthly', value: '₹54.6K', icon: 'trending-up-outline' as const, color: '#8b5cf6' },
          { label: 'Patients', value: '2,340', icon: 'people-outline' as const, color: '#f59e0b' },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon} size={20} color={stat.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Consultations</Text>

        {upcomingBookings.map((booking) => (
          <View
            key={booking.id}
            style={[styles.bookingCard, booking.isIncoming && styles.bookingIncoming]}
          >
            {booking.isIncoming && (
              <LinearGradient
                colors={['#0d9488', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.incomingBar}
              />
            )}
            <View style={styles.bookingHeader}>
              <View style={styles.patientRow}>
                <View style={styles.patientAvatar}>
                  <Text style={styles.patientAvatarText}>
                    {booking.patient.split(' ').map((n) => n[0]).join('')}
                  </Text>
                </View>
                <View>
                  <Text style={styles.patientName}>{booking.patient}</Text>
                  <Text style={styles.patientMeta}>
                    {booking.age}yrs · {booking.gender}
                  </Text>
                </View>
              </View>
              <View style={styles.timeTag}>
                {booking.isIncoming && (
                  <View style={styles.liveDot} />
                )}
                <Text style={[styles.timeText, booking.isIncoming && styles.timeTextLive]}>
                  {booking.time}
                </Text>
              </View>
            </View>

            <View style={styles.symptomsBox}>
              <Text style={styles.symptomsLabel}>Symptoms</Text>
              <Text style={styles.symptomsText}>{booking.symptoms}</Text>
            </View>

            {booking.reports > 0 && (
              <View style={styles.reportsTag}>
                <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                <Text style={styles.reportsText}>
                  {booking.reports} report{booking.reports > 1 ? 's' : ''} attached
                </Text>
              </View>
            )}

            <View style={styles.bookingActions}>
              {booking.isIncoming ? (
                <>
                  <Pressable style={styles.acceptBtn}>
                    <Ionicons name="videocam" size={18} color={colors.white} />
                    <Text style={styles.acceptBtnText}>Accept & Join</Text>
                  </Pressable>
                  <Pressable style={styles.declineBtn}>
                    <Ionicons name="close" size={20} color={colors.danger} />
                  </Pressable>
                </>
              ) : (
                <Pressable style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View Details</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Logout */}
      <Pressable
        style={styles.logoutBtn}
        onPress={async () => { await clearTokens(); router.replace('/'); }}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: spacing.lg,
  },
  greeting: { fontSize: fontSize.sm, color: colors.textSecondary },
  name: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.text, marginTop: 2 },
  headerRight: { marginTop: 4 },
  onlineToggle: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, borderRadius: radius.lg,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  dotOnline: { backgroundColor: colors.success },
  dotOffline: { backgroundColor: colors.gray400 },
  statusText: { fontSize: fontSize.xs, fontWeight: '700' },
  textOnline: { color: colors.success },
  textOffline: { color: colors.gray400 },
  statsRow: {
    flexDirection: 'row', gap: spacing.md,
    paddingHorizontal: spacing.xl, marginTop: spacing.md,
  },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  statValue: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing['2xl'] },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  bookingCard: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: spacing.md, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  bookingIncoming: { borderWidth: 1, borderColor: '#99f6e4' },
  incomingBar: { height: 3, marginHorizontal: -spacing.lg, marginTop: -spacing.lg, marginBottom: spacing.md },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  patientAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  patientAvatarText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },
  patientName: { fontSize: fontSize.base, fontWeight: '700', color: colors.text },
  patientMeta: { fontSize: fontSize.xs, color: colors.textSecondary },
  timeTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  timeText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
  timeTextLive: { color: colors.success },
  symptomsBox: {
    backgroundColor: colors.gray50, borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.md,
  },
  symptomsLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  symptomsText: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  reportsTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: spacing.sm,
  },
  reportsText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
  bookingActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  acceptBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  acceptBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },
  declineBtn: {
    width: 44, height: 44, borderRadius: radius.md, backgroundColor: '#fef2f2',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fecaca',
  },
  viewBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.md,
    borderRadius: radius.lg, backgroundColor: colors.gray100,
  },
  viewBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginTop: spacing['2xl'], marginHorizontal: spacing.xl,
    padding: spacing.lg, borderRadius: radius.lg,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { fontSize: fontSize.base, fontWeight: '600', color: colors.danger },
});
