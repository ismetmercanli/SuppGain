import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<AppTabParamList>;
  WeeklyProgram: undefined;
  AdminProducts: undefined;
  OrderDetail: { orderId: string };
  SupplementTracking: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};
