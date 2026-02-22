import { useState, useEffect } from 'react';
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiCall } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsResponse = await apiCall('/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
        // Mock sales data for chart
        setSalesData([
          { name: 'Jan', sales: 4000 },
          { name: 'Feb', sales: 3000 },
          { name: 'Mar', sales: 5000 },
          { name: 'Apr', sales: 4500 },
          { name: 'May', sales: 6000 },
          { name: 'Jun', sales: 5500 }
        ]);
      } else {
        toast.error('Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Orders', value: stats.totalOrders, icon: ShoppingBagIcon, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { name: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { name: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: CurrencyRupeeIcon, color: 'text-primary-600', bgColor: 'bg-primary-50' },
    { name: 'Total Products', value: stats.totalProducts, icon: ChartBarIcon, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="section-title mb-1">Dashboard Overview</h1>
          <p className="text-gray-500 font-medium">Welcome back, {user?.name}. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card-premium p-8 group">
            <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-black/5 group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon className={`h-7 w-7 ${stat.color}`} />
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.name}</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
              <span className="text-emerald-500 text-xs font-bold mb-1.5">+12.5%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card-premium p-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Revenue Insights</h3>
              <p className="text-gray-500 text-xs font-medium mt-1">Monthly performance visualization</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health */}
        <div className="card-premium p-8">
          <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">System Health</h3>
          <div className="space-y-6">
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <div className="text-emerald-900 font-bold text-sm">Server Online</div>
                  <div className="text-emerald-600 text-[10px] font-medium uppercase tracking-wider">Operational</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Achievement</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-600">Monthly Sales Goal</span>
                  <span className="text-primary-600">84%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;