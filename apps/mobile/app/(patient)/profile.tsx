import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { clearTokens } from '../../lib/api';

export default function ProfileTab() {
  const logout = async () => {
    await clearTokens();
    router.replace('/');
  };

  const menuItems = [
    { icon: 'wallet-outline' as const, label: 'Wallet', sub: 'Balance & transactions' },
    { icon: 'document-text-outline' as const, label: 'My Reports', sub: 'Uploaded reports' },
    { icon: 'receipt-outline' as const, label: 'Order History', sub: 'Past bookings & payments' },
    { icon: 'card-outline' as const, label: 'My Plans', sub: 'Active subscription' },
    { icon: 'settings-outline' as const, label: 'Settings', sub: 'App preferences' },
    { icon: 'help-circle-outline' as const, label: 'Help & Support', sub: 'FAQs, contact us' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>RK</Text>
        </View>
        <Text style={styles.name}>Rahul Kumar</Text>
        <Text style={styles.phone}>+91 98765 43210</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <Pressable key={item.label} style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.gray300} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingTop: 70, paddingBottom: spacing['2xl'] },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.white },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  phone: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  menu: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.lg,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: radius.md, backgroundColor: '#e6f7f5',
    alignItems: 'center', justifyContent: 'center',
  },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: fontSize.base, fontWeight: '600', color: colors.text },
  menuSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginTop: spacing['2xl'], marginHorizontal: spacing.xl,
    padding: spacing.lg, borderRadius: radius.lg,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { fontSize: fontSize.base, fontWeight: '600', color: colors.danger },
});
