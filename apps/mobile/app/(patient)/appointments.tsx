import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

type Tab = 'upcoming' | 'past' | 'cancelled';

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#0d9488', IN_PROGRESS: '#10b981',
  COMPLETED: '#10b981', CANCELLED: '#ef4444', NO_SHOW: '#ef4444',
};

export default function AppointmentsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [activeTab]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api(`/users/me/bookings?filter=${activeTab}`);
      setBookings(data || []);
    } catch { setBookings([]); }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      <View style={styles.tabs}>
        {(['upcoming', 'past', 'cancelled'] as Tab[]).map((tab) => (
          <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} /> : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {bookings.map((apt: any) => (
            <View key={apt.id} style={styles.aptCard}>
              <View style={styles.aptAvatar}>
                <Text style={styles.aptAvatarText}>{apt.doctor?.name?.[0] || 'D'}</Text>
              </View>
              <View style={styles.aptInfo}>
                <Text style={styles.aptDoctor}>{apt.doctor?.name || 'Doctor'}</Text>
                <Text style={styles.aptSpec}>{apt.doctor?.specialization || ''}</Text>
                <View style={styles.aptTimeRow}>
                  <Ionicons name="time-outline" size={12} color={colors.gray400} />
                  <Text style={styles.aptTime}>{new Date(apt.scheduledAt).toLocaleString()}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: (statusColors[apt.status] || '#64748b') + '15' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColors[apt.status] || '#64748b' }]} />
                <Text style={[styles.statusText, { color: statusColors[apt.status] || '#64748b' }]}>{apt.status}</Text>
              </View>
            </View>
          ))}
          {bookings.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyText}>No {activeTab} appointments</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.gray400 },
  tabTextActive: { color: colors.text },
  list: { paddingHorizontal: 20, marginTop: 16 },
  aptCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fafafa', borderRadius: 16, padding: 14, marginBottom: 10 },
  aptAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  aptAvatarText: { fontSize: 16, fontWeight: '700', color: '#0284c7' },
  aptInfo: { flex: 1 },
  aptDoctor: { fontSize: 15, fontWeight: '700', color: colors.text },
  aptSpec: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  aptTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  aptTime: { fontSize: 12, color: colors.gray500 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.gray400 },
});
