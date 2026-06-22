import { colors } from './colors';

export const shadows = {
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  soft: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
