import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { clearTokens } from '../../lib/api';

const menuItems = [
  { icon: 'settings-outline' as const, label: 'General Settings' },
  { icon: 'card-outline' as const, label: 'Payments History' },
  { icon: 'help-circle-outline' as const, label: 'Frequently Asked Question' },
  { icon: 'heart-outline' as const, label: 'Favourite Doctors' },
  { icon: 'document-text-outline' as const, label: 'Test Reports' },
  { icon: 'document-outline' as const, label: 'Terms & Conditions' },
];

export default function MoreTab() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.headerTitle}>More</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="search-outline" size={20} color={colors.text} />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <Pressable key={item.label} style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.gray300} />
          </Pressable>
        ))}

        <Pressable
          style={styles.logoutBtn}
          onPress={() => { clearTokens(); router.replace('/'); }}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
  },
  welcomeText: { fontSize: 12, color: colors.gray400 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8, marginTop: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 20, paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  menuIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0fdf4',
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 32, marginHorizontal: 20,
    paddingVertical: 16, borderRadius: 14,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
});
