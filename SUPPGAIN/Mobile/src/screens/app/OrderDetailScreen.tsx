import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { getApiErrorMessage } from '../../api/errors';
import { getOrderById } from '../../api/ordersApi';
import { AppText, Button, Card, Screen } from '../../components';
import type { AppStackParamList } from '../../navigation/types';
import { colors, radii, spacing } from '../../theme';
import type { Order } from '../../types/order';

type Props = NativeStackScreenProps<AppStackParamList, 'OrderDetail'>;
type Nav = NativeStackNavigationProp<AppStackParamList>;

const STATUS_LABEL: Record<string, string> = {
  Pending: 'Beklemede',
  Processing: 'Hazırlanıyor',
  Shipped: 'Kargoda',
  Delivered: 'Teslim Edildi',
  Cancelled: 'İptal Edildi',
};

const STATUS_COLOR: Record<string, string> = {
  Pending: colors.textSubtle,
  Processing: colors.primaryStrong,
  Shipped: colors.primary,
  Delivered: colors.secondary,
  Cancelled: colors.danger,
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
}

export function OrderDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const data = await getOrderById(orderId);
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (!cancelled) setErrorMsg(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [orderId]);

  return (
    <Screen scroll safeBottom contentStyle={styles.screen}>
      {/* Başlık */}
      <View style={styles.header}>
        <Button
          title="‹ Geri"
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <AppText variant="headline">Sipariş Detayı</AppText>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.secondary} size="large" />
          <AppText variant="bodyMuted">Yükleniyor...</AppText>
        </View>
      ) : errorMsg ? (
        <Card variant="glass" style={styles.center}>
          <AppText style={styles.errorText}>{errorMsg}</AppText>
          <Button title="Geri Dön" variant="secondary" onPress={() => navigation.goBack()} />
        </Card>
      ) : order ? (
        <>
          {/* Sipariş özeti */}
          <Card variant="premium" style={styles.summaryCard}>
            <View style={styles.orderTop}>
              <View>
                <AppText style={styles.orderNo}>
                  #{order.orderId.slice(0, 8).toUpperCase()}
                </AppText>
                <AppText variant="bodyMuted">
                  {new Date(order.createdAtUtc).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </AppText>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { borderColor: STATUS_COLOR[order.status] ?? colors.outline },
                ]}
              >
                <AppText
                  style={[
                    styles.statusText,
                    { color: STATUS_COLOR[order.status] ?? colors.textMuted },
                  ]}
                >
                  {STATUS_LABEL[order.status] ?? order.status}
                </AppText>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <AppText variant="bodyMuted">Toplam Tutar</AppText>
              <AppText style={styles.totalAmount}>{formatPrice(order.totalAmount)}</AppText>
            </View>
          </Card>

          {/* Ürünler */}
          <View>
            <AppText style={styles.sectionLabel}>SİPARİŞ KALEMLERİ</AppText>
            <View style={styles.itemList}>
              {order.items.map((item) => (
                <View key={item.productId} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <AppText style={styles.itemName} numberOfLines={2}>
                      {item.productName}
                    </AppText>
                    <AppText style={styles.itemUnit}>
                      {formatPrice(item.unitPrice)} / adet
                    </AppText>
                  </View>
                  <View style={styles.itemRight}>
                    <View style={styles.qtyBadge}>
                      <AppText style={styles.qtyText}>x{item.quantity}</AppText>
                    </View>
                    <AppText style={styles.lineTotal}>{formatPrice(item.lineTotal)}</AppText>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Toplam özet */}
          <Card variant="glass" style={styles.totalCard}>
            <View style={styles.totalRow}>
              <AppText variant="bodyMuted">
                {order.items.reduce((sum, i) => sum + i.quantity, 0)} ürün
              </AppText>
              <AppText style={styles.totalFinal}>{formatPrice(order.totalAmount)}</AppText>
            </View>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.md, paddingBottom: spacing.xxxl },
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  center: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  errorText: { color: colors.danger, fontWeight: '600', textAlign: 'center' },

  summaryCard: { gap: spacing.md },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNo: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.outlineSoft },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalAmount: { color: colors.secondary, fontSize: 20, fontWeight: '800' },

  sectionLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  itemList: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineSoft,
    backgroundColor: colors.surfaceDim,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineSoft,
    gap: spacing.sm,
  },
  itemLeft: { flex: 1, gap: 3 },
  itemName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  itemUnit: { color: colors.textMuted, fontSize: 12 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  qtyBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: 'rgba(111,251,190,0.1)',
  },
  qtyText: { color: colors.secondary, fontSize: 12, fontWeight: '700' },
  lineTotal: { color: colors.primary, fontSize: 14, fontWeight: '800' },

  totalCard: { gap: spacing.xs },
  totalFinal: { color: colors.secondary, fontSize: 18, fontWeight: '800' },
});
