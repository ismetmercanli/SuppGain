export const PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PRODUCTS: '/products',
  CHECKOUT: '/checkout',
  MY_ORDERS: '/my-orders',
  ORDER_DETAIL: '/my-orders/:orderId',
  WEEKLY_PROGRAM: '/weekly-program',
  SUPPLEMENT_TRACKING: '/supplement-tracking',
} as const

export type AppPath = (typeof PATHS)[keyof typeof PATHS]
