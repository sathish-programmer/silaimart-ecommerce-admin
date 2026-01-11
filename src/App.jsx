import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
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

function App() {
  const { user, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-bronze"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Router>
        <div className="min-h-screen bg-black">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/banners" element={<Banners />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/chatbot" element={<ChatbotManager />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
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
    </Router>
  );
}

export default App;