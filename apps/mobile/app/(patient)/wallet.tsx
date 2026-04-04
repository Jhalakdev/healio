import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';

const MAX_BALANCE = 25000;
const currentBalance = 2000;

const quickAmounts = [500, 1000, 2000, 5000];

const transactions = [
  { id: '1', type: 'debit', title: 'Consultation — Dr. Priya', amount: 450, date: 'Today, 2:15 PM', icon: 'videocam' as const },
  { id: '2', type: 'credit', title: 'Wallet Top-up', amount: 2000, date: 'Today, 1:30 PM', icon: 'add-circle' as const },
  { id: '3', type: 'credit', title: 'Refund — Cancelled booking', amount: 500, date: 'Yesterday', icon: 'arrow-undo' as const },
  { id: '4', type: 'debit', title: 'Plan Purchase — Family 3', amount: 1000, date: '12 Oct', icon: 'card' as const },
  { id: '5', type: 'debit', title: 'Consultation — Dr. Amit', amount: 700, date: '10 Oct', icon: 'videocam' as const },
  { id: '6', type: 'credit', title: 'Wallet Top-up', amount: 5000, date: '8 Oct', icon: 'add-circle' as const },
];

export default function WalletScreen() {
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const canAdd = MAX_BALANCE - currentBalance;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance card */}
        <LinearGradient
          colors={['#0d9488', '#059669', '#10b981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceTop}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>₹{currentBalance.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.walletIconBig}>
              <Ionicons name="wallet" size={28} color="rgba(255,255,255,0.9)" />
            </View>
          </View>

          {/* Limit bar */}
          <View style={styles.limitSection}>
            <View style={styles.limitBar}>
              <View style={[styles.limitFill, { width: `${(currentBalance / MAX_BALANCE) * 100}%` }]} />
            </View>
            <View style={styles.limitLabels}>
              <Text style={styles.limitText}>₹0</Text>
              <Text style={styles.limitText}>Limit: ₹{MAX_BALANCE.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <Pressable style={styles.addMoneyBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="add-circle" size={20} color={colors.primary} />
            <Text style={styles.addMoneyText}>Add Money</Text>
          </Pressable>
        </LinearGradient>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'This Month', value: '₹3,150', icon: 'trending-down' as const, color: '#ef4444' },
            { label: 'Added', value: '₹7,000', icon: 'trending-up' as const, color: '#10b981' },
            { label: 'Refunds', value: '₹500', icon: 'arrow-undo' as const, color: '#3b82f6' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon} size={18} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.transSection}>
          <Text style={styles.transTitle}>Recent Transactions</Text>

          {transactions.map((tx) => (
            <View key={tx.id} style={styles.txCard}>
              <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? '#dcfce7' : '#fef2f2' }]}>
                <Ionicons
                  name={tx.icon}
                  size={18}
                  color={tx.type === 'credit' ? '#10b981' : '#ef4444'}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, tx.type === 'credit' ? styles.txGreen : styles.txRed]}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Money Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money</Text>
              <Pressable onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <Text style={styles.modalSub}>
              You can add up to ₹{canAdd.toLocaleString('en-IN')} more (max ₹25,000 limit)
            </Text>

            {/* Amount input */}
            <View style={styles.amountInput}>
              <Text style={styles.rupeeSign}>₹</Text>
              <TextInput
                style={styles.amountField}
                placeholder="0"
                placeholderTextColor={colors.gray300}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Quick amounts */}
            <View style={styles.quickRow}>
              {quickAmounts.map((q) => (
                <Pressable
                  key={q}
                  style={[styles.quickChip, amount === String(q) && styles.quickChipActive]}
                  onPress={() => setAmount(String(q))}
                >
                  <Text style={[styles.quickChipText, amount === String(q) && styles.quickChipTextActive]}>
                    +₹{q.toLocaleString('en-IN')}
                  </Text>
                </Pressable>
              ))}
            </View>

            {Number(amount) > canAdd && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={16} color="#d97706" />
                <Text style={styles.warningText}>
                  Exceeds wallet limit. Max you can add: ₹{canAdd.toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            <Pressable
              style={[styles.payBtn, (!amount || Number(amount) > canAdd) && styles.payBtnDisabled]}
              onPress={() => { setShowAdd(false); Alert.alert('Success', `₹${amount} added to wallet!`); }}
            >
              <Ionicons name="card-outline" size={20} color={colors.white} />
              <Text style={styles.payBtnText}>
                {amount ? `Pay ₹${Number(amount).toLocaleString('en-IN')}` : 'Enter Amount'}
              </Text>
            </Pressable>

            <View style={styles.secureRow}>
              <Ionicons name="shield-checkmark" size={14} color={colors.gray400} />
              <Text style={styles.secureText}>Secured by Razorpay · 256-bit encryption</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },

  // Balance card
  balanceCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, marginBottom: 16 },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  balanceAmount: { fontSize: 36, fontWeight: '900', color: colors.white, marginTop: 4, letterSpacing: -1 },
  walletIconBig: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  limitSection: { marginTop: 20 },
  limitBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 },
  limitFill: { height: 6, backgroundColor: colors.white, borderRadius: 3 },
  limitLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  limitText: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  addMoneyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.white, height: 48, borderRadius: 14, marginTop: 18,
  },
  addMoneyText: { fontSize: 15, fontWeight: '700', color: colors.primary },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 15, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 10, color: colors.gray400 },

  // Transactions
  transSection: { paddingHorizontal: 20, marginBottom: 30 },
  transTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  txCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  txIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  txDate: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  txGreen: { color: '#10b981' },
  txRed: { color: '#ef4444' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  modalSub: { fontSize: 13, color: colors.gray500, marginBottom: 20, lineHeight: 18 },
  amountInput: {
    flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2,
    borderBottomColor: colors.primary, paddingBottom: 8, marginBottom: 20,
  },
  rupeeSign: { fontSize: 32, fontWeight: '300', color: colors.gray400, marginRight: 4 },
  amountField: { flex: 1, fontSize: 40, fontWeight: '800', color: colors.text },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickChip: {
    flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  quickChipActive: { backgroundColor: colors.primary },
  quickChipText: { fontSize: 13, fontWeight: '700', color: colors.gray600 },
  quickChipTextActive: { color: colors.white },
  warningBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef3c7', padding: 12, borderRadius: 12, marginBottom: 16,
  },
  warningText: { flex: 1, fontSize: 12, color: '#92400e' },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 56, borderRadius: 16, backgroundColor: colors.primary,
  },
  payBtnDisabled: { opacity: 0.4 },
  payBtnText: { fontSize: 17, fontWeight: '700', color: colors.white },
  secureRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 16,
  },
  secureText: { fontSize: 11, color: colors.gray400 },
});
