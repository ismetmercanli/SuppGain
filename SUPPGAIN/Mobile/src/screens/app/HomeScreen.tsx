import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { getApiErrorMessage } from '../../api/errors';
import { getProducts } from '../../api/productsApi';
import {
  AppText,
  Button,
  Card,
  ProductCard,
  Screen,
  SectionHeader,
} from '../../components';
import { useAuth } from '../../context/AuthContext';
import type { AppStackParamList } from '../../navigation/types';
import { colors, radii, spacing } from '../../theme';
import type { Product } from '../../types/product';

type Nav = NativeStackNavigationProp<AppStackParamList>;

/* ── Hızlı erişim kartları (web quickCards ile birebir) ── */
const QUICK_CARDS = [
  {
    id: 'tracking',
    icon: '◎',
    title: 'Canlı Takip',
    desc: 'Bugünkü dozlarını tek ekranda tamamla.',
    screen: 'SupplementTracking' as const,
    accent: colors.secondary,
    bg: 'rgba(78,222,163,0.08)',
    border: 'rgba(78,222,163,0.2)',
  },
  {
    id: 'weekly',
    icon: '◷',
    title: 'Haftalık Plan',
    desc: 'Satın alımlara göre plan oluştur ve düzenle.',
    screen: 'WeeklyProgram' as const,
    accent: colors.primary,
    bg: 'rgba(149,211,186,0.08)',
    border: 'rgba(149,211,186,0.2)',
  },
] as const;

const QUICK_CARDS_BOTTOM = [
  {
    id: 'products',
    icon: '◫',
    title: 'Ürün Kataloğu',
    desc: 'Takviye seç, stok ve içerikleri karşılaştır.',
    tab: 'Products' as const,
    accent: colors.primaryStrong,
    bg: 'rgba(149,211,186,0.06)',
    border: 'rgba(149,211,186,0.15)',
  },
  {
    id: 'orders',
    icon: '▣',
    title: 'Siparişlerim',
    desc: 'Geçmiş siparişlerini ve durumlarını gör.',
    tab: 'Orders' as const,
    accent: colors.textMuted,
    bg: 'rgba(255,255,255,0.04)',
    border: colors.outlineSoft,
  },
] as const;

/* ── Takip prensipleri ── */
const PRINCIPLES = [
  {
    icon: '◉',
    title: 'Düzenli Kullanım',
    detail: 'Aynı saatlerde alınan takviyeler takip disiplini oluşturur.',
  },
  {
    icon: '▤',
    title: 'Stok Takibi',
    detail: 'Düşük stokta erken yenileme, programın aksamamasını sağlar.',
  },
  {
    icon: '◷',
    title: 'Kişisel Plan',
    detail: 'Haftalık programa göre kullanım, hedefe uygun süreçleri güçlendirir.',
  },
] as const;

/* ── Öncelik adımları ── */
const PRIORITY_STEPS = [
  { num: '1', label: 'Takviyeleri İşaretle', screen: 'SupplementTracking' as const },
  { num: '2', label: 'Haftalık Planı Güncelle', screen: 'WeeklyProgram' as const },
] as const;

/* ════════════════════════════════
   Küçük bileşenler
════════════════════════════════ */

function QuickCard({
  icon,
  title,
  desc,
  accent,
  bg,
  border,
  onPress,
}: {
  icon: string;
  title: string;
  desc: string;
  accent: string;
  bg: string;
  border: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        qc.card,
        { backgroundColor: bg, borderColor: border },
        pressed && { opacity: 0.8 },
      ]}
    >
      <AppText style={[qc.icon, { color: accent }]}>{icon}</AppText>
      <AppText style={qc.title}>{title}</AppText>
      <AppText style={qc.desc} numberOfLines={2}>{desc}</AppText>
      <View style={[qc.pill, { borderColor: accent }]}>
        <AppText style={[qc.pillTxt, { color: accent }]}>Aç ›</AppText>
      </View>
    </Pressable>
  );
}

function PrincipleCard({ icon, title, detail }: { icon: string; title: string; detail: string }) {
  return (
    <View style={pr.card}>
      <AppText style={pr.icon}>{icon}</AppText>
      <AppText style={pr.detail}>{detail}</AppText>
      <AppText style={pr.title}>{title}</AppText>
    </View>
  );
}

/* ════════════════════════════════
   Ana ekran
════════════════════════════════ */
export function HomeScreen() {
  const { session } = useAuth();
  const navigation = useNavigation<Nav>();
  const [products, setProducts] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProducts = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);
    try {
      const nextProducts = await getProducts({ isActive: true });
      setProducts(nextProducts);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const user = session?.user;
  const firstName = user?.firstName ?? 'Sporcu';

  return (
    <Screen scroll contentStyle={st.screen}>

      {/* ── Üst başlık ── */}
      <View style={st.topBar}>
        <View>
          <AppText style={st.logo}>SuppGain</AppText>
          <AppText style={st.logoSub}>Supplement Dünyası</AppText>
        </View>
        <Pressable
          onPress={() => navigation.navigate('SupplementTracking')}
          style={({ pressed }) => [st.liveBtn, pressed && { opacity: 0.8 }]}
        >
          <AppText style={st.liveBtnTxt}>◎ Takibe Git</AppText>
        </Pressable>
      </View>

      {/* ── Hero bant ── */}
      <Card variant="premium" style={st.hero}>
        <View style={st.heroBadge}>
          <AppText style={st.heroBadgeTxt}>✦ Hedefe Odaklan</AppText>
        </View>
        <AppText style={st.heroTitle}>
          Takviyeni planla,{'\n'}takip et, tamamla.
        </AppText>
        <AppText style={st.heroSub}>
          Merhaba <AppText style={st.heroName}>{firstName}</AppText>! Bu panel ürün, stok ve doz takibini tek akışta yönetmen için tasarlandı.
        </AppText>
        <Button
          title="✦ Canlı Takip Başlat"
          onPress={() => navigation.navigate('SupplementTracking')}
        />
      </Card>

      {/* ── Bugün ne yapacaksın? ── */}
      <Card variant="default" style={st.priorityCard}>
        <AppText style={st.sectionKicker}>Öncelik Sırası</AppText>
        <AppText style={st.sectionTitle}>Bugün Ne Yapacaksın?</AppText>
        <View style={st.priorityList}>
          {PRIORITY_STEPS.map((step) => (
            <Pressable
              key={step.num}
              onPress={() => navigation.navigate(step.screen)}
              style={({ pressed }) => [st.priorityRow, pressed && { opacity: 0.75 }]}
            >
              <View style={st.priorityNum}>
                <AppText style={st.priorityNumTxt}>{step.num}</AppText>
              </View>
              <AppText style={st.priorityLabel}>{step.label}</AppText>
              <AppText style={st.priorityArrow}>›</AppText>
            </Pressable>
          ))}
          <Pressable
            onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })}
            style={({ pressed }) => [st.priorityRow, pressed && { opacity: 0.75 }]}
          >
            <View style={st.priorityNum}>
              <AppText style={st.priorityNumTxt}>3</AppText>
            </View>
            <AppText style={st.priorityLabel}>Stok Uygunluğunu Kontrol Et</AppText>
            <AppText style={st.priorityArrow}>›</AppText>
          </Pressable>
        </View>
      </Card>

      {/* ── Hızlı erişim grid ── */}
      <View>
        <AppText style={st.sectionKicker}>Hızlı Erişim</AppText>
        <View style={st.quickGrid}>
          {QUICK_CARDS.map((card) => (
            <QuickCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              desc={card.desc}
              accent={card.accent}
              bg={card.bg}
              border={card.border}
              onPress={() => navigation.navigate(card.screen)}
            />
          ))}
          {QUICK_CARDS_BOTTOM.map((card) => (
            <QuickCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              desc={card.desc}
              accent={card.accent}
              bg={card.bg}
              border={card.border}
              onPress={() => navigation.navigate('MainTabs', { screen: card.tab })}
            />
          ))}
        </View>
      </View>

      {/* ── Profil özeti ── */}
      {user ? (
        <Card variant="glass" style={st.profileCard}>
          <View style={st.profileRow}>
            <View style={st.profileAvatar}>
              <AppText style={st.profileAvatarTxt}>
                {(user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')}
              </AppText>
            </View>
            <View style={st.profileInfo}>
              <AppText style={st.profileName}>{user.firstName} {user.lastName}</AppText>
              <AppText style={st.profileEmail}>{user.email}</AppText>
            </View>
          </View>
          <View style={st.profileStats}>
            <View style={st.profileStat}>
              <AppText style={st.profileStatVal}>{user.age ?? '—'}</AppText>
              <AppText style={st.profileStatLbl}>Yaş</AppText>
            </View>
            <View style={st.profileStatDivider} />
            <View style={st.profileStat}>
              <AppText style={st.profileStatVal}>{user.heightCm ? `${user.heightCm}` : '—'}</AppText>
              <AppText style={st.profileStatLbl}>Boy cm</AppText>
            </View>
            <View style={st.profileStatDivider} />
            <View style={st.profileStat}>
              <AppText style={st.profileStatVal}>{user.weightKg ? `${user.weightKg}` : '—'}</AppText>
              <AppText style={st.profileStatLbl}>Kilo kg</AppText>
            </View>
          </View>
        </Card>
      ) : null}

      {/* ── Takip prensipleri ── */}
      <View>
        <AppText style={st.sectionKicker}>Takip Prensipleri</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.principleRow}>
          {PRINCIPLES.map((p) => (
            <PrincipleCard key={p.title} icon={p.icon} title={p.title} detail={p.detail} />
          ))}
        </ScrollView>
      </View>

      {/* ── Trend ürünler ── */}
      <View>
        <SectionHeader
          title="◈ Trend Ürünler"
          actionLabel={isRefreshing ? 'Yenileniyor...' : '↻ Yenile'}
          onActionPress={() => loadProducts(true)}
        />

        {isLoading ? (
          <View style={st.stateBox}>
            <ActivityIndicator color={colors.secondary} />
            <AppText variant="bodyMuted">Ürünler yükleniyor...</AppText>
          </View>
        ) : errorMessage ? (
          <Card variant="glass" style={st.stateBox}>
            <AppText style={st.errorTxt}>{errorMessage}</AppText>
            <Button title="Tekrar Dene" variant="secondary" onPress={() => loadProducts()} />
          </Card>
        ) : (
          <FlatList
            data={products.slice(0, 6)}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={st.productRow}
            contentContainerStyle={st.productList}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => loadProducts(true)}
                tintColor={colors.secondary}
              />
            }
            ListEmptyComponent={
              <Card variant="glass" style={st.stateBox}>
                <AppText variant="bodyMuted">Şu an listelenecek ürün yok.</AppText>
              </Card>
            }
            renderItem={({ item }) => (
              <ProductCard
                name={item.name}
                category={item.category}
                price={formatPrice(item.price)}
                imageUrl={item.imageUrl ?? undefined}
                badge={item.stock > 0 ? 'Stokta' : 'Tükendi'}
                inStock={item.stock > 0}
              />
            )}
          />
        )}
      </View>
    </Screen>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
}

/* ── Stiller ── */

const st = StyleSheet.create({
  screen: { gap: spacing.lg, paddingBottom: spacing.xxxl },

  /* topbar */
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.xs },
  logo: { color: colors.primary, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  logoSub: { color: colors.textSubtle, fontSize: 12, fontWeight: '500' },
  liveBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radii.full,
    backgroundColor: 'rgba(149,211,186,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(149,211,186,0.25)',
  },
  liveBtnTxt: { color: colors.primary, fontSize: 12, fontWeight: '700' },

  /* hero */
  hero: { gap: spacing.md },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: 'rgba(111,251,190,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(111,251,190,0.22)',
  },
  heroBadgeTxt: { color: colors.secondary, fontSize: 11, fontWeight: '800' },
  heroTitle: { color: colors.text, fontSize: 22, fontWeight: '800', lineHeight: 30, letterSpacing: -0.3 },
  heroSub: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  heroName: { color: colors.primary, fontWeight: '700' },

  /* priority */
  priorityCard: { gap: spacing.sm },
  sectionKicker: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: spacing.sm },
  priorityList: { gap: 0, borderRadius: radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.outlineSoft },
  priorityRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.outlineSoft,
    backgroundColor: colors.surfaceDim,
  },
  priorityNum: {
    width: 26, height: 26, borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  priorityNumTxt: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  priorityLabel: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '500' },
  priorityArrow: { color: colors.textSubtle, fontSize: 18 },

  /* quick grid */
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  /* profile card */
  profileCard: { gap: spacing.md },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profileAvatar: {
    width: 44, height: 44, borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    borderWidth: 2, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarTxt: { color: colors.primary, fontSize: 16, fontWeight: '800' },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  profileEmail: { color: colors.textMuted, fontSize: 12 },
  profileStats: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1, borderColor: colors.outlineSoft,
  },
  profileStat: { flex: 1, alignItems: 'center', gap: 2 },
  profileStatVal: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  profileStatLbl: { color: colors.textMuted, fontSize: 11, fontWeight: '500' },
  profileStatDivider: { width: 1, height: 30, backgroundColor: colors.outlineSoft },

  /* principles */
  principleRow: { gap: spacing.sm, paddingVertical: 2 },

  /* products */
  stateBox: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  errorTxt: { color: colors.danger, fontWeight: '600', textAlign: 'center' },
  productList: { gap: spacing.gutter },
  productRow: { gap: spacing.gutter, marginBottom: spacing.xs },
});

const qc = StyleSheet.create({
  card: {
    width: '47.5%',
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.xs,
  },
  icon: { fontSize: 22, lineHeight: 28 },
  title: { color: colors.text, fontSize: 14, fontWeight: '700' },
  desc: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  pill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  pillTxt: { fontSize: 11, fontWeight: '700' },
});

const pr = StyleSheet.create({
  card: {
    width: 180,
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineSoft,
    gap: spacing.xs,
  },
  icon: { fontSize: 20, color: colors.primary },
  detail: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  title: { color: colors.primary, fontSize: 13, fontWeight: '700' },
});
