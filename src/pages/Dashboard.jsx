import { useState, useEffect } from 'react';
import { 
  ShoppingBagIcon, 
  UsersIcon, 
  CurrencyRupeeIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SendOfferNotification from '../components/SendOfferNotification';
import { apiCall } from '../utils/api';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchDashboardData();
  }, [isSuperAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsResponse = await apiCall('/admin/stats');
      const statsData = await statsResponse.json();

      if (statsResponse.ok) {
        setStats(statsData.stats);
        setRecentOrders(statsData.stats.recentOrders);
        // Mock sales data for chart - this should ideally come from backend
        setSalesData([
          { name: 'Jan', sales: 4000 },
          { name: 'Feb', sales: 3000 },
          { name: 'Mar', sales: 5000 },
          { name: 'Apr', sales: 4500 },
          { name: 'May', sales: 6000 },
          { name: 'Jun', sales: 5500 }
        ]);
      } else {
        toast.error(statsData.message || 'Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBagIcon}
          color="text-blue-400"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UsersIcon}
          color="text-green-400"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={CurrencyRupeeIcon}
          color="text-bronze"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={ChartBarIcon}
          color="text-purple-400"
        />
      </div>

      {/* Charts and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Sales Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #CD7F32',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="sales" stroke="#CD7F32" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div>
                  <p className="text-white font-medium">#{order.orderNumber}</p>
                  <p className="text-gray-400 text-sm">{order.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-bronze font-semibold">₹{order.total}</p>
                  <p className={`text-sm ${
                    order.orderStatus === 'delivered' ? 'text-green-400' :
                    order.orderStatus === 'shipped' ? 'text-blue-400' :
                    order.orderStatus === 'cancelled' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {order.orderStatus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Send Offer Notification */}
      <SendOfferNotification />
    </div>
  );
};

export default Dashboard;