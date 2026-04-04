import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

const specializations = [
  { id: '1', name: 'General', icon: 'fitness-outline' as const },
  { id: '2', name: 'Derma', icon: 'body-outline' as const },
  { id: '3', name: 'Pediatric', icon: 'happy-outline' as const },
  { id: '4', name: 'Cardio', icon: 'heart-outline' as const },
  { id: '5', name: 'ENT', icon: 'ear-outline' as const },
  { id: '6', name: 'Ortho', icon: 'walk-outline' as const },
];

const onlineDoctors = [
  { id: '1', name: 'Dr. Priya Sharma', spec: 'General Medicine', fee: 500, rating: 4.9, online: true },
  { id: '2', name: 'Dr. Amit Verma', spec: 'Dermatology', fee: 700, rating: 4.8, online: true },
  { id: '3', name: 'Dr. Sanjay Kumar', spec: 'ENT', fee: 800, rating: 4.8, online: true },
];

export default function PatientHome() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good afternoon 👋</Text>
          <Text style={styles.headerTitle}>Find your doctor</Text>
        </View>
        <Pressable style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

      {/* Quick Actions */}
      <LinearGradient
        colors={['#0d9488', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickCard}
      >
        <View>
          <Text style={styles.quickTitle}>Need a consultation?</Text>
          <Text style={styles.quickSub}>Talk to a doctor instantly</Text>
        </View>
        <Pressable style={styles.quickBtn}>
          <Ionicons name="videocam" size={20} color={colors.primary} />
          <Text style={styles.quickBtnText}>Consult Now</Text>
        </Pressable>
      </LinearGradient>

      {/* Specializations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specializations</Text>
        <View style={styles.specGrid}>
          {specializations.map((s) => (
            <Pressable key={s.id} style={styles.specItem}>
              <View style={styles.specIcon}>
                <Ionicons name={s.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.specName}>{s.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Online Doctors */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Online Now</Text>
          <Pressable onPress={() => router.push('/(patient)/doctors')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {onlineDoctors.map((doc) => (
          <Pressable key={doc.id} style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.avatarText}>
                {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doc.name}</Text>
              <Text style={styles.doctorSpec}>{doc.spec}</Text>
              <View style={styles.doctorMeta}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.rating}>{doc.rating}</Text>
                <Text style={styles.fee}>₹{doc.fee}</Text>
              </View>
            </View>
            <Pressable style={styles.consultBtn}>
              <Ionicons name="videocam" size={16} color={colors.white} />
            </Pressable>
          </Pressable>
        ))}
      </View>

      {/* Plans */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <Text style={styles.sectionTitle}>Plans</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { name: 'Single', price: '₹299', consults: '1 Consultation', color: ['#0d9488', '#059669'] as [string, string] },
            { name: '3-Pack', price: '₹699', consults: '3 Consultations', color: ['#7c3aed', '#6d28d9'] as [string, string] },
            { name: '5-Pack', price: '₹999', consults: '5 Consultations', color: ['#ea580c', '#dc2626'] as [string, string] },
          ].map((plan) => (
            <LinearGradient
              key={plan.name}
              colors={plan.color}
              style={styles.planCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planConsults}>{plan.consults}</Text>
              <Pressable style={styles.planBtn}>
                <Text style={styles.planBtnText}>Buy Now</Text>
              </Pressable>
            </LinearGradient>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: spacing.lg,
  },
  greeting: { fontSize: fontSize.sm, color: colors.textSecondary },
  headerTitle: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.text, marginTop: 2 },
  notifBtn: {
    width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 10, right: 10, width: 8, height: 8,
    borderRadius: 4, backgroundColor: colors.danger,
  },
  quickCard: {
    marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  quickTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.white },
  quickSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.white, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md, borderRadius: radius.lg,
  },
  quickBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  section: { marginTop: spacing['2xl'], paddingHorizontal: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  seeAll: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  specItem: { width: '30%', alignItems: 'center', gap: spacing.sm },
  specIcon: {
    width: 56, height: 56, borderRadius: radius.lg, backgroundColor: '#e6f7f5',
    alignItems: 'center', justifyContent: 'center',
  },
  specName: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textSecondary },
  doctorCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg,
    backgroundColor: colors.white, borderRadius: radius.lg,
    marginBottom: spacing.md, gap: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  doctorAvatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: fontSize.base },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0, width: 14, height: 14,
    borderRadius: 7, backgroundColor: colors.success, borderWidth: 2, borderColor: colors.white,
  },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: fontSize.base, fontWeight: '700', color: colors.text },
  doctorSpec: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  doctorMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  rating: { fontSize: fontSize.xs, fontWeight: '600', color: colors.text },
  fee: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primary },
  consultBtn: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  planCard: {
    width: 160, borderRadius: radius.xl, padding: spacing.xl,
    marginRight: spacing.md,
  },
  planName: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  planPrice: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.white, marginTop: 4 },
  planConsults: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  planBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: spacing.sm,
    borderRadius: radius.md, alignItems: 'center', marginTop: spacing.md,
  },
  planBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },
});
