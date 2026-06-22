import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { AppText, BrandMark, Button, Card, Screen } from '../../components';
import { colors, radii, spacing } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.lightLeakTop} />
      <View style={styles.lightLeakBottom} />

      <View style={styles.brand}>
        <BrandMark size="large" />
        <AppText variant="bodyMuted" style={styles.subtitle}>
          Proaktif sağlık yolculuğunuz için hassas performans yakıtı.
        </AppText>
      </View>

      <Card variant="glass" style={styles.valueCard}>
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>Klinik Dereceli Formülasyonlar</AppText>
        </View>
        <AppText variant="headline">Takviyeni planla, sepetini yönet.</AppText>
        <AppText variant="bodyMuted">
          Ürünleri keşfet, haftalık programını oluştur ve siparişlerini mobilde
          takip et.
        </AppText>
      </Card>

      <View style={styles.actions}>
        <Button
          title="Hemen Başla"
          rightAccessory="→"
          onPress={() => navigation.navigate('Register')}
        />
        <Button
          title="Giriş Yap"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
        />
        <AppText variant="labelSmall" style={styles.legal}>
          Devam ederek SuppGain kullanım şartlarını kabul etmiş olursun.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.md,
  },
  subtitle: {
    maxWidth: 290,
    textAlign: 'center',
  },
  valueCard: {
    gap: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: 'rgba(111, 251, 190, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(111, 251, 190, 0.18)',
  },
  badgeText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    gap: spacing.md,
    alignItems: 'center',
  },
  legal: {
    maxWidth: 280,
    textAlign: 'center',
  },
  lightLeakTop: {
    position: 'absolute',
    top: -100,
    right: -90,
    width: 220,
    height: 220,
    borderRadius: radii.full,
    backgroundColor: 'rgba(176, 240, 214, 0.06)',
  },
  lightLeakBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: radii.full,
    backgroundColor: 'rgba(111, 251, 190, 0.08)',
  },
});
