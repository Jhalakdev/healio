import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../../lib/theme';

export default function BookingsTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <Text style={styles.sub}>Booking history + active consultations</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  sub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm },
});
