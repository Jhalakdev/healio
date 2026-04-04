import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

const gradients: [string, string][] = [
  ['#0d9488', '#059669'], ['#7c3aed', '#6d28d9'], ['#ea580c', '#dc2626'], ['#0f172a', '#1e293b'],
];

export default function PlansScreen() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/plans').then(setPlans).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Choose a Plan</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {plans.map((plan: any, i: number) => (
          <Pressable key={plan.id} style={styles.cardWrap}>
            <LinearGradient colors={gradients[i % gradients.length]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planMembers}>{plan.maxMembers === 1 ? 'Individual' : `Up to ${plan.maxMembers} members`}</Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.price}>₹{Number(plan.price).toLocaleString('en-IN')}</Text>
                  <Text style={styles.validity}>{plan.validityDays >= 365 ? '1 year' : `${Math.floor(plan.validityDays / 30)} months`}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.features}>
                {(plan.features || []).map((f: string, j: number) => (
                  <View key={j} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.statsBlock}>
                <View style={styles.statItem}><Text style={styles.statNum}>{plan.consultations}</Text><Text style={styles.statLabel}>Consults</Text></View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}><Text style={styles.statNum}>{plan.maxMembers}</Text><Text style={styles.statLabel}>Members</Text></View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}><Text style={styles.statNum}>{Number(plan.childDiscountPercent)}%</Text><Text style={styles.statLabel}>Child Off</Text></View>
              </View>
              <Pressable style={styles.buyBtn}><Text style={styles.buyBtnText}>Get {plan.name}</Text></Pressable>
            </LinearGradient>
          </Pressable>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  cardWrap: { marginHorizontal: 20, marginBottom: 16 },
  card: { borderRadius: 24, padding: 24 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 20, fontWeight: '800', color: colors.white },
  planMembers: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: 28, fontWeight: '900', color: colors.white },
  validity: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 16 },
  features: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  statsBlock: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, marginTop: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: colors.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.15)' },
  buyBtn: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', height: 50, borderRadius: 14, justifyContent: 'center', marginTop: 16 },
  buyBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});
