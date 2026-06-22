import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { getApiErrorMessage } from '../../api/errors';
import { getProducts } from '../../api/productsApi';
import { addToCart } from '../../api/cartApi';
import { AppText, Button, Card, ProductCard, Screen } from '../../components';
import { colors, radii, spacing } from '../../theme';
import type { Product } from '../../types/product';

const ALL_LABEL = 'Hepsi';

export function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_LABEL);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Ürün yükleme ── */
  const loadProducts = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getProducts({ isActive: true });
      setProducts(data);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadProducts(); }, [loadProducts]));

  /* ── Sepete ekle ── */
  async function handleAddToCart(product: Product) {
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      setCartFeedback(`"${product.name}" sepete eklendi!`);
      feedbackTimer.current = setTimeout(() => setCartFeedback(null), 2500);
    } catch (err) {
      setCartFeedback(getApiErrorMessage(err));
      feedbackTimer.current = setTimeout(() => setCartFeedback(null), 3000);
    }
  }

  /* ── Kategori listesi (memoize) ── */
  const categories = useMemo(
    () => [ALL_LABEL, ...Array.from(new Set(products.map((p) => p.category))).sort()],
    [products],
  );

  /* ── Filtreleme (memoize) ── */
  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchesCategory = activeCategory === ALL_LABEL || p.category === activeCategory;
        const matchesSearch =
          search.trim() === '' ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [products, activeCategory, search],
  );

  return (
    <Screen scroll contentStyle={styles.screen}>

      {/* ── Başlık ── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <AppText variant="headline">◫ Ürün Listesi</AppText>
          {!isLoading && filtered.length > 0 ? (
            <View style={styles.countBadge}>
              <AppText style={styles.countTxt}>{filtered.length} ürün</AppText>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Arama barı ── */}
      <View style={styles.searchFrame}>
        <AppText style={styles.searchIcon}>🔍</AppText>
        <TextInput
          style={styles.searchInput}
          placeholder="Premium takviye ara..."
          placeholderTextColor={colors.textSubtle}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch('')}>
            <AppText style={styles.clearBtn}>✕</AppText>
          </Pressable>
        ) : null}
      </View>

      {/* ── Kategori chip'leri ── */}
      {!isLoading && products.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {categories.map((cat) => {
            const active = cat === activeCategory;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <AppText style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {/* ── Sepet feedback ── */}
      {cartFeedback ? (
        <View style={styles.feedback}>
          <AppText style={styles.feedbackText}>{cartFeedback}</AppText>
        </View>
      ) : null}

      {/* ── Yükleniyor ── */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.secondary} size="large" />
          <AppText variant="bodyMuted">Ürünler yükleniyor...</AppText>
        </View>
      ) : null}

      {/* ── Hata ── */}
      {errorMessage ? (
        <Card variant="glass" style={styles.center}>
          <AppText style={styles.errorText}>{errorMessage}</AppText>
          <Button title="Tekrar Dene" variant="secondary" onPress={() => loadProducts()} />
        </Card>
      ) : null}

      {/* ── Ürün grid'i ── */}
      {!isLoading && !errorMessage ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <Card variant="glass" style={styles.center}>
              <AppText variant="bodyMuted">
                {search ? `"${search}" için sonuç bulunamadı.` : 'Ürün bulunamadı.'}
              </AppText>
            </Card>
          }
          renderItem={({ item }) => (
            <ProductCard
              name={item.name}
              category={item.category}
              price={formatPrice(item.price)}
              imageUrl={item.imageUrl ?? undefined}
              inStock={item.stock > 0}
              badge={item.stock <= 0 ? 'Tükendi' : undefined}
              onAddPress={() => handleAddToCart(item)}
            />
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
  screen: { gap: spacing.md, paddingBottom: spacing.xxxl },
  header: { marginTop: spacing.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineSoft,
  },
  countTxt: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  searchFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceContainer,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: {
    color: colors.textSubtle,
    fontSize: 14,
    paddingHorizontal: spacing.xs,
  },
  chips: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineSoft,
  },
  chipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.surface,
  },
  feedback: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: 'rgba(78,222,163,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(78,222,163,0.3)',
  },
  feedbackText: {
    color: colors.secondaryDim,
    fontWeight: '600',
    fontSize: 13,
  },
  grid: { gap: spacing.sm },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  center: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  errorText: { color: colors.danger, fontWeight: '600', textAlign: 'center' },
});
