import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

const specializations = [
  { id: '1', name: 'Neurology', icon: 'brain-outline' as const, color: '#7c3aed' },
  { id: '2', name: 'Cardiology', icon: 'heart-outline' as const, color: '#e11d48' },
  { id: '3', name: 'Orthopedics', icon: 'body-outline' as const, color: '#f59e0b' },
  { id: '4', name: 'Pathology', icon: 'flask-outline' as const, color: '#10b981' },
];

const popularDoctors = [
  {
    id: '1', name: 'Dr. Priya Sharma', spec: 'General Medicine',
    rating: 4.9, reviews: 2530, online: true,
  },
  {
    id: '2', name: 'Dr. Amit Verma', spec: 'Dermatology',
    rating: 4.8, reviews: 1820, online: true,
  },
  {
    id: '3', name: 'Dr. Neha Gupta', spec: 'Pediatrics',
    rating: 4.9, reviews: 2100, online: true,
  },
  {
    id: '4', name: 'Dr. Sanjay Kumar', spec: 'ENT',
    rating: 4.8, reviews: 1540, online: true,
  },
];

const familyMembers = [
  { name: 'Chloe K.', color: '#FFD700' },
  { name: 'Colter E.', color: '#FF6B6B' },
  { name: 'Waylan A.', color: '#4ECDC4' },
];

export default function PatientHome() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>MW</Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.userName}>Mr. Williamson</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="search-outline" size={20} color={colors.text} />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </View>

      {/* Search Banner */}
      <LinearGradient
        colors={['#0d9488', '#10b981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.searchBanner}
      >
        <Text style={styles.searchBannerTitle}>Looking for{'\n'}desired doctor?</Text>
        <Pressable style={styles.searchBtn}>
          <Ionicons name="search" size={14} color={colors.primary} />
          <Text style={styles.searchBtnText}>Search for...</Text>
        </Pressable>
      </LinearGradient>

      {/* Family Members */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family Member</Text>
        <View style={styles.familyRow}>
          {familyMembers.map((m) => (
            <View key={m.name} style={styles.familyItem}>
              <View style={[styles.familyAvatar, { backgroundColor: m.color }]}>
                <Text style={styles.familyAvatarText}>{m.name[0]}</Text>
              </View>
              <Text style={styles.familyName}>{m.name}</Text>
            </View>
          ))}
          <Pressable style={styles.familyItem}>
            <View style={[styles.familyAvatar, { backgroundColor: colors.gray100, borderWidth: 2, borderColor: colors.gray200, borderStyle: 'dashed' }]}>
              <Ionicons name="add" size={22} color={colors.gray400} />
            </View>
            <Text style={styles.familyName}>Add New</Text>
          </Pressable>
        </View>
      </View>

      {/* Find Your Doctor - Specializations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Find your doctor</Text>
          <Pressable onPress={() => router.push('/(patient)/doctors')}>
            <Text style={styles.seeAll}>See All &gt;</Text>
          </Pressable>
        </View>
        <View style={styles.specRow}>
          {specializations.map((s) => (
            <Pressable key={s.id} style={styles.specItem}>
              <View style={[styles.specCircle, { backgroundColor: s.color + '15' }]}>
                <Ionicons name={s.icon} size={26} color={s.color} />
              </View>
              <Text style={styles.specName}>{s.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Popular Doctors */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Doctors</Text>
          <Pressable>
            <Text style={styles.seeAll}>See All &gt;</Text>
          </Pressable>
        </View>

        {popularDoctors.map((doc) => (
          <Pressable
            key={doc.id}
            style={styles.doctorCard}
            onPress={() => router.push('/(patient)/doctor-profile')}
          >
            <View style={styles.docAvatarWrap}>
              <View style={styles.docAvatar}>
                <Text style={styles.docAvatarText}>
                  {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
                </Text>
              </View>
              {doc.online && <View style={styles.onlineDot} />}
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
              <Pressable
                style={styles.bookNowBtn}
                onPress={() => router.push('/(patient)/doctor-profile')}
              >
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

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarSmall: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarSmallText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  welcomeText: { fontSize: 12, color: colors.gray400 },
  userName: { fontSize: 20, fontWeight: '800', color: colors.text },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8, width: 8, height: 8,
    borderRadius: 4, backgroundColor: '#ef4444',
  },

  // Search banner
  searchBanner: {
    marginHorizontal: 20, borderRadius: 20, padding: 24,
    marginBottom: 8,
  },
  searchBannerTitle: {
    fontSize: 20, fontWeight: '700', color: colors.white, lineHeight: 28,
    marginBottom: 16,
  },
  searchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, alignSelf: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
  },
  searchBtnText: { fontSize: 13, color: colors.gray400 },

  // Family
  familyRow: { flexDirection: 'row', gap: 20, paddingLeft: 4 },
  familyItem: { alignItems: 'center', gap: 6 },
  familyAvatar: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
  },
  familyAvatarText: { fontSize: 20, fontWeight: '700', color: colors.white },
  familyName: { fontSize: 11, color: colors.gray500, fontWeight: '500' },

  // Section
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: colors.text, marginBottom: 4 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // Specializations
  specRow: { flexDirection: 'row', justifyContent: 'space-between' },
  specItem: { alignItems: 'center', gap: 8, flex: 1 },
  specCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e6f7f5',
  },
  // specEmoji removed — using Ionicons now
  specName: { fontSize: 11, color: colors.gray600, fontWeight: '500' },

  // Doctor card
  doctorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  docAvatarWrap: { position: 'relative' },
  docAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0f2fe',
    alignItems: 'center', justifyContent: 'center',
  },
  docAvatarText: { fontSize: 16, fontWeight: '700', color: '#0284c7' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1, width: 12, height: 12,
    borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: colors.white,
  },
  docInfo: { flex: 1 },
  docName: { fontSize: 16, fontWeight: '700', color: colors.text },
  docSpec: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  docRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, color: colors.gray500, fontWeight: '500' },
  docRight: { alignItems: 'flex-end' },
  feeLabel: { fontSize: 11, color: colors.gray400 },
  feeValue: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 1 },
  bookNowBtn: {
    marginTop: 8, backgroundColor: colors.primary,
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8,
  },
  bookNowText: { fontSize: 12, fontWeight: '700', color: colors.white },
});
