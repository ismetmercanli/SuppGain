import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { colors, radii, shadows, spacing } from '../theme';

type CardVariant = 'default' | 'premium' | 'glass';

type CardProps = PropsWithChildren<
  ViewProps & {
    variant?: CardVariant;
  }
>;

export function Card({
  children,
  variant = 'default',
  style,
  ...props
}: CardProps) {
  return (
    <View style={[styles.base, styles[variant], style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineSoft,
  },
  default: {
    backgroundColor: colors.surfaceLow,
  },
  premium: {
    backgroundColor: colors.surfaceContainer,
    ...shadows.card,
  },
  glass: {
    backgroundColor: 'rgba(149, 211, 186, 0.08)',
    borderColor: 'rgba(149, 211, 186, 0.16)',
  },
});
