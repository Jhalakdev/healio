import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

const relationOptions = [
  { value: 'spouse', label: 'Spouse / Partner', icon: 'heart-outline' as const },
  { value: 'child', label: 'Child (Under 18)', icon: 'happy-outline' as const },
  { value: 'parent', label: 'Parent', icon: 'people-outline' as const },
  { value: 'sibling', label: 'Sibling', icon: 'person-outline' as const },
];

const relationColors: Record<string, string> = {
  self: '#0d9488', spouse: '#7c3aed', child: '#f59e0b', parent: '#3b82f6', sibling: '#ec4899',
};

export default function SwitchProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedRelation, setSelectedRelation] = useState('');
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api('/users/me');
      setProfile(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const familyMembers = profile?.familyMembers || [];
  const maxSlots = 5;
  const used = familyMembers.length + 1; // +1 for self

  const addMember = async () => {
    if (!newName || !newDob) return Alert.alert('Error', 'Name and date of birth are required');
    setSubmitting(true);
    try {
      await api('/users/me/family', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          relation: selectedRelation,
          dob: newDob,
          isChild: selectedRelation === 'child',
          phoneNumber: newPhone || undefined,
        }),
      });
      setShowAdd(false);
      setNewName(''); setNewDob(''); setNewPhone(''); setStep(1); setSelectedRelation('');
      await load();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add member');
    }
    setSubmitting(false);
  };

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const age = (dob: string) => dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Switch Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>
        Select a profile to view their reports, bookings, and prescriptions
      </Text>

      <View style={styles.currentBadge}>
        <Ionicons name="person-circle" size={16} color={colors.primary} />
        <Text style={styles.currentText}>Currently viewing: <Text style={{ fontWeight: '700' }}>{profile?.name || 'You'}</Text></Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Self profile */}
        <Pressable style={[styles.profileCard, styles.profileCardActive]}>
          <View style={[styles.avatar, { backgroundColor: relationColors.self + '20' }]}>
            <Text style={[styles.avatarText, { color: relationColors.self }]}>{(profile?.name || 'U')[0]}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name || 'You'}</Text>
            <Text style={styles.profileMeta}>Self{age(profile?.dob) ? ` · ${age(profile.dob)} yrs` : ''}</Text>
          </View>
          <View style={styles.activeBadge}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        </Pressable>

        {/* Family members */}
        {familyMembers.map((m: any) => (
          <Pressable key={m.id} style={styles.profileCard}>
            <View style={[styles.avatar, { backgroundColor: (relationColors[m.relation] || '#94a3b8') + '20' }]}>
              <Text style={[styles.avatarText, { color: relationColors[m.relation] || '#94a3b8' }]}>{m.name[0]}</Text>
              {m.isChild && <View style={styles.childTag}><Ionicons name="happy" size={8} color={colors.white} /></View>}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{m.name}</Text>
              <Text style={styles.profileMeta}>{m.relation}{age(m.dob) ? ` · ${age(m.dob)} yrs` : ''}</Text>
            </View>
            <Pressable style={styles.switchBtn}>
              <Text style={styles.switchBtnText}>Switch</Text>
            </Pressable>
          </Pressable>
        ))}

        {/* Add new */}
        {used < maxSlots && (
          <Pressable style={styles.addCard} onPress={() => { setShowAdd(true); setStep(1); }}>
            <View style={styles.addIcon}><Ionicons name="person-add-outline" size={22} color={colors.primary} /></View>
            <View style={styles.addInfo}>
              <Text style={styles.addTitle}>Add Family Member</Text>
              <Text style={styles.addSubtitle}>{maxSlots - used} slot{maxSlots - used > 1 ? 's' : ''} remaining</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray300} />
          </Pressable>
        )}

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>How Profile Switching Works</Text>
          {[
            'Each profile has independent reports, prescriptions & bookings',
            'Children are linked to the account creator\'s profile',
            'Members 18+ need phone OTP verification to add',
            'Max 3 adults + 3 children per account',
          ].map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <View style={styles.ruleDot} />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Member Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {step === 1 ? 'Who are you adding?' : 'Enter Details'}
              </Text>
              <Pressable onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {step === 1 && (
              <View style={styles.relationGrid}>
                {relationOptions.map((rel) => (
                  <Pressable
                    key={rel.value}
                    style={[styles.relationCard, selectedRelation === rel.value && styles.relationCardActive]}
                    onPress={() => { setSelectedRelation(rel.value); setStep(2); }}
                  >
                    <Ionicons name={rel.icon} size={28} color={selectedRelation === rel.value ? colors.white : colors.primary} />
                    <Text style={[styles.relationLabel, selectedRelation === rel.value && styles.relationLabelActive]}>{rel.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {step === 2 && (
              <View style={styles.formStep}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput style={styles.input} placeholder="Enter name" placeholderTextColor={colors.gray400} value={newName} onChangeText={setNewName} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Date of Birth * (YYYY-MM-DD)</Text>
                  <TextInput style={styles.input} placeholder="1995-06-15" placeholderTextColor={colors.gray400} value={newDob} onChangeText={setNewDob} />
                </View>

                {selectedRelation !== 'child' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number (for 18+ verification)</Text>
                    <TextInput style={styles.input} placeholder="+91 98765 43210" placeholderTextColor={colors.gray400} keyboardType="phone-pad" value={newPhone} onChangeText={setNewPhone} />
                  </View>
                )}

                {selectedRelation === 'child' && (
                  <View style={styles.childInfoBox}>
                    <Ionicons name="happy" size={18} color="#f59e0b" />
                    <Text style={styles.childInfoText}>Children don't need phone verification and get 10% discount on consultations!</Text>
                  </View>
                )}

                <Pressable style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={addMember} disabled={submitting}>
                  {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitBtnText}>Add Member</Text>}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.gray500, paddingHorizontal: 20, marginBottom: 12, lineHeight: 20 },
  currentBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, backgroundColor: '#e6f7f5', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginBottom: 16 },
  currentText: { fontSize: 13, color: colors.primary },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  profileCardActive: { borderColor: colors.primary, backgroundColor: '#f0fdfa' },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  childTag: { position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 15, fontWeight: '700', color: colors.text },
  profileMeta: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activeText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  switchBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.gray100 },
  switchBtnText: { fontSize: 13, fontWeight: '600', color: colors.gray600 },
  addCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  addIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e6f7f5', alignItems: 'center', justifyContent: 'center' },
  addInfo: { flex: 1 },
  addTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  addSubtitle: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  rulesCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: colors.white, borderRadius: 16, padding: 18, marginBottom: 30 },
  rulesTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  ruleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 5 },
  ruleText: { flex: 1, fontSize: 13, color: colors.gray500, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  relationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  relationCard: { width: '47%', padding: 20, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: 'transparent' },
  relationCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  relationLabel: { fontSize: 13, fontWeight: '600', color: colors.text, textAlign: 'center' },
  relationLabelActive: { color: colors.white },
  formStep: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  input: { height: 48, borderRadius: 12, backgroundColor: '#f1f5f9', paddingHorizontal: 16, fontSize: 15, color: colors.text },
  childInfoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef3c7', padding: 12, borderRadius: 12 },
  childInfoText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },
  submitBtn: { backgroundColor: colors.primary, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
