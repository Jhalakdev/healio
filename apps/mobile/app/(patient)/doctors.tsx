import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

const iconMap: Record<string, { icon: string; color: string }> = {
  droplets: { icon: 'water-outline', color: '#3b82f6' },
  syringe: { icon: 'medical-outline', color: '#8b5cf6' },
  bone: { icon: 'body-outline', color: '#f59e0b' },
  eye: { icon: 'eye-outline', color: '#06b6d4' },
  baby: { icon: 'happy-outline', color: '#ec4899' },
  ribbon: { icon: 'ribbon-outline', color: '#ef4444' },
  hand: { icon: 'hand-left-outline', color: '#f97316' },
  'flask-conical': { icon: 'flask-outline', color: '#10b981' },
  brain: { icon: 'brain-outline', color: '#7c3aed' },
  hospital: { icon: 'medkit-outline', color: '#dc2626' },
  activity: { icon: 'fitness-outline', color: '#14b8a6' },
  'scan-line': { icon: 'scan-outline', color: '#6366f1' },
  heart: { icon: 'heart-outline', color: '#e11d48' },
  accessibility: { icon: 'accessibility-outline', color: '#0d9488' },
  stethoscope: { icon: 'medkit-outline', color: '#0d9488' },
  ear: { icon: 'ear-outline', color: '#d97706' },
  'flower-2': { icon: 'flower-outline', color: '#ec4899' },
};

export default function DoctorsTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/categories').then(setCategories).catch(() => []),
      api('/doctors').then(setDoctors).catch(() => []),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCat) params.set('categoryId', selectedCat);
    const q = params.toString() ? `?${params.toString()}` : '';
    api(`/doctors${q}`).then(setDoctors).catch(() => {});
  }, [search, selectedCat]);

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.shareBtn}><Ionicons name="share-outline" size={20} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Find Your Doctor</Text>
        <Pressable style={styles.shareBtn}><Ionicons name="options-outline" size={20} color={colors.text} /></Pressable>
      </View>

      {/* Specialization Grid from API */}
      <View style={styles.specGrid}>
        {categories.map((s: any) => {
          const mapped = iconMap[s.icon] || { icon: 'medkit-outline', color: '#64748b' };
          const selected = selectedCat === s.id;
          return (
            <Pressable key={s.id} style={styles.specItem} onPress={() => setSelectedCat(selected ? '' : s.id)}>
              <View style={[styles.specCircle, { backgroundColor: mapped.color + '15' }, selected && { borderColor: mapped.color, borderWidth: 2 }]}>
                <Ionicons name={mapped.icon as any} size={26} color={mapped.color} />
              </View>
              <Text style={[styles.specName, selected && { color: mapped.color, fontWeight: '700' }]}>{s.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.gray400} />
        <TextInput style={styles.searchInput} placeholder="Search doctor name..." placeholderTextColor={colors.gray400} value={search} onChangeText={setSearch} />
        {search ? <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.gray400} /></Pressable> : null}
      </View>

      {/* Doctor List from API */}
      <View style={styles.doctorsList}>
        <Text style={styles.sectionTitle}>{doctors.length} Doctor{doctors.length !== 1 ? 's' : ''} found</Text>
        {doctors.map((doc: any) => (
          <Pressable key={doc.id} style={styles.doctorCard} onPress={() => router.push('/(patient)/doctor-profile')}>
            <View style={{ position: 'relative' }}>
              <View style={styles.docAvatar}>
                <Text style={styles.docAvatarText}>{doc.name?.split(' ').slice(1).map((n: string) => n[0]).join('').slice(0, 2) || 'D'}</Text>
              </View>
              {doc.isOnline && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{doc.name}</Text>
              <Text style={styles.docSpec}>{doc.specialization || doc.categories?.[0]?.category?.name || 'General'}</Text>
              <View style={styles.docRating}>
                <Ionicons name="star" size={13} color="#f59e0b" />
                <Text style={styles.ratingText}>{doc._count?.reviews || 0} reviews · {doc.experience || 0} yrs</Text>
              </View>
            </View>
            <Pressable style={styles.bookNowBtn} onPress={() => router.push('/(patient)/doctor-profile')}>
              <Text style={styles.bookNowText}>Book Now</Text>
            </Pressable>
          </Pressable>
        ))}
        {doctors.length === 0 && <Text style={{ textAlign: 'center', color: colors.gray400, padding: 30 }}>No doctors found</Text>}
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  shareBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 4, justifyContent: 'space-between' },
  specItem: { width: '23%', alignItems: 'center', marginBottom: 16 },
  specCircle: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  specName: { fontSize: 10, color: colors.gray600, fontWeight: '500', marginTop: 4, textAlign: 'center' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, height: 48, borderRadius: 14,
    backgroundColor: colors.gray100, paddingHorizontal: 16, marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  doctorsList: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.gray500, marginBottom: 8 },
  doctorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  docAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
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
  bookNowBtn: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10 },
  bookNowText: { fontSize: 12, fontWeight: '700', color: colors.white },
});
