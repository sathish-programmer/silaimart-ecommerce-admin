import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Blogs from './pages/Blogs';
import Coupons from './pages/Coupons';
import Banners from './pages/Banners';
import Settings from './pages/Settings';
import Policies from './pages/Policies';
import ChatbotManager from './pages/ChatbotManager';
import EmailMarketing from './pages/EmailMarketing';
import Users from './pages/Users';
import CustomOrderManager from './pages/CustomOrderManager';
import UserDetail from './pages/UserDetail';
import MasterValues from './pages/MasterValues';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const { user, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      setIsAuthLoading(true);
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        navigate('/login');
      }
      setIsAuthLoading(false);
    };
    authenticate();
  }, [checkAuth, navigate]);

  const AdminRoute = ({ children, requiredRole }) => {
    if (isAuthLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-bronze"></div>
        </div>
      );
    }

    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
    if (requiredRole === 'superadmin' && user.role !== 'superadmin') {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-bronze"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {user && ['admin', 'superadmin'].includes(user.role) && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {user && ['admin', 'superadmin'].includes(user.role) && <Header />}
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin and Superadmin Routes */}
            <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/products" element={<AdminRoute><Products /></AdminRoute>} />
            <Route path="/categories" element={<AdminRoute><Categories /></AdminRoute>} />
            <Route path="/orders" element={<AdminRoute><Orders /></AdminRoute>} />
            <Route path="/reviews" element={<AdminRoute><Reviews /></AdminRoute>} />
            <Route path="/blogs" element={<AdminRoute><Blogs /></AdminRoute>} />
            <Route path="/coupons" element={<AdminRoute><Coupons /></AdminRoute>} />
            <Route path="/banners" element={<AdminRoute><Banners /></AdminRoute>} />
            <Route path="/policies" element={<AdminRoute><Policies /></AdminRoute>} />
            <Route path="/chatbot" element={<AdminRoute><ChatbotManager /></AdminRoute>} />
            <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
            <Route path="/email-marketing" element={<AdminRoute><EmailMarketing /></AdminRoute>} />
            
            {/* Superadmin Only Routes */}
            <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
            <Route path="/users/:id" element={<AdminRoute><UserDetail /></AdminRoute>} />
            <Route path="/custom-orders" element={<AdminRoute><CustomOrderManager /></AdminRoute>} />
            <Route path="/master-values" element={<AdminRoute requiredRole="superadmin"><MasterValues /></AdminRoute>} />

            <Route path="*" element={user && ['admin', 'superadmin'].includes(user.role) ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #CD7F32'
          }
        }}
      />
    </div>
  );
}

export default App;