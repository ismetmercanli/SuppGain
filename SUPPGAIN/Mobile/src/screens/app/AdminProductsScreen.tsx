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
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../../api/productsApi';
import { AppText, Button, Card, Screen, TextInputField } from '../../components';
import type { AppStackParamList } from '../../navigation/types';
import { colors, radii, spacing } from '../../theme';
import type { Product, SaveProductRequest } from '../../types/product';

type Nav = NativeStackNavigationProp<AppStackParamList, 'AdminProducts'>;
type Mode = 'list' | 'add' | 'edit';

const CATEGORIES = ['Protein', 'Kreatin', 'Vitamin', 'Pre-Workout', 'Omega', 'Diğer'];

const CATEGORY_COLORS: Record<string, string> = {
  Protein: colors.secondaryDim,
  Kreatin: colors.primary,
  Vitamin: colors.primaryStrong,
  'Pre-Workout': colors.danger,
  Omega: colors.secondary,
  Diğer: colors.textMuted,
};

/* ── Form başlangıç değerleri ── */
const emptyForm = (): SaveProductRequest => ({
  name: '',
  description: '',
  imageUrl: '',
  price: 0,
  stock: 0,
  category: 'Protein',
  isActive: true,
});

/* ── Ürün listesi satırı ── */
function ProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={rowStyles.wrap}>
      <View style={rowStyles.left}>
        <View style={rowStyles.top}>
          <AppText style={rowStyles.name} numberOfLines={1}>
            {product.name}
          </AppText>
          <View
            style={[
              rowStyles.catBadge,
              { backgroundColor: `${CATEGORY_COLORS[product.category] ?? colors.textMuted}22` },
            ]}
          >
            <AppText
              style={[
                rowStyles.catText,
                { color: CATEGORY_COLORS[product.category] ?? colors.textMuted },
              ]}
            >
              {product.category}
            </AppText>
          </View>
        </View>
        <View style={rowStyles.meta}>
          <AppText style={rowStyles.price}>
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
              product.price,
            )}
          </AppText>
          <AppText style={rowStyles.stock}>Stok: {product.stock}</AppText>
          {!product.isActive ? (
            <View style={rowStyles.inactiveBadge}>
              <AppText style={rowStyles.inactiveText}>Pasif</AppText>
            </View>
          ) : null}
        </View>
      </View>
      <View style={rowStyles.actions}>
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => [rowStyles.actionBtn, rowStyles.editBtn, pressed && { opacity: 0.7 }]}
        >
          <AppText style={rowStyles.editBtnText}>✎</AppText>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [rowStyles.actionBtn, rowStyles.deleteBtn, pressed && { opacity: 0.7 }]}
        >
          <AppText style={rowStyles.deleteBtnText}>✕</AppText>
        </Pressable>
      </View>
    </View>
  );
}

/* ── Kategori seçici ── */
function CategoryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (cat: string) => void;
}) {
  return (
    <View style={pickerStyles.wrap}>
      <AppText style={pickerStyles.label}>Kategori</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pickerStyles.row}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => onChange(cat)}
            style={[pickerStyles.chip, value === cat && pickerStyles.chipActive]}
          >
            <AppText style={[pickerStyles.chipText, value === cat && pickerStyles.chipTextActive]}>
              {cat}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

/* ── Aktiflik toggle ── */
function ActiveToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={toggleStyles.wrap}>
      <AppText style={toggleStyles.label}>Durum</AppText>
      <View style={toggleStyles.row}>
        <Pressable
          onPress={() => onChange(true)}
          style={[toggleStyles.btn, value && toggleStyles.btnActive]}
        >
          <AppText style={[toggleStyles.btnText, value && toggleStyles.btnTextActive]}>
            Aktif
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => onChange(false)}
          style={[toggleStyles.btn, !value && toggleStyles.btnDanger]}
        >
          <AppText style={[toggleStyles.btnText, !value && toggleStyles.btnTextDanger]}>
            Pasif
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

/* ════════════════════════════════
   ANA EKRAN
════════════════════════════════ */
export function AdminProductsScreen() {
  const navigation = useNavigation<Nav>();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  /* Form alanları */
  const [form, setForm] = useState<SaveProductRequest>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /* ── Ürünleri yükle ── */
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await getProducts({});
      setProducts(data);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /* ── Ürün ekleme moduna geç ── */
  function openAdd() {
    setForm(emptyForm());
    setSaveError(null);
    setEditingProduct(null);
    setMode('add');
  }

  /* ── Ürün düzenleme moduna geç ── */
  function openEdit(product: Product) {
    setForm({
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl ?? '',
      price: product.price,
      stock: product.stock,
      category: product.category,
      isActive: product.isActive,
    });
    setSaveError(null);
    setEditingProduct(product);
    setMode('edit');
  }

  /* ── Form validasyon ── */
  function validateForm(): string | null {
    if (!form.name.trim()) return 'Ürün adı zorunludur.';
    if (!form.description.trim()) return 'Açıklama zorunludur.';
    if (form.price <= 0) return 'Fiyat 0\'dan büyük olmalıdır.';
    if (form.stock < 0) return 'Stok negatif olamaz.';
    if (!form.category) return 'Kategori seçiniz.';
    return null;
  }

  /* ── Kaydet (ekle veya güncelle) ── */
  async function handleSave() {
    const validationError = validateForm();
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload: SaveProductRequest = {
        ...form,
        imageUrl: form.imageUrl?.trim() || null,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      if (mode === 'edit' && editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      setMode('list');
    } catch (err) {
      setSaveError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  /* ── Sil ── */
  function handleDelete(product: Product) {
    Alert.alert(
      'Ürünü Sil',
      `"${product.name}" ürününü silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch (err) {
              Alert.alert('Hata', getApiErrorMessage(err));
            }
          },
        },
      ],
    );
  }

  /* ── Form field setter yardımcısı ── */
  function setField<K extends keyof SaveProductRequest>(key: K, value: SaveProductRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ════════════
     FORM MODU (Ekle / Düzenle)
  ════════════ */
  if (mode === 'add' || mode === 'edit') {
    return (
      <Screen scroll safeBottom contentStyle={styles.screen}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          {/* Başlık */}
          <View style={styles.header}>
            <Pressable onPress={() => setMode('list')} style={styles.backBtn}>
              <AppText style={styles.backText}>‹ Geri</AppText>
            </Pressable>
            <AppText variant="headline">
              {mode === 'add' ? 'Yeni Ürün Ekle' : 'Ürünü Düzenle'}
            </AppText>
          </View>

          {/* Temel bilgiler */}
          <Card variant="premium" style={styles.formCard}>
            <AppText style={styles.sectionLabel}>TEMEL BİLGİLER</AppText>
            <TextInputField
              label="Ürün Adı"
              value={form.name}
              onChangeText={(v) => setField('name', v)}
              placeholder="Whey Protein Gold"
            />
            <TextInputField
              label="Açıklama"
              value={form.description}
              onChangeText={(v) => setField('description', v)}
              placeholder="Ürün açıklaması..."
              multiline
            />
            <TextInputField
              label="Görsel URL (isteğe bağlı)"
              value={form.imageUrl ?? ''}
              onChangeText={(v) => setField('imageUrl', v)}
              placeholder="https://..."
              autoCapitalize="none"
            />
          </Card>

          {/* Fiyat ve stok */}
          <Card variant="default" style={styles.formCard}>
            <AppText style={styles.sectionLabel}>FİYAT & STOK</AppText>
            <View style={styles.twoCol}>
              <View style={styles.half}>
                <TextInputField
                  label="Fiyat (₺)"
                  value={String(form.price)}
                  onChangeText={(v) => setField('price', parseFloat(v) || 0)}
                  keyboardType="numeric"
                  placeholder="299.90"
                />
              </View>
              <View style={styles.half}>
                <TextInputField
                  label="Stok Adedi"
                  value={String(form.stock)}
                  onChangeText={(v) => setField('stock', parseInt(v, 10) || 0)}
                  keyboardType="numeric"
                  placeholder="50"
                />
              </View>
            </View>
          </Card>

          {/* Kategori */}
          <Card variant="default" style={styles.formCard}>
            <CategoryPicker value={form.category} onChange={(v) => setField('category', v)} />
          </Card>

          {/* Durum */}
          <Card variant="default" style={styles.formCard}>
            <ActiveToggle value={form.isActive} onChange={(v) => setField('isActive', v)} />
          </Card>

          {saveError ? <AppText style={styles.errorText}>{saveError}</AppText> : null}

          <Button
            title={isSaving ? 'Kaydediliyor...' : mode === 'add' ? 'Ürünü Ekle' : 'Değişiklikleri Kaydet'}
            disabled={isSaving}
            onPress={handleSave}
          />
          <Button title="İptal" variant="ghost" onPress={() => setMode('list')} />
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  /* ════════════
     LİSTE MODU
  ════════════ */
  return (
    <Screen scroll safeBottom contentStyle={styles.screen}>
      {/* Başlık */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <AppText style={styles.backText}>‹ Geri</AppText>
        </Pressable>
        <View style={styles.headerRow}>
          <AppText variant="headline">Ürün Yönetimi</AppText>
          <View style={styles.adminBadge}>
            <AppText style={styles.adminText}>Admin</AppText>
          </View>
        </View>
      </View>

      {/* Yeni ürün ekle butonu */}
      <Button title="+ Yeni Ürün Ekle" onPress={openAdd} />

      {/* Yükleniyor */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.secondary} size="large" />
          <AppText variant="bodyMuted">Ürünler yükleniyor...</AppText>
        </View>
      ) : errorMsg ? (
        <Card variant="glass" style={styles.center}>
          <AppText style={styles.errorText}>{errorMsg}</AppText>
          <Button title="Tekrar Dene" variant="secondary" onPress={loadProducts} />
        </Card>
      ) : products.length === 0 ? (
        <Card variant="glass" style={styles.center}>
          <AppText style={styles.emptyIcon}>📦</AppText>
          <AppText variant="bodyMuted">Henüz ürün yok.</AppText>
        </Card>
      ) : (
        <>
          {/* Özet */}
          <View style={styles.summary}>
            <View style={styles.summaryChip}>
              <AppText style={styles.summaryText}>Toplam: {products.length} ürün</AppText>
            </View>
            <View style={styles.summaryChip}>
              <AppText style={styles.summaryText}>
                Aktif: {products.filter((p) => p.isActive).length}
              </AppText>
            </View>
            <View style={[styles.summaryChip, styles.summaryDanger]}>
              <AppText style={[styles.summaryText, styles.summaryDangerText]}>
                Pasif: {products.filter((p) => !p.isActive).length}
              </AppText>
            </View>
          </View>

          {/* Ürün listesi */}
          <View style={styles.productList}>
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onEdit={() => openEdit(product)}
                onDelete={() => handleDelete(product)}
              />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

/* ────────────────────────────────
   Stiller
──────────────────────────────── */

const styles = StyleSheet.create({
  screen: { gap: spacing.md, paddingBottom: spacing.xxxl },
  kav: { gap: spacing.md },
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  backBtn: { alignSelf: 'flex-start' },
  backText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  adminBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,100,100,0.12)',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  adminText: { color: colors.danger, fontSize: 11, fontWeight: '800' },
  center: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  errorText: { color: colors.danger, fontWeight: '600', textAlign: 'center' },
  emptyIcon: { fontSize: 40 },
  sectionLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  formCard: { gap: spacing.sm },
  twoCol: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  summary: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  summaryChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: 'rgba(149,211,186,0.1)',
    borderWidth: 1,
    borderColor: colors.outlineSoft,
  },
  summaryText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  summaryDanger: { backgroundColor: 'rgba(255,100,100,0.08)', borderColor: 'rgba(255,100,100,0.2)' },
  summaryDangerText: { color: colors.danger },
  productList: { gap: spacing.sm },
});

const rowStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineSoft,
    padding: spacing.md,
  },
  left: { flex: 1, gap: 6 },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  name: { color: colors.text, fontSize: 14, fontWeight: '700', flex: 1 },
  catBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radii.full },
  catText: { fontSize: 10, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  price: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  stock: { color: colors.textMuted, fontSize: 12 },
  inactiveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,100,100,0.12)',
  },
  inactiveText: { color: colors.danger, fontSize: 10, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.xs },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: { backgroundColor: 'rgba(149,211,186,0.15)', borderWidth: 1, borderColor: 'rgba(149,211,186,0.3)' },
  editBtnText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  deleteBtn: { backgroundColor: 'rgba(255,100,100,0.12)', borderWidth: 1, borderColor: 'rgba(255,100,100,0.25)' },
  deleteBtnText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
});

const pickerStyles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  row: { gap: spacing.xs, paddingVertical: 2 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineSoft,
  },
  chipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.primary },
});

const toggleStyles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.sm },
  btn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineSoft,
  },
  btnActive: { backgroundColor: 'rgba(149,211,186,0.15)', borderColor: colors.primary },
  btnDanger: { backgroundColor: 'rgba(255,100,100,0.12)', borderColor: colors.danger },
  btnText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  btnTextActive: { color: colors.primary },
  btnTextDanger: { color: colors.danger },
});
