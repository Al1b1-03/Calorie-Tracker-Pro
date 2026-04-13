import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import RegistrationForm from './components/RegistrationForm';
import AiAssistant from './components/AiAssistant';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import SupportMessagesPage from './pages/SupportMessagesPage';
import ProductsShopPage from './pages/ProductsShopPage';
import CartPage from './pages/CartPage';
import WorkoutsPageRouter from './pages/WorkoutsPageRouter';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));

  useEffect(() => {
    const onRoleUpdate = () => setUserRole(localStorage.getItem('userRole'));
    window.addEventListener('userRoleUpdated', onRoleUpdate);
    window.addEventListener('storage', onRoleUpdate);
    return () => {
      window.removeEventListener('userRoleUpdated', onRoleUpdate);
      window.removeEventListener('storage', onRoleUpdate);
    };
  }, []);

  const showAssistant = userRole !== 'admin';

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="app__main">
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
            <Route path="/registration" element={<RegistrationForm />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
        {showAssistant && <AiAssistant />}
      </div>
    </BrowserRouter>
  );
}

export default App;
