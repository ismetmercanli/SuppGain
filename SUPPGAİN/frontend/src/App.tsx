import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './features/dashboard/pages/DashboardPage'
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { ProductsPage } from './features/products/pages/ProductsPage'
import { ProfilePage } from './features/profile/pages/ProfilePage'
import { CheckoutPage } from './features/checkout/pages/CheckoutPage'
import { MyOrdersPage } from './features/orders/pages/MyOrdersPage'
import { OrderDetailPage } from './features/orders/pages/OrderDetailPage'
import { WeeklyProgramPage } from './features/weekly-program/pages/WeeklyProgramPage'
import { SupplementTrackingPage } from './features/supplement-tracking/pages/SupplementTrackingPage'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import { PublicOnlyRoute } from './shared/components/PublicOnlyRoute'
import { PATHS } from './shared/router/paths'

const publicOnlyRoutes = [
  { path: PATHS.ROOT, element: <LoginPage /> },
  { path: PATHS.LOGIN, element: <LoginPage /> },
  { path: PATHS.REGISTER, element: <RegisterPage /> },
  { path: PATHS.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
  { path: PATHS.RESET_PASSWORD, element: <ResetPasswordPage /> },
]

const protectedRoutes = [
  { path: PATHS.DASHBOARD, element: <DashboardPage /> },
  { path: PATHS.PROFILE, element: <ProfilePage /> },
  { path: PATHS.PRODUCTS, element: <ProductsPage /> },
  { path: PATHS.CHECKOUT, element: <CheckoutPage /> },
  { path: PATHS.MY_ORDERS, element: <MyOrdersPage /> },
  { path: PATHS.ORDER_DETAIL, element: <OrderDetailPage /> },
  { path: PATHS.WEEKLY_PROGRAM, element: <WeeklyProgramPage /> },
  { path: PATHS.SUPPLEMENT_TRACKING, element: <SupplementTrackingPage /> },
]

function App() {
  return (
    <Routes>
      {publicOnlyRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={(
            <PublicOnlyRoute>
              {route.element}
            </PublicOnlyRoute>
          )}
        />
      ))}

      {protectedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={(
            <ProtectedRoute>
              {route.element}
            </ProtectedRoute>
          )}
        />
      ))}

      <Route path="*" element={<Navigate to={PATHS.ROOT} replace />} />
    </Routes>
  )
}

export default App
