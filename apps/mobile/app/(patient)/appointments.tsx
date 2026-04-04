import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

type Tab = 'Past' | 'Upcoming' | 'Cancelled';

const appointments = {
  Past: [
    { id: '1', doctor: 'Dr. Andrea H.', spec: 'Neurosurgery', date: '02 Oct, 2023', time: '10:00 AM', status: 'Completed' },
    { id: '2', doctor: 'Dr. Amira', spec: 'Dentistry', date: '28 Sep, 2023', time: '2:30 PM', status: 'Completed' },
  ],
  Upcoming: [
    { id: '3', doctor: 'Dr. Eion Morgan', spec: 'Pediatrics', date: 'Today', time: '3:00 PM', status: 'Confirmed' },
    { id: '4', doctor: 'Dr. Amira Yusha', spec: 'Dentistry', date: 'Today', time: '5:00 PM', status: 'Confirmed' },
    { id: '5', doctor: 'Dr. Eion Morgan', spec: 'Pediatrics', date: 'Tomorrow', time: '10:00 AM', status: 'Pending' },
  ],
  Cancelled: [
    { id: '6', doctor: 'Dr. Jerry Jones', spec: 'Cardiology', date: '15 Sep, 2023', time: '11:00 AM', status: 'Cancelled' },
  ],
};

const statusColors: Record<string, string> = {
  Completed: '#10b981',
  Confirmed: '#0d9488',
  Pending: '#f59e0b',
  Cancelled: '#ef4444',
};

export default function AppointmentsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Upcoming');

  const data = appointments[activeTab];

  // Group by date
  const grouped: Record<string, typeof data> = {};
  data.forEach((a) => {
    if (!grouped[a.date]) grouped[a.date] = [];
    grouped[a.date].push(a);
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['Past', 'Upcoming', 'Cancelled'] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {/* Appointments list */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {Object.entries(grouped).map(([date, items]) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {items.map((apt) => (
              <View key={apt.id} style={styles.aptCard}>
                <View style={styles.aptAvatar}>
                  <Text style={styles.aptAvatarText}>
                    {apt.doctor.split(' ').slice(1).map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.aptInfo}>
                  <Text style={styles.aptDoctor}>{apt.doctor}</Text>
                  <Text style={styles.aptSpec}>{apt.spec}</Text>
                  <View style={styles.aptTimeRow}>
                    <Ionicons name="time-outline" size={12} color={colors.gray400} />
                    <Text style={styles.aptTime}>{apt.time}</Text>
                  </View>
                </View>
                <View style={styles.aptRight}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors[apt.status] + '15' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColors[apt.status] }]} />
                    <Text style={[styles.statusText, { color: statusColors[apt.status] }]}>{apt.status}</Text>
                  </View>
                  {apt.status === 'Confirmed' && (
                    <Pressable style={styles.joinBtn}>
                      <Ionicons name="videocam" size={14} color={colors.white} />
                      <Text style={styles.joinBtnText}>Join</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}

        {data.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={colors.gray300} />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} appointments</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  welcomeText: { fontSize: 12, color: colors.gray400 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 2 },
  tabs: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 16,
    backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.gray400 },
  tabTextActive: { color: colors.text },
  list: { paddingHorizontal: 20, marginTop: 16 },
  dateHeader: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 10 },
  aptCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fafafa', borderRadius: 16, padding: 14, marginBottom: 10,
  },
  aptAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0f2fe',
    alignItems: 'center', justifyContent: 'center',
  },
  aptAvatarText: { fontSize: 16, fontWeight: '700', color: '#0284c7' },
  aptInfo: { flex: 1 },
  aptDoctor: { fontSize: 15, fontWeight: '700', color: colors.text },
  aptSpec: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  aptTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  aptTime: { fontSize: 12, color: colors.gray500 },
  aptRight: { alignItems: 'flex-end', gap: 8 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  joinBtnText: { fontSize: 12, fontWeight: '700', color: colors.white },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.gray400 },
});
