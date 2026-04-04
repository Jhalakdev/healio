import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

// Mock data — in production, fetched from API
const doctor = {
  id: '1',
  name: 'Dr. Priya Sharma',
  qualification: 'MBBS, MD (General Medicine)',
  specialization: 'General Medicine',
  experience: 8,
  fee: 500,
  bio: 'Experienced general physician with 8+ years of practice. Specialized in preventive healthcare, chronic disease management, and family medicine. Available for instant and scheduled video consultations.',
  languages: ['Hindi', 'English', 'Marathi'],
  isOnline: true,
  totalPatients: 2340,
  totalConsultations: 4580,
  averageRating: 4.9,
  totalReviews: 342,
  ratingBreakdown: { 5: 280, 4: 42, 3: 12, 2: 5, 1: 3 },
  responseTime: '< 2 min',
  memberSince: '2023',
};

const reviews = [
  { id: '1', name: 'Rahul K.', rating: 5, comment: 'Very thorough consultation. Dr. Sharma listened patiently and explained everything clearly. Highly recommended!', date: '2 days ago' },
  { id: '2', name: 'Anita M.', rating: 5, comment: 'Excellent doctor. Very professional and caring. The prescription worked perfectly.', date: '1 week ago' },
  { id: '3', name: 'Anonymous', rating: 4, comment: 'Good consultation. Could have been a bit longer but overall satisfied.', date: '2 weeks ago' },
  { id: '4', name: 'Suresh P.', rating: 5, comment: 'Best online doctor experience. Will definitely consult again!', date: '3 weeks ago' },
];

export default function DoctorProfile() {
  const [selectedTab, setSelectedTab] = useState<'about' | 'reviews'>('about');

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? 'star' : i < rating ? 'star-half' : 'star-outline'}
        size={16}
        color="#f59e0b"
      />
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#0d9488', '#059669']} style={styles.headerBg}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </Pressable>

          <View style={styles.profileSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>PS</Text>
              {doctor.isOnline && <View style={styles.onlineBadgeLarge} />}
            </View>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorQualif}>{doctor.qualification}</Text>

            {/* Trust badges */}
            <View style={styles.trustBadges}>
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="medal-outline" size={14} color="#f59e0b" />
                <Text style={styles.badgeText}>Top Rated</Text>
              </View>
              {doctor.isOnline && (
                <View style={[styles.badge, styles.badgeOnline]}>
                  <View style={styles.liveDot} />
                  <Text style={[styles.badgeText, { color: '#10b981' }]}>Online Now</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: doctor.totalPatients.toLocaleString(), label: 'Patients', icon: 'people-outline' as const },
            { value: `${doctor.experience}+ yrs`, label: 'Experience', icon: 'ribbon-outline' as const },
            { value: doctor.averageRating.toString(), label: 'Rating', icon: 'star' as const },
            { value: doctor.responseTime, label: 'Response', icon: 'flash-outline' as const },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Ionicons name={stat.icon} size={18} color={colors.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['about', 'reviews'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab === 'about' ? 'About' : `Reviews (${doctor.totalReviews})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {selectedTab === 'about' ? (
          <View style={styles.content}>
            {/* Bio */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About</Text>
              <Text style={styles.bioText}>{doctor.bio}</Text>
            </View>

            {/* Info */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Details</Text>
              {[
                { icon: 'medkit-outline' as const, label: 'Specialization', value: doctor.specialization },
                { icon: 'language-outline' as const, label: 'Languages', value: doctor.languages.join(', ') },
                { icon: 'cash-outline' as const, label: 'Consultation Fee', value: `₹${doctor.fee}` },
                { icon: 'calendar-outline' as const, label: 'Member Since', value: doctor.memberSince },
              ].map((item) => (
                <View key={item.label} style={styles.infoRow}>
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              ))}
            </View>

            {/* Satisfaction guarantee */}
            <View style={styles.guaranteeCard}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.guaranteeTitle}>Satisfaction Guaranteed</Text>
                <Text style={styles.guaranteeText}>
                  100% refund if the consultation doesn't meet your expectations. No questions asked.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Rating summary */}
            <View style={styles.ratingCard}>
              <View style={styles.ratingLeft}>
                <Text style={styles.ratingBig}>{doctor.averageRating}</Text>
                <View style={styles.starsRow}>{renderStars(doctor.averageRating)}</View>
                <Text style={styles.ratingCount}>{doctor.totalReviews} reviews</Text>
              </View>
              <View style={styles.ratingBars}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = doctor.ratingBreakdown[star as keyof typeof doctor.ratingBreakdown];
                  const pct = (count / doctor.totalReviews) * 100;
                  return (
                    <View key={star} style={styles.barRow}>
                      <Text style={styles.barLabel}>{star}</Text>
                      <Ionicons name="star" size={10} color="#f59e0b" />
                      <View style={styles.barBg}>
                        <View style={[styles.barFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={styles.barCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Reviews list */}
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {review.name[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.feeSection}>
          <Text style={styles.feeLabel}>Consultation Fee</Text>
          <Text style={styles.feeValue}>₹{doctor.fee}</Text>
        </View>
        <Pressable style={styles.bookBtn}>
          <Ionicons name="videocam" size={20} color={colors.white} />
          <Text style={styles.bookBtnText}>
            {doctor.isOnline ? 'Consult Now' : 'Schedule'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBg: { paddingTop: 60, paddingBottom: spacing['3xl'], borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginLeft: spacing.xl,
  },
  profileSection: { alignItems: 'center', marginTop: spacing.xl },
  avatarLarge: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarLargeText: { fontSize: 32, fontWeight: '800', color: colors.white },
  onlineBadgeLarge: {
    position: 'absolute', bottom: 2, right: 2, width: 20, height: 20,
    borderRadius: 10, backgroundColor: colors.success, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  doctorName: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.white, marginTop: spacing.md },
  doctorQualif: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  trustBadges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.md,
    paddingVertical: 6, borderRadius: radius.full,
  },
  badgeOnline: { backgroundColor: 'rgba(16,185,129,0.2)' },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.white },
  statsRow: {
    flexDirection: 'row', marginHorizontal: spacing.xl, marginTop: -24,
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: fontSize.base, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },
  tabs: {
    flexDirection: 'row', marginHorizontal: spacing.xl, marginTop: spacing.xl,
    backgroundColor: colors.gray100, borderRadius: radius.lg, padding: 4,
  },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.text },
  content: { paddingHorizontal: spacing.xl, marginTop: spacing.lg, gap: spacing.lg },
  card: {
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  bioText: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 24 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100,
  },
  infoLabel: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary },
  infoValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  guaranteeCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#e6f7f5', borderRadius: radius.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: '#99f6e4',
  },
  guaranteeTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.primaryDark },
  guaranteeText: { fontSize: fontSize.xs, color: colors.primary, marginTop: 2, lineHeight: 18 },
  ratingCard: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xl, gap: spacing.xl,
  },
  ratingLeft: { alignItems: 'center' },
  ratingBig: { fontSize: 44, fontWeight: '800', color: colors.text },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
  ratingCount: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 },
  ratingBars: { flex: 1, gap: 6, justifyContent: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  barLabel: { width: 12, fontSize: 11, fontWeight: '600', color: colors.textSecondary, textAlign: 'right' },
  barBg: { flex: 1, height: 6, backgroundColor: colors.gray100, borderRadius: 3 },
  barFill: { height: 6, backgroundColor: '#f59e0b', borderRadius: 3 },
  barCount: { width: 28, fontSize: 11, color: colors.textSecondary, textAlign: 'right' },
  reviewCard: {
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray200,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.gray600 },
  reviewName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  reviewDate: { fontSize: 10, color: colors.textSecondary },
  reviewStars: { flexDirection: 'row', gap: 1 },
  reviewComment: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.md, lineHeight: 20 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: 34,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray200,
  },
  feeSection: {},
  feeLabel: { fontSize: 11, color: colors.textSecondary },
  feeValue: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg, borderRadius: radius.lg,
  },
  bookBtnText: { fontSize: fontSize.base, fontWeight: '700', color: colors.white },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
});
