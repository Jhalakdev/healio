import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';

export default function VideoCallScreen() {
  const { doctorName, bookingId } = useLocalSearchParams<{ doctorName: string; bookingId: string }>();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a3a4a', '#0f2a35']} style={styles.mainVideo}>
        <View style={styles.topBar}>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{doctorName || 'Doctor'}</Text>
          </View>
          <View style={styles.timerTag}>
            <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
          </View>
        </View>

        <View style={styles.doctorCenter}>
          <View style={styles.doctorAvatarLarge}>
            <Ionicons name="person" size={80} color="rgba(255,255,255,0.3)" />
          </View>
          <Text style={styles.connectingText}>Connecting to video call...</Text>
          <Text style={styles.infoText}>LiveKit integration coming soon</Text>
        </View>

        <View style={styles.pipContainer}>
          <View style={styles.pip}>
            <View style={styles.pipInner}>
              <Ionicons name="person" size={30} color="rgba(255,255,255,0.5)" />
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <View style={styles.controlsRow}>
            <Pressable style={[styles.controlBtn, isMuted && styles.controlBtnActive]} onPress={() => setIsMuted(!isMuted)}>
              <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color={colors.white} />
            </Pressable>
            <Pressable style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]} onPress={() => setIsVideoOff(!isVideoOff)}>
              <Ionicons name={isVideoOff ? 'videocam-off' : 'videocam'} size={24} color={colors.white} />
            </Pressable>
            <Pressable style={styles.endCallBtn} onPress={() => router.back()}>
              <Ionicons name="call" size={28} color={colors.white} style={{ transform: [{ rotate: '135deg' }] }} />
            </Pressable>
            <Pressable style={styles.controlBtn}>
              <Ionicons name="volume-high" size={24} color={colors.white} />
            </Pressable>
            <Pressable style={[styles.controlBtn, isChatOpen && styles.controlBtnActive]} onPress={() => setIsChatOpen(!isChatOpen)}>
              <Ionicons name="chatbubble-ellipses" size={24} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {isChatOpen && (
        <View style={styles.chatOverlay}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Chat</Text>
            <Pressable onPress={() => setIsChatOpen(false)}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.chatMessages}>
            <Text style={styles.chatEmpty}>Chat messages will appear here during the consultation</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2a35' },
  mainVideo: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60 },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  liveText: { fontSize: 16, fontWeight: '700', color: colors.white },
  timerTag: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  timerText: { fontSize: 14, fontWeight: '600', color: colors.white, fontVariant: ['tabular-nums'] },
  doctorCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  doctorAvatarLarge: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  connectingText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600', marginTop: 20 },
  infoText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8 },
  pipContainer: { position: 'absolute', top: 110, right: 16 },
  pip: { alignItems: 'center', gap: 8 },
  pipInner: { width: 80, height: 100, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  controls: { paddingBottom: 50, paddingHorizontal: 20 },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  controlBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  controlBtnActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  endCallBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 },
  chatOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  chatTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  chatMessages: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  chatEmpty: { fontSize: 14, color: colors.gray400, textAlign: 'center' },
});
