import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

const doctor = {
  name: 'Dr. Eion Morgan',
  qualification: 'MBBS, MD (Neurology)',
  rating: 4.5,
  reviews: 2530,
  tags: ['Neuralist', 'Neuromedicine', 'Medicine'],
  bio: 'Eion Morgan is a dedicated pediatrician with over 15 years of experience in caring for children\'s health. She is passionate about ensuring the well-being of your little ones and believes in a holistic approach.',
  fee: 500,
};

const dates = [
  { day: 15, label: 'Mon', active: true },
  { day: 16, label: 'Tue', active: false },
  { day: 17, label: 'Wed', active: false },
  { day: 18, label: 'Thu', active: false },
  { day: 19, label: 'Fri', active: false },
  { day: 20, label: 'Sat', active: false },
];

const timeSlots = {
  Morning: ['09:00 AM', '10:00 AM', '11:00 AM'],
  Afternoon: ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'],
  Evening: ['05:00 PM', '06:00 PM', '07:00 PM'],
};

type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';

export default function DoctorProfileScreen() {
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay>('Afternoon');
  const [selectedSlot, setSelectedSlot] = useState<string | null>('02:00 PM');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Doctor Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Doctor info */}
        <View style={styles.doctorSection}>
          <View style={styles.docAvatar}>
            <Text style={styles.docAvatarText}>EM</Text>
          </View>
          <Text style={styles.docName}>{doctor.name}</Text>
          <Text style={styles.docQualif}>{doctor.qualification}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>{doctor.rating} ({doctor.reviews})</Text>
          </View>
          <View style={styles.tagsRow}>
            {doctor.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Biography */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctor Biography</Text>
          <Text style={styles.bioText}>{doctor.bio}</Text>
        </View>

        {/* Schedules - Calendar */}
        <View style={styles.section}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionTitle}>Schedules</Text>
            <Text style={styles.monthLabel}>Oct 2023 ▾</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesRow}>
            {dates.map((d) => (
              <Pressable
                key={d.day}
                style={[styles.dateCard, selectedDate === d.day && styles.dateCardActive]}
                onPress={() => setSelectedDate(d.day)}
              >
                <Text style={[styles.dateNum, selectedDate === d.day && styles.dateNumActive]}>{d.day}</Text>
                <Text style={[styles.dateLabel, selectedDate === d.day && styles.dateLabelActive]}>{d.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Choose Times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Times</Text>

          {/* Time of day tabs */}
          <View style={styles.timeTabs}>
            {(['Morning', 'Afternoon', 'Evening'] as TimeOfDay[]).map((tod) => (
              <Pressable
                key={tod}
                style={[styles.timeTab, selectedTimeOfDay === tod && styles.timeTabActive]}
                onPress={() => setSelectedTimeOfDay(tod)}
              >
                <Text style={[styles.timeTabText, selectedTimeOfDay === tod && styles.timeTabTextActive]}>{tod}</Text>
              </Pressable>
            ))}
          </View>

          {/* Time label */}
          <Text style={styles.scheduleLabel}>{selectedTimeOfDay} Schedule</Text>

          {/* Time slots */}
          <View style={styles.slotsRow}>
            {timeSlots[selectedTimeOfDay].map((slot) => (
              <Pressable
                key={slot}
                style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.bookBtn}>
          <Text style={styles.bookBtnText}>Book Appointment (₹{doctor.fee.toFixed(2)})</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8,
  },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },

  // Doctor
  doctorSection: { alignItems: 'center', paddingTop: 16, paddingBottom: 8 },
  docAvatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0f2fe',
    alignItems: 'center', justifyContent: 'center',
  },
  docAvatarText: { fontSize: 28, fontWeight: '800', color: '#0284c7' },
  docName: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 12 },
  docQualif: { fontSize: 13, color: colors.primary, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ratingText: { fontSize: 13, color: colors.gray500, fontWeight: '500' },
  tagsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: colors.gray100,
  },
  tagText: { fontSize: 12, color: colors.gray600, fontWeight: '500' },

  // Section
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 10 },
  bioText: { fontSize: 14, color: colors.gray500, lineHeight: 22 },

  // Schedule
  scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthLabel: { fontSize: 13, color: colors.gray400, fontWeight: '500' },
  datesRow: { marginTop: 4 },
  dateCard: {
    width: 52, height: 72, borderRadius: 14, backgroundColor: '#f8fafc',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  dateCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateNum: { fontSize: 20, fontWeight: '800', color: colors.text },
  dateNumActive: { color: colors.white },
  dateLabel: { fontSize: 11, color: colors.gray400, fontWeight: '500', marginTop: 2 },
  dateLabelActive: { color: 'rgba(255,255,255,0.8)' },

  // Time
  timeTabs: {
    flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4,
  },
  timeTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  timeTabActive: { backgroundColor: colors.primary },
  timeTabText: { fontSize: 13, fontWeight: '600', color: colors.gray400 },
  timeTabTextActive: { color: colors.white },
  scheduleLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 10 },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
  },
  slotChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontSize: 13, fontWeight: '600', color: colors.gray600 },
  slotTextActive: { color: colors.white },

  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 34,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#f5f5f5',
  },
  bookBtn: {
    backgroundColor: colors.primary, height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  bookBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
