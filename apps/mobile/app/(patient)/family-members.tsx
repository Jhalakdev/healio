import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

const mockMembers = [
  { id: '1', name: 'Mr. Williamson', relation: 'Self', isChild: false, age: 32, gender: 'Male', bloodGroup: 'B+', isVerified: true },
  { id: '2', name: 'Mrs. Williamson', relation: 'Spouse', isChild: false, age: 29, gender: 'Female', bloodGroup: 'A+', isVerified: true },
  { id: '3', name: 'Chloe W.', relation: 'Child', isChild: true, age: 5, gender: 'Female', bloodGroup: 'B+', isVerified: true },
];

const relationColors: Record<string, string> = {
  Self: '#0d9488',
  Spouse: '#7c3aed',
  Child: '#f59e0b',
  Parent: '#3b82f6',
  Sibling: '#ec4899',
};

export default function FamilyMembersScreen() {
  const [members] = useState(mockMembers);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [isChild, setIsChild] = useState(false);
  const [newAge, setNewAge] = useState('');

  const adultCount = members.filter((m) => !m.isChild && m.relation !== 'Self').length;
  const childCount = members.filter((m) => m.isChild).length;
  const totalSlots = 5;
  const usedSlots = members.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Family Members</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Slots indicator */}
      <View style={styles.slotsCard}>
        <View style={styles.slotsHeader}>
          <Text style={styles.slotsTitle}>Account Members</Text>
          <Text style={styles.slotsCount}>{usedSlots}/{totalSlots} used</Text>
        </View>
        <View style={styles.slotsBar}>
          {Array.from({ length: totalSlots }, (_, i) => (
            <View
              key={i}
              style={[
                styles.slotDot,
                i < usedSlots ? styles.slotDotFilled : styles.slotDotEmpty,
              ]}
            />
          ))}
        </View>
        <View style={styles.slotsRules}>
          <View style={styles.ruleRow}>
            <View style={[styles.ruleDot, { backgroundColor: '#0d9488' }]} />
            <Text style={styles.ruleText}>Adults: {adultCount + 1}/3 max</Text>
          </View>
          <View style={styles.ruleRow}>
            <View style={[styles.ruleDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.ruleText}>Children: {childCount}/3 max</Text>
          </View>
        </View>
      </View>

      {/* Members list */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={[styles.memberAvatar, { backgroundColor: (relationColors[member.relation] || '#94a3b8') + '20' }]}>
              <Text style={[styles.memberAvatarText, { color: relationColors[member.relation] || '#94a3b8' }]}>
                {member.name[0]}
              </Text>
              {member.isChild && (
                <View style={styles.childBadge}>
                  <Ionicons name="happy" size={10} color={colors.white} />
                </View>
              )}
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberMeta}>
                {member.relation} · {member.age} yrs · {member.gender} · {member.bloodGroup}
              </Text>
            </View>
            <View style={styles.memberRight}>
              {member.isVerified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : (
                <View style={[styles.verifiedBadge, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="time" size={14} color="#d97706" />
                  <Text style={[styles.verifiedText, { color: '#d97706' }]}>Pending</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Add member button */}
        {usedSlots < totalSlots && (
          <Pressable style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <View style={styles.addIcon}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.addTitle}>Add Family Member</Text>
              <Text style={styles.addSubtitle}>
                {totalSlots - usedSlots} slot{totalSlots - usedSlots > 1 ? 's' : ''} remaining
              </Text>
            </View>
          </Pressable>
        )}

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            Children under 18 can be added without verification. Members 18+ require phone number verification. Adding a child gets 10% discount on consultations.
          </Text>
        </View>
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <Pressable onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput style={styles.input} placeholder="Enter name" placeholderTextColor={colors.gray400} value={newName} onChangeText={setNewName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Relation *</Text>
              <View style={styles.relationRow}>
                {['Spouse', 'Child', 'Parent', 'Sibling'].map((rel) => (
                  <Pressable
                    key={rel}
                    style={[styles.relationChip, newRelation === rel && styles.relationChipActive]}
                    onPress={() => { setNewRelation(rel); setIsChild(rel === 'Child'); }}
                  >
                    <Text style={[styles.relationChipText, newRelation === rel && styles.relationChipTextActive]}>{rel}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age *</Text>
              <TextInput style={styles.input} placeholder="Age" placeholderTextColor={colors.gray400} keyboardType="numeric" value={newAge} onChangeText={setNewAge} />
            </View>

            {parseInt(newAge) >= 18 && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={18} color="#d97706" />
                <Text style={styles.warningText}>Members 18+ require phone number verification after adding.</Text>
              </View>
            )}

            {isChild && (
              <View style={styles.discountBox}>
                <Ionicons name="pricetag" size={18} color="#10b981" />
                <Text style={styles.discountText}>Adding a child gets 10% discount on flat consultation rate!</Text>
              </View>
            )}

            <Pressable style={styles.submitBtn} onPress={() => { setShowAdd(false); Alert.alert('Success', 'Family member added!'); }}>
              <Text style={styles.submitBtnText}>Add Member</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  slotsCard: {
    marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 18,
    padding: 18, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  slotsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotsTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  slotsCount: { fontSize: 13, fontWeight: '600', color: colors.primary },
  slotsBar: { flexDirection: 'row', gap: 8, marginTop: 12 },
  slotDot: { flex: 1, height: 8, borderRadius: 4 },
  slotDotFilled: { backgroundColor: colors.primary },
  slotDotEmpty: { backgroundColor: '#e2e8f0' },
  slotsRules: { flexDirection: 'row', gap: 20, marginTop: 12 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ruleDot: { width: 8, height: 8, borderRadius: 4 },
  ruleText: { fontSize: 12, color: colors.gray500, fontWeight: '500' },
  memberCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 16,
    padding: 16, marginBottom: 10,
  },
  memberAvatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontSize: 20, fontWeight: '800' },
  childBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9, backgroundColor: '#f59e0b',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white,
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '700', color: colors.text },
  memberMeta: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  memberRight: {},
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  verifiedText: { fontSize: 11, fontWeight: '600', color: '#10b981' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 16,
    padding: 16, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed',
  },
  addIcon: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#e6f7f5',
    alignItems: 'center', justifyContent: 'center',
  },
  addTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  addSubtitle: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  infoCard: {
    flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 16,
    backgroundColor: '#e6f7f5', borderRadius: 14, padding: 14,
  },
  infoText: { flex: 1, fontSize: 12, color: colors.primary, lineHeight: 18 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { height: 48, borderRadius: 12, backgroundColor: '#f1f5f9', paddingHorizontal: 16, fontSize: 15, color: colors.text },
  relationRow: { flexDirection: 'row', gap: 8 },
  relationChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9' },
  relationChipActive: { backgroundColor: colors.primary },
  relationChipText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  relationChipTextActive: { color: colors.white },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef3c7', padding: 12, borderRadius: 12, marginBottom: 16 },
  warningText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },
  discountBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dcfce7', padding: 12, borderRadius: 12, marginBottom: 16 },
  discountText: { flex: 1, fontSize: 12, color: '#166534', lineHeight: 18 },
  submitBtn: { backgroundColor: colors.primary, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
