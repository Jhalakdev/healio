import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api, clearTokens } from '../../lib/api';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('');

  const loadData = useCallback(async () => {
    await Promise.all([
      api('/doctors/me/profile').then((p) => { setProfile(p); setBio(p?.bio || ''); }).catch(() => {}),
      api('/doctors/me/slots').then((s) => setSlots(Array.isArray(s) ? s : [])).catch(() => { setSlots([]); }),
    ]);
  }, []);

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);
  const onRefresh = useCallback(async () => { setRefreshing(true); await loadData(); setRefreshing(false); }, [loadData]);

  const saveBio = async () => {
    try {
      await api('/doctors/me', { method: 'PATCH', body: JSON.stringify({ bio }) });
      setEditingBio(false);
      Alert.alert('Saved', 'Bio updated');
      loadData();
    } catch (err: any) { Alert.alert('Error', err.message || 'Failed'); }
  };

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const qualifications = profile?.qualifications?.length > 0 ? profile.qualifications : [profile?.qualification].filter(Boolean);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(profile?.name || 'D').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Text></View>
        <Text style={styles.profileName}>{profile?.name}</Text>
        <Text style={styles.profileSpec}>{profile?.specialization || qualifications.join(', ') || 'Doctor'}</Text>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}><Text style={styles.profileStatValue}>{profile?.experience || 0}</Text><Text style={styles.profileStatLabel}>Years Exp</Text></View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}><Text style={styles.profileStatValue}>{profile?._count?.bookings || 0}</Text><Text style={styles.profileStatLabel}>Consults</Text></View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}><Text style={styles.profileStatValue}>{profile?.maxSessionsPerDay || 20}</Text><Text style={styles.profileStatLabel}>Max/Day</Text></View>
        </View>
      </View>

      {/* Qualifications */}
      {qualifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qualifications</Text>
          <View style={styles.tagsRow}>
            {qualifications.map((q: string, i: number) => (
              <View key={i} style={styles.tag}><Text style={styles.tagText}>{q}</Text></View>
            ))}
          </View>
        </View>
      )}

      {/* Bio */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About</Text>
          <Pressable onPress={() => editingBio ? saveBio() : setEditingBio(true)}>
            <Text style={styles.editBtn}>{editingBio ? 'Save' : 'Edit'}</Text>
          </Pressable>
        </View>
        {editingBio ? (
          <TextInput style={styles.bioInput} value={bio} onChangeText={setBio} multiline placeholder="Tell patients about yourself..." placeholderTextColor={colors.gray400} />
        ) : (
          <Text style={styles.bioText}>{profile?.bio || 'No bio set. Tap Edit to add one.'}</Text>
        )}
      </View>

      {/* Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability Schedule</Text>
        {slots.length > 0 ? (
          <View style={styles.scheduleGrid}>
            {dayNames.map((day, i) => {
              const daySlots = slots.filter((s: any) => s.dayOfWeek === i && !s.isBreak);
              return (
                <View key={day} style={styles.scheduleRow}>
                  <Text style={styles.scheduleDay}>{day.slice(0, 3)}</Text>
                  {daySlots.length > 0 ? (
                    <View style={styles.scheduleSlots}>
                      {daySlots.map((s: any, j: number) => (
                        <Text key={j} style={styles.scheduleTime}>{s.startTime} - {s.endTime}</Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.scheduleOff}>Day off</Text>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.noSchedule}>
            <Ionicons name="time-outline" size={32} color={colors.gray300} />
            <Text style={styles.noScheduleText}>No schedule set yet</Text>
            <Text style={styles.noScheduleSub}>Set your availability from the web dashboard</Text>
          </View>
        )}
      </View>

      {/* Payment info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.paymentCard}>
          {[
            { label: 'UPI ID', value: profile?.upiId || 'Not set', icon: 'card-outline' as const },
            { label: 'Bank', value: profile?.bankName || 'Not set', icon: 'business-outline' as const },
            { label: 'Account', value: profile?.bankAccountNo ? `****${profile.bankAccountNo.slice(-4)}` : 'Not set', icon: 'wallet-outline' as const },
          ].map((item) => (
            <View key={item.label} style={styles.paymentRow}>
              <Ionicons name={item.icon} size={18} color={colors.gray400} />
              <Text style={styles.paymentLabel}>{item.label}</Text>
              <Text style={styles.paymentValue}>{item.value}</Text>
            </View>
          ))}
        </View>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  profileCard: { marginHorizontal: 20, marginTop: 16, backgroundColor: colors.white, borderRadius: 20, padding: 24, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.white },
  profileName: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 12 },
  profileSpec: { fontSize: 14, color: colors.primary, marginTop: 4 },
  profileStats: { flexDirection: 'row', marginTop: 20, width: '100%' },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  profileStatLabel: { fontSize: 10, color: colors.gray400, marginTop: 2 },
  profileStatDivider: { width: 1, backgroundColor: '#f0f0f0' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 10 },
  editBtn: { fontSize: 13, fontWeight: '600', color: colors.primary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e6f7f5' },
  tagText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  bioText: { fontSize: 14, color: colors.gray500, lineHeight: 22 },
  bioInput: { backgroundColor: colors.white, borderRadius: 12, padding: 14, minHeight: 80, fontSize: 14, color: colors.text, textAlignVertical: 'top' },
  scheduleGrid: { gap: 6 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 12 },
  scheduleDay: { width: 40, fontSize: 13, fontWeight: '700', color: colors.text },
  scheduleSlots: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  scheduleTime: { fontSize: 12, color: colors.primary, backgroundColor: '#f0fdfa', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scheduleOff: { fontSize: 12, color: colors.gray400, fontStyle: 'italic' },
  noSchedule: { alignItems: 'center', paddingVertical: 30, gap: 6 },
  noScheduleText: { fontSize: 14, fontWeight: '600', color: colors.gray400 },
  noScheduleSub: { fontSize: 12, color: colors.gray300 },
  paymentCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  paymentLabel: { flex: 1, fontSize: 13, color: colors.gray500 },
  paymentValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, marginHorizontal: 20, paddingVertical: 16, borderRadius: 14, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
});
