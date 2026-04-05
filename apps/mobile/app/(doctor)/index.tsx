import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Switch, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

const statusColor: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#0d9488', IN_PROGRESS: '#10b981',
  COMPLETED: '#10b981', CANCELLED: '#ef4444',
};

export default function DoctorHome() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any>({ data: [], unreadCount: 0 });
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([
      api('/doctors/me/dashboard').then((d) => { setDashboard(d); setIsOnline(d?.isOnline || false); }).catch(() => {}),
      api('/doctors/me/profile').then(setProfile).catch(() => {}),
      api('/doctors/me/bookings-by-date?range=today').then((d) => setBookings(d?.bookings || [])).catch(() => {}),
      api('/notifications').then(setNotifications).catch(() => {}),
    ]);
  }, []);

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadData(); setRefreshing(false); }, [loadData]);

  const toggleOnline = async (val: boolean) => {
    setIsOnline(val);
    try { await api('/doctors/me/toggle-online', { method: 'POST', body: JSON.stringify({ isOnline: val }) }); } catch {}
  };

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const upcoming = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status));
  const inProgress = bookings.filter(b => b.status === 'IN_PROGRESS');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.name}>{profile?.name || 'Doctor'}</Text>
        </View>
        <Pressable style={styles.notifBtn} onPress={() => router.push('/(doctor)/notifications' as any)}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {notifications.unreadCount > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{notifications.unreadCount}</Text></View>}
        </Pressable>
      </View>

      {/* Online toggle card */}
      <View style={styles.onlineCard}>
        <View style={styles.onlineLeft}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10b981' : colors.gray400 }]} />
          <View>
            <Text style={styles.onlineLabel}>{isOnline ? 'You are Online' : 'You are Offline'}</Text>
            <Text style={styles.onlineSub}>{isOnline ? 'Patients can find and book you' : 'Toggle on to start receiving bookings'}</Text>
          </View>
        </View>
        <Switch value={isOnline} onValueChange={toggleOnline} trackColor={{ true: '#10b981', false: colors.gray300 }} thumbColor={colors.white} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <LinearGradient colors={['#0d9488', '#059669']} style={styles.statCard}>
          <Ionicons name="calendar" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={styles.statValue}>{dashboard?.todayBookings || 0}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </LinearGradient>
        <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.statCard}>
          <Ionicons name="people" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={styles.statValue}>{dashboard?.totalPatients || 0}</Text>
          <Text style={styles.statLabel}>Patients</Text>
        </LinearGradient>
        <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.statCard}>
          <Ionicons name="wallet" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={styles.statValue}>₹{Number(dashboard?.totalEarnings || 0).toLocaleString('en-IN')}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </LinearGradient>
      </View>

      {/* In-Progress consultation — prominent CTA */}
      {inProgress.length > 0 && (
        <Pressable style={styles.activeCallCard}>
          <LinearGradient colors={['#10b981', '#059669']} style={styles.activeCallGradient}>
            <View style={styles.activeCallPulse} />
            <Ionicons name="videocam" size={24} color={colors.white} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeCallTitle}>Active Consultation</Text>
              <Text style={styles.activeCallPatient}>{inProgress[0].patientName} — Tap to join</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </LinearGradient>
        </Pressable>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'calendar-outline' as const, label: 'My Bookings', color: '#3b82f6', route: '/(doctor)/bookings' },
            { icon: 'wallet-outline' as const, label: 'Earnings', color: '#10b981', route: '/(doctor)/earnings' },
            { icon: 'time-outline' as const, label: 'Set Schedule', color: '#8b5cf6', route: '/(doctor)/profile' },
            { icon: 'document-text-outline' as const, label: 'Prescriptions', color: '#f59e0b', route: '/(doctor)/bookings' },
          ].map((a) => (
            <Pressable key={a.label} style={styles.actionItem} onPress={() => router.push(a.route as any)}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '15' }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Upcoming Consultations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Pressable onPress={() => router.push('/(doctor)/bookings' as any)}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>
        {upcoming.length > 0 ? upcoming.map((b: any) => (
          <View key={b.id} style={styles.bookingCard}>
            <View style={styles.bookingTime}>
              <Text style={styles.timeText}>{new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={styles.timeDuration}>{b.durationMin || 15}min</Text>
            </View>
            <View style={styles.bookingInfo}>
              <Text style={styles.patientName}>{b.patientName}</Text>
              {b.symptoms && <Text style={styles.symptoms} numberOfLines={1}>{b.symptoms}</Text>}
              <View style={[styles.statusBadge, { backgroundColor: (statusColor[b.status] || '#64748b') + '15' }]}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: statusColor[b.status] || '#64748b' }}>{b.status}</Text>
              </View>
            </View>
            <Pressable style={styles.callBtn}>
              <Ionicons name="videocam" size={18} color={colors.white} />
            </Pressable>
          </View>
        )) : (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={40} color={colors.gray300} />
            <Text style={styles.emptyText}>No upcoming consultations</Text>
            <Text style={styles.emptySubtext}>Toggle online to start receiving bookings</Text>
          </View>
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  greeting: { fontSize: 13, color: colors.gray400 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  notifBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#ef4444', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },

  onlineCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 16, backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  onlineLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  onlineLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  onlineSub: { fontSize: 11, color: colors.gray400, marginTop: 1 },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 20, fontWeight: '900', color: colors.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },

  activeCallCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  activeCallGradient: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18 },
  activeCallPulse: { position: 'absolute', top: 18, left: 18, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white },
  activeCallTitle: { fontSize: 14, fontWeight: '700', color: colors.white },
  activeCallPatient: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionItem: { flex: 1, alignItems: 'center', gap: 8 },
  actionIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '600', color: colors.gray500 },

  bookingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10 },
  bookingTime: { width: 56, alignItems: 'center', paddingVertical: 8, backgroundColor: '#f0fdfa', borderRadius: 12 },
  timeText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  timeDuration: { fontSize: 9, color: colors.gray400, marginTop: 2 },
  bookingInfo: { flex: 1 },
  patientName: { fontSize: 15, fontWeight: '700', color: colors.text },
  symptoms: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  callBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: '600', color: colors.gray400 },
  emptySubtext: { fontSize: 12, color: colors.gray300 },
});
