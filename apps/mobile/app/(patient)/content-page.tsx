import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

const slugTitles: Record<string, string> = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  about: 'About Us',
  refund: 'Refund Policy',
};

export default function ContentPageScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      api(`/content/pages/${slug}`).then(setPage).catch(() => {}).finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>{page?.title || slugTitles[slug || ''] || 'Page'}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <Text style={styles.bodyText}>{page?.content || 'Content not available yet.'}</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  content: { paddingHorizontal: 20 },
  bodyText: { fontSize: 15, color: colors.gray500, lineHeight: 24 },
});
