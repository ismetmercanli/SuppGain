import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { getApiErrorMessage } from '../../api/errors';
import { createOrder } from '../../api/ordersApi';
import { getMyCart } from '../../api/cartApi';
import { AppText, Button, Card, Screen } from '../../components';
import { colors, radii, spacing } from '../../theme';
import type { Cart } from '../../types/cart';

/* ── Promo kodları ── */
const PROMO_CODES: Record<string, number> = {
  PER20: 0.2,
  SUPPGAIN10: 0.1,
};

function applyPromo(total: number, code: string): number {
  const rate = PROMO_CODES[code.trim().toUpperCase()];
  return rate != null ? Number((total * rate).toFixed(2)) : 0;
}

/* ── Ürün ikonu ── */
function productIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('protein') || n.includes('whey')) return '◇';
  if (n.includes('omega') || n.includes('balık')) return '◆';
  if (n.includes('vitamin')) return '◉';
  if (n.includes('kreatin')) return '◈';
  if (n.includes('pre') || n.includes('enerji')) return '⚡';
  if (n.includes('bcaa') || n.includes('amino')) return '◫';
  return '●';
}

/* ── Adım göstergesi ── */
function StepBar({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Sepet', 'Ödeme', 'Onay'];
  return (
    <View style={sb.wrap}>
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === step;
        const done = num < step;
        return (
          <View key={label} style={sb.stepGroup}>
            <View style={[sb.circle, (active || done) && sb.circleActive]}>
              <AppText style={[sb.circleNum, (active || done) && sb.circleNumActive]}>
                {done ? '✓' : String(num)}
              </AppText>
            </View>
            <AppText style={[sb.label, active && sb.labelActive]}>{label}</AppText>
            {i < steps.length - 1 ? <View style={[sb.line, done && sb.lineDone]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

/* ════════════════════════════════
   Ana Ekran
════════════════════════════════ */
export function CartScreen() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState('');
  const promoRef = useRef<TextInput>(null);

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getMyCart();
      setCart(data);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadCart(); }, [loadCart]));

  /* ── Promo uygula ── */
  function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) { setPromoError('Kod boş olamaz.'); return; }
    if (!PROMO_CODES[code]) { setPromoError(`"${code}" geçerli bir kod değil.`); return; }
    setAppliedPromo(code);
    setPromoError('');
    promoRef.current?.blur();
  }

  function handleRemovePromo() {
    setAppliedPromo('');
    setPromoInput('');
    setPromoError('');
  }

  /* ── İndirim hesapla ── */
  const { discountAmount, finalAmount } = useMemo(() => {
    if (!cart) return { discountAmount: 0, finalAmount: 0 };
    const discount = applyPromo(cart.totalAmount, appliedPromo);
    return { discountAmount: discount, finalAmount: cart.totalAmount - discount };
  }, [cart, appliedPromo]);

  /* ── Sipariş oluştur ── */
  async function handleOrder() {
    setIsOrdering(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await createOrder();
      setSuccessMessage('Siparişiniz başarıyla oluşturuldu!');
      setAppliedPromo('');
      setPromoInput('');
      await loadCart();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsOrdering(false);
    }
  }

  /* ── Adım durumu ── */
  const step: 1 | 2 | 3 = successMessage ? 3 : cart && cart.items.length > 0 ? 2 : 1;

  return (
    <Screen scroll contentStyle={st.screen}>

      {/* Başlık */}
      <View style={st.header}>
        <AppText variant="headline">◍ Sepetim</AppText>
        <StepBar step={step} />
      </View>

      {/* Yükleniyor */}
      {isLoading ? (
        <View style={st.center}>
          <ActivityIndicator color={colors.secondary} />
          <AppText variant="bodyMuted">Sepet yükleniyor...</AppText>
        </View>
      ) : null}

      {/* Hata */}
      {errorMessage ? (
        <Card variant="glass" style={st.center}>
          <AppText style={st.errorText}>{errorMessage}</AppText>
          <Button title="Tekrar Dene" variant="secondary" onPress={loadCart} />
        </Card>
      ) : null}

      {/* Başarı */}
      {successMessage ? (
        <Card variant="premium" style={st.successCard}>
          <AppText style={st.successIcon}>✓</AppText>
          <AppText style={st.successTitle}>Sipariş Alındı!</AppText>
          <AppText variant="bodyMuted" style={{ textAlign: 'center' }}>{successMessage}</AppText>
        </Card>
      ) : null}

      {/* Sepet içeriği */}
      {!isLoading && !errorMessage && cart ? (
        <>
          {cart.items.length === 0 ? (
            <Card variant="glass" style={st.emptyCard}>
              <AppText style={st.emptyIcon}>◍</AppText>
              <AppText style={st.emptyTitle}>Sepetiniz Boş</AppText>
              <AppText variant="bodyMuted" style={{ textAlign: 'center' }}>
                Ürünler ekranından takviye ekleyerek başlayın.
              </AppText>
            </Card>
          ) : (
            <>
              {/* Ürün listesi */}
              <View>
                <AppText style={st.sectionLabel}>
                  SİPARİŞİNİZ · {cart.items.length} ÜRÜN
                </AppText>
                <View style={st.itemList}>
                  <FlatList
                    data={cart.items}
                    keyExtractor={(item) => item.productId}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                      <View style={st.cartItem}>
                        <View style={st.itemIcon}>
                          <AppText style={st.itemIconTxt}>{productIcon(item.productName)}</AppText>
                        </View>
                        <View style={st.itemBody}>
                          <AppText style={st.itemName} numberOfLines={1}>{item.productName}</AppText>
                          <AppText style={st.itemUnit}>{formatPrice(item.unitPrice)} / adet</AppText>
                        </View>
                        <View style={st.itemRight}>
                          <View style={st.qtyBadge}>
                            <AppText style={st.qtyTxt}>x{item.quantity}</AppText>
                          </View>
                          <AppText style={st.lineTotal}>{formatPrice(item.lineTotal)}</AppText>
                        </View>
                      </View>
                    )}
                  />
                </View>
              </View>

              {/* Promo kod */}
              {!appliedPromo ? (
                <View style={st.promoWrap}>
                  <AppText style={st.sectionLabel}>İNDİRİM KODU</AppText>
                  <View style={st.promoRow}>
                    <TextInput
                      ref={promoRef}
                      style={st.promoInput}
                      value={promoInput}
                      onChangeText={(t) => { setPromoInput(t.toUpperCase()); setPromoError(''); }}
                      placeholder="Kod girin (örn. PER20)"
                      placeholderTextColor={colors.textSubtle}
                      autoCapitalize="characters"
                      returnKeyType="done"
                      onSubmitEditing={handleApplyPromo}
                    />
                    <Pressable onPress={handleApplyPromo} style={st.promoApplyBtn}>
                      <AppText style={st.promoApplyTxt}>Uygula</AppText>
                    </Pressable>
                  </View>
                  {promoError ? <AppText style={st.promoError}>{promoError}</AppText> : null}
                </View>
              ) : null}

              {/* Uygulanan promo */}
              {appliedPromo ? (
                <View style={st.promoApplied}>
                  <View style={st.promoAppliedLeft}>
                    <AppText style={st.promoAppliedIcon}>✓</AppText>
                    <AppText style={st.promoAppliedCode}>{appliedPromo}</AppText>
                    <AppText style={st.promoAppliedDesc}>
                      %{Math.round((PROMO_CODES[appliedPromo] ?? 0) * 100)} indirim uygulandı
                    </AppText>
                  </View>
                  <Pressable onPress={handleRemovePromo}>
                    <AppText style={st.promoRemove}>✕ Kaldır</AppText>
                  </Pressable>
                </View>
              ) : null}

              {/* Toplam / Ödeme kartı */}
              <Card variant="premium" style={st.totalCard}>
                <View style={st.totalLine}>
                  <AppText variant="bodyMuted">Ara Toplam</AppText>
                  <AppText style={st.totalSub}>{formatPrice(cart.totalAmount)}</AppText>
                </View>
                {discountAmount > 0 ? (
                  <View style={st.totalLine}>
                    <AppText style={st.discountLabel}>İndirim ({appliedPromo})</AppText>
                    <AppText style={st.discountAmt}>−{formatPrice(discountAmount)}</AppText>
                  </View>
                ) : null}
                <View style={st.divider} />
                <View style={st.totalLine}>
                  <AppText style={st.totalLbl}>Ödenecek Tutar</AppText>
                  <AppText style={st.totalFinal}>{formatPrice(finalAmount)}</AppText>
                </View>
                <Button
                  title={isOrdering ? '◍ Sipariş oluşturuluyor...' : '◍ Siparişi Onayla'}
                  disabled={isOrdering}
                  onPress={handleOrder}
                />
              </Card>
            </>
          )}
        </>
      ) : null}
    </Screen>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
}

/* ── Stiller ── */

const st = StyleSheet.create({
  screen: { gap: spacing.md, paddingBottom: spacing.xxxl },
  header: { gap: spacing.md },
  center: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  errorText: { color: colors.danger, fontWeight: '600', textAlign: 'center' },

  successCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  successIcon: { color: colors.secondary, fontSize: 40, lineHeight: 48 },
  successTitle: { color: colors.secondary, fontSize: 18, fontWeight: '800' },

  emptyCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  emptyIcon: { fontSize: 36, color: colors.textSubtle },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },

  sectionLabel: {
    color: colors.textSubtle, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.sm,
  },
  itemList: {
    borderRadius: radii.xl, borderWidth: 1, borderColor: colors.outlineSoft,
    backgroundColor: colors.surfaceDim, overflow: 'hidden',
  },
  cartItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.outlineSoft,
  },
  itemIcon: {
    width: 36, height: 36, borderRadius: radii.md,
    backgroundColor: 'rgba(149,211,186,0.1)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  itemIconTxt: { fontSize: 16, color: colors.primary },
  itemBody: { flex: 1, gap: 2 },
  itemName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  itemUnit: { color: colors.textMuted, fontSize: 11 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  qtyBadge: {
    paddingHorizontal: spacing.xs, paddingVertical: 2,
    borderRadius: radii.full, backgroundColor: 'rgba(111,251,190,0.12)',
  },
  qtyTxt: { color: colors.secondary, fontSize: 11, fontWeight: '700' },
  lineTotal: { color: colors.primaryStrong, fontSize: 13, fontWeight: '800' },

  promoWrap: { gap: spacing.xs },
  promoRow: { flexDirection: 'row', gap: spacing.sm },
  promoInput: {
    flex: 1, height: 48, paddingHorizontal: spacing.md,
    borderRadius: radii.md, borderWidth: 1, borderColor: colors.outline,
    backgroundColor: colors.surfaceContainer,
    color: colors.text, fontSize: 14, fontWeight: '700', letterSpacing: 1,
  },
  promoApplyBtn: {
    height: 48, paddingHorizontal: spacing.md,
    borderRadius: radii.md, borderWidth: 1, borderColor: colors.primary,
    backgroundColor: 'rgba(149,211,186,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  promoApplyTxt: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  promoError: { color: colors.danger, fontSize: 12, fontWeight: '600' },

  promoApplied: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radii.md, borderWidth: 1,
    borderColor: 'rgba(78,222,163,0.35)',
    backgroundColor: 'rgba(78,222,163,0.08)',
  },
  promoAppliedLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  promoAppliedIcon: { color: colors.secondary, fontSize: 14, fontWeight: '800' },
  promoAppliedCode: { color: colors.secondary, fontSize: 14, fontWeight: '800' },
  promoAppliedDesc: { color: colors.textMuted, fontSize: 12 },
  promoRemove: { color: colors.danger, fontSize: 12, fontWeight: '700' },

  totalCard: { gap: spacing.sm },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalSub: { color: colors.text, fontWeight: '600', fontSize: 15 },
  discountLabel: { color: colors.secondaryDim, fontSize: 13, fontWeight: '600' },
  discountAmt: { color: colors.secondaryDim, fontSize: 13, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.outlineSoft },
  totalLbl: { color: colors.text, fontSize: 16, fontWeight: '700' },
  totalFinal: { color: colors.secondary, fontSize: 22, fontWeight: '800' },
});

const sb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stepGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  circle: {
    width: 24, height: 24, borderRadius: radii.full,
    backgroundColor: colors.surfaceLow, borderWidth: 1, borderColor: colors.outline,
    alignItems: 'center', justifyContent: 'center',
  },
  circleActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  circleNum: { color: colors.textSubtle, fontSize: 10, fontWeight: '800' },
  circleNumActive: { color: colors.primary },
  label: { color: colors.textSubtle, fontSize: 11, fontWeight: '600' },
  labelActive: { color: colors.primary },
  line: { width: 20, height: 1, backgroundColor: colors.outlineSoft },
  lineDone: { backgroundColor: colors.primary },
});
