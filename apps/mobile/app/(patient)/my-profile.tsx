import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

export default function MyProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await api('/users/me').then(setProfile).catch(() => {});
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const age = profile?.dob ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(profile?.name || 'U')[0]}</Text></View>
        <Text style={styles.name}>{profile?.name || 'Patient'}</Text>
        <Text style={styles.phone}>{profile?.user?.phone || profile?.user?.email || ''}</Text>
        <Pressable style={styles.editBtn} onPress={() => router.push('/(patient)/edit-profile')}>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        {[
          { icon: 'resize-outline' as const, label: 'Height', value: profile?.height || 'N/A', color: '#3b82f6' },
          { icon: 'barbell-outline' as const, label: 'Weight', value: profile?.weight || 'N/A', color: '#f59e0b' },
          { icon: 'calendar-outline' as const, label: 'Age', value: age ? `${age}` : 'N/A', color: '#10b981' },
          { icon: 'water-outline' as const, label: 'Blood', value: profile?.bloodGroup || 'N/A', color: '#ef4444' },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Family Members from API */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Family Members</Text>
          <Pressable onPress={() => router.push('/(patient)/family-members')}><Text style={styles.seeAll}>Manage</Text></Pressable>
        </View>
        <View style={styles.familyRow}>
          {(profile?.familyMembers || []).map((m: any) => (
            <View key={m.id} style={styles.familyItem}>
              <View style={[styles.familyAvatar, { backgroundColor: m.isChild ? '#fef3c7' : '#e0f2fe' }]}>
                <Text style={{ fontWeight: '700', color: m.isChild ? '#d97706' : '#0284c7' }}>{m.name[0]}</Text>
              </View>
              <Text style={styles.familyName}>{m.name.split(' ')[0]}</Text>
            </View>
          ))}
          <Pressable style={styles.familyItem} onPress={() => router.push('/(patient)/family-members')}>
            <View style={styles.addAvatar}><Ionicons name="add" size={24} color={colors.gray400} /></View>
            <Text style={styles.familyName}>Add</Text>
          </Pressable>
        </View>
      </View>

      {/* Active Plan */}
      {profile?.ownPlan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Plan</Text>
          <View style={styles.planCard}>
            <Text style={styles.planName}>{profile.ownPlan.plan?.name}</Text>
            <Text style={styles.planInfo}>{profile.ownPlan.consultationsRemaining} consultations remaining · Expires {new Date(profile.ownPlan.expiresAt).toLocaleDateString()}</Text>
          </View>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  avatarSection: { alignItems: 'center', marginTop: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: '800', color: colors.white },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 14 },
  phone: { fontSize: 14, color: colors.gray500, marginTop: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e6f7f5' },
  editBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 24, gap: 10 },
  statCard: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, backgroundColor: '#fafafa', borderRadius: 14 },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 15, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 11, color: colors.gray400 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  familyRow: { flexDirection: 'row', gap: 20 },
  familyItem: { alignItems: 'center', gap: 6 },
  familyAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  addAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.gray200, borderStyle: 'dashed' },
  familyName: { fontSize: 11, color: colors.gray500 },
  planCard: { padding: 16, borderRadius: 14, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  planName: { fontSize: 15, fontWeight: '700', color: '#166534' },
  planInfo: { fontSize: 12, color: '#15803d', marginTop: 4 },
});
