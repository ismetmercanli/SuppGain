import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '../theme';
import { AppText } from './AppText';

type BrandMarkProps = {
  size?: 'small' | 'large';
};

export function BrandMark({ size = 'small' }: BrandMarkProps) {
  const isLarge = size === 'large';

  return (
    <View style={styles.wrapper}>
      <View style={[styles.logo, isLarge && styles.logoLarge]}>
        <AppText style={[styles.logoText, isLarge && styles.logoTextLarge]}>
          SG
        </AppText>
      </View>
      <AppText variant={isLarge ? 'display' : 'headline'}>SuppGain</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(111, 251, 190, 0.3)',
    backgroundColor: 'rgba(111, 251, 190, 0.12)',
  },
  logoLarge: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
  },
  logoText: {
    color: colors.secondary,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  logoTextLarge: {
    fontSize: 20,
  },
});
