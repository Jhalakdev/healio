import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

type Range = 'today' | 'yesterday' | 'week';

const statusColor: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#0d9488', IN_PROGRESS: '#10b981',
  COMPLETED: '#10b981', CANCELLED: '#ef4444', NO_SHOW: '#ef4444',
};

export default function DoctorBookingsScreen() {
  const [range, setRange] = useState<Range>('today');
  const [data, setData] = useState<any>({ bookings: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [prescriptionText, setPrescriptionText] = useState('');

  const loadData = useCallback(async () => {
    try {
      const d = await api(`/doctors/me/bookings-by-date?range=${range}`);
      setData(d);
    } catch {}
  }, [range]);

  useEffect(() => { setLoading(true); loadData().finally(() => setLoading(false)); }, [loadData]);

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadData(); setRefreshing(false); }, [loadData]);

  const writePrescription = async (bookingId: string) => {
    if (!prescriptionText.trim()) return Alert.alert('Error', 'Write prescription content');
    try {
      await api(`/prescriptions/${bookingId}`, {
        method: 'POST',
        body: JSON.stringify({ content: prescriptionText }),
      });
      Alert.alert('Success', 'Prescription saved');
      setPrescriptionText('');
      setExpandedId(null);
      loadData();
    } catch (err: any) { Alert.alert('Error', err.message || 'Failed'); }
  };

  const s = data.summary || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSub}>{data.bookings?.length || 0} consultations</Text>
      </View>

      {/* Range filter */}
      <View style={styles.filterRow}>
        {([['today', 'Today'], ['yesterday', 'Yesterday'], ['week', 'This Week']] as [Range, string][]).map(([key, label]) => (
          <Pressable key={key} style={[styles.filterChip, range === key && styles.filterChipActive]} onPress={() => setRange(key)}>
            <Text style={[styles.filterText, range === key && styles.filterTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}><Text style={styles.summaryValue}>{s.completed || 0}</Text><Text style={styles.summaryLabel}>Done</Text></View>
        <View style={styles.summaryItem}><Text style={styles.summaryValue}>{s.pending || 0}</Text><Text style={styles.summaryLabel}>Pending</Text></View>
        <View style={styles.summaryItem}><Text style={[styles.summaryValue, { color: '#10b981' }]}>₹{Number(s.totalNetEarnings || 0).toLocaleString('en-IN')}</Text><Text style={styles.summaryLabel}>Net</Text></View>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} /> : (
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />} style={{ flex: 1 }}>
          {data.bookings?.map((b: any) => (
            <Pressable key={b.id} style={styles.bookingCard} onPress={() => setExpandedId(expandedId === b.id ? null : b.id)}>
              <View style={styles.bookingHeader}>
                <View style={styles.patientAvatar}><Text style={styles.avatarText}>{(b.patientName || 'P')[0]}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.patientName}>{b.patientName}</Text>
                  <Text style={styles.bookingMeta}>
                    {new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {b.actualDurationMin || b.durationMin}min · ₹{Math.round(b.netEarning || 0)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: (statusColor[b.status] || '#64748b') + '15' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: statusColor[b.status] || '#64748b' }}>{b.status}</Text>
                </View>
              </View>

              {b.symptoms && <Text style={styles.symptomsText}>Symptoms: {b.symptoms}</Text>}

              {/* Expanded actions */}
              {expandedId === b.id && (
                <View style={styles.expanded}>
                  {/* Prescription */}
                  <View style={styles.prescriptionSection}>
                    <Text style={styles.expandLabel}>Write Prescription</Text>
                    <TextInput
                      style={styles.prescriptionInput}
                      placeholder="Medicine names, dosage, instructions..."
                      placeholderTextColor={colors.gray400}
                      multiline
                      value={prescriptionText}
                      onChangeText={setPrescriptionText}
                    />
                    <Pressable style={styles.prescriptionBtn} onPress={() => writePrescription(b.id)}>
                      <Ionicons name="document-text" size={16} color={colors.white} />
                      <Text style={styles.prescriptionBtnText}>Save Prescription</Text>
                    </Pressable>
                  </View>

                  {/* Actions row */}
                  <View style={styles.actionsRow}>
                    {b.status === 'CONFIRMED' && (
                      <Pressable style={[styles.actionBtn, { backgroundColor: '#10b981' }]}>
                        <Ionicons name="videocam" size={16} color={colors.white} />
                        <Text style={styles.actionBtnText}>Start Call</Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Booking details */}
                  <View style={styles.detailsGrid}>
                    <Text style={styles.detailItem}>Gross: ₹{b.grossAmount}</Text>
                    <Text style={styles.detailItem}>Commission: -₹{Math.round(b.commissionDeducted || 0)}</Text>
                    <Text style={styles.detailItem}>Net: ₹{Math.round(b.netEarning || 0)}</Text>
                    <Text style={styles.detailItem}>ID: {b.id?.slice(0, 8)}</Text>
                  </View>
                </View>
              )}
            </Pressable>
          ))}
          {data.bookings?.length === 0 && (
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyText}>No bookings for this period</Text>
            </View>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: 13, color: colors.gray400, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 12 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: '#e2e8f0' },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  filterTextActive: { color: colors.white },
  summaryRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: colors.white, borderRadius: 14, padding: 16 },
  summaryItem: { flex: 1, alignItems: 'center', gap: 2 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  summaryLabel: { fontSize: 10, color: colors.gray400 },
  bookingCard: { marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 16, padding: 16, marginTop: 10 },
  bookingHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  patientAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#0284c7' },
  patientName: { fontSize: 15, fontWeight: '700', color: colors.text },
  bookingMeta: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  symptomsText: { fontSize: 12, color: colors.gray500, marginTop: 8, fontStyle: 'italic' },
  expanded: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  expandLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
  prescriptionSection: { marginBottom: 12 },
  prescriptionInput: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, minHeight: 80, fontSize: 14, color: colors.text, textAlignVertical: 'top' },
  prescriptionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, marginTop: 8 },
  prescriptionBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailItem: { fontSize: 11, color: colors.gray400, backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 15, color: colors.gray400 },
});
