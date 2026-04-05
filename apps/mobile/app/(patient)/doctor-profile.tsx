import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';

function categorizeSlot(startTime: string): TimeOfDay {
  const hour = parseInt(startTime.split(':')[0]);
  if (hour < 12) return 'Morning';
  if (hour < 16) return 'Afternoon';
  return 'Evening';
}

function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function DoctorProfileScreen() {
  const { doctorId: paramDoctorId } = useLocalSearchParams<{ doctorId: string }>();
  const [doctor, setDoctor] = useState<any>(null);
  const [reviews, setReviews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay>('Morning');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [tab, setTab] = useState<'about' | 'reviews'>('about');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Generate dates for next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { day: d.getDate(), label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()], date: d };
  });
  const [selectedDate, setSelectedDate] = useState(0); // index into dates array

  const loadDoctor = useCallback(async () => {
    try {
      let doc: any;
      if (paramDoctorId) {
        doc = await api(`/doctors/${paramDoctorId}`);
      } else {
        const doctors = await api('/doctors');
        doc = doctors?.[0];
      }
      if (doc) {
        setDoctor(doc);
        try {
          const rev = await api(`/reviews/doctor/${doc.id}`);
          setReviews(rev);
        } catch {}
      }
    } catch {}
    setLoading(false);
  }, [paramDoctorId]);

  const loadSlots = useCallback(async (dateIndex: number) => {
    if (!doctor?.id) return;
    setSlotsLoading(true);
    try {
      const dateStr = dates[dateIndex].date.toISOString().split('T')[0];
      const slots = await api(`/doctors/${doctor.id}/availability?date=${dateStr}&timezone=Asia/Kolkata`);
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch {
      setAvailableSlots([]);
    }
    setSlotsLoading(false);
  }, [doctor?.id]);

  useEffect(() => { loadDoctor(); }, [loadDoctor]);

  useEffect(() => {
    if (doctor?.id) loadSlots(selectedDate);
  }, [doctor?.id, selectedDate, loadSlots]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDoctor();
    if (doctor?.id) await loadSlots(selectedDate);
    setRefreshing(false);
  };

  const toggleFav = async () => {
    if (!doctor) return;
    try {
      await api(`/users/me/favourites/${doctor.id}`, { method: 'POST' });
      setIsFavourite(!isFavourite);
    } catch {}
  };

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!doctor) return <View style={styles.loadingWrap}><Text style={{ color: colors.gray400 }}>Doctor not found</Text></View>;

  const categories = doctor.categories?.map((c: any) => c.category?.name).filter(Boolean) || [doctor.specialization || 'General'];

  // Group available slots by time of day
  const slotsByTime: Record<TimeOfDay, { time: string; available: boolean }[]> = {
    Morning: [], Afternoon: [], Evening: [],
  };
  availableSlots.forEach((s: any) => {
    const cat = categorizeSlot(s.startTime);
    slotsByTime[cat].push({ time: formatTime(s.startTime), available: s.available !== false });
  });

  // Auto-select first time of day that has slots
  const activeSlots = slotsByTime[selectedTimeOfDay];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
          <Text style={styles.headerTitle}>Doctor Profile</Text>
          <Pressable onPress={toggleFav} style={styles.favBtn}>
            <Ionicons name={isFavourite ? 'heart' : 'heart-outline'} size={22} color={isFavourite ? '#ef4444' : colors.gray400} />
          </Pressable>
        </View>

        {/* Doctor info */}
        <View style={styles.doctorSection}>
          <View style={styles.docAvatar}>
            <Text style={styles.docAvatarText}>{doctor.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'D'}</Text>
            {doctor.isOnline && <View style={styles.onlineBadge} />}
          </View>
          <Text style={styles.docName}>{doctor.name}</Text>
          <Text style={styles.docQualif}>{(doctor.qualifications || [doctor.qualification]).filter(Boolean).join(', ') || ''}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>{reviews?.stats?.averageRating?.toFixed(1) || 'New'} ({reviews?.stats?.totalReviews || 0} reviews)</Text>
          </View>
          <View style={styles.tagsRow}>
            {categories.map((tag: string) => (
              <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reviews?.stats?.totalPatients || 0}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.experience || 0}+ yrs</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reviews?.stats?.averageRating?.toFixed(1) || 'New'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.avgResponseMin ? `${doctor.avgResponseMin}m` : '< 5m'}</Text>
            <Text style={styles.statLabel}>Response</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['about', 'reviews'] as const).map((t) => (
            <Pressable key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'about' ? 'About' : `Reviews (${reviews?.stats?.totalReviews || 0})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'about' ? (
          <View style={styles.content}>
            {doctor.bio && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>About</Text>
                <Text style={styles.bioText}>{doctor.bio}</Text>
              </View>
            )}

            {/* Schedule */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Schedule</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {dates.map((d, idx) => (
                  <Pressable key={idx} style={[styles.dateCard, selectedDate === idx && styles.dateCardActive]} onPress={() => { setSelectedDate(idx); setSelectedSlot(null); }}>
                    <Text style={[styles.dateNum, selectedDate === idx && styles.dateNumActive]}>{d.day}</Text>
                    <Text style={[styles.dateLabel, selectedDate === idx && styles.dateLabelActive]}>{d.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.timeTabs}>
                {(['Morning', 'Afternoon', 'Evening'] as TimeOfDay[]).map((tod) => (
                  <Pressable key={tod} style={[styles.timeTab, selectedTimeOfDay === tod && styles.timeTabActive]} onPress={() => setSelectedTimeOfDay(tod)}>
                    <Text style={[styles.timeTabText, selectedTimeOfDay === tod && styles.timeTabTextActive]}>
                      {tod} ({slotsByTime[tod].filter(s => s.available).length})
                    </Text>
                  </Pressable>
                ))}
              </View>

              {slotsLoading ? (
                <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
              ) : activeSlots.length > 0 ? (
                <View style={styles.slotsRow}>
                  {activeSlots.map((slot) => (
                    <Pressable
                      key={slot.time}
                      style={[styles.slotChip, selectedSlot === slot.time && styles.slotChipActive, !slot.available && styles.slotChipDisabled]}
                      onPress={() => slot.available && setSelectedSlot(slot.time)}
                      disabled={!slot.available}
                    >
                      <Text style={[styles.slotText, selectedSlot === slot.time && styles.slotTextActive, !slot.available && styles.slotTextDisabled]}>{slot.time}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={{ textAlign: 'center', color: colors.gray400, padding: 20 }}>No slots available for this period</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            {reviews?.reviews?.map((r: any) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}><Text style={styles.reviewAvatarText}>{(r.patient?.name || 'A')[0]}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{r.isAnonymous ? 'Anonymous' : r.patient?.name || 'Patient'}</Text>
                    <Text style={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 1 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={14} color="#f59e0b" />
                    ))}
                  </View>
                </View>
                {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
              </View>
            ))}
            {(!reviews?.reviews || reviews.reviews.length === 0) && (
              <Text style={{ textAlign: 'center', color: colors.gray400, padding: 30 }}>No reviews yet</Text>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable style={[styles.bookBtn, !selectedSlot && { opacity: 0.5 }]} onPress={() => {
          if (!selectedSlot) return;
          const selDate = dates[selectedDate];
          router.push({ pathname: '/(patient)/booking-confirm', params: { doctorId: doctor.id, slot: selectedSlot, date: selDate?.date?.toISOString() || '' } });
        }}>
          <Ionicons name="videocam" size={20} color={colors.white} />
          <Text style={styles.bookBtnText}>{selectedSlot ? 'Book Appointment' : 'Select a Time Slot'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  favBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  doctorSection: { alignItems: 'center', paddingTop: 16, paddingBottom: 8 },
  onlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#10b981', borderWidth: 3, borderColor: colors.white },
  docAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  docAvatarText: { fontSize: 28, fontWeight: '800', color: '#0284c7' },
  docName: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 12 },
  docQualif: { fontSize: 13, color: colors.primary, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ratingText: { fontSize: 13, color: colors.gray500 },
  tagsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  tag: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.gray100 },
  tagText: { fontSize: 12, color: colors.gray600 },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: '#fafafa', borderRadius: 16, padding: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.gray500 },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, backgroundColor: colors.gray100, borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: colors.white },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.gray400 },
  tabTextActive: { color: colors.text },
  content: { paddingHorizontal: 20, marginTop: 16, gap: 16 },
  card: { backgroundColor: '#fafafa', borderRadius: 16, padding: 18 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 10 },
  bioText: { fontSize: 14, color: colors.gray500, lineHeight: 22 },
  dateCard: { width: 52, height: 72, borderRadius: 14, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  dateCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateNum: { fontSize: 20, fontWeight: '800', color: colors.text },
  dateNumActive: { color: colors.white },
  dateLabel: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  dateLabelActive: { color: 'rgba(255,255,255,0.8)' },
  timeTabs: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4, marginBottom: 12 },
  timeTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  timeTabActive: { backgroundColor: colors.primary },
  timeTabText: { fontSize: 12, fontWeight: '600', color: colors.gray400 },
  timeTabTextActive: { color: colors.white },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  slotChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotChipDisabled: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', opacity: 0.4 },
  slotText: { fontSize: 13, fontWeight: '600', color: colors.gray600 },
  slotTextActive: { color: colors.white },
  slotTextDisabled: { color: colors.gray400 },
  reviewCard: { backgroundColor: '#fafafa', borderRadius: 16, padding: 16 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray200, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontSize: 14, fontWeight: '700', color: colors.gray600 },
  reviewName: { fontSize: 14, fontWeight: '700', color: colors.text },
  reviewDate: { fontSize: 10, color: colors.gray400 },
  reviewComment: { fontSize: 13, color: colors.gray500, marginTop: 10, lineHeight: 20 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 34, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, height: 54, borderRadius: 16 },
  bookBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
