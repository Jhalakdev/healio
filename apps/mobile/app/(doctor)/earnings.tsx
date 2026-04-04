import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';

const dateFilters = ['Today', 'Yesterday', 'This Week', 'Custom'];

const bookings = [
  { id: '1', patient: 'Mrs. Williamson', time: '10:00 AM', gross: 500, commission: 150, net: 350, status: 'Completed', duration: '14 min' },
  { id: '2', patient: 'Rahul Kumar', time: '11:30 AM', gross: 500, commission: 150, net: 350, status: 'Completed', duration: '12 min' },
  { id: '3', patient: 'Anita Mishra', time: '2:00 PM', gross: 700, commission: 210, net: 490, status: 'Completed', duration: '15 min' },
  { id: '4', patient: 'Suresh Patil', time: '3:30 PM', gross: 500, commission: 150, net: 350, status: 'No Show', duration: '-' },
  { id: '5', patient: 'Chloe W. (Child)', time: '4:30 PM', gross: 450, commission: 135, net: 315, status: 'Completed', duration: '13 min' },
];

const payouts = [
  { id: '1', period: 'Oct 7 — Oct 13', amount: 4550, bookings: 12, status: 'Completed', date: 'Paid Oct 14' },
  { id: '2', period: 'Sep 30 — Oct 6', amount: 3850, bookings: 10, status: 'Completed', date: 'Paid Oct 7' },
];

export default function EarningsScreen() {
  const [activeFilter, setActiveFilter] = useState('Today');
  const [tab, setTab] = useState<'bookings' | 'payouts'>('bookings');

  const totalNet = bookings.filter(b => b.status === 'Completed').reduce((s, b) => s + b.net, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Earnings</Text>
        <Pressable>
          <Ionicons name="download-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Earnings card */}
        <LinearGradient colors={['#0d9488', '#059669']} style={styles.earningsCard}>
          <View style={styles.earningsTop}>
            <View>
              <Text style={styles.earningsLabel}>Today's Earnings (after 30% commission)</Text>
              <Text style={styles.earningsAmount}>₹{totalNet.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.earningsIcon}>
              <Ionicons name="trending-up" size={24} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          <View style={styles.earningsStats}>
            {[
              { label: 'Gross', value: `₹${bookings.reduce((s, b) => s + b.gross, 0).toLocaleString('en-IN')}` },
              { label: 'Commission', value: `-₹${bookings.reduce((s, b) => s + b.commission, 0).toLocaleString('en-IN')}` },
              { label: 'Consults', value: bookings.filter(b => b.status === 'Completed').length.toString() },
            ].map((s) => (
              <View key={s.label} style={styles.earningStat}>
                <Text style={styles.earningStatValue}>{s.value}</Text>
                <Text style={styles.earningStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* UPI info */}
        <View style={styles.upiCard}>
          <Ionicons name="card" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.upiLabel}>Payout to UPI</Text>
            <Text style={styles.upiId}>doctor.sharma@upi</Text>
          </View>
          <Pressable style={styles.editUpi}>
            <Text style={styles.editUpiText}>Edit</Text>
          </Pressable>
        </View>

        {/* Date filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {dateFilters.map((f) => (
            <Pressable
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['bookings', 'payouts'] as const).map((t) => (
            <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'bookings' ? 'Bookings' : 'Payouts'}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'bookings' ? (
          <View style={styles.listSection}>
            {bookings.map((b) => (
              <View key={b.id} style={styles.bookingCard}>
                <View style={styles.bkLeft}>
                  <Text style={styles.bkPatient}>{b.patient}</Text>
                  <Text style={styles.bkTime}>{b.time} · {b.duration}</Text>
                </View>
                <View style={styles.bkRight}>
                  <Text style={styles.bkNet}>+₹{b.net}</Text>
                  <Text style={styles.bkGross}>₹{b.gross} - ₹{b.commission} comm.</Text>
                  <View style={[styles.statusTag, b.status === 'Completed' ? styles.statusGreen : styles.statusRed]}>
                    <Text style={[styles.statusText, b.status === 'Completed' ? { color: '#10b981' } : { color: '#ef4444' }]}>
                      {b.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.listSection}>
            {payouts.map((p) => (
              <View key={p.id} style={styles.payoutCard}>
                <View style={styles.payoutLeft}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <View>
                    <Text style={styles.payoutPeriod}>{p.period}</Text>
                    <Text style={styles.payoutDate}>{p.date} · {p.bookings} consults</Text>
                  </View>
                </View>
                <Text style={styles.payoutAmount}>₹{p.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))}
            <View style={styles.payoutInfo}>
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text style={styles.payoutInfoText}>Payouts are processed every Friday via UPI.</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },

  earningsCard: { marginHorizontal: 20, borderRadius: 22, padding: 22, marginBottom: 12 },
  earningsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  earningsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  earningsAmount: { fontSize: 34, fontWeight: '900', color: colors.white, marginTop: 4, letterSpacing: -1 },
  earningsIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  earningsStats: { flexDirection: 'row', marginTop: 18, gap: 0 },
  earningStat: { flex: 1, alignItems: 'center' },
  earningStatValue: { fontSize: 15, fontWeight: '700', color: colors.white },
  earningStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  upiCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 12,
  },
  upiLabel: { fontSize: 11, color: colors.gray400 },
  upiId: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 1 },
  editUpi: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.gray100 },
  editUpiText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  filterRow: { paddingLeft: 20, marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20,
    backgroundColor: colors.white, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0',
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  filterTextActive: { color: colors.white },

  tabs: {
    flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#f1f5f9',
    borderRadius: 12, padding: 3, marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.gray400 },
  tabTextActive: { color: colors.text },

  listSection: { paddingHorizontal: 20, marginBottom: 30 },
  bookingCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  bkLeft: {},
  bkPatient: { fontSize: 14, fontWeight: '600', color: colors.text },
  bkTime: { fontSize: 12, color: colors.gray400, marginTop: 3 },
  bkRight: { alignItems: 'flex-end' },
  bkNet: { fontSize: 16, fontWeight: '800', color: '#10b981' },
  bkGross: { fontSize: 10, color: colors.gray400, marginTop: 2 },
  statusTag: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusGreen: { backgroundColor: '#dcfce7' },
  statusRed: { backgroundColor: '#fef2f2' },
  statusText: { fontSize: 10, fontWeight: '600' },

  payoutCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 8,
  },
  payoutLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payoutPeriod: { fontSize: 14, fontWeight: '600', color: colors.text },
  payoutDate: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  payoutAmount: { fontSize: 17, fontWeight: '800', color: '#10b981' },
  payoutInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#e6f7f5', padding: 12, borderRadius: 12, marginTop: 8,
  },
  payoutInfoText: { fontSize: 12, color: colors.primary },
});
