import { PropsWithChildren } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: ViewStyle;
  /** Bottom safe area: tab ekranlarında false (tab bar handle eder), stack ekranlarında true */
  safeBottom?: boolean;
}> &
  ScrollViewProps;

export function Screen({
  children,
  scroll = false,
  contentStyle,
  safeBottom = false,
  ...scrollProps
}: ScreenProps) {
  const edges = safeBottom
    ? (['top', 'left', 'right', 'bottom'] as const)
    : (['top', 'left', 'right'] as const);

  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea} edges={edges}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.container,
    paddingVertical: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.container,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
