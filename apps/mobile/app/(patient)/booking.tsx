import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

export default function MessagesTab() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/users/me/conversations').then(setConversations).catch(() => []).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {conversations.map((conv: any) => (
          <Pressable key={conv.bookingId} style={styles.messageCard}>
            <View style={styles.msgAvatar}>
              <Text style={styles.msgAvatarText}>{conv.doctor?.name?.[0] || 'D'}</Text>
            </View>
            <View style={styles.msgContent}>
              <View style={styles.msgTopRow}>
                <Text style={styles.msgName}>{conv.doctor?.name || 'Doctor'}</Text>
                {conv.lastMessage && <Text style={styles.msgTime}>{new Date(conv.lastMessage.createdAt).toLocaleDateString()}</Text>}
              </View>
              <Text style={styles.msgPreview} numberOfLines={1}>
                {conv.lastMessage?.content || 'No messages yet'}
              </Text>
            </View>
          </Pressable>
        ))}
        {conversations.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.gray300} />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubText}>Messages from your consultations will appear here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  messageCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  msgAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  msgAvatarText: { fontSize: 18, fontWeight: '700', color: '#0284c7' },
  msgContent: { flex: 1 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgName: { fontSize: 15, fontWeight: '700', color: colors.text },
  msgTime: { fontSize: 11, color: colors.gray400 },
  msgPreview: { fontSize: 13, color: colors.gray400, marginTop: 3 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.gray400 },
  emptySubText: { fontSize: 13, color: colors.gray400 },
});
