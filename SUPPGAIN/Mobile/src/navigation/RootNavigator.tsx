import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components';
import { useAuth } from '../context/AuthContext';
import { CartScreen } from '../screens/app/CartScreen';
import { HomeScreen } from '../screens/app/HomeScreen';
import { OrdersScreen } from '../screens/app/OrdersScreen';
import { ProductsScreen } from '../screens/app/ProductsScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { AdminProductsScreen } from '../screens/app/AdminProductsScreen';
import { OrderDetailScreen } from '../screens/app/OrderDetailScreen';
import { SupplementTrackingScreen } from '../screens/app/SupplementTrackingScreen';
import { WeeklyProgramScreen } from '../screens/app/WeeklyProgramScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { colors, spacing } from '../theme';
import type { AppStackParamList, AppTabParamList, AuthStackParamList, RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const AppTab = createBottomTabNavigator<AppTabParamList>();

const suppGainTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surfaceDim,
    primary: colors.primary,
    text: colors.text,
    border: 'rgba(255,255,255,0.06)',
  },
};

/* ── Tab icon helper ── */
const TAB_ICONS: Record<string, string> = {
  Home: '⌂',
  Products: '◈',
  Cart: '⊕',
  Orders: '≡',
  Profile: '◉',
};

const TAB_LABELS: Record<string, string> = {
  Home: 'Ana Sayfa',
  Products: 'Ürünler',
  Cart: 'Sepet',
  Orders: 'Siparişler',
  Profile: 'Profil',
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <AppTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          ...styles.tabBar,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom + 6,
        },
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ color, focused }) => (
          <Text
            style={{
              fontSize: focused ? 20 : 18,
              color,
              lineHeight: 24,
            }}
          >
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarLabel: TAB_LABELS[route.name] ?? route.name,
      })}
    >
      <AppTab.Screen name="Home" component={HomeScreen} />
      <AppTab.Screen name="Products" component={ProductsScreen} />
      <AppTab.Screen name="Cart" component={CartScreen} />
      <AppTab.Screen name="Orders" component={OrdersScreen} />
      <AppTab.Screen name="Profile" component={ProfileScreen} />
    </AppTab.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="MainTabs" component={TabNavigator} />
      <AppStack.Screen
        name="WeeklyProgram"
        component={WeeklyProgramScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen
        name="AdminProducts"
        component={AdminProductsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen
        name="SupplementTracking"
        component={SupplementTrackingScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { isBootstrapping, session } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.secondary} />
        <AppText variant="bodyMuted">Oturum kontrol ediliyor...</AppText>
      </View>
    );
  }

  return (
    <NavigationContainer theme={suppGainTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <RootStack.Screen name="App" component={AppNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.surfaceDim,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    height: 62,
    paddingBottom: 6,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabItem: {
    paddingTop: 2,
  },
});
