import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

const specializations = [
  { name: 'Nephrology', icon: 'water-outline' as const, color: '#3b82f6' },
  { name: 'Anesthesiology', icon: 'medical-outline' as const, color: '#8b5cf6' },
  { name: 'Orthopedics', icon: 'body-outline' as const, color: '#f59e0b' },
  { name: 'Ophthalmology', icon: 'eye-outline' as const, color: '#06b6d4' },
  { name: 'Pediatrics', icon: 'happy-outline' as const, color: '#ec4899' },
  { name: 'Oncology', icon: 'ribbon-outline' as const, color: '#ef4444' },
  { name: 'Dermatology', icon: 'hand-left-outline' as const, color: '#f97316' },
  { name: 'Pathology', icon: 'flask-outline' as const, color: '#10b981' },
  { name: 'Psychiatry', icon: 'brain-outline' as const, color: '#7c3aed' },
  { name: 'General Surgery', icon: 'medkit-outline' as const, color: '#dc2626' },
  { name: 'Endocrinology', icon: 'fitness-outline' as const, color: '#14b8a6' },
  { name: 'Radiology', icon: 'scan-outline' as const, color: '#6366f1' },
  { name: 'Surgery', icon: 'cut-outline' as const, color: '#be123c' },
  { name: 'Cardiology', icon: 'heart-outline' as const, color: '#e11d48' },
  { name: 'Geriatrics', icon: 'accessibility-outline' as const, color: '#0d9488' },
];

const filterTags = ['Neuralist', 'Neuromedicine', 'Medicine', 'Psychiatry'];

const doctors = [
  { id: '1', name: 'Dr. Priya Sharma', spec: 'General Medicine', rating: 4.9, reviews: 2530, online: true },
  { id: '2', name: 'Dr. Amit Verma', spec: 'Dermatology', rating: 4.8, reviews: 1820, online: true },
  { id: '3', name: 'Dr. Anna G.', spec: 'Cardiologist', rating: 4.7, reviews: 980, online: true },
  { id: '4', name: 'Dr. Neha Gupta', spec: 'Pediatrics', rating: 4.9, reviews: 2100, online: true },
  { id: '5', name: 'Dr. Sanjay K.', spec: 'ENT', rating: 4.6, reviews: 1540, online: true },
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
            <View style={[styles.specCircle, { backgroundColor: s.color + '15' }]}>
              <Ionicons name={s.icon} size={26} color={s.color} />
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
            <View style={{ position: 'relative' }}>
              <View style={styles.docAvatar}>
                <Text style={styles.docAvatarText}>{doc.name.split(' ').slice(1).map(n => n[0]).join('')}</Text>
              </View>
              {doc.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{doc.name}</Text>
              <Text style={styles.docSpec}>{doc.spec}</Text>
              <View style={styles.docRating}>
                <Ionicons name="star" size={13} color="#f59e0b" />
                <Text style={styles.ratingText}>{doc.rating} ({doc.reviews.toLocaleString()})</Text>
              </View>
            </View>
            <View style={styles.docRight}>
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
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
  specName: { fontSize: 12, color: colors.gray600, fontWeight: '600', marginTop: 6, textAlign: 'center' },
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
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
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
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1, width: 14, height: 14,
    borderRadius: 7, backgroundColor: '#10b981', borderWidth: 2, borderColor: colors.white,
  },
  docInfo: { flex: 1 },
  docName: { fontSize: 16, fontWeight: '700', color: colors.text },
  docSpec: { fontSize: 13, color: colors.gray500, marginTop: 2 },
  docRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 13, color: colors.gray500, fontWeight: '500' },
  docRight: { alignItems: 'flex-end' },
  bookNowBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10,
  },
  bookNowText: { fontSize: 12, fontWeight: '700', color: colors.white },
});
