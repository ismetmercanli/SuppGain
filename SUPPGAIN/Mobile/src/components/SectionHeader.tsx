import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <AppText variant="title">{title}</AppText>
      {actionLabel ? (
        <Pressable onPress={onActionPress}>
          <AppText style={styles.action}>{actionLabel}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  action: {
    color: colors.primary,
    fontWeight: '700',
  },
});
