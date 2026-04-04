import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

const specializations = [
  { name: 'Nephrology', emoji: '🫘' },
  { name: 'Anesthesiology', emoji: '💉' },
  { name: 'Orthopedics', emoji: '🦴' },
  { name: 'Ophthalmology', emoji: '👁️' },
  { name: 'Pediatrics', emoji: '👶' },
  { name: 'Oncology', emoji: '🎗️' },
  { name: 'Dermatology', emoji: '🧴' },
  { name: 'Pathology', emoji: '🔬' },
  { name: 'Psychiatry', emoji: '🧠' },
  { name: 'General Surgery', emoji: '🏥' },
  { name: 'Endocrinology', emoji: '🦋' },
  { name: 'Radiology', emoji: '📡' },
  { name: 'Surgery', emoji: '🔪' },
  { name: 'Cardiology', emoji: '❤️' },
  { name: 'Geriatrics', emoji: '👴' },
];

const filterTags = ['Neuralist', 'Neuromedicine', 'Medicine', 'Psychiatry'];

const doctors = [
  { id: '1', name: 'Dr. Aaliya Y.', spec: 'MBBS, BCS', fee: 500, rating: 4.5, reviews: 2530 },
  { id: '2', name: 'Dr. Amira', spec: 'BDS, Dentistry', fee: 500, rating: 4.5, reviews: 2530 },
  { id: '3', name: 'Dr. Anna G.', spec: 'Cardiologist', fee: 500, rating: 4.5, reviews: 2530 },
  { id: '4', name: 'Dr. Anne.', spec: 'Hepatologist', fee: 500, rating: 4.5, reviews: 2530 },
  { id: '5', name: 'Dr. Andrea H.', spec: 'Neurosurgery', fee: 500, rating: 4.5, reviews: 2530 },
];

export default function DoctorsTab() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Find Your Doctor</Text>
        <Pressable style={styles.shareBtn}>
          <Ionicons name="options-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Specialization Grid */}
      <View style={styles.specGrid}>
        {specializations.map((s) => (
          <Pressable key={s.name} style={styles.specItem}>
            <View style={styles.specCircle}>
              <Text style={styles.specEmoji}>{s.emoji}</Text>
            </View>
            <Text style={styles.specName}>{s.name}</Text>
          </Pressable>
        ))}
      </View>

      {/* Filter Tags */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {filterTags.map((tag, i) => (
          <Pressable key={tag} style={[styles.filterTag, i === 0 && styles.filterTagActive]}>
            <Text style={[styles.filterTagText, i === 0 && styles.filterTagTextActive]}>{tag}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Doctor List */}
      <View style={styles.doctorsList}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommend for you</Text>
          <Text style={styles.seeAll}>See All &gt;</Text>
        </View>

        {doctors.map((doc) => (
          <Pressable
            key={doc.id}
            style={styles.doctorCard}
            onPress={() => router.push('/(patient)/doctor-profile')}
          >
            <View style={styles.docAvatar}>
              <Text style={styles.docAvatarText}>{doc.name.split(' ')[1]?.[0] || 'D'}</Text>
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{doc.name}</Text>
              <Text style={styles.docSpec}>{doc.spec}</Text>
              <View style={styles.docRating}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.ratingText}>{doc.rating} ({doc.reviews})</Text>
              </View>
            </View>
            <View style={styles.docRight}>
              <Text style={styles.feeLabel}>Fees <Text style={styles.feeValue}>₹{doc.fee.toFixed(2)}</Text></Text>
              <Pressable style={styles.bookNowBtn}>
                <Text style={styles.bookNowText}>Book Now</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  shareBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  specGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 4,
    justifyContent: 'space-between',
  },
  specItem: { width: '30%', alignItems: 'center', marginBottom: 20 },
  specCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#f8fffe',
    borderWidth: 1, borderColor: '#e6f7f5',
    alignItems: 'center', justifyContent: 'center',
  },
  specEmoji: { fontSize: 28 },
  specName: { fontSize: 11, color: colors.gray500, fontWeight: '500', marginTop: 6, textAlign: 'center' },
  filterRow: { paddingLeft: 20, marginBottom: 8 },
  filterTag: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.gray100, marginRight: 8,
  },
  filterTagActive: { backgroundColor: colors.primary },
  filterTagText: { fontSize: 13, color: colors.gray500, fontWeight: '500' },
  filterTagTextActive: { color: colors.white, fontWeight: '600' },
  doctorsList: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  doctorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  docAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0f2fe',
    alignItems: 'center', justifyContent: 'center',
  },
  docAvatarText: { fontSize: 18, fontWeight: '700', color: '#0284c7' },
  docInfo: { flex: 1 },
  docName: { fontSize: 15, fontWeight: '700', color: colors.text },
  docSpec: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  docRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, color: colors.gray500 },
  docRight: { alignItems: 'flex-end', gap: 6 },
  feeLabel: { fontSize: 12, color: colors.gray400 },
  feeValue: { fontWeight: '700', color: colors.text },
  bookNowBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8,
  },
  bookNowText: { fontSize: 12, fontWeight: '700', color: colors.white },
});
