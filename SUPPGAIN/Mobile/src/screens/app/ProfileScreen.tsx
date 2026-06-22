import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { getApiErrorMessage } from '../../api/errors';
import { deleteMyProfile, getMyProfile, updateMyProfile } from '../../api/profileApi';
import { AppText, Button, Card, Screen, TextInputField } from '../../components';
import { useAuth } from '../../context/AuthContext';
import type { AppStackParamList } from '../../navigation/types';
import { colors, radii, spacing } from '../../theme';
import type { UpdateProfileRequest, UserProfile } from '../../types/profile';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type Mode = 'view' | 'edit';

/* ────────────────────────────────
   Alt bileşenler
──────────────────────────────── */

function StatBox({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={statStyles.box}>
      <AppText style={statStyles.label}>{label}</AppText>
      <AppText style={statStyles.value}>{value}</AppText>
      <AppText style={statStyles.unit}>{unit}</AppText>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  labelColor,
  iconBg,
  iconColor,
  badge,
  onPress,
  noBorder,
}: {
  icon: string;
  label: string;
  labelColor?: string;
  iconBg: string;
  iconColor: string;
  badge?: string;
  onPress?: () => void;
  noBorder?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        menuStyles.row,
        !noBorder && menuStyles.rowBorder,
        pressed && menuStyles.rowPressed,
      ]}
    >
      <View style={styles.menuLeft}>
        <View style={[menuStyles.iconBox, { backgroundColor: iconBg }]}>
          <AppText style={[menuStyles.iconText, { color: iconColor }]}>{icon}</AppText>
        </View>
        <AppText style={[menuStyles.rowLabel, labelColor ? { color: labelColor } : null]}>
          {label}
        </AppText>
      </View>
      <View style={menuStyles.rowRight}>
        {badge ? (
          <View style={menuStyles.badge}>
            <AppText style={menuStyles.badgeText}>{badge}</AppText>
          </View>
        ) : null}
        <AppText style={[menuStyles.chevron, labelColor ? { color: labelColor } : null]}>
          ›
        </AppText>
      </View>
    </Pressable>
  );
}

/* ────────────────────────────────
   Ana ekran
──────────────────────────────── */

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('view');

  /* edit form state */
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadProfile(); }, [loadProfile]));

  /* Düzenle moduna geç → formu doldur */
  function openEditMode() {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setEmail(profile.email);
    setPhone(profile.phone ?? '');
    setAge(profile.age != null ? String(profile.age) : '');
    setHeightCm(profile.heightCm != null ? String(profile.heightCm) : '');
    setWeightKg(profile.weightKg != null ? String(profile.weightKg) : '');
    setSaveError(null);
    setSaveSuccess(false);
    setMode('edit');
  }

  /* Kaydet */
  async function handleSave() {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setSaveError('Ad, soyad ve e-posta zorunludur.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const payload: UpdateProfileRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        age: age ? Number(age) : null,
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
      };
      const updated = await updateMyProfile(payload);
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setMode('view');
        setSaveSuccess(false);
      }, 1200);
    } catch (err) {
      setSaveError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  /* Hesap sil */
  function handleDeleteAccount() {
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz. Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMyProfile();
              await signOut();
            } catch (err) {
              Alert.alert('Hata', getApiErrorMessage(err));
            }
          },
        },
      ],
    );
  }

  /* Çıkış */
  function handleSignOut() {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: signOut },
    ]);
  }

  /* ── Yükleniyor ── */
  if (isLoading) {
    return (
      <Screen contentStyle={styles.center}>
        <ActivityIndicator color={colors.secondary} size="large" />
        <AppText variant="bodyMuted">Profil yükleniyor...</AppText>
      </Screen>
    );
  }

  /* ── Hata ── */
  if (errorMessage) {
    return (
      <Screen contentStyle={styles.center}>
        <Card variant="glass" style={styles.center}>
          <AppText style={styles.errorText}>{errorMessage}</AppText>
          <Button title="Tekrar Dene" variant="secondary" onPress={loadProfile} />
        </Card>
      </Screen>
    );
  }

  if (!profile) return null;

  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase();

  /* ════════════════════════════════
     DÜZENLEME MODU
  ════════════════════════════════ */
  if (mode === 'edit') {
    return (
      <Screen scroll contentStyle={styles.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          {/* Başlık */}
          <View style={styles.editHeader}>
            <Pressable onPress={() => setMode('view')} style={styles.backBtn}>
              <AppText style={styles.backText}>‹ Geri</AppText>
            </Pressable>
            <AppText variant="headline">Profili Düzenle</AppText>
          </View>

          <Card variant="premium" style={styles.editCard}>
            <View style={styles.nameRow}>
              <View style={styles.half}>
                <TextInputField label="Ad" value={firstName} onChangeText={setFirstName} placeholder="Ad" />
              </View>
              <View style={styles.half}>
                <TextInputField label="Soyad" value={lastName} onChangeText={setLastName} placeholder="Soyad" />
              </View>
            </View>

            <TextInputField
              label="E-posta"
              leftAccessory="@"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="isim@ornek.com"
            />
            <TextInputField
              label="Telefon"
              leftAccessory="+"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="05xx xxx xx xx"
            />
          </Card>

          {/* Sağlık bilgileri */}
          <Card variant="default" style={styles.editCard}>
            <AppText style={styles.sectionLabel}>SAĞLIK BİLGİLERİ</AppText>

            <View style={styles.nameRow}>
              <View style={styles.half}>
                <TextInputField label="Yaş" value={age} onChangeText={setAge} keyboardType="numeric" placeholder="32" />
              </View>
              <View style={styles.half}>
                <TextInputField label="Boy (cm)" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" placeholder="175" />
              </View>
            </View>
            <TextInputField
              label="Kilo (kg)"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="numeric"
              placeholder="70"
            />
          </Card>

          {saveError ? <AppText style={styles.errorText}>{saveError}</AppText> : null}
          {saveSuccess ? <AppText style={styles.successText}>Profil güncellendi!</AppText> : null}

          <Button
            title={isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            disabled={isSaving}
            onPress={handleSave}
          />
          <Button title="İptal" variant="ghost" onPress={() => setMode('view')} />
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  /* ════════════════════════════════
     GÖRÜNTÜLEME MODU
  ════════════════════════════════ */
  return (
    <Screen scroll contentStyle={styles.screen}>
      {/* ── Avatar + Ad ── */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarText}>{initials}</AppText>
          </View>
          {/* Düzenle butonu (sağ alt köşe) */}
          <Pressable style={styles.editAvatarBtn} onPress={openEditMode}>
            <AppText style={styles.editAvatarIcon}>✎</AppText>
          </Pressable>
        </View>

        <AppText variant="title" style={styles.profileName}>
          {profile.firstName} {profile.lastName}
        </AppText>
        <AppText variant="bodyMuted">{profile.email}</AppText>

        {profile.role?.toLowerCase() === 'admin' ? (
          <View style={styles.adminBadge}>
            <AppText style={styles.adminText}>Admin</AppText>
          </View>
        ) : null}
      </View>

      {/* ── Sağlık Grid ── */}
      <View>
        <AppText style={styles.sectionLabel}>SAĞLIK PROFİLİ</AppText>
        <View style={styles.statsRow}>
          <StatBox label="Yaş" value={profile.age ? String(profile.age) : '—'} unit="yıl" />
          <StatBox label="Boy" value={profile.heightCm ? String(profile.heightCm) : '—'} unit="cm" />
          <StatBox label="Kilo" value={profile.weightKg ? String(profile.weightKg) : '—'} unit="kg" />
        </View>
      </View>

      {/* ── Menü ── */}
      <View>
        <AppText style={styles.sectionLabel}>GENEL</AppText>
        <View style={styles.menuCard}>
          <MenuRow
            icon="✎"
            label="Profili Düzenle"
            iconBg="rgba(149,211,186,0.15)"
            iconColor={colors.primary}
            onPress={openEditMode}
          />
          <MenuRow
            icon="◎"
            label="Takviye Takibi"
            iconBg="rgba(78,222,163,0.15)"
            iconColor={colors.secondary}
            onPress={() => navigation.navigate('SupplementTracking')}
          />
          <MenuRow
            icon="◷"
            label="Haftalık Program"
            iconBg="rgba(149,211,186,0.12)"
            iconColor={colors.secondaryDim}
            onPress={() => navigation.navigate('WeeklyProgram')}
          />
          {profile.role?.toLowerCase() === 'admin' ? (
            <MenuRow
              icon="⚙"
              label="Ürün Yönetimi"
              iconBg="rgba(255,180,171,0.12)"
              iconColor={colors.danger}
              onPress={() => navigation.navigate('AdminProducts')}
            />
          ) : null}
          <MenuRow
            icon="→"
            label="Çıkış Yap"
            labelColor={colors.danger}
            iconBg="rgba(255,100,100,0.12)"
            iconColor={colors.danger}
            onPress={handleSignOut}
            noBorder
          />
        </View>
      </View>

      {/* ── Hesap Sil ── */}
      <View>
        <AppText style={styles.sectionLabel}>TEHLİKELİ BÖLGE</AppText>
        <View style={styles.menuCard}>
          <MenuRow
            icon="⊗"
            label="Hesabı Sil"
            labelColor={colors.danger}
            iconBg="rgba(255,100,100,0.12)"
            iconColor={colors.danger}
            onPress={handleDeleteAccount}
            noBorder
          />
        </View>
      </View>
    </Screen>
  );
}

/* ────────────────────────────────
   Stiller
──────────────────────────────── */

const styles = StyleSheet.create({
  screen: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  center: { alignItems: 'center', gap: spacing.md, flex: 1, justifyContent: 'center' },
  errorText: { color: colors.danger, fontWeight: '600', textAlign: 'center' },
  successText: { color: colors.secondaryDim, fontWeight: '700', textAlign: 'center' },

  avatarSection: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md },
  avatarWrap: { position: 'relative', marginBottom: spacing.xs },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontSize: 32, fontWeight: '800' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarIcon: { color: colors.surface, fontSize: 14, fontWeight: '700' },
  profileName: { fontSize: 20, fontWeight: '700' },
  adminBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: 'rgba(111,251,190,0.12)',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  adminText: { color: colors.secondary, fontSize: 11, fontWeight: '700' },

  sectionLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },

  menuCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineSoft,
    backgroundColor: colors.surfaceDim,
    overflow: 'hidden',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },

  editHeader: { gap: spacing.xs, paddingTop: spacing.sm },
  backBtn: { alignSelf: 'flex-start' },
  backText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  editCard: { gap: spacing.md },
  nameRow: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  keyboardView: { gap: spacing.md },
});

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineSoft,
    backgroundColor: colors.surfaceLow,
  },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '500' },
  value: { color: colors.primary, fontSize: 22, fontWeight: '800', lineHeight: 26 },
  unit: { color: colors.textSubtle, fontSize: 11, fontWeight: '500' },
});

const menuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineSoft,
  },
  rowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 16 },
  rowLabel: { color: colors.text, fontSize: 15, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  chevron: { color: colors.textSubtle, fontSize: 20, lineHeight: 22 },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: colors.secondaryContainer,
  },
  badgeText: { color: colors.secondaryDim, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
});
