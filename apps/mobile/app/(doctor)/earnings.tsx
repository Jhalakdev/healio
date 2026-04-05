import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

const ranges = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
];

export default function EarningsScreen() {
  const [activeRange, setActiveRange] = useState('today');
  const [data, setData] = useState<any>({ bookings: [], summary: {} });
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([
      api(`/doctors/me/bookings-by-date?range=${activeRange}`).then(setData).catch(() => {}),
      api('/doctors/me/payouts').then(setPayouts).catch(() => []),
    ]);
  }, [activeRange]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [activeRange]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const s = data.summary || {};

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />}>
        {/* Earnings card */}
        <LinearGradient colors={['#0d9488', '#059669']} style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Net Earnings (after {s.commissionPercent || 30}% commission)</Text>
          <Text style={styles.earningsAmount}>₹{Number(s.totalNetEarnings || 0).toLocaleString('en-IN')}</Text>
          <View style={styles.earningsStats}>
            <View style={styles.earningStat}><Text style={styles.earningStatValue}>₹{Number(s.totalGrossEarnings || 0).toLocaleString('en-IN')}</Text><Text style={styles.earningStatLabel}>Gross</Text></View>
            <View style={styles.earningStat}><Text style={styles.earningStatValue}>-₹{Number(s.commissionDeducted || 0).toLocaleString('en-IN')}</Text><Text style={styles.earningStatLabel}>Commission</Text></View>
            <View style={styles.earningStat}><Text style={styles.earningStatValue}>{s.completed || 0}</Text><Text style={styles.earningStatLabel}>Consults</Text></View>
          </View>
        </LinearGradient>

        {/* Range filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20, marginBottom: 12 }}>
          {ranges.map((r) => (
            <Pressable key={r.key} style={[styles.filterChip, activeRange === r.key && styles.filterChipActive]} onPress={() => { setLoading(true); setActiveRange(r.key); }}>
              <Text style={[styles.filterText, activeRange === r.key && styles.filterTextActive]}>{r.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Bookings */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Bookings</Text>
          {data.bookings?.map((b: any) => (
            <View key={b.id} style={styles.bookingCard}>
              <View>
                <Text style={styles.bkPatient}>{b.patientName}</Text>
                <Text style={styles.bkTime}>{new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {b.actualDurationMin || b.durationMin}min</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.bkNet}>+₹{Math.round(b.netEarning)}</Text>
                <Text style={styles.bkGross}>₹{b.grossAmount} - ₹{Math.round(b.commissionDeducted)}</Text>
              </View>
            </View>
          ))}
          {data.bookings?.length === 0 && <Text style={styles.emptyText}>No bookings for this period</Text>}
        </View>

        {/* Payouts */}
        {payouts.length > 0 && (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Payout History</Text>
            {payouts.map((p: any) => (
              <View key={p.id} style={styles.payoutCard}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.payoutPeriod}>{new Date(p.periodStart).toLocaleDateString()} — {new Date(p.periodEnd).toLocaleDateString()}</Text>
                  <Text style={styles.payoutDate}>{p.bookingCount} consults · {p.status}</Text>
                </View>
                <Text style={styles.payoutAmount}>₹{Number(p.amount).toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  earningsCard: { marginHorizontal: 20, borderRadius: 22, padding: 22, marginBottom: 16 },
  earningsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  earningsAmount: { fontSize: 34, fontWeight: '900', color: colors.white, marginTop: 4 },
  earningsStats: { flexDirection: 'row', marginTop: 18 },
  earningStat: { flex: 1, alignItems: 'center' },
  earningStatValue: { fontSize: 15, fontWeight: '700', color: colors.white },
  earningStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: colors.white, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  filterTextActive: { color: colors.white },
  listSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  bookingCard: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  bkPatient: { fontSize: 14, fontWeight: '600', color: colors.text },
  bkTime: { fontSize: 12, color: colors.gray400, marginTop: 3 },
  bkNet: { fontSize: 16, fontWeight: '800', color: '#10b981' },
  bkGross: { fontSize: 10, color: colors.gray400, marginTop: 2 },
  payoutCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 8 },
  payoutPeriod: { fontSize: 14, fontWeight: '600', color: colors.text },
  payoutDate: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  payoutAmount: { fontSize: 17, fontWeight: '800', color: '#10b981' },
  emptyText: { textAlign: 'center', color: colors.gray400, padding: 30 },
});
