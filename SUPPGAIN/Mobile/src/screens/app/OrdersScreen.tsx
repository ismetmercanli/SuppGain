import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { getApiErrorMessage } from '../../api/errors';
import { getMyOrders } from '../../api/ordersApi';
import { AppText, Button, Card, Screen } from '../../components';
import type { AppStackParamList } from '../../navigation/types';
import { colors, radii, spacing } from '../../theme';
import type { Order } from '../../types/order';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const STATUS_LABEL: Record<string, string> = {
  Pending: 'Beklemede',
  Processing: 'Hazırlanıyor',
  Shipped: 'Kargoda',
  Delivered: 'Teslim Edildi',
  Cancelled: 'İptal Edildi',
};

const STATUS_ICON: Record<string, string> = {
  Pending: '◌',
  Processing: '◎',
  Shipped: '▷',
  Delivered: '✓',
  Cancelled: '✕',
};

const STATUS_COLOR: Record<string, string> = {
  Pending: colors.textSubtle,
  Processing: colors.primaryStrong,
  Shipped: colors.primary,
  Delivered: colors.secondary,
  Cancelled: colors.danger,
};

export function OrdersScreen() {
  const navigation = useNavigation<Nav>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadOrders(); }, [loadOrders]));

  return (
    <Screen scroll contentStyle={styles.screen}>
      <AppText variant="headline">▣ Siparişlerim</AppText>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.secondary} />
          <AppText variant="bodyMuted">Siparişler yükleniyor...</AppText>
        </View>
      ) : null}

      {errorMessage ? (
        <Card variant="glass" style={styles.center}>
          <AppText style={styles.errorText}>{errorMessage}</AppText>
          <Button title="Tekrar Dene" variant="secondary" onPress={loadOrders} />
        </Card>
      ) : null}

      {!isLoading && !errorMessage ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.orderId}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Card variant="glass" style={styles.center}>
              <AppText variant="bodyMuted">Henüz siparişiniz yok.</AppText>
            </Card>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.orderId })}
              style={({ pressed }) => pressed && styles.pressed}
            >
            <Card variant="premium" style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderNoWrap}>
                  <AppText style={styles.orderNo}>
                    #{item.orderId.slice(0, 8).toUpperCase()}
                  </AppText>
                  <AppText style={styles.orderDate}>
                    {new Date(item.createdAtUtc).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </AppText>
                </View>
                <View style={styles.rightGroup}>
                  <View
                    style={[
                      styles.statusBadge,
                      { borderColor: STATUS_COLOR[item.status] ?? colors.outline },
                    ]}
                  >
                    <AppText
                      style={[
                        styles.statusText,
                        { color: STATUS_COLOR[item.status] ?? colors.textMuted },
                      ]}
                    >
                      {STATUS_ICON[item.status] ?? '◌'} {STATUS_LABEL[item.status] ?? item.status}
                    </AppText>
                  </View>
                  <AppText style={styles.chevron}>›</AppText>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.orderMeta}>
                <View style={styles.lineItems}>
                  {item.items.slice(0, 2).map((line) => (
                    <View key={line.productId} style={styles.lineItem}>
                      <AppText style={styles.lineDot}>·</AppText>
                      <AppText variant="bodyMuted" numberOfLines={1} style={styles.flex1}>
                        {line.productName}
                      </AppText>
                      <AppText style={styles.lineQty}>×{line.quantity}</AppText>
                    </View>
                  ))}
                  {item.items.length > 2 ? (
                    <AppText style={styles.moreItems}>+{item.items.length - 2} ürün daha</AppText>
                  ) : null}
                </View>
                <AppText style={styles.amount}>{formatPrice(item.totalAmount)}</AppText>
              </View>
            </Card>
            </Pressable>
          )}
        />
      ) : null}
    </Screen>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
}

const styles = StyleSheet.create({
  screen: { gap: spacing.md },
  center: { alignItems: 'center', gap: spacing.md },
  errorText: { color: colors.danger, fontWeight: '600', textAlign: 'center' },
  separator: { height: spacing.sm },
  orderCard: { gap: spacing.sm },

  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNoWrap: { gap: 3 },
  orderNo: { color: colors.text, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  orderDate: { color: colors.textMuted, fontSize: 11 },
  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  chevron: { color: colors.textSubtle, fontSize: 20, lineHeight: 22 },

  divider: { height: 1, backgroundColor: colors.outlineSoft },

  orderMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: spacing.sm },
  lineItems: { flex: 1, gap: 3 },
  lineItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lineDot: { color: colors.textSubtle, fontSize: 12 },
  lineQty: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  moreItems: { color: colors.textSubtle, fontSize: 11, fontStyle: 'italic' },
  amount: { color: colors.secondary, fontWeight: '800', fontSize: 16, flexShrink: 0 },

  flex1: { flex: 1 },
  pressed: { opacity: 0.75 },
});
