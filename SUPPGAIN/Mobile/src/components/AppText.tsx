import { StyleSheet, Text, TextProps } from 'react-native';

import { colors, typography } from '../theme';

type AppTextVariant =
  | 'display'
  | 'headlineLarge'
  | 'headline'
  | 'title'
  | 'body'
  | 'bodyMuted'
  | 'label'
  | 'labelSmall';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
};

export function AppText({ variant = 'body', style, ...props }: AppTextProps) {
  return <Text style={[styles.base, styles[variant], style]} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
  display: {
    ...typography.display,
    color: colors.secondary,
  },
  headlineLarge: {
    ...typography.headlineLarge,
    color: colors.primary,
  },
  headline: {
    ...typography.headlineMobile,
    color: colors.primary,
  },
  title: {
    ...typography.headlineMedium,
  },
  body: {
    ...typography.body,
  },
  bodyMuted: {
    ...typography.body,
    color: colors.textMuted,
  },
  label: {
    ...typography.label,
  },
  labelSmall: {
    ...typography.labelSmall,
    color: colors.textSubtle,
  },
});
