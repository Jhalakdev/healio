import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api, clearTokens } from '../../lib/api';

const statusColor: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#0d9488', IN_PROGRESS: '#10b981',
  COMPLETED: '#10b981', CANCELLED: '#ef4444',
};

export default function DoctorDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/doctors/me/dashboard').then((d) => { setDashboard(d); setIsOnline(d?.isOnline || false); }).catch(() => {}),
      api('/doctors/me/bookings-by-date?range=today').then((d) => setBookings(d?.bookings || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const toggleOnline = async (val: boolean) => {
    setIsOnline(val);
    try { await api('/doctors/me/toggle-online', { method: 'POST', body: JSON.stringify({ isOnline: val }) }); } catch {}
  };

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}</Text>
          <Text style={styles.name}>Doctor Dashboard</Text>
        </View>
        <View style={styles.onlineToggle}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10b981' : colors.gray400 }]} />
          <Text style={[styles.statusText, { color: isOnline ? '#10b981' : colors.gray400 }]}>{isOnline ? 'Online' : 'Offline'}</Text>
          <Switch value={isOnline} onValueChange={toggleOnline} trackColor={{ true: '#10b981', false: colors.gray300 }} thumbColor={colors.white} />
        </View>
      </View>

      {/* Stats from API */}
      <View style={styles.statsRow}>
        {[
          { label: "Today's", value: String(dashboard?.todayBookings || 0), icon: 'calendar-outline' as const, color: '#3b82f6' },
          { label: 'Earnings', value: `₹${Number(dashboard?.totalEarnings || 0).toLocaleString('en-IN')}`, icon: 'wallet-outline' as const, color: '#10b981' },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon} size={20} color={stat.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Today's bookings from API */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Consultations</Text>
        {bookings.length > 0 ? bookings.map((b: any) => (
          <View key={b.id} style={styles.bookingCard}>
            <View style={styles.patientRow}>
              <View style={styles.patientAvatar}><Text style={styles.patientAvatarText}>{(b.patientName || 'P')[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{b.patientName}</Text>
                <Text style={styles.patientMeta}>{new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {b.durationMin}min</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: (statusColor[b.status] || '#64748b') + '15' }]}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: statusColor[b.status] || '#64748b' }}>{b.status}</Text>
              </View>
            </View>
            {b.symptoms && (
              <View style={styles.symptomsBox}>
                <Text style={styles.symptomsLabel}>Symptoms</Text>
                <Text style={styles.symptomsText}>{b.symptoms}</Text>
              </View>
            )}
          </View>
        )) : (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={40} color={colors.gray300} />
            <Text style={styles.emptyText}>No consultations today</Text>
          </View>
        )}
      </View>

      {/* Logout */}
      <Pressable style={styles.logoutBtn} onPress={() => { clearTokens(); router.replace('/'); }}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  greeting: { fontSize: 12, color: colors.gray400 },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 2 },
  onlineToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 8 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 16, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.gray400 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  bookingCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  patientAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  patientAvatarText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  patientName: { fontSize: 15, fontWeight: '700', color: colors.text },
  patientMeta: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  symptomsBox: { backgroundColor: colors.gray50, borderRadius: 10, padding: 12, marginTop: 10 },
  symptomsLabel: { fontSize: 10, color: colors.gray400, fontWeight: '600', marginBottom: 2 },
  symptomsText: { fontSize: 13, color: colors.text },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, color: colors.gray400 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, marginHorizontal: 20, paddingVertical: 16, borderRadius: 14, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
});
