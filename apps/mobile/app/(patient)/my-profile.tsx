import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

const familyMembers = [
  { name: 'Chloe K.', color: '#FFD700' },
  { name: 'Colter E.', color: '#FF6B6B' },
  { name: 'Waylan A.', color: '#4ECDC4' },
];

const statsItems = [
  { icon: 'resize-outline' as const, label: 'Height', value: '5.8 in', color: '#3b82f6' },
  { icon: 'barbell-outline' as const, label: 'Weight', value: '5.8 in', color: '#f59e0b' },
  { icon: 'calendar-outline' as const, label: 'Age', value: '25', color: '#10b981' },
  { icon: 'water-outline' as const, label: 'Blood', value: 'B+', color: '#ef4444' },
];

export default function MyProfileScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>EM</Text>
          </View>
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={12} color={colors.white} />
          </View>
        </View>
        <Text style={styles.name}>Dr. Eion Morgan</Text>
        <View style={styles.premiumBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#f59e0b" />
          <Text style={styles.premiumText}>Premium Member</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {statsItems.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* About Me */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.aboutText}>
          Eion Morgan is a dedicated pediatrician with over 15 years of experience in caring for children's health. She is passionate about ensuring the well-being of your little ones and believes in a holistic approach.
        </Text>
      </View>

      {/* Family Member */}
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
            <View style={styles.addAvatar}>
              <Ionicons name="add" size={24} color={colors.gray400} />
            </View>
            <Text style={styles.familyName}>Add New</Text>
          </Pressable>
        </View>
      </View>

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
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  avatarSection: { alignItems: 'center', marginTop: 12 },
  avatarRing: { position: 'relative' },
  avatar: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#f59e0b',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#10b981',
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: colors.white },
  editBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white,
  },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 14 },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, marginTop: 8,
  },
  premiumText: { fontSize: 12, fontWeight: '600', color: '#d97706' },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: 20, marginTop: 24, gap: 10,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, backgroundColor: '#fafafa', borderRadius: 14 },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 15, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 11, color: colors.gray400 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 10 },
  aboutText: { fontSize: 14, color: colors.gray500, lineHeight: 22 },
  familyRow: { flexDirection: 'row', gap: 20 },
  familyItem: { alignItems: 'center', gap: 6 },
  familyAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  familyAvatarText: { fontSize: 20, fontWeight: '700', color: colors.white },
  addAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gray100,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.gray200, borderStyle: 'dashed',
  },
  familyName: { fontSize: 11, color: colors.gray500, fontWeight: '500' },
});
