import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';
import { AppText } from './AppText';

type TextInputFieldProps = TextInputProps & {
  label: string;
  helperText?: string;
  leftAccessory?: string;
};

export function TextInputField({
  label,
  helperText,
  leftAccessory,
  style,
  placeholderTextColor = colors.textSubtle,
  ...props
}: TextInputFieldProps) {
  return (
    <View style={styles.wrapper}>
      <AppText variant="label">{label}</AppText>
      <View style={styles.inputFrame}>
        {leftAccessory ? (
          <AppText style={styles.accessory}>{leftAccessory}</AppText>
        ) : null}
        <TextInput
          placeholderTextColor={placeholderTextColor}
          style={[styles.input, style]}
          {...props}
        />
      </View>
      {helperText ? <AppText variant="labelSmall">{helperText}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  inputFrame: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
  },
  accessory: {
    color: colors.textSubtle,
  },
  input: {
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
});
