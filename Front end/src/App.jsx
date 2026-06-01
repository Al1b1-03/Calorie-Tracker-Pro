/**
 * ФАЙЛ: App.jsx
 * ЧТО ЭТО: Маршрутизация SPA.
 * ЗА ЧТО ОТВЕЧАЕТ: URL → страницы, ProtectedRoute, AdminRoute.
 */
import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import RegistrationForm from './components/RegistrationForm';
import AiAssistant from './components/AiAssistant';
import { SkeletonCardList } from './components/ui/Skeleton';
import { isAdmin, normalizeRole } from './utils/roles';
import './App.css';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const SupportMessagesPage = lazy(() => import('./pages/SupportMessagesPage'));
const ProductsShopPage = lazy(() => import('./pages/ProductsShopPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WorkoutsPageRouter = lazy(() => import('./pages/WorkoutsPageRouter'));
const AiCameraPage = lazy(() => import('./pages/AiCameraPage'));
const AdminManagementPage = lazy(() => import('./pages/AdminManagementPage'));

function RouteFallback() {
  return (
    <div className="page" aria-busy="true">
      <SkeletonCardList count={4} />
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const [userRole, setUserRole] = useState(() => normalizeRole(localStorage.getItem('userRole')));

  useEffect(() => {
    const onAuthUpdate = () => {
      setUserRole(normalizeRole(localStorage.getItem('userRole')));
    };
    window.addEventListener('userRoleUpdated', onAuthUpdate);
    window.addEventListener('storage', onAuthUpdate);
    return () => {
      window.removeEventListener('userRoleUpdated', onAuthUpdate);
      window.removeEventListener('storage', onAuthUpdate);
    };
  }, []);

  const showAssistant =
    !isAdmin(userRole) && !location.pathname.startsWith('/ai-camera');

  return (
      <div className="app">
        <Header />
        <main className="app__main">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <AdminRoute>
                    <UsersPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <AdminRoute>
                    <ProductsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <AdminRoute>
                    <OrdersPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <AdminRoute>
                    <SupportMessagesPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin-management"
                element={
                  <SuperAdminRoute>
                    <AdminManagementPage />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="/shop"
                element={
                  <ProtectedRoute>
                    <ProductsShopPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workouts"
                element={
                  <ProtectedRoute>
                    <WorkoutsPageRouter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-camera"
                element={
                  <ProtectedRoute>
                    <AiCameraPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/registration" element={<RegistrationForm />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        {showAssistant && <AiAssistant />}
      </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
