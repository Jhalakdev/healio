import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';

const plans = [
  {
    id: '1',
    name: 'Single Consult',
    type: 'single',
    price: 399,
    originalPrice: 499,
    members: 1,
    consultations: 1,
    validity: '30 days',
    gradient: ['#0d9488', '#059669'] as [string, string],
    icon: 'person' as const,
    popular: false,
    features: ['15-min HD video call', 'Digital prescription', 'Chat support'],
  },
  {
    id: '2',
    name: 'Family Plan',
    type: 'family',
    price: 1000,
    originalPrice: 1299,
    members: 3,
    consultations: 3,
    validity: '3 months',
    gradient: ['#7c3aed', '#6d28d9'] as [string, string],
    icon: 'people' as const,
    popular: true,
    features: ['3 consultations', 'Up to 3 members', '10% child discount', '3 months validity'],
  },
  {
    id: '3',
    name: 'Family Plus',
    type: 'family',
    price: 1500,
    originalPrice: 1999,
    members: 5,
    consultations: 5,
    validity: '3 months',
    gradient: ['#ea580c', '#dc2626'] as [string, string],
    icon: 'people-circle' as const,
    popular: false,
    features: ['5 consultations', 'Up to 5 members', '10% child discount', 'Priority booking', '3 months validity'],
  },
  {
    id: '4',
    name: 'Yearly Card',
    type: 'yearly',
    price: 5999,
    originalPrice: 7999,
    members: 5,
    consultations: 10,
    validity: '12 months',
    gradient: ['#0f172a', '#1e293b'] as [string, string],
    icon: 'shield-checkmark' as const,
    popular: false,
    features: ['10 consultations', '5 family members', 'Free follow-ups', 'Priority booking', '12 months validity', '10% child discount'],
  },
];

export default function PlansScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Choose a Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>
        Save more with family plans. Add children for extra discounts.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {plans.map((plan) => (
          <Pressable key={plan.id} style={styles.cardWrap}>
            <LinearGradient
              colors={plan.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Popular badge */}
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="star" size={10} color="#f59e0b" />
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}

              {/* Top row */}
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.membersRow}>
                    <Ionicons name={plan.icon} size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.membersText}>
                      {plan.members === 1 ? 'Individual' : `Up to ${plan.members} members`}
                    </Text>
                  </View>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.originalPrice}>₹{plan.originalPrice}</Text>
                  <Text style={styles.price}>₹{plan.price}</Text>
                  <Text style={styles.validity}>{plan.validity}</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Features */}
              <View style={styles.featuresBlock}>
                {plan.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              {/* Stats */}
              <View style={styles.statsBlock}>
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{plan.consultations}</Text>
                  <Text style={styles.statLabel}>Consults</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{plan.members}</Text>
                  <Text style={styles.statLabel}>Members</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>10%</Text>
                  <Text style={styles.statLabel}>Child Off</Text>
                </View>
              </View>

              {/* CTA */}
              <Pressable style={styles.buyBtn}>
                <Text style={styles.buyBtnText}>Get {plan.name}</Text>
                <Ionicons name="arrow-forward" size={18} color={plan.type === 'yearly' ? colors.white : colors.text} />
              </Pressable>
            </LinearGradient>
          </Pressable>
        ))}

        {/* Info note */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Family Member Rules</Text>
            <Text style={styles.infoText}>
              • Max 5 members per account (3 adults + 2 children or 2 adults + 3 children){'\n'}
              • Children under 18: no verification needed{'\n'}
              • Members 18+: phone number verification required{'\n'}
              • Adding a child gets 10% discount on flat rate
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  subtitle: {
    fontSize: 14, color: colors.gray500, paddingHorizontal: 20,
    marginBottom: 16, lineHeight: 20,
  },
  cardWrap: { marginHorizontal: 20, marginBottom: 16 },
  card: { borderRadius: 24, padding: 24, overflow: 'hidden' },
  popularBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12,
  },
  popularText: { fontSize: 10, fontWeight: '800', color: colors.white, letterSpacing: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 20, fontWeight: '800', color: colors.white },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  membersText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  priceBlock: { alignItems: 'flex-end' },
  originalPrice: {
    fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  price: { fontSize: 28, fontWeight: '900', color: colors.white },
  validity: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 16 },
  featuresBlock: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  statsBlock: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 14,
    marginTop: 16, gap: 0,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: colors.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.15)' },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)', height: 50, borderRadius: 14,
    marginTop: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  buyBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
  infoCard: {
    flexDirection: 'row', gap: 12, marginHorizontal: 20,
    backgroundColor: '#e6f7f5', borderRadius: 16, padding: 16, marginTop: 4,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.primaryDark, marginBottom: 4 },
  infoText: { fontSize: 12, color: colors.primary, lineHeight: 20 },
});
