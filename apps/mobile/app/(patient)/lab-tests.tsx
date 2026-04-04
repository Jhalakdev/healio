import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

const categories = [
  'Full Body Checkup', 'Cardiac Profiles', 'Diabetic Profiles', 'Thyroid Test Packages',
  'Vitamin Test Packages', 'Anemia Profiles', 'Fever & Infection Screening', 'Cancer & Tumor Screening',
  'PCOD & PCOS Packages', 'Hair Fall Packages', 'Skin Care Checkup Packages', 'Allergy Packages',
  'STD & Sexual Health', 'Senior Citizen Packages', 'Sports & Fitness', 'Individual Tests',
];

const popularTests = [
  { id: '1', name: 'Basic Full Body Checkup', category: 'Full Body Checkup', mrp: 1500, price: 799, tests: 6, turnaround: '24 hrs' },
  { id: '2', name: 'Complete Blood Count', category: 'Individual Tests', mrp: 500, price: 299, tests: 1, turnaround: '6 hrs' },
  { id: '3', name: 'Thyroid Profile', category: 'Thyroid Test Packages', mrp: 800, price: 449, tests: 3, turnaround: '12 hrs' },
  { id: '4', name: 'Vitamin D + B12', category: 'Vitamin Test Packages', mrp: 1500, price: 799, tests: 2, turnaround: '24 hrs' },
  { id: '5', name: 'Comprehensive Checkup', category: 'Full Body Checkup', mrp: 3500, price: 1999, tests: 10, turnaround: '48 hrs' },
  { id: '6', name: 'Diabetes Screening', category: 'Diabetic Profiles', mrp: 800, price: 449, tests: 3, turnaround: '12 hrs' },
];

const catIcons: Record<string, string> = {
  'Full Body Checkup': 'body-outline',
  'Cardiac Profiles': 'heart-outline',
  'Diabetic Profiles': 'water-outline',
  'Thyroid Test Packages': 'fitness-outline',
  'Vitamin Test Packages': 'sunny-outline',
  'Anemia Profiles': 'bandage-outline',
  'Fever & Infection Screening': 'thermometer-outline',
  'Cancer & Tumor Screening': 'ribbon-outline',
  'PCOD & PCOS Packages': 'female-outline',
  'Hair Fall Packages': 'cut-outline',
  'Skin Care Checkup Packages': 'hand-left-outline',
  'Allergy Packages': 'alert-circle-outline',
  'STD & Sexual Health': 'shield-checkmark-outline',
  'Senior Citizen Packages': 'accessibility-outline',
  'Sports & Fitness': 'barbell-outline',
  'Individual Tests': 'flask-outline',
};

const catColors: Record<string, string> = {
  'Full Body Checkup': '#0d9488',
  'Cardiac Profiles': '#e11d48',
  'Diabetic Profiles': '#3b82f6',
  'Thyroid Test Packages': '#8b5cf6',
  'Vitamin Test Packages': '#f59e0b',
  'Anemia Profiles': '#ef4444',
  'Fever & Infection Screening': '#f97316',
  'Cancer & Tumor Screening': '#dc2626',
  'PCOD & PCOS Packages': '#ec4899',
  'Hair Fall Packages': '#6366f1',
  'Skin Care Checkup Packages': '#14b8a6',
  'Allergy Packages': '#d97706',
  'STD & Sexual Health': '#10b981',
  'Senior Citizen Packages': '#64748b',
  'Sports & Fitness': '#06b6d4',
  'Individual Tests': '#10b981',
};

export default function LabTestsScreen() {
  const [search, setSearch] = useState('');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Health Packages</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tests, packages..."
          placeholderTextColor={colors.gray400}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Ionicons name="home-outline" size={20} color="#10b981" />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Home Sample Collection</Text>
          <Text style={styles.bannerSub}>Free collection at your doorstep</Text>
        </View>
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeText}>FREE</Text>
        </View>
      </View>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Browse by Category</Text>
      <View style={styles.catGrid}>
        {categories.map((cat) => (
          <Pressable key={cat} style={styles.catCard}>
            <View style={[styles.catIcon, { backgroundColor: (catColors[cat] || '#64748b') + '15' }]}>
              <Ionicons name={(catIcons[cat] || 'flask-outline') as any} size={22} color={catColors[cat] || '#64748b'} />
            </View>
            <Text style={styles.catName} numberOfLines={2}>{cat}</Text>
          </Pressable>
        ))}
      </View>

      {/* Popular tests */}
      <Text style={styles.sectionTitle}>Popular Tests</Text>
      {popularTests.map((test) => (
        <Pressable key={test.id} style={styles.testCard}>
          <View style={styles.testInfo}>
            <Text style={styles.testName}>{test.name}</Text>
            <Text style={styles.testMeta}>{test.category} · {test.turnaround} · {test.tests} test{test.tests > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.testRight}>
            <Text style={styles.testMrp}>₹{test.mrp}</Text>
            <Text style={styles.testPrice}>₹{test.price}</Text>
            <Pressable style={styles.addBtn}>
              <Text style={styles.addBtnText}>Book</Text>
            </Pressable>
          </View>
        </Pressable>
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, height: 48, borderRadius: 14,
    backgroundColor: colors.gray100, paddingHorizontal: 16, marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, padding: 16, borderRadius: 16,
    backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', marginBottom: 20,
  },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#166534' },
  bannerSub: { fontSize: 11, color: '#15803d', marginTop: 1 },
  bannerBadge: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bannerBadgeText: { fontSize: 11, fontWeight: '800', color: colors.white },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, paddingHorizontal: 20, marginBottom: 12, marginTop: 8 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  catCard: { width: '23%', alignItems: 'center', marginBottom: 12 },
  catIcon: {
    width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  catName: { fontSize: 10, color: colors.gray600, fontWeight: '500', marginTop: 4, textAlign: 'center' },
  testCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 20, padding: 16, borderRadius: 14,
    backgroundColor: colors.white, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 8,
  },
  testInfo: { flex: 1 },
  testName: { fontSize: 15, fontWeight: '700', color: colors.text },
  testMeta: { fontSize: 11, color: colors.gray400, marginTop: 3 },
  testRight: { alignItems: 'flex-end' },
  testMrp: { fontSize: 12, color: colors.gray400, textDecorationLine: 'line-through' },
  testPrice: { fontSize: 17, fontWeight: '800', color: colors.primary },
  addBtn: {
    marginTop: 6, backgroundColor: colors.primary,
    paddingHorizontal: 18, paddingVertical: 7, borderRadius: 8,
  },
  addBtnText: { fontSize: 12, fontWeight: '700', color: colors.white },
});
