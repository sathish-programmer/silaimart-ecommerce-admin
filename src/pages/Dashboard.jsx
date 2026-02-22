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
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color.replace('text-', 'text-gray-900')}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('-400', '-50').replace('-600', '-50')}`}>
          <Icon className={`h-6 w-6 ${color.replace('-400', '-600')}`} />
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBagIcon}
          color="text-blue-600"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UsersIcon}
          color="text-green-600"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={CurrencyRupeeIcon}
          color="text-primary-600"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={ChartBarIcon}
          color="text-secondary-600"
        />
      </div>

      {/* Charts and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Sales Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <ShoppingBagIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">#{order.orderNumber}</p>
                    <p className="text-gray-500 text-sm font-medium">{order.user?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-bold">₹{order.total.toLocaleString()}</p>
                  <p className={`text-xs font-bold uppercase tracking-wider ${order.orderStatus === 'delivered' ? 'text-green-600' :
                      order.orderStatus === 'shipped' ? 'text-blue-600' :
                        order.orderStatus === 'cancelled' ? 'text-rose-600' :
                          'text-amber-600'
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