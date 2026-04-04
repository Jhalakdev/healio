"use client";

import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { api, getToken } from '../../lib/api';

export default function PatientHome() {
  const [user, setUser] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docs, cats, plansData] = await Promise.all([
        api('/doctors').catch(() => []),
        api('/categories').catch(() => []),
        api('/plans').catch(() => []),
      ]);
      setDoctors(docs || []);
      setCategories((cats || []).slice(0, 4));
      setPlans((plansData || []).slice(0, 3));

      // Try to get user profile if logged in
      const token = getToken();
      if (token) {
        try { setUser(await api('/users/me')); } catch {}
      }
    } catch {}
    setLoading(false);
  };

  const iconMap: Record<string, string> = {
    droplets: 'water-outline', syringe: 'medical-outline', bone: 'body-outline',
    eye: 'eye-outline', baby: 'happy-outline', ribbon: 'ribbon-outline',
    hand: 'hand-left-outline', 'flask-conical': 'flask-outline', brain: 'brain-outline',
    hospital: 'medkit-outline', activity: 'fitness-outline', 'scan-line': 'scan-outline',
    heart: 'heart-outline', accessibility: 'accessibility-outline', stethoscope: 'medkit-outline',
    ear: 'ear-outline', 'flower-2': 'flower-outline',
  };

  const iconColor: Record<string, string> = {
    droplets: '#3b82f6', heart: '#e11d48', bone: '#f59e0b', 'flask-conical': '#10b981',
    brain: '#7c3aed', stethoscope: '#0d9488', eye: '#06b6d4', baby: '#ec4899',
  };

  if (loading) {
    return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{(user?.name || 'U')[0]}</Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} onPress={() => router.push('/(patient)/notifications')}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Search Banner */}
      <LinearGradient colors={['#0d9488', '#10b981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.searchBanner}>
        <Text style={styles.searchBannerTitle}>Looking for{'\n'}desired doctor?</Text>
        <Pressable style={styles.searchBtn} onPress={() => router.push('/(patient)/doctors')}>
          <Ionicons name="search" size={14} color={colors.primary} />
          <Text style={styles.searchBtnText}>Search for...</Text>
        </Pressable>
      </LinearGradient>

      {/* Specializations from API */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Find your doctor</Text>
          <Pressable onPress={() => router.push('/(patient)/doctors')}>
            <Text style={styles.seeAll}>See All &gt;</Text>
          </Pressable>
        </View>
        <View style={styles.specRow}>
          {categories.map((s: any) => (
            <Pressable key={s.id} style={styles.specItem} onPress={() => router.push('/(patient)/doctors')}>
              <View style={[styles.specCircle, { backgroundColor: (iconColor[s.icon] || '#0d9488') + '15' }]}>
                <Ionicons name={(iconMap[s.icon] || 'medkit-outline') as any} size={26} color={iconColor[s.icon] || '#0d9488'} />
              </View>
              <Text style={styles.specName}>{s.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Lab Tests quick link */}
      <Pressable style={styles.labBanner} onPress={() => router.push('/(patient)/lab-tests')}>
        <View style={styles.labIcon}>
          <Ionicons name="flask" size={22} color="#7c3aed" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.labTitle}>Book Lab Test</Text>
          <Text style={styles.labSub}>Home collection · Reports in 24hrs</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
      </Pressable>

      {/* Online Doctors from API */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Doctors</Text>
          <Pressable onPress={() => router.push('/(patient)/doctors')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {doctors.length > 0 ? doctors.map((doc: any) => (
          <Pressable key={doc.id} style={styles.doctorCard} onPress={() => router.push('/(patient)/doctor-profile')}>
            <View style={styles.docAvatarWrap}>
              <View style={styles.docAvatar}>
                <Text style={styles.docAvatarText}>
                  {doc.name?.split(' ').slice(1).map((n: string) => n[0]).join('').slice(0, 2) || 'D'}
                </Text>
              </View>
              {doc.isOnline && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{doc.name}</Text>
              <Text style={styles.docSpec}>{doc.specialization || 'General'}</Text>
              <View style={styles.docRating}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.ratingText}>
                  {doc._count?.reviews || 0} reviews · {doc.experience || 0} yrs
                </Text>
              </View>
            </View>
            <Pressable style={styles.bookNowBtn} onPress={() => router.push('/(patient)/doctor-profile')}>
              <Text style={styles.bookNowText}>Book Now</Text>
            </Pressable>
          </Pressable>
        )) : (
          <Text style={{ textAlign: 'center', color: colors.gray400, padding: 20 }}>No doctors available yet</Text>
        )}
      </View>

      {/* Plans from API */}
      {plans.length > 0 && (
        <View style={[styles.section, { marginBottom: 30 }]}>
          <Text style={styles.sectionTitle}>Plans</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {plans.map((plan: any, i: number) => (
              <LinearGradient
                key={plan.id}
                colors={i === 0 ? ['#0d9488', '#059669'] : i === 1 ? ['#7c3aed', '#6d28d9'] : ['#ea580c', '#dc2626']}
                style={styles.planCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>₹{Number(plan.price).toLocaleString('en-IN')}</Text>
                <Text style={styles.planConsults}>{plan.consultations} Consultation{plan.consultations > 1 ? 's' : ''}</Text>
                <Pressable style={styles.planBtn} onPress={() => router.push('/(patient)/plans')}>
                  <Text style={styles.planBtnText}>View Plans</Text>
                </Pressable>
              </LinearGradient>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  searchBanner: { marginHorizontal: 20, borderRadius: 20, padding: 24, marginBottom: 8 },
  searchBannerTitle: { fontSize: 20, fontWeight: '700', color: colors.white, lineHeight: 28, marginBottom: 16 },
  searchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, alignSelf: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
  },
  searchBtnText: { fontSize: 13, color: colors.gray400 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: colors.text, marginBottom: 4 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  specRow: { flexDirection: 'row', justifyContent: 'space-between' },
  specItem: { alignItems: 'center', gap: 8, flex: 1 },
  specCircle: {
    width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e6f7f5',
  },
  specName: { fontSize: 11, color: colors.gray600, fontWeight: '500' },
  labBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 16,
    backgroundColor: '#f5f3ff', borderWidth: 1, borderColor: '#e9e5ff',
  },
  labIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#ede9fe',
    alignItems: 'center', justifyContent: 'center',
  },
  labTitle: { fontSize: 15, fontWeight: '700', color: '#5b21b6' },
  labSub: { fontSize: 11, color: '#7c3aed', marginTop: 2 },
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
    position: 'absolute', bottom: 1, right: 1, width: 14, height: 14,
    borderRadius: 7, backgroundColor: '#10b981', borderWidth: 2, borderColor: colors.white,
  },
  docInfo: { flex: 1 },
  docName: { fontSize: 16, fontWeight: '700', color: colors.text },
  docSpec: { fontSize: 13, color: colors.gray500, marginTop: 2 },
  docRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 13, color: colors.gray500, fontWeight: '500' },
  bookNowBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10,
  },
  bookNowText: { fontSize: 12, fontWeight: '700', color: colors.white },
  planCard: { width: 160, borderRadius: 20, padding: 20, marginRight: 12 },
  planName: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  planPrice: { fontSize: 24, fontWeight: '800', color: colors.white, marginTop: 4 },
  planConsults: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  planBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8,
    borderRadius: 10, alignItems: 'center', marginTop: 12,
  },
  planBtnText: { fontSize: 12, fontWeight: '700', color: colors.white },
});
