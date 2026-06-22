import { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, shadows, spacing } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

/* ─────────────────────────────────────────────
   Web'deki resolveProductImage mantığı birebir
   ───────────────────────────────────────────── */

type VisualType = 'powder' | 'pill' | 'bar' | 'drink';

function pickVisualType(name: string, category: string): VisualType {
  const key = `${name} ${category}`.toLowerCase();
  if (key.includes('bar')) return 'bar';
  if (
    key.includes('electrolyte') ||
    key.includes('hydration') ||
    key.includes('drink') ||
    key.includes('carnitine')
  )
    return 'drink';
  const pillKeywords = [
    'vitamin', 'mineral', 'tablet', 'kapsul', 'capsule',
    'softgel', 'omega', 'zma',
  ];
  if (pillKeywords.some((w) => key.includes(w))) return 'pill';
  return 'powder';
}

function pickImageByHash(seed: string, urls: string[]): string {
  const value = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return urls[value % urls.length];
}

const POWDER_URLS = [
  'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
];
const PILL_URLS = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80',
];
const BAR_URLS = [
  'https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80',
];
const DRINK_URLS = [
  'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=800&q=80',
];

function getFallbackImage(name: string, category: string): string {
  const key = `${name} ${category}`.toLowerCase();
  const type = pickVisualType(name, category);
  switch (type) {
    case 'bar':   return pickImageByHash(key, BAR_URLS);
    case 'drink': return pickImageByHash(key, DRINK_URLS);
    case 'pill':  return pickImageByHash(key, PILL_URLS);
    default:      return pickImageByHash(key, POWDER_URLS);
  }
}

function resolveImage(
  name: string,
  category: string,
  imageUrl?: string,
): string {
  const raw = (imageUrl ?? '').trim();
  if (raw.length > 0 && !raw.includes('placehold.co')) return raw;
  return getFallbackImage(name, category);
}

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

type ProductCardProps = {
  name: string;
  category: string;
  price: string;
  imageUrl?: string;
  badge?: string;
  inStock?: boolean;
  onPress?: () => void;
  onAddPress?: () => void;
};

function ProductCardInner({
  name,
  category,
  price,
  imageUrl,
  badge,
  inStock = true,
  onPress,
  onAddPress,
}: ProductCardProps) {
  const imgSrc = resolveImage(name, category, imageUrl);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* ── Resim ── */}
      <View style={styles.imageFrame}>
        <Image
          source={{ uri: imgSrc }}
          style={styles.image}
          resizeMode="cover"
        />
        {badge ? (
          <View style={[styles.badge, badge === 'Tükendi' && styles.badgeDanger]}>
            <AppText
              style={[styles.badgeText, badge === 'Tükendi' && styles.badgeTextDanger]}
            >
              {badge}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* ── İçerik ── */}
      <View style={styles.content}>
        <AppText style={styles.category} numberOfLines={1}>
          {category}
        </AppText>
        <AppText variant="title" numberOfLines={2} style={styles.name}>
          {name}
        </AppText>

        <View style={styles.priceRow}>
          <AppText style={styles.price}>{price}</AppText>
          <View style={styles.stock}>
            <View style={[styles.stockDot, !inStock && styles.stockDotMuted]} />
            <AppText style={styles.stockText}>
              {inStock ? 'Stokta' : 'Tükendi'}
            </AppText>
          </View>
        </View>

        <Button
          title="+ Ekle"
          fullWidth
          variant={inStock ? 'primary' : 'ghost'}
          disabled={!inStock}
          onPress={onAddPress}
        />
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardInner);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineSoft,
    backgroundColor: colors.surfaceLow,
    ...shadows.soft,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  imageFrame: {
    aspectRatio: 4 / 5,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(78,222,163,0.35)',
    backgroundColor: 'rgba(78,222,163,0.18)',
  },
  badgeDanger: {
    borderColor: 'rgba(255,100,100,0.35)',
    backgroundColor: 'rgba(255,100,100,0.15)',
  },
  badgeText: {
    color: colors.secondaryDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgeTextDanger: {
    color: colors.danger,
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  category: {
    color: colors.textSubtle,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  name: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.secondaryDim,
    fontSize: 16,
    fontWeight: '800',
  },
  stock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockDot: {
    width: 5,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  stockDotMuted: {
    backgroundColor: colors.textSubtle,
  },
  stockText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },
});
