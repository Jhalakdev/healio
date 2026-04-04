import { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.55;
const SLIDER_WIDTH = SCREEN_WIDTH - 80;
const THUMB_SIZE = 64;

export default function BookingConfirmScreen() {
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'gateway'>('wallet');
  const [confirmed, setConfirmed] = useState(false);
  const slideX = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      if (gesture.dx >= 0 && gesture.dx <= SLIDER_WIDTH - THUMB_SIZE) {
        slideX.setValue(gesture.dx);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        Animated.spring(slideX, {
          toValue: SLIDER_WIDTH - THUMB_SIZE,
          useNativeDriver: false,
        }).start(() => {
          setConfirmed(true);
          setTimeout(() => router.push('/(patient)/booking-success'), 300);
        });
      } else {
        Animated.spring(slideX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // Interpolate opacity for the text
  const textOpacity = slideX.interpolate({
    inputRange: [0, SLIDER_WIDTH * 0.4],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const bgColor = slideX.interpolate({
    inputRange: [0, SLIDER_WIDTH - THUMB_SIZE],
    outputRange: ['#0d9488', '#059669'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Doctor card */}
        <View style={styles.doctorCard}>
          <View style={styles.docAvatar}>
            <Text style={styles.docAvatarText}>PS</Text>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docName}>Dr. Priya Sharma</Text>
            <Text style={styles.docSpec}>General Medicine</Text>
            <View style={styles.docRating}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.ratingText}>4.9 (2,530 reviews)</Text>
            </View>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#10b981" />
          </View>
        </View>

        {/* Booking details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Booking Details</Text>

          {[
            { icon: 'calendar-outline' as const, label: 'Date', value: 'Mon, 15 Oct 2025' },
            { icon: 'time-outline' as const, label: 'Time', value: '2:00 PM — 2:15 PM' },
            { icon: 'hourglass-outline' as const, label: 'Duration', value: '15 minutes' },
            { icon: 'videocam-outline' as const, label: 'Type', value: 'Video Consultation' },
          ].map((item) => (
            <View key={item.label} style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* For whom */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Patient Details</Text>
          <View style={styles.patientRow}>
            <View style={[styles.patientAvatar, { backgroundColor: '#7c3aed20' }]}>
              <Text style={{ color: '#7c3aed', fontWeight: '800', fontSize: 16 }}>MW</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>Mrs. Williamson</Text>
              <Text style={styles.patientMeta}>Spouse · 29 yrs · Female</Text>
            </View>
            <Pressable style={styles.changeBtn}>
              <Text style={styles.changeBtnText}>Change</Text>
            </Pressable>
          </View>

          <View style={styles.symptomsBox}>
            <Text style={styles.symptomsLabel}>Symptoms / Reason</Text>
            <Text style={styles.symptomsText}>Persistent headache, mild fever for 3 days</Text>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Payment</Text>

          {/* Wallet toggle */}
          <Pressable
            style={[styles.paymentOption, paymentMethod === 'wallet' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('wallet')}
          >
            <View style={styles.paymentLeft}>
              <View style={[styles.radioOuter, paymentMethod === 'wallet' && styles.radioOuterActive]}>
                {paymentMethod === 'wallet' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.paymentLabel}>Healio Wallet</Text>
                <Text style={styles.paymentSub}>Balance: ₹2,000</Text>
              </View>
            </View>
            <View style={styles.sufficientBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              <Text style={styles.sufficientText}>Sufficient</Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.paymentOption, paymentMethod === 'gateway' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('gateway')}
          >
            <View style={styles.paymentLeft}>
              <View style={[styles.radioOuter, paymentMethod === 'gateway' && styles.radioOuterActive]}>
                {paymentMethod === 'gateway' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.walletIcon}>
                <Ionicons name="card" size={20} color="#7c3aed" />
              </View>
              <View>
                <Text style={styles.paymentLabel}>Pay Online</Text>
                <Text style={styles.paymentSub}>UPI, Card, Net Banking</Text>
              </View>
            </View>
          </Pressable>

          {/* Coupon */}
          <Pressable style={styles.couponRow}>
            <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
            <Text style={styles.couponText}>Apply Coupon Code</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
          </Pressable>
        </View>

        {/* Price breakdown */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          {[
            { label: 'Consultation Fee', value: '₹500.00' },
            { label: 'Child Discount (10%)', value: '-₹0.00', green: false },
            { label: 'Coupon (WELCOME50)', value: '-₹50.00', green: true },
          ].map((item) => (
            <View key={item.label} style={styles.priceRow}>
              <Text style={styles.priceLabel}>{item.label}</Text>
              <Text style={[styles.priceValue, item.green && styles.priceGreen]}>
                {item.value}
              </Text>
            </View>
          ))}
          <View style={styles.totalDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹450.00</Text>
          </View>
        </View>
      </ScrollView>

      {/* Swipe to confirm */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomTotal}>₹450</Text>
          <Text style={styles.bottomSub}>via {paymentMethod === 'wallet' ? 'Wallet' : 'Online Payment'}</Text>
        </View>

        <Animated.View style={[styles.slider, { backgroundColor: bgColor }]}>
          <Animated.Text style={[styles.slideText, { opacity: textOpacity }]}>
            Swipe to Confirm →
          </Animated.Text>
          <Animated.View
            style={[styles.thumb, { transform: [{ translateX: slideX }] }]}
            {...panResponder.panHandlers}
          >
            <LinearGradient
              colors={['#ffffff', '#f0fdf4']}
              style={styles.thumbInner}
            >
              {confirmed ? (
                <Ionicons name="checkmark" size={28} color="#10b981" />
              ) : (
                <Ionicons name="arrow-forward" size={24} color={colors.primary} />
              )}
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </View>
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

  // Doctor
  doctorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 18,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  docAvatar: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: '#e0f2fe',
    alignItems: 'center', justifyContent: 'center',
  },
  docAvatarText: { fontSize: 18, fontWeight: '800', color: '#0284c7' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1, width: 14, height: 14,
    borderRadius: 7, backgroundColor: '#10b981', borderWidth: 2, borderColor: colors.white,
  },
  docInfo: { flex: 1 },
  docName: { fontSize: 16, fontWeight: '700', color: colors.text },
  docSpec: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  docRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 11, color: colors.gray500 },
  verifiedBadge: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#dcfce7',
    alignItems: 'center', justifyContent: 'center',
  },

  // Details
  detailsCard: {
    marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 18,
    padding: 18, marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  detailIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#e6f7f5',
    alignItems: 'center', justifyContent: 'center',
  },
  detailLabel: { flex: 1, fontSize: 13, color: colors.gray500 },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.text },

  // Patient
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  patientAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 15, fontWeight: '700', color: colors.text },
  patientMeta: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  changeBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
    backgroundColor: colors.gray100,
  },
  changeBtnText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  symptomsBox: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12 },
  symptomsLabel: { fontSize: 11, fontWeight: '600', color: colors.gray400, marginBottom: 4 },
  symptomsText: { fontSize: 13, color: colors.text, lineHeight: 20 },

  // Payment
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 14, backgroundColor: '#f8fafc',
    borderWidth: 2, borderColor: 'transparent', marginBottom: 8,
  },
  paymentOptionActive: { borderColor: colors.primary, backgroundColor: '#f0fdfa' },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  walletIcon: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#e6f7f5',
    alignItems: 'center', justifyContent: 'center',
  },
  paymentLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  paymentSub: { fontSize: 11, color: colors.gray400, marginTop: 1 },
  sufficientBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  sufficientText: { fontSize: 10, fontWeight: '600', color: '#10b981' },
  couponRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f5f5f5', marginTop: 4,
  },
  couponText: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.primary },

  // Price
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { fontSize: 13, color: colors.gray500 },
  priceValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  priceGreen: { color: '#10b981' },
  totalDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary },

  // Bottom swipe bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 38,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#f0f0f0',
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  bottomInfo: { width: 60 },
  bottomTotal: { fontSize: 20, fontWeight: '800', color: colors.text },
  bottomSub: { fontSize: 10, color: colors.gray400, marginTop: 1 },
  slider: {
    flex: 1, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  slideText: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.9)', letterSpacing: 0.3 },
  thumb: {
    position: 'absolute', left: 4, top: 4,
    width: THUMB_SIZE - 8, height: THUMB_SIZE - 8,
    borderRadius: (THUMB_SIZE - 8) / 2,
  },
  thumbInner: {
    width: '100%', height: '100%', borderRadius: (THUMB_SIZE - 8) / 2,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
});
