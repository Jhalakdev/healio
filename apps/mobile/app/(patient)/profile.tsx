import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import { colors } from '../../lib/theme';
import { clearTokens, api } from '../../lib/api';

const menuItems = [
  { icon: 'person-circle-outline' as const, label: 'My Profile', route: '/(patient)/my-profile' },
  { icon: 'wallet-outline' as const, label: 'Payments History', route: '/(patient)/wallet' },
  { icon: 'calendar-outline' as const, label: 'Booking History', route: '/(patient)/appointments' },
  { icon: 'people-outline' as const, label: 'Family Members', route: '/(patient)/family-members' },
  { icon: 'heart-outline' as const, label: 'Favourite Doctors', route: '/(patient)/doctors' },
  { icon: 'flask-outline' as const, label: 'Test Reports', route: '/(patient)/lab-tests' },
  { icon: 'pricetags-outline' as const, label: 'Plans & Pricing', route: '/(patient)/plans' },
  { icon: 'help-circle-outline' as const, label: 'Frequently Asked Questions', route: '/(patient)/faq' },
  { icon: 'document-outline' as const, label: 'Terms & Conditions', route: '/(patient)/content-page?slug=terms' },
  { icon: 'shield-checkmark-outline' as const, label: 'Privacy Policy', route: '/(patient)/content-page?slug=privacy' },
  { icon: 'information-circle-outline' as const, label: 'About Us', route: '/(patient)/content-page?slug=about' },
];

export default function MoreTab() {
  const [name, setName] = useState('');

  useEffect(() => {
    api('/users/me').then((p: any) => setName(p?.name || '')).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.headerTitle}>{name || 'More'}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} onPress={() => router.push('/(patient)/notifications')}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
          >
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

        <View style={styles.branding}>
          <Text style={styles.brandingText}>Developed by</Text>
          <Pressable onPress={() => Linking.openURL('https://webaccuracy.com')}>
            <Text style={styles.brandingLink}>@webaccuracy</Text>
          </Pressable>
          <Text style={styles.brandingVenture}>BlinkCure — a venture of Web Accuracy Pvt. Ltd.</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
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
  branding: { alignItems: 'center', marginTop: 40, marginBottom: 30, gap: 4 },
  brandingText: { fontSize: 11, color: colors.gray400 },
  brandingLink: { fontSize: 14, fontWeight: '700', color: colors.primary },
  brandingVenture: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  versionText: { fontSize: 10, color: colors.gray300, marginTop: 8 },
});
