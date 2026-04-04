import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

const notifications = [
  { id: '1', title: 'Appointment Update', body: 'Eion Morgan is a dedicated pediatrician with over 15 years...', time: 'Just Now', color: '#3b82f6', icon: 'calendar' as const },
  { id: '2', title: 'Credit Card Connected', body: 'Eion Morgan is a dedicated pediatrician with over 15 years...', time: 'Just Now', color: '#10b981', icon: 'card' as const },
  { id: '3', title: 'New Services Available', body: 'Eion Morgan is a dedicated pediatrician with over 15 years...', time: 'Just Now', color: '#8b5cf6', icon: 'medical' as const },
  { id: '4', title: 'Rescheduled', body: 'Eion Morgan is a dedicated pediatrician with over 15 years...', time: 'Just Now', color: '#f59e0b', icon: 'time' as const },
  { id: '5', title: 'Appointment Update', body: 'Eion Morgan is a dedicated pediatrician with over 15 years...', time: 'Just Now', color: '#ef4444', icon: 'calendar' as const },
  { id: '6', title: 'New Service Available', body: 'Eion Morgan is a dedicated pediatrician with over 15 years...', time: 'Just Now', color: '#0d9488', icon: 'medical' as const },
  { id: '7', title: 'Appointment Success', body: 'Eion Morgan is a dedicated pediatrician with over 15 years...', time: 'Just Now', color: '#10b981', icon: 'checkmark-circle' as const },
];

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable>
          <Text style={styles.clearAll}>Clear all</Text>
        </Pressable>
      </View>

      {/* Notifications list */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {notifications.map((notif) => (
          <Pressable key={notif.id} style={styles.notifCard}>
            <View style={[styles.notifIcon, { backgroundColor: notif.color + '15' }]}>
              <Ionicons name={notif.icon} size={20} color={notif.color} />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, { color: notif.color }]}>{notif.title}</Text>
              <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
            </View>
            <Text style={styles.notifTime}>{notif.time}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  clearAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  notifIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '700' },
  notifBody: { fontSize: 13, color: colors.gray400, marginTop: 3, lineHeight: 18 },
  notifTime: { fontSize: 11, color: colors.gray400, marginTop: 2 },
});
