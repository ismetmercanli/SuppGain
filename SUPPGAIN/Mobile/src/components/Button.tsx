import { Pressable, PressableProps, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '../theme';
import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  rightAccessory?: string;
};

export function Button({
  title,
  variant = 'primary',
  fullWidth = true,
  rightAccessory,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const labelStyle = labelStyles[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      disabled={disabled}
      {...props}
    >
      <View style={styles.content}>
        <AppText style={[styles.label, labelStyle]}>{title}</AppText>
        {rightAccessory ? (
          <AppText style={[styles.label, labelStyle]}>{rightAccessory}</AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  secondary: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  ghost: {
    backgroundColor: colors.transparent,
    borderColor: 'rgba(111, 251, 190, 0.22)',
  },
  danger: {
    backgroundColor: colors.dangerContainer,
    borderColor: colors.dangerContainer,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontWeight: '700',
  },
});

const labelStyles = StyleSheet.create({
  primary: {
    color: colors.surface,
  },
  secondary: {
    color: colors.primary,
  },
  ghost: {
    color: colors.secondary,
  },
  danger: {
    color: colors.white,
  },
});
