import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

const catIcons: Record<string, { icon: string; color: string }> = {
  'Full Body Checkup': { icon: 'body-outline', color: '#0d9488' },
  'Cardiac Profiles': { icon: 'heart-outline', color: '#e11d48' },
  'Diabetic Profiles': { icon: 'water-outline', color: '#3b82f6' },
  'Thyroid Test Packages': { icon: 'fitness-outline', color: '#8b5cf6' },
  'Vitamin Test Packages': { icon: 'sunny-outline', color: '#f59e0b' },
  'Anemia Profiles': { icon: 'bandage-outline', color: '#ef4444' },
  'Fever & Infection Screening': { icon: 'thermometer-outline', color: '#f97316' },
  'Cancer & Tumor Screening': { icon: 'ribbon-outline', color: '#dc2626' },
  'PCOD & PCOS Packages': { icon: 'female-outline', color: '#ec4899' },
  'Hair Fall Packages': { icon: 'cut-outline', color: '#6366f1' },
  'Allergy Packages': { icon: 'alert-circle-outline', color: '#d97706' },
  'Individual Tests': { icon: 'flask-outline', color: '#10b981' },
  'Senior Citizen Packages': { icon: 'accessibility-outline', color: '#64748b' },
  'STD & Sexual Health': { icon: 'shield-checkmark-outline', color: '#10b981' },
  'Sports & Fitness': { icon: 'barbell-outline', color: '#06b6d4' },
};

export default function LabTestsScreen() {
  const [categories, setCategories] = useState<string[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([
      api('/lab-tests/categories').then(setCategories).catch(() => []),
      api('/lab-tests/tests').then(setTests).catch(() => []),
      api('/lab-tests/packages').then(setPackages).catch(() => []),
    ]);
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filtered = selectedCat
    ? tests.filter((t: any) => t.category === selectedCat)
    : search
    ? tests.filter((t: any) => t.name.toLowerCase().includes(search.toLowerCase()))
    : packages.length > 0 ? packages : tests.slice(0, 10);

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Health Packages</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.gray400} />
        <TextInput style={styles.searchInput} placeholder="Search tests..." placeholderTextColor={colors.gray400} value={search} onChangeText={(v) => { setSearch(v); setSelectedCat(''); }} />
      </View>

      <View style={styles.banner}>
        <Ionicons name="home-outline" size={20} color="#10b981" />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Home Sample Collection</Text>
          <Text style={styles.bannerSub}>Free collection at your doorstep</Text>
        </View>
        <View style={styles.bannerBadge}><Text style={styles.bannerBadgeText}>FREE</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Browse by Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
        {categories.map((cat) => {
          const mapped = catIcons[cat] || { icon: 'flask-outline', color: '#64748b' };
          const sel = selectedCat === cat;
          return (
            <Pressable key={cat} style={[styles.catChip, sel && { backgroundColor: mapped.color + '20', borderColor: mapped.color }]}
              onPress={() => setSelectedCat(sel ? '' : cat)}>
              <Ionicons name={mapped.icon as any} size={16} color={mapped.color} />
              <Text style={[styles.catChipText, sel && { color: mapped.color }]} numberOfLines={1}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>{selectedCat || (search ? 'Search Results' : 'Popular Packages')}</Text>
      {filtered.map((test: any) => (
        <Pressable key={test.id} style={styles.testCard}>
          <View style={styles.testInfo}>
            <Text style={styles.testName}>{test.name}</Text>
            <Text style={styles.testMeta}>
              {test.turnaround} · {test.fasting ? 'Fasting required' : 'No fasting'}
              {test.isPackage && test.testsIncluded?.length > 0 && ` · ${test.testsIncluded.length} tests`}
            </Text>
          </View>
          <View style={styles.testRight}>
            <Text style={styles.testMrp}>₹{Number(test.mrp).toLocaleString('en-IN')}</Text>
            <Text style={styles.testPrice}>₹{Number(test.sellingPrice).toLocaleString('en-IN')}</Text>
            <Pressable style={styles.addBtn} onPress={() => {
              Alert.alert('Book Lab Test', `Book ${test.name} for ₹${Number(test.sellingPrice).toLocaleString('en-IN')}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Book Now', onPress: async () => {
                  try {
                    await api('/lab-tests/order', { method: 'POST', body: JSON.stringify({ testIds: [test.id], collectionAddress: 'Home' }) });
                    Alert.alert('Success', 'Lab test booked! You will receive collection details soon.');
                  } catch (err: any) { Alert.alert('Error', err.message || 'Failed to book'); }
                }},
              ]);
            }}><Text style={styles.addBtnText}>Book</Text></Pressable>
          </View>
        </Pressable>
      ))}
      {filtered.length === 0 && <Text style={{ textAlign: 'center', color: colors.gray400, padding: 30 }}>No tests found</Text>}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, height: 48, borderRadius: 14, backgroundColor: colors.gray100, paddingHorizontal: 16, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, padding: 16, borderRadius: 16, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', marginBottom: 20 },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#166534' },
  bannerSub: { fontSize: 11, color: '#15803d', marginTop: 1 },
  bannerBadge: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bannerBadgeText: { fontSize: 11, fontWeight: '800', color: colors.white },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, paddingHorizontal: 20, marginBottom: 12, marginTop: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.gray100, marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  catChipText: { fontSize: 12, fontWeight: '600', color: colors.gray600 },
  testCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, padding: 16, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 8 },
  testInfo: { flex: 1, paddingRight: 12 },
  testName: { fontSize: 15, fontWeight: '700', color: colors.text },
  testMeta: { fontSize: 11, color: colors.gray400, marginTop: 3 },
  testRight: { alignItems: 'flex-end' },
  testMrp: { fontSize: 12, color: colors.gray400, textDecorationLine: 'line-through' },
  testPrice: { fontSize: 17, fontWeight: '800', color: colors.primary },
  addBtn: { marginTop: 6, backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 7, borderRadius: 8 },
  addBtnText: { fontSize: 12, fontWeight: '700', color: colors.white },
});
