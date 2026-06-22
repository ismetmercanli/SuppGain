import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
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
  autoCreateWeeklyProgram,
  createWeeklyProgram,
  deleteWeeklyProgram,
  getMyWeeklyPrograms,
  updateWeeklyProgram,
} from '../../api/weeklyProgramApi';
import { AppText, Button, Card, Screen, TextInputField } from '../../components';
import type { AppStackParamList } from '../../navigation/types';
import { colors, radii, spacing } from '../../theme';
import type { Product } from '../../types/product';
import type { WeeklyManualScheduleItem, WeeklyProgram } from '../../types/weeklyProgram';

type Nav = NativeStackNavigationProp<AppStackParamList, 'WeeklyProgram'>;
type ScreenMode = 'list' | 'create' | 'detail' | 'edit';

/* ── Sabitler ── */
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const DAY_SHORT = ['Pzt', 'Sal', 'Çrş', 'Prş', 'Cum', 'Cts', 'Paz'];
const SLOTS = ['Sabah', 'Öğle', 'Akşam', 'Gece'];

const SLOT_COLORS: Record<string, string> = {
  Sabah: colors.primaryStrong,
  Öğle: colors.secondaryDim,
  Akşam: colors.primary,
  Gece: colors.textMuted,
};
const CATEGORY_BG: Record<string, string> = {
  Protein: 'rgba(78,222,163,0.12)',
  Kreatin: 'rgba(149,211,186,0.12)',
  Vitamin: 'rgba(175,206,186,0.12)',
  'Pre-Workout': 'rgba(255,180,171,0.12)',
  Omega: 'rgba(111,251,190,0.1)',
};
function getCategoryBg(cat: string) { return CATEGORY_BG[cat] ?? 'rgba(255,255,255,0.06)'; }

/* ── Manuel satır tipi ── */
type ManualEntry = {
  localId: string;
  day: string;
  slot: string;
  productId: string;
  productName: string;
  category: string;
  dosage: string;
  note: string;
};

function makeEntryId() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }

function emptyEntry(products: Product[]): ManualEntry {
  const p = products[0];
  return {
    localId: makeEntryId(),
    day: DAYS[0],
    slot: SLOTS[0],
    productId: p?.id ?? '',
    productName: p?.name ?? '',
    category: p?.category ?? '',
    dosage: '1 doz',
    note: '',
  };
}

function buildContentJson(entries: ManualEntry[]): string {
  const schedule: WeeklyManualScheduleItem[] = entries.map((e) => ({
    day: e.day,
    slot: e.slot,
    productId: e.productId,
    productName: e.productName,
    category: e.category,
    dosage: e.dosage.trim() || '1 doz',
    note: e.note.trim(),
  }));
  return JSON.stringify(schedule);
}

function parseContentJson(contentJson: string): WeeklyManualScheduleItem[] {
  try {
    const raw = JSON.parse(contentJson);
    if (Array.isArray(raw)) return raw as WeeklyManualScheduleItem[];
    /* web formatı: { schedule: [...] } */
    if (raw && Array.isArray(raw.schedule)) return raw.schedule as WeeklyManualScheduleItem[];
    return [];
  } catch { return []; }
}

function scheduleToEntries(items: WeeklyManualScheduleItem[]): ManualEntry[] {
  return items.map((item) => ({
    localId: makeEntryId(),
    day: item.day,
    slot: item.slot,
    productId: item.productId,
    productName: item.productName,
    category: item.category,
    dosage: item.dosage,
    note: item.note,
  }));
}

/* ═══════════════════════════════════
   Alt bileşenler
═══════════════════════════════════ */

function SupplementRow({ item }: { item: WeeklyManualScheduleItem }) {
  return (
    <View style={itemSt.row}>
      <View style={[itemSt.dot, { backgroundColor: SLOT_COLORS[item.slot] ?? colors.primary }]} />
      <View style={itemSt.info}>
        <View style={sh.rowHead}>
          <AppText style={itemSt.name}>{item.productName}</AppText>
          <View style={[itemSt.catBadge, { backgroundColor: getCategoryBg(item.category) }]}>
            <AppText style={itemSt.catText}>{item.category}</AppText>
          </View>
        </View>
        <View style={sh.rowHead}>
          <AppText style={itemSt.dosage}>{item.dosage}</AppText>
          {item.note ? <AppText style={itemSt.note}>{item.note}</AppText> : null}
        </View>
      </View>
    </View>
  );
}

function SlotGroup({ slot, items }: { slot: string; items: WeeklyManualScheduleItem[] }) {
  if (items.length === 0) return null;
  return (
    <View style={slotSt.wrap}>
      <View style={slotSt.header}>
        <View style={[slotSt.dot, { backgroundColor: SLOT_COLORS[slot] ?? colors.primary }]} />
        <AppText style={slotSt.label}>{slot}</AppText>
      </View>
      {items.map((item, i) => <SupplementRow key={`${item.productId}-${i}`} item={item} />)}
    </View>
  );
}

/* ── Ürün seçici chip-scroll ── */
function ProductPicker({
  products,
  value,
  onChange,
}: {
  products: Product[];
  value: string;
  onChange: (p: Product) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sh.chipRow}>
      {products.map((p) => {
        const active = p.id === value;
        return (
          <Pressable
            key={p.id}
            onPress={() => onChange(p)}
            style={[sh.chip, active && sh.chipActive]}
          >
            <AppText style={[sh.chipText, active && sh.chipTextActive]} numberOfLines={1}>
              {p.name}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ── Gün / Slot seçici chip-scroll ── */
function ChipPicker({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sh.chipRow}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable key={opt} onPress={() => onChange(opt)} style={[sh.chip, active && sh.chipActive]}>
            <AppText style={[sh.chipText, active && sh.chipTextActive]}>{opt}</AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ── Tek manuel satır kartı ── */
function EntryCard({
  entry,
  products,
  onChange,
  onRemove,
  index,
}: {
  entry: ManualEntry;
  products: Product[];
  onChange: (field: keyof ManualEntry, val: string) => void;
  onRemove: () => void;
  index: number;
}) {
  return (
    <View style={entrySt.wrap}>
      <View style={entrySt.header}>
        <AppText style={entrySt.num}>{index + 1}. Takviye</AppText>
        <Pressable onPress={onRemove} style={entrySt.removeBtn} hitSlop={8}>
          <AppText style={entrySt.removeTxt}>✕</AppText>
        </Pressable>
      </View>

      <AppText style={sh.label}>Ürün</AppText>
      {products.length > 0 ? (
        <ProductPicker
          products={products}
          value={entry.productId}
          onChange={(p) => {
            onChange('productId', p.id);
            onChange('productName', p.name);
            onChange('category', p.category);
          }}
        />
      ) : (
        <TextInputField
          label=""
          value={entry.productName}
          onChangeText={(v) => onChange('productName', v)}
          placeholder="Ürün adı"
        />
      )}

      <AppText style={[sh.label, { marginTop: spacing.sm }]}>Gün</AppText>
      <ChipPicker options={DAYS} value={entry.day} onChange={(v) => onChange('day', v)} />

      <AppText style={[sh.label, { marginTop: spacing.sm }]}>Zaman Dilimi</AppText>
      <ChipPicker options={SLOTS} value={entry.slot} onChange={(v) => onChange('slot', v)} />

      <View style={sh.twoCol}>
        <View style={sh.half}>
          <TextInputField
            label="Doz"
            value={entry.dosage}
            onChangeText={(v) => onChange('dosage', v)}
            placeholder="1 doz"
          />
        </View>
        <View style={sh.half}>
          <TextInputField
            label="Not (isteğe bağlı)"
            value={entry.note}
            onChangeText={(v) => onChange('note', v)}
            placeholder="Kahvaltı ile"
          />
        </View>
      </View>
    </View>
  );
}

/* ── Program listesi kartı ── */
function ProgramCard({
  program, onPress, onDelete,
}: { program: WeeklyProgram; onPress: () => void; onDelete: () => void }) {
  const items = parseContentJson(program.contentJson);
  const dayCount = new Set(items.map((i) => i.day)).size;
  const date = new Date(program.createdAtUtc).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [cardSt.wrap, pressed && cardSt.pressed]}>
      <View style={cardSt.topRow}>
        <View style={cardSt.iconBox}><AppText style={cardSt.icon}>📅</AppText></View>
        <View style={cardSt.meta}>
          <AppText style={cardSt.title}>{program.title}</AppText>
          <AppText style={cardSt.date}>{date}</AppText>
        </View>
        <Pressable onPress={(e) => { e.stopPropagation(); onDelete(); }} style={cardSt.delBtn} hitSlop={8}>
          <AppText style={cardSt.delTxt}>✕</AppText>
        </Pressable>
      </View>
      <View style={cardSt.stats}>
        <View style={cardSt.statChip}><AppText style={cardSt.statTxt}>{dayCount} gün</AppText></View>
        <View style={cardSt.statChip}><AppText style={cardSt.statTxt}>{items.length} takviye</AppText></View>
      </View>
    </Pressable>
  );
}

/* ═══════════════════════════════════
   ANA EKRAN
═══════════════════════════════════ */
export function WeeklyProgramScreen() {
  const navigation = useNavigation<Nav>();

  /* ── Veriler ── */
  const [programs, setPrograms] = useState<WeeklyProgram[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ── Ekran modu ── */
  const [mode, setMode] = useState<ScreenMode>('list');
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /* ── Detay/düzenleme ── */
  const [selectedProgram, setSelectedProgram] = useState<WeeklyProgram | null>(null);
  const [activeDay, setActiveDay] = useState(0);

  /* ── Form (create & edit) ── */
  const [formTitle, setFormTitle] = useState('');
  const [entries, setEntries] = useState<ManualEntry[]>([]);

  /* ── Yükle ── */
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [progs, prods] = await Promise.all([
        getMyWeeklyPrograms(),
        getProducts({ isActive: true }),
      ]);
      setPrograms(progs);
      setProducts(prods);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Otomatik oluştur ── */
  async function handleAutoCreate() {
    setIsAutoCreating(true);
    try {
      const prog = await autoCreateWeeklyProgram({ title: 'Haftalık Programım' });
      setPrograms((prev) => [prog, ...prev]);
      openDetail(prog);
    } catch (err) {
      Alert.alert('Hata', getApiErrorMessage(err));
    } finally {
      setIsAutoCreating(false);
    }
  }

  /* ── Manuel oluştur moduna geç ── */
  function openCreate() {
    setFormTitle('Haftalık Manuel Programım');
    setEntries(products.length > 0 ? [emptyEntry(products)] : []);
    setSaveError(null);
    setMode('create');
  }

  /* ── Düzenleme moduna geç ── */
  function openEdit(program: WeeklyProgram) {
    const items = parseContentJson(program.contentJson);
    setFormTitle(program.title);
    setEntries(items.length > 0 ? scheduleToEntries(items) : (products.length > 0 ? [emptyEntry(products)] : []));
    setSaveError(null);
    setMode('edit');
  }

  /* ── Detay görünümüne geç ── */
  function openDetail(program: WeeklyProgram) {
    setSelectedProgram(program);
    setActiveDay(0);
    setMode('detail');
  }

  /* ── Sil ── */
  function handleDelete(program: WeeklyProgram) {
    Alert.alert('Programı Sil', `"${program.title}" programını silmek istediğinize emin misiniz?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          try {
            await deleteWeeklyProgram(program.programId);
            setPrograms((prev) => prev.filter((p) => p.programId !== program.programId));
            if (selectedProgram?.programId === program.programId) setMode('list');
          } catch (err) { Alert.alert('Hata', getApiErrorMessage(err)); }
        },
      },
    ]);
  }

  /* ── Kaydet (create) ── */
  async function handleCreate() {
    if (!formTitle.trim()) { setSaveError('Program başlığı zorunludur.'); return; }
    if (entries.length === 0) { setSaveError('En az bir takviye satırı ekleyin.'); return; }
    setIsSaving(true);
    setSaveError(null);
    try {
      const prog = await createWeeklyProgram({
        title: formTitle.trim(),
        contentJson: buildContentJson(entries),
      });
      setPrograms((prev) => [prog, ...prev]);
      openDetail(prog);
    } catch (err) {
      setSaveError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  /* ── Kaydet (edit) ── */
  async function handleUpdate() {
    if (!selectedProgram) return;
    if (!formTitle.trim()) { setSaveError('Program başlığı zorunludur.'); return; }
    if (entries.length === 0) { setSaveError('En az bir takviye satırı ekleyin.'); return; }
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await updateWeeklyProgram(selectedProgram.programId, {
        title: formTitle.trim(),
        contentJson: buildContentJson(entries),
      });
      setPrograms((prev) => prev.map((p) => (p.programId === updated.programId ? updated : p)));
      setSelectedProgram(updated);
      setMode('detail');
    } catch (err) {
      setSaveError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  /* ── Entry yardımcıları ── */
  function addEntry() {
    setEntries((prev) => [...prev, emptyEntry(products)]);
  }
  function removeEntry(localId: string) {
    setEntries((prev) => prev.filter((e) => e.localId !== localId));
  }
  function updateEntry(localId: string, field: keyof ManualEntry, val: string) {
    setEntries((prev) => prev.map((e) => (e.localId === localId ? { ...e, [field]: val } : e)));
  }

  /* ═══════════ YÜKLENIYOR ════════════ */
  if (isLoading) {
    return (
      <Screen safeBottom contentStyle={st.center}>
        <ActivityIndicator color={colors.secondary} size="large" />
        <AppText variant="bodyMuted">Yükleniyor...</AppText>
      </Screen>
    );
  }

  /* ═══════════ HATA ════════════ */
  if (errorMsg && mode === 'list') {
    return (
      <Screen safeBottom contentStyle={st.center}>
        <Card variant="glass" style={st.center}>
          <AppText style={st.errorTxt}>{errorMsg}</AppText>
          <Button title="Tekrar Dene" variant="secondary" onPress={loadAll} />
        </Card>
      </Screen>
    );
  }

  /* ═══════════ FORM (create / edit) ════════════ */
  if (mode === 'create' || mode === 'edit') {
    const isEdit = mode === 'edit';
    return (
      <Screen scroll safeBottom contentStyle={st.screen}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={sh.kav}>
          {/* Başlık */}
          <View style={st.header}>
            <Pressable
              onPress={() => (isEdit ? setMode('detail') : setMode('list'))}
              style={st.backBtn}
            >
              <AppText style={st.backTxt}>‹ Geri</AppText>
            </Pressable>
            <AppText variant="headline">
              {isEdit ? 'Programı Düzenle' : 'Manuel Program Oluştur'}
            </AppText>
          </View>

          {/* Program başlığı */}
          <Card variant="premium" style={sh.card}>
            <TextInputField
              label="Program Başlığı"
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="Haftalık Manuel Programım"
            />
          </Card>

          {/* Takviye satırları */}
          <View style={st.entriesWrap}>
            <AppText style={sh.sectionLabel}>TAKVİYE PLANI</AppText>
            {entries.map((entry, idx) => (
              <EntryCard
                key={entry.localId}
                entry={entry}
                products={products}
                index={idx}
                onChange={(field, val) => updateEntry(entry.localId, field, val)}
                onRemove={() => removeEntry(entry.localId)}
              />
            ))}
            <Button
              title="+ Takviye Satırı Ekle"
              variant="secondary"
              onPress={addEntry}
            />
          </View>

          {saveError ? <AppText style={st.errorTxt}>{saveError}</AppText> : null}

          <Button
            title={isSaving ? 'Kaydediliyor...' : (isEdit ? 'Değişiklikleri Kaydet' : 'Programı Oluştur')}
            disabled={isSaving}
            onPress={isEdit ? handleUpdate : handleCreate}
          />
          <Button
            title="İptal"
            variant="ghost"
            onPress={() => (isEdit ? setMode('detail') : setMode('list'))}
          />
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  /* ═══════════ DETAY ════════════ */
  if (mode === 'detail' && selectedProgram) {
    const detailItems = parseContentJson(selectedProgram.contentJson);
    const currentDayName = DAYS[activeDay];
    const dayItems = detailItems.filter((i) => i.day === currentDayName);
    const slotGroups = ['Sabah', 'Öğle', 'Akşam', 'Gece'].map((slot) => ({
      slot,
      items: dayItems.filter((i) => i.slot === slot),
    }));

    return (
      <Screen scroll safeBottom contentStyle={st.screen}>
        {/* Başlık */}
        <View style={st.header}>
          <Pressable onPress={() => setMode('list')} style={st.backBtn}>
            <AppText style={st.backTxt}>‹ Geri</AppText>
          </Pressable>
          <AppText variant="headline">Haftalık Program</AppText>
        </View>

        {/* Program başlık kartı */}
        <Card variant="premium" style={sh.card}>
          <View style={st.titleRow}>
            <View style={st.titleMeta}>
              <AppText style={st.progTitle}>{selectedProgram.title}</AppText>
              <AppText variant="bodyMuted">
                {new Date(selectedProgram.createdAtUtc).toLocaleDateString('tr-TR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </AppText>
            </View>
            <Pressable onPress={() => openEdit(selectedProgram)} style={st.editIcon}>
              <AppText style={st.editIconTxt}>✎</AppText>
            </Pressable>
          </View>
          <View style={st.statsRow}>
            <View style={st.statChip}>
              <AppText style={st.statChipTxt}>
                {new Set(detailItems.map((i) => i.day)).size} gün
              </AppText>
            </View>
            <View style={st.statChip}>
              <AppText style={st.statChipTxt}>{detailItems.length} takviye</AppText>
            </View>
          </View>
        </Card>

        {/* Gün sekmeleri */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.dayTabs}>
          {DAYS.map((day, idx) => {
            const hasItems = detailItems.some((i) => i.day === day);
            const isActive = idx === activeDay;
            return (
              <Pressable
                key={day}
                onPress={() => setActiveDay(idx)}
                style={[st.dayTab, isActive && st.dayTabActive, hasItems && !isActive && st.dayTabHasItems]}
              >
                <AppText style={[st.dayTabTxt, isActive && st.dayTabTxtActive]}>
                  {DAY_SHORT[idx]}
                </AppText>
                {hasItems ? <View style={[st.dayDot, isActive && st.dayDotActive]} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Gün içeriği */}
        <View style={st.dayContent}>
          {dayItems.length === 0 ? (
            <Card variant="glass" style={st.emptyDay}>
              <AppText style={st.emptyDayTxt}>Bu gün için takviye planlanmamış.</AppText>
              <Button
                title="Programı Düzenle"
                variant="secondary"
                onPress={() => openEdit(selectedProgram)}
                style={{ marginTop: spacing.sm }}
              />
            </Card>
          ) : (
            slotGroups.map(({ slot, items }) =>
              items.length > 0 ? <SlotGroup key={slot} slot={slot} items={items} /> : null,
            )
          )}
        </View>
      </Screen>
    );
  }

  /* ═══════════ LİSTE ════════════ */
  return (
    <Screen scroll safeBottom contentStyle={st.screen}>
      {/* Başlık */}
      <View style={st.header}>
        <Pressable onPress={() => navigation.goBack()} style={st.backBtn}>
          <AppText style={st.backTxt}>‹ Geri</AppText>
        </Pressable>
        <AppText variant="headline">Haftalık Program</AppText>
      </View>

      {programs.length === 0 ? (
        /* Boş durum */
        <View style={st.emptyWrap}>
          <AppText style={st.emptyEmoji}>📋</AppText>
          <AppText variant="title" style={st.emptyTitle}>Henüz Program Yok</AppText>
          <AppText variant="bodyMuted" style={st.emptySub}>
            Satın aldığın ürünlere göre otomatik program oluşturabilir ya da kendi programını manuel girebilirsin.
          </AppText>
          <Button
            title={isAutoCreating ? 'Oluşturuluyor...' : '✦  Otomatik Oluştur'}
            disabled={isAutoCreating}
            onPress={handleAutoCreate}
          />
          <Button
            title="✎  Manuel Program Oluştur"
            variant="secondary"
            onPress={openCreate}
          />
        </View>
      ) : (
        <>
          {/* Program listesi */}
          {programs.map((p) => (
            <ProgramCard
              key={p.programId}
              program={p}
              onPress={() => openDetail(p)}
              onDelete={() => handleDelete(p)}
            />
          ))}

          {/* Alt butonlar */}
          <Button
            title={isAutoCreating ? 'Oluşturuluyor...' : '+ Otomatik Program'}
            variant="secondary"
            disabled={isAutoCreating}
            onPress={handleAutoCreate}
          />
          <Button
            title="✎  Manuel Program Oluştur"
            variant="ghost"
            onPress={openCreate}
          />
        </>
      )}
    </Screen>
  );
}

/* ═══════════════════════════════════
   Stiller
═══════════════════════════════════ */

const st = StyleSheet.create({
  screen: { gap: spacing.md, paddingBottom: 80 },
  center: { alignItems: 'center', gap: spacing.md, flex: 1, justifyContent: 'center' },
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  backBtn: { alignSelf: 'flex-start' },
  backTxt: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  errorTxt: { color: colors.danger, fontWeight: '600', textAlign: 'center' },

  /* List empty */
  emptyWrap: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { textAlign: 'center' },
  emptySub: { textAlign: 'center', lineHeight: 22 },

  /* Entries */
  entriesWrap: { gap: spacing.sm },

  /* Detail */
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  titleMeta: { flex: 1, gap: 4 },
  progTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  editIcon: {
    width: 32, height: 32, borderRadius: radii.full,
    backgroundColor: 'rgba(149,211,186,0.15)',
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  editIconTxt: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: spacing.xs, marginTop: 2 },
  statChip: {
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: 'rgba(149,211,186,0.1)',
    borderWidth: 1, borderColor: colors.outlineSoft,
  },
  statChipTxt: { color: colors.primary, fontSize: 11, fontWeight: '600' },
  dayTabs: { gap: spacing.xs, paddingVertical: spacing.xs },
  dayTab: {
    alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radii.full, backgroundColor: colors.surfaceLow,
    borderWidth: 1, borderColor: colors.outlineSoft, minWidth: 48,
  },
  dayTabActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  dayTabHasItems: { borderColor: 'rgba(149,211,186,0.3)' },
  dayTabTxt: { color: colors.textSubtle, fontSize: 12, fontWeight: '600' },
  dayTabTxtActive: { color: colors.primary },
  dayDot: { width: 5, height: 5, borderRadius: radii.full, backgroundColor: colors.textSubtle, marginTop: 2 },
  dayDotActive: { backgroundColor: colors.primary },
  dayContent: { gap: spacing.sm },
  emptyDay: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyDayTxt: { color: colors.textMuted, fontSize: 14 },
});

/* Paylaşılan kısa stiller */
const sh = StyleSheet.create({
  kav: { gap: spacing.md },
  card: { gap: spacing.sm },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  sectionLabel: {
    color: colors.textSubtle, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipRow: { gap: spacing.xs, paddingVertical: 4 },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radii.full, backgroundColor: colors.surfaceLow,
    borderWidth: 1, borderColor: colors.outlineSoft, maxWidth: 160,
  },
  chipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: colors.primary },
  twoCol: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
});

const entrySt = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceDim, borderRadius: radii.xl,
    borderWidth: 1, borderColor: colors.outlineSoft,
    padding: spacing.md, gap: spacing.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  num: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  removeBtn: {
    width: 28, height: 28, borderRadius: radii.full,
    backgroundColor: 'rgba(255,100,100,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  removeTxt: { color: colors.danger, fontSize: 12, fontWeight: '700' },
});

const cardSt = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceDim, borderRadius: radii.xl,
    borderWidth: 1, borderColor: colors.outlineSoft,
    padding: spacing.md, gap: spacing.sm,
  },
  pressed: { opacity: 0.75 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: {
    width: 44, height: 44, borderRadius: radii.md,
    backgroundColor: 'rgba(149,211,186,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  meta: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: 15, fontWeight: '700' },
  date: { color: colors.textSubtle, fontSize: 12 },
  delBtn: {
    width: 30, height: 30, borderRadius: radii.full,
    backgroundColor: 'rgba(255,100,100,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  delTxt: { color: colors.danger, fontSize: 13, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: spacing.xs },
  statChip: {
    paddingHorizontal: spacing.xs, paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: 'rgba(149,211,186,0.08)',
    borderWidth: 1, borderColor: colors.outlineSoft,
  },
  statTxt: { color: colors.primary, fontSize: 11, fontWeight: '600' },
});

const slotSt = StyleSheet.create({
  wrap: {
    gap: spacing.xs, backgroundColor: colors.surfaceDim,
    borderRadius: radii.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.outlineSoft,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
});

const itemSt = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    paddingVertical: spacing.xs, borderTopWidth: 1, borderTopColor: colors.outlineSoft,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  info: { flex: 1, gap: 3 },
  name: { color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  dosage: { color: colors.textMuted, fontSize: 12 },
  note: { color: colors.textSubtle, fontSize: 11, fontStyle: 'italic' },
  catBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: radii.full },
  catText: { color: colors.primary, fontSize: 10, fontWeight: '600' },
});
