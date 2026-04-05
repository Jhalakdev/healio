import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { api } from '../../lib/api';

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
const ratingEmojis = ['', '😞', '😐', '🙂', '😊', '🤩'];

export default function RateDoctor() {
  const { bookingId, doctorName } = useLocalSearchParams<{ bookingId: string; doctorName: string }>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const quickTags = [
    'Very professional',
    'Patient & caring',
    'Clear explanation',
    'Quick response',
    'Effective treatment',
    'Good follow-up',
  ];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const submit = async () => {
    if (rating === 0) return Alert.alert('Please select a rating');
    if (!bookingId) return Alert.alert('Error', 'No booking ID provided');

    setSubmitting(true);
    try {
      const fullComment = [
        ...selectedTags.map((t) => `✓ ${t}`),
        comment,
      ].filter(Boolean).join('\n');

      await api(`/reviews/${bookingId}`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          comment: fullComment || undefined,
          isAnonymous,
        }),
      });
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.thankYou}>
          <LinearGradient colors={['#0d9488', '#059669']} style={styles.thankIcon}>
            <Ionicons name="heart" size={48} color={colors.white} />
          </LinearGradient>
          <Text style={styles.thankTitle}>Thank You!</Text>
          <Text style={styles.thankText}>
            Your feedback helps other patients and helps doctors improve their service.
          </Text>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Rate your experience</Text>
        <Text style={styles.subtitle}>
          How was your consultation with {doctorName || 'the doctor'}?
        </Text>
      </View>

      {/* Star rating */}
      <View style={styles.ratingSection}>
        <Text style={styles.emoji}>{rating > 0 ? ratingEmojis[rating] : '⭐'}</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)} style={styles.starBtn}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#f59e0b' : colors.gray300}
              />
            </Pressable>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>
        )}
      </View>

      {/* Quick tags */}
      {rating > 0 && (
        <View style={styles.tagsSection}>
          <Text style={styles.tagsTitle}>What went well?</Text>
          <View style={styles.tagsGrid}>
            {quickTags.map((tag) => (
              <Pressable
                key={tag}
                style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
                onPress={() => toggleTag(tag)}
              >
                {selectedTags.includes(tag) && (
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                )}
                <Text
                  style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}
                >
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Comment */}
      {rating > 0 && (
        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>Add a comment (optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your experience to help other patients..."
            placeholderTextColor={colors.gray400}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />
        </View>
      )}

      {/* Anonymous toggle */}
      {rating > 0 && (
        <View style={styles.anonRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.anonLabel}>Post anonymously</Text>
            <Text style={styles.anonSub}>Your name won't be shown</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ true: colors.primary, false: colors.gray300 }}
          />
        </View>
      )}

      {/* Submit */}
      {rating > 0 && (
        <Pressable style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={submit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>Submit Review</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing['2xl'] },
  back: { marginTop: 60, width: 40 },
  header: { marginTop: spacing['2xl'] },
  title: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.sm },
  ratingSection: { alignItems: 'center', marginTop: spacing['3xl'] },
  emoji: { fontSize: 48, marginBottom: spacing.md },
  starsRow: { flexDirection: 'row', gap: spacing.md },
  starBtn: { padding: 4 },
  ratingLabel: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  tagsSection: { marginTop: spacing['2xl'] },
  tagsTitle: { fontSize: fontSize.base, fontWeight: '600', color: colors.text, marginBottom: spacing.md },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderRadius: radius.full, backgroundColor: colors.gray100,
    borderWidth: 1, borderColor: 'transparent',
  },
  tagSelected: { backgroundColor: '#e6f7f5', borderColor: colors.primary },
  tagText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' },
  tagTextSelected: { color: colors.primary, fontWeight: '600' },
  commentSection: { marginTop: spacing.xl },
  commentLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  commentInput: {
    height: 100, backgroundColor: colors.gray100, borderRadius: radius.lg,
    padding: spacing.lg, fontSize: fontSize.base, color: colors.text,
  },
  anonRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl,
    backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.lg,
  },
  anonLabel: { fontSize: fontSize.base, fontWeight: '600', color: colors.text },
  anonSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  submitBtn: {
    marginTop: spacing['2xl'], height: 56, borderRadius: radius.lg,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  submitBtnText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.white },
  thankYou: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  thankIcon: {
    width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  thankTitle: { fontSize: fontSize['3xl'], fontWeight: '800', color: colors.text },
  thankText: {
    fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center',
    marginTop: spacing.md, paddingHorizontal: spacing['3xl'], lineHeight: 22,
  },
  doneBtn: {
    marginTop: spacing['2xl'], paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.primary,
  },
  doneBtnText: { fontSize: fontSize.base, fontWeight: '700', color: colors.white },
});
