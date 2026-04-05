import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { api } from '../../lib/api';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Other'];

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  useEffect(() => {
    api('/users/me').then((p: any) => {
      setName(p?.name || '');
      setDob(p?.dob ? new Date(p.dob).toISOString().split('T')[0] : '');
      setGender(p?.gender || '');
      setHeight(p?.height || '');
      setWeight(p?.weight || '');
      setBloodGroup(p?.bloodGroup || '');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!name) return Alert.alert('Error', 'Name is required');
    setSaving(true);
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name || undefined,
          dob: dob || undefined,
          gender: gender || undefined,
          height: height || undefined,
          weight: weight || undefined,
          bloodGroup: bloodGroup || undefined,
        }),
      });
      Alert.alert('Success', 'Profile updated');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update');
    }
    setSaving(false);
  };

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.gray400} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="1995-06-15" placeholderTextColor={colors.gray400} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipRow}>
            {genders.map((g) => (
              <Pressable key={g} style={[styles.chip, gender === g && styles.chipActive]} onPress={() => setGender(g)}>
                <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Height</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} placeholder="175 cm" placeholderTextColor={colors.gray400} />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Weight</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="70 kg" placeholderTextColor={colors.gray400} />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Blood Group</Text>
          <View style={styles.chipRow}>
            {bloodGroups.map((bg) => (
              <Pressable key={bg} style={[styles.chip, bloodGroup === bg && styles.chipActive]} onPress={() => setBloodGroup(bg)}>
                <Text style={[styles.chipText, bloodGroup === bg && styles.chipTextActive]}>{bg}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  form: { paddingHorizontal: 20 },
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  input: { height: 50, borderRadius: 14, backgroundColor: '#f1f5f9', paddingHorizontal: 16, fontSize: 15, color: colors.text },
  row: { flexDirection: 'row', gap: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: '#e6f7f5', borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.gray500 },
  chipTextActive: { color: colors.primary },
  saveBtn: { height: 54, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
