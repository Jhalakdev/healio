import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

export default function FamilyMembersScreen() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await api('/users/me/family').then(setMembers).catch(() => []);
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

  const maxSlots = 5;
  const adultCount = members.filter(m => !m.isChild).length;
  const childCount = members.filter(m => m.isChild).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Family Members</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Slots */}
      <View style={styles.slotsCard}>
        <Text style={styles.slotsTitle}>Members: {members.length}/{maxSlots}</Text>
        <View style={styles.slotsBar}>
          {Array.from({ length: maxSlots }, (_, i) => (
            <View key={i} style={[styles.slotDot, i < members.length ? styles.slotFilled : styles.slotEmpty]} />
          ))}
        </View>
        <Text style={styles.ruleText}>Adults: {adultCount}/3 · Children: {childCount}/3</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />}>
        {members.map((m: any) => {
          const age = m.dob ? Math.floor((Date.now() - new Date(m.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
          return (
            <View key={m.id} style={styles.memberCard}>
              <View style={[styles.memberAvatar, { backgroundColor: m.isChild ? '#fef3c7' : '#e0f2fe' }]}>
                <Text style={{ fontWeight: '800', fontSize: 18, color: m.isChild ? '#d97706' : '#0284c7' }}>{m.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{m.name}</Text>
                <Text style={styles.memberMeta}>
                  {m.relation} · {m.isChild ? 'Child' : 'Adult'}{age ? ` · ${age} yrs` : ''}{m.bloodGroup ? ` · ${m.bloodGroup}` : ''}
                </Text>
              </View>
              <View style={[styles.verifiedBadge, { backgroundColor: m.isVerified ? '#dcfce7' : '#fef3c7' }]}>
                <Ionicons name={m.isVerified ? 'checkmark-circle' : 'time'} size={14} color={m.isVerified ? '#10b981' : '#d97706'} />
                <Text style={{ fontSize: 10, fontWeight: '600', color: m.isVerified ? '#10b981' : '#d97706' }}>{m.isVerified ? 'Verified' : 'Pending'}</Text>
              </View>
            </View>
          );
        })}

        {members.length === 0 && (
          <Text style={{ textAlign: 'center', color: colors.gray400, padding: 30 }}>No family members added yet</Text>
        )}

        {members.length < maxSlots && (
          <Pressable style={styles.addBtn}>
            <View style={styles.addIcon}><Ionicons name="person-add-outline" size={22} color={colors.primary} /></View>
            <View>
              <Text style={styles.addTitle}>Add Family Member</Text>
              <Text style={styles.addSubtitle}>{maxSlots - members.length} slot{maxSlots - members.length > 1 ? 's' : ''} remaining</Text>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  slotsCard: { marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 18, padding: 18, marginBottom: 16 },
  slotsTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  slotsBar: { flexDirection: 'row', gap: 8, marginTop: 12 },
  slotDot: { flex: 1, height: 8, borderRadius: 4 },
  slotFilled: { backgroundColor: colors.primary },
  slotEmpty: { backgroundColor: '#e2e8f0' },
  ruleText: { fontSize: 12, color: colors.gray500, marginTop: 8 },
  memberCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  memberAvatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  memberName: { fontSize: 15, fontWeight: '700', color: colors.text },
  memberMeta: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  addIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e6f7f5', alignItems: 'center', justifyContent: 'center' },
  addTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  addSubtitle: { fontSize: 12, color: colors.gray400, marginTop: 2 },
});
