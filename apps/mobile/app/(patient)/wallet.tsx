import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

export default function WalletScreen() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/wallet').then(setWallet).catch(() => null),
      api('/wallet/transactions').then((d) => setTransactions(d?.data || [])).catch(() => []),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const balance = Number(wallet?.balance || 0);
  const maxBalance = wallet?.maxBalance || 25000;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0d9488', '#059669', '#10b981']} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{balance.toLocaleString('en-IN')}</Text>
          <View style={styles.limitBar}>
            <View style={[styles.limitFill, { width: `${(balance / maxBalance) * 100}%` }]} />
          </View>
          <Text style={styles.limitText}>Limit: ₹{maxBalance.toLocaleString('en-IN')}</Text>
        </LinearGradient>

        <View style={styles.transSection}>
          <Text style={styles.transTitle}>Transactions</Text>
          {transactions.map((tx: any) => (
            <View key={tx.id} style={styles.txCard}>
              <Ionicons name={tx.type === 'CREDIT' ? 'add-circle' : tx.type === 'REFUND' ? 'arrow-undo' : 'remove-circle'} size={20}
                color={tx.type === 'CREDIT' ? '#10b981' : tx.type === 'REFUND' ? '#3b82f6' : '#ef4444'} />
              <View style={{ flex: 1 }}>
                <Text style={styles.txTitle}>{tx.description || tx.type}</Text>
                <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleString()}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'DEBIT' ? '#ef4444' : '#10b981' }]}>
                {tx.type === 'DEBIT' ? '-' : '+'}₹{Number(tx.amount)}
              </Text>
            </View>
          ))}
          {transactions.length === 0 && <Text style={styles.emptyText}>No transactions yet</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  balanceCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, marginBottom: 16 },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  balanceAmount: { fontSize: 36, fontWeight: '900', color: colors.white, marginTop: 4 },
  limitBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 20 },
  limitFill: { height: 6, backgroundColor: colors.white, borderRadius: 3 },
  limitText: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  transSection: { paddingHorizontal: 20, marginBottom: 30 },
  transTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  txCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  txTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  txDate: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: colors.gray400, padding: 30 },
});
