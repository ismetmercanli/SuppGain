import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { getApiErrorMessage } from '../../api/errors';
import { getProducts } from '../../api/productsApi';
import {
  consumeSupplementDose,
  createSupplementTracker,
  getSupplementDashboard,
} from '../../api/supplementTrackerApi';
import { AppText, Button, Card, Screen, TextInputField } from '../../components';
import type { AppStackParamList } from '../../navigation/types';
import { colors, radii, spacing } from '../../theme';
import type { DashboardIntakeRow, DashboardStockAlert, SupplementDashboard } from '../../types/supplementTracker';
import type { Product } from '../../types/product';

type Nav = NativeStackNavigationProp<AppStackParamList, 'SupplementTracking'>;

/* ── İkon seçici ── */
function intakeIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('omega') || n.includes('yağ') || n.includes('balık')) return '◆';
  if (n.includes('pre') || n.includes('workout') || n.includes('enerji')) return '⚡';
  if (n.includes('vitamin') || n.includes('multi')) return '◉';
  if (n.includes('kreatin') || n.includes('bcaa') || n.includes('protein') || n.includes('whey')) return '◇';
  return '●';
}

/* ── Tarih format ── */
function formatTrDate(yyyyMmDd: string): string {
  const parts = yyyyMmDd.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return yyyyMmDd;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatLoggedTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

/* ════════════════════════════════
   Alt bileşenler
════════════════════════════════ */

/* Compliance kartı */
function ComplianceCard({ dashboard }: { dashboard: SupplementDashboard }) {
  const pct = dashboard.compliancePercent;
  const last = dashboard.lastCompletedProductName;
  const summaryLine =
    dashboard.totalScheduledDoses === 0
      ? 'Henüz planlı doz yok. Yeni kayıt ekleyin.'
      : `${dashboard.completedDoses}/${dashboard.totalScheduledDoses} tamamlandı.${last ? ` Son: ${last}.` : ''}`;

  return (
    <Card variant="premium" style={compSt.wrap}>
      <View style={compSt.topRow}>
        <View>
          <View style={compSt.badge}>
            <AppText style={compSt.badgeText}>Canlı Panel</AppText>
          </View>
          {dashboard.localDate ? (
            <AppText style={compSt.date}>{formatTrDate(dashboard.localDate)}</AppText>
          ) : null}
        </View>
        <View style={compSt.pctBox}>
          <AppText style={compSt.pctNum}>{pct}%</AppText>
          <AppText style={compSt.pctLabel}>Günlük Uyum</AppText>
        </View>
      </View>

      {/* Progress bar */}
      <View style={compSt.barTrack}>
        <View style={[compSt.barFill, { width: `${Math.min(pct, 100)}%` as `${number}%` }]} />
      </View>

      <AppText style={compSt.summaryLine}>{summaryLine}</AppText>
    </Card>
  );
}

/* Intake satırı */
function IntakeRow({
  row,
  canConsume,
  isConsuming,
  onConsume,
}: {
  row: DashboardIntakeRow;
  canConsume: boolean;
  isConsuming: boolean;
  onConsume: () => void;
}) {
  const statusColor =
    row.status === 'completed'
      ? colors.secondary
      : row.status === 'due'
      ? colors.primaryStrong
      : colors.textSubtle;

  return (
    <View
      style={[
        intakeSt.row,
        row.status === 'completed' && intakeSt.rowDone,
        row.status === 'due' && intakeSt.rowDue,
      ]}
    >
      <View style={intakeSt.icon}>
        <AppText style={intakeSt.iconText}>{intakeIcon(row.productName)}</AppText>
      </View>

      <View style={intakeSt.body}>
        <AppText style={intakeSt.name} numberOfLines={1}>{row.productName}</AppText>
        <AppText style={intakeSt.meta}>
          {row.plannedTimeLocal}
          {row.contextHint ? ` · ${row.contextHint}` : ''}
          {row.isCompleted && row.loggedAtUtc
            ? ` · Kayıt: ${formatLoggedTime(row.loggedAtUtc)}`
            : ''}
        </AppText>
      </View>

      <View style={intakeSt.right}>
        {row.isCompleted ? (
          <View style={[intakeSt.statusPill, { borderColor: statusColor }]}>
            <AppText style={[intakeSt.statusText, { color: statusColor }]}>✓ Tamam</AppText>
          </View>
        ) : row.status === 'upcoming' ? (
          <View style={[intakeSt.statusPill, { borderColor: colors.textSubtle }]}>
            <AppText style={[intakeSt.statusText, { color: colors.textSubtle }]}>Bekliyor</AppText>
          </View>
        ) : null}

        {!row.isCompleted ? (
          <Pressable
            onPress={onConsume}
            disabled={!canConsume || isConsuming}
            style={[
              intakeSt.consumeBtn,
              (!canConsume || isConsuming) && intakeSt.consumeBtnDisabled,
            ]}
          >
            <AppText style={intakeSt.consumeTxt}>
              {isConsuming ? '...' : 'Tüket'}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/* Stok uyarı kartı */
function StockAlertCard({ alert }: { alert: DashboardStockAlert }) {
  const isUrgent = alert.severity === 'urgent';
  return (
    <View style={[stockSt.wrap, isUrgent && stockSt.wrapUrgent]}>
      <View style={[stockSt.badge, isUrgent ? stockSt.badgeUrgent : stockSt.badgeWarning]}>
        <AppText style={stockSt.badgeText}>{isUrgent ? 'ACİL' : 'UYARI'}</AppText>
      </View>
      <AppText style={stockSt.name}>{alert.productName}</AppText>
      <AppText style={stockSt.stock}>
        {Math.floor(alert.currentStock)} servis kaldı
      </AppText>
    </View>
  );
}

/* Yeni takip formu */
function NewTrackerForm({
  products,
  onSave,
  onCancel,
  isSaving,
  saveError,
}: {
  products: Product[];
  onSave: (p: {
    productId: string;
    dailyDosage: number;
    timesPerDay: number;
    currentStock: number;
    lowStockThreshold: number;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
  saveError: string | null;
}) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? '');
  const [dailyDosage, setDailyDosage] = useState('1');
  const [timesPerDay, setTimesPerDay] = useState('2');
  const [currentStock, setCurrentStock] = useState('30');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  function handleSubmit() {
    const d = Number(dailyDosage);
    const t = Number(timesPerDay);
    const s = Number(currentStock);
    const l = Number(lowStockThreshold);
    if (!selectedProductId || isNaN(d) || isNaN(t) || isNaN(s) || isNaN(l)) return;
    onSave({ productId: selectedProductId, dailyDosage: d, timesPerDay: t, currentStock: s, lowStockThreshold: l });
  }

  return (
    <Card variant="premium" style={formSt.wrap}>
      <AppText style={formSt.title}>Yeni Takip Kaydı</AppText>

      <AppText style={formSt.label}>Ürün Seç</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={formSt.chipRow}>
        {products.map((p) => {
          const active = p.id === selectedProductId;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelectedProductId(p.id)}
              style={[formSt.chip, active && formSt.chipActive]}
            >
              <AppText style={[formSt.chipTxt, active && formSt.chipTxtActive]} numberOfLines={1}>
                {p.name}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={formSt.twoCol}>
        <View style={formSt.half}>
          <TextInputField
            label="Günlük Doz"
            value={dailyDosage}
            onChangeText={setDailyDosage}
            keyboardType="numeric"
            placeholder="1"
          />
        </View>
        <View style={formSt.half}>
          <TextInputField
            label="Günde Kaç Kez"
            value={timesPerDay}
            onChangeText={setTimesPerDay}
            keyboardType="numeric"
            placeholder="2"
          />
        </View>
      </View>

      <View style={formSt.twoCol}>
        <View style={formSt.half}>
          <TextInputField
            label="Mevcut Stok (servis)"
            value={currentStock}
            onChangeText={setCurrentStock}
            keyboardType="numeric"
            placeholder="30"
          />
        </View>
        <View style={formSt.half}>
          <TextInputField
            label="Düşük Stok Eşiği"
            value={lowStockThreshold}
            onChangeText={setLowStockThreshold}
            keyboardType="numeric"
            placeholder="5"
          />
        </View>
      </View>

      {saveError ? <AppText style={formSt.error}>{saveError}</AppText> : null}

      <View style={formSt.actions}>
        <Button
          title={isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          disabled={isSaving || !selectedProductId}
          onPress={handleSubmit}
          style={formSt.actionBtn}
        />
        <Button title="İptal" variant="ghost" onPress={onCancel} style={formSt.actionBtn} />
      </View>
    </Card>
  );
}

/* ════════════════════════════════
   ANA EKRAN
════════════════════════════════ */
export function SupplementTrackingScreen() {
  const navigation = useNavigation<Nav>();

  const [dashboard, setDashboard] = useState<SupplementDashboard | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [consumingId, setConsumingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSavingTracker, setIsSavingTracker] = useState(false);
  const [trackerSaveError, setTrackerSaveError] = useState<string | null>(null);

  /* ── Yükle ── */
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await getSupplementDashboard();
      setDashboard(data);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  /* Ürünleri form açıldığında yükle */
  useEffect(() => {
    if (!showForm || products.length > 0) return;
    let cancelled = false;
    void getProducts({ isActive: true }).then((list) => {
      if (!cancelled) setProducts(list);
    });
    return () => { cancelled = true; };
  }, [showForm, products.length]);

  /* ── Doz tüket ── */
  async function handleConsume(row: DashboardIntakeRow) {
    if (row.doseAmount <= 0) return;
    setConsumingId(row.rowId);
    try {
      await consumeSupplementDose(row.trackerId, row.doseAmount);
      await loadDashboard();
    } catch (err) {
      Alert.alert('Hata', getApiErrorMessage(err));
    } finally {
      setConsumingId(null);
    }
  }

  /* ── Yeni takip kaydet ── */
  async function handleSaveTracker(payload: {
    productId: string;
    dailyDosage: number;
    timesPerDay: number;
    currentStock: number;
    lowStockThreshold: number;
  }) {
    setIsSavingTracker(true);
    setTrackerSaveError(null);
    try {
      await createSupplementTracker({
        ...payload,
        timesOfDayJson: '[]',
      });
      setShowForm(false);
      await loadDashboard();
    } catch (err) {
      setTrackerSaveError(getApiErrorMessage(err));
    } finally {
      setIsSavingTracker(false);
    }
  }

  const intakes = useMemo(() => dashboard?.intakes ?? [], [dashboard]);
  const stockAlerts = useMemo(() => dashboard?.stockAlerts ?? [], [dashboard]);

  /* O(n) önceden hesaplama: hangi rowId'ler tüketilebilir? */
  const consumableRowIds = useMemo<Set<string>>(() => {
    const completedPerTracker = new Map<string, number>();
    for (const row of intakes) {
      if (row.isCompleted) {
        completedPerTracker.set(row.trackerId, (completedPerTracker.get(row.trackerId) ?? 0) + 1);
      }
    }
    const result = new Set<string>();
    for (const row of intakes) {
      if (!row.isCompleted && row.slotIndex === (completedPerTracker.get(row.trackerId) ?? 0)) {
        result.add(row.rowId);
      }
    }
    return result;
  }, [intakes]);

  /* ── Yükleniyor ── */
  if (isLoading) {
    return (
      <Screen safeBottom contentStyle={st.center}>
        <ActivityIndicator color={colors.secondary} size="large" />
        <AppText variant="bodyMuted">Dashboard yükleniyor...</AppText>
      </Screen>
    );
  }

  /* ── Hata ── */
  if (errorMsg) {
    return (
      <Screen safeBottom contentStyle={st.center}>
        <Card variant="glass" style={st.center}>
          <AppText style={st.errorTxt}>{errorMsg}</AppText>
          <Button title="Tekrar Dene" variant="secondary" onPress={loadDashboard} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll safeBottom contentStyle={st.screen}>
      {/* Başlık */}
      <View style={st.header}>
        <Pressable onPress={() => navigation.goBack()} style={st.backBtn}>
          <AppText style={st.backTxt}>‹ Geri</AppText>
        </Pressable>
        <AppText variant="headline">Takviye Takibi</AppText>
      </View>

      {/* Compliance kartı */}
      {dashboard ? <ComplianceCard dashboard={dashboard} /> : null}

      {/* Yeni takip formu */}
      {showForm ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <NewTrackerForm
            products={products}
            isSaving={isSavingTracker}
            saveError={trackerSaveError}
            onSave={handleSaveTracker}
            onCancel={() => { setShowForm(false); setTrackerSaveError(null); }}
          />
        </KeyboardAvoidingView>
      ) : (
        <Button
          title="+ Yeni Takip Kaydı"
          variant="secondary"
          onPress={() => setShowForm(true)}
        />
      )}

      {/* Günlük alım listesi */}
      <View>
        <AppText style={st.sectionLabel}>GÜNLÜK ALIM LİSTESİ</AppText>

        {intakes.length === 0 ? (
          <Card variant="glass" style={st.emptyBox}>
            <AppText style={st.emptyTxt}>Aktif takip kaydı yok.</AppText>
            <AppText variant="bodyMuted" style={st.emptySubTxt}>
              Yukarıdaki "+ Yeni Takip Kaydı" butonuyla ürün ekleyin.
            </AppText>
          </Card>
        ) : (
          <View style={st.intakeList}>
            {intakes.map((row) => (
              <IntakeRow
                key={row.rowId}
                row={row}
                canConsume={consumableRowIds.has(row.rowId)}
                isConsuming={consumingId === row.rowId}
                onConsume={() => { void handleConsume(row); }}
              />
            ))}
          </View>
        )}
      </View>

      {/* Stok monitörü */}
      {stockAlerts.length > 0 ? (
        <View>
          <AppText style={st.sectionLabel}>STOK MONİTÖRÜ</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.stockRow}>
            {stockAlerts.map((alert) => (
              <StockAlertCard key={alert.trackerId} alert={alert} />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </Screen>
  );
}

/* ════════════════════════════════
   Stiller
════════════════════════════════ */

const st = StyleSheet.create({
  screen: { gap: spacing.md, paddingBottom: 80 },
  center: { alignItems: 'center', gap: spacing.md, flex: 1, justifyContent: 'center' },
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  backBtn: { alignSelf: 'flex-start' },
  backTxt: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  errorTxt: { color: colors.danger, fontWeight: '600', textAlign: 'center' },
  sectionLabel: {
    color: colors.textSubtle, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.sm,
  },
  intakeList: {
    borderRadius: radii.xl, borderWidth: 1, borderColor: colors.outlineSoft,
    backgroundColor: colors.surfaceDim, overflow: 'hidden',
  },
  emptyBox: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  emptyTxt: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  emptySubTxt: { textAlign: 'center' },
  stockRow: { gap: spacing.sm, paddingVertical: 4 },
});

const compSt = StyleSheet.create({
  wrap: { gap: spacing.sm },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badge: {
    alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radii.full, backgroundColor: 'rgba(78,222,163,0.15)',
    borderWidth: 1, borderColor: 'rgba(78,222,163,0.3)',
  },
  badgeText: { color: colors.secondaryDim, fontSize: 11, fontWeight: '800' },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  pctBox: { alignItems: 'flex-end' },
  pctNum: { color: colors.secondary, fontSize: 32, fontWeight: '800', lineHeight: 36 },
  pctLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  barTrack: {
    height: 6, borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: radii.full, backgroundColor: colors.secondary },
  summaryLine: { color: colors.textMuted, fontSize: 13 },
});

const intakeSt = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.outlineSoft,
  },
  rowDone: { backgroundColor: 'rgba(78,222,163,0.04)' },
  rowDue: { backgroundColor: 'rgba(149,211,186,0.06)' },
  icon: {
    width: 36, height: 36, borderRadius: radii.md,
    backgroundColor: 'rgba(149,211,186,0.12)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  iconText: { fontSize: 16 },
  body: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 13, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: 11 },
  right: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  statusPill: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radii.full, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  consumeBtn: {
    paddingHorizontal: spacing.sm, paddingVertical: 5,
    borderRadius: radii.md,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1, borderColor: colors.primary,
  },
  consumeBtnDisabled: { opacity: 0.38 },
  consumeTxt: { color: colors.primary, fontSize: 12, fontWeight: '700' },
});

const stockSt = StyleSheet.create({
  wrap: {
    width: 160, padding: spacing.md, borderRadius: radii.xl,
    backgroundColor: colors.surfaceDim,
    borderWidth: 1, borderColor: colors.outlineSoft, gap: spacing.xs,
  },
  wrapUrgent: { borderColor: 'rgba(255,100,100,0.3)', backgroundColor: 'rgba(255,100,100,0.05)' },
  badge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeWarning: { backgroundColor: 'rgba(255,200,0,0.15)' },
  badgeUrgent: { backgroundColor: 'rgba(255,100,100,0.18)' },
  badgeText: { fontSize: 9, fontWeight: '800', color: colors.danger, textTransform: 'uppercase' },
  name: { color: colors.text, fontSize: 13, fontWeight: '700' },
  stock: { color: colors.textMuted, fontSize: 12 },
});

const formSt = StyleSheet.create({
  wrap: { gap: spacing.md },
  title: { color: colors.primary, fontSize: 16, fontWeight: '800' },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipRow: { gap: spacing.xs, paddingVertical: 4 },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radii.full, backgroundColor: colors.surfaceLow,
    borderWidth: 1, borderColor: colors.outlineSoft, maxWidth: 180,
  },
  chipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  chipTxt: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  chipTxtActive: { color: colors.primary },
  twoCol: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  error: { color: colors.danger, fontWeight: '600', textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1 },
});
