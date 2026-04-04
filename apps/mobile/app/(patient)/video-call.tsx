import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';

export default function VideoCallScreen() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Doctor main video */}
      <LinearGradient colors={['#1a3a4a', '#0f2a35']} style={styles.mainVideo}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Dr. Eion Morgan</Text>
          </View>
          <View style={styles.timerTag}>
            <Text style={styles.timerText}>01:25:56</Text>
          </View>
        </View>

        {/* Doctor avatar placeholder */}
        <View style={styles.doctorCenter}>
          <View style={styles.doctorAvatarLarge}>
            <Ionicons name="person" size={80} color="rgba(255,255,255,0.3)" />
          </View>
        </View>

        {/* PiP - patient self view */}
        <View style={styles.pipContainer}>
          <View style={styles.pip}>
            <View style={styles.pipInner}>
              <Ionicons name="person" size={30} color="rgba(255,255,255,0.5)" />
            </View>
            <Pressable style={styles.pipAddBtn}>
              <Ionicons name="add" size={16} color={colors.white} />
              <Text style={styles.pipAddText}>Add New</Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom controls */}
        <View style={styles.controls}>
          <View style={styles.controlsRow}>
            <Pressable
              style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
              onPress={() => setIsMuted(!isMuted)}
            >
              <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color={colors.white} />
            </Pressable>

            <Pressable
              style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
              onPress={() => setIsVideoOff(!isVideoOff)}
            >
              <Ionicons name={isVideoOff ? 'videocam-off' : 'videocam'} size={24} color={colors.white} />
            </Pressable>

            <Pressable
              style={styles.endCallBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="call" size={28} color={colors.white} style={{ transform: [{ rotate: '135deg' }] }} />
            </Pressable>

            <Pressable style={styles.controlBtn}>
              <Ionicons name="volume-high" size={24} color={colors.white} />
            </Pressable>

            <Pressable
              style={[styles.controlBtn, isChatOpen && styles.controlBtnActive]}
              onPress={() => setIsChatOpen(!isChatOpen)}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* Chat overlay */}
      {isChatOpen && (
        <View style={styles.chatOverlay}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Chat</Text>
            <Pressable onPress={() => setIsChatOpen(false)}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.chatMessages}>
            {[
              { from: 'doctor', text: 'Hello! How are you feeling today?', time: '1:20 PM' },
              { from: 'patient', text: 'Hi Doctor, I have a headache since 3 days', time: '1:21 PM' },
              { from: 'doctor', text: 'I see. Any fever or nausea?', time: '1:21 PM' },
            ].map((msg, i) => (
              <View key={i} style={[styles.chatBubble, msg.from === 'patient' ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                <Text style={[styles.chatBubbleText, msg.from === 'patient' && styles.chatBubbleTextRight]}>{msg.text}</Text>
                <Text style={[styles.chatTime, msg.from === 'patient' && styles.chatTimeRight]}>{msg.time}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chatInput}>
            <Pressable style={styles.attachBtn}>
              <Ionicons name="attach" size={22} color={colors.gray400} />
            </Pressable>
            <View style={styles.chatInputField}>
              <Text style={styles.chatPlaceholder}>Type a message...</Text>
            </View>
            <Pressable style={styles.sendBtn}>
              <Ionicons name="send" size={18} color={colors.white} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2a35' },
  mainVideo: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60,
  },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  liveText: { fontSize: 16, fontWeight: '700', color: colors.white },
  timerTag: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  timerText: { fontSize: 14, fontWeight: '600', color: colors.white, fontVariant: ['tabular-nums'] },

  // Doctor center
  doctorCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  doctorAvatarLarge: {
    width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  // PiP
  pipContainer: { position: 'absolute', top: 110, right: 16 },
  pip: { alignItems: 'center', gap: 8 },
  pipInner: {
    width: 80, height: 100, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  pipAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  pipAddText: { fontSize: 10, color: colors.white, fontWeight: '600' },

  // Controls
  controls: { paddingBottom: 50, paddingHorizontal: 20 },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  controlBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  controlBtnActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  endCallBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#ef4444',
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 8,
  },

  // Chat overlay
  chatOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  chatHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  chatTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  chatMessages: { flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  chatBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  chatBubbleLeft: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9', borderBottomLeftRadius: 4 },
  chatBubbleRight: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  chatBubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  chatBubbleTextRight: { color: colors.white },
  chatTime: { fontSize: 10, color: colors.gray400, marginTop: 4 },
  chatTimeRight: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  chatInput: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f5f5f5',
  },
  attachBtn: { padding: 4 },
  chatInputField: {
    flex: 1, height: 42, borderRadius: 21, backgroundColor: '#f1f5f9',
    justifyContent: 'center', paddingHorizontal: 16,
  },
  chatPlaceholder: { fontSize: 14, color: colors.gray400 },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});
