import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

const messages = [
  { id: '1', name: 'Eyal Ofer', preview: 'Eion Morgan is a dedicated pediatrician with over 15...', time: 'Just Now', unread: true },
  { id: '2', name: 'Jeff Yass', preview: 'You: Eion Morgan is a dedicated pediatrician with...', time: '1min ago', unread: false },
  { id: '3', name: 'Yen Shipley', preview: 'Eion Morgan is a dedicated pediatrician with over 15...', time: '2min ago', unread: true },
  { id: '4', name: 'Pedramine G.', preview: 'Eion Morgan is a dedicated pediatrician with over 15...', time: '5min ago', unread: false },
  { id: '5', name: 'Kimberly J.', preview: 'Eion Morgan is a dedicated pediatrician with over 15...', time: '10min ago', unread: false },
  { id: '6', name: 'Stefan Persson', preview: 'You: Eion Morgan is a dedicated pediatrician with...', time: '1hr ago', unread: false },
];

export default function MessagesTab() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.headerTitle}>Inbox</Text>
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
        {messages.map((msg) => (
          <Pressable key={msg.id} style={styles.messageCard}>
            <View style={styles.msgAvatar}>
              <Text style={styles.msgAvatarText}>{msg.name[0]}</Text>
            </View>
            <View style={styles.msgContent}>
              <View style={styles.msgTopRow}>
                <Text style={[styles.msgName, msg.unread && styles.msgNameUnread]}>{msg.name}</Text>
                <Text style={styles.msgTime}>{msg.time}</Text>
              </View>
              <Text style={styles.msgPreview} numberOfLines={1}>{msg.preview}</Text>
            </View>
            {msg.unread && <View style={styles.unreadDot} />}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  welcomeText: { fontSize: 12, color: colors.gray400 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8, marginTop: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  messageCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  msgAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0f2fe',
    alignItems: 'center', justifyContent: 'center',
  },
  msgAvatarText: { fontSize: 18, fontWeight: '700', color: '#0284c7' },
  msgContent: { flex: 1 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgName: { fontSize: 15, fontWeight: '600', color: colors.text },
  msgNameUnread: { fontWeight: '700' },
  msgTime: { fontSize: 11, color: colors.gray400 },
  msgPreview: { fontSize: 13, color: colors.gray400, marginTop: 3 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
