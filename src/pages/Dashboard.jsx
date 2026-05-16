import { useState, useEffect } from 'react';
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { apiCall } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

/* ── Order status config ─────────────────────────── */
const STATUS_COLORS = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: ClockIcon },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: ArrowTrendingUpIcon },
  shipped: { bg: 'bg-violet-100', text: 'text-violet-700', icon: TruckIcon },
  delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircleIcon },
  cancelled: { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircleIcon },
};

const PIE_COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#3b82f6', '#f43f5e'];

/* ── Stat Card ───────────────────────────────────── */
const StatCard = ({ name, value, icon: Icon, color, bg, change, changeDir }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-4 hover:shadow-md transition-all">
    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{name}</p>
      <p className="text-2xl font-black text-gray-900 tracking-tight truncate">{value}</p>
      {change != null && (
        <div className={`flex items-center gap-1 mt-1 ${changeDir === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
          {changeDir === 'up'
            ? <ArrowTrendingUpIcon className="h-3 w-3" />
            : <ArrowTrendingDownIcon className="h-3 w-3" />}
          <span className="text-[10px] font-bold">{change} this month</span>
        </div>
      )}
    </div>
  </div>
);

/* ── Dashboard ───────────────────────────────────── */
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalProducts: 0,
    recentOrders: [],
  });
  const [salesData, setSalesData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/admin/stats');
      if (res.ok) {
        const d = await res.json();
        setStats(d.stats || {});

        /* ── Generate monthly sales from recentOrders (demo/fallback) ── */
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const last6 = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
          return { name: months[d.getMonth()], orders: Math.floor(Math.random() * 20 + 5), revenue: Math.floor(Math.random() * 50000 + 10000) };
        });
        setSalesData(last6);

        /* ── Order status distribution (from recentOrders) ── */
        const statusCount = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
        (d.stats?.recentOrders || []).forEach(o => {
          if (statusCount[o.orderStatus] !== undefined) statusCount[o.orderStatus]++;
        });
        setOrderStatusData(
          Object.entries(statusCount)
            .filter(([, v]) => v > 0)
            .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
        );

        /* ── Mock top products (placeholder) ── */
        setTopProducts([
          { name: 'Ganesha Murti', sales: 42, revenue: 126000 },
          { name: 'Shiva Lingam', sales: 38, revenue: 95000 },
          { name: 'Brass Diya Set', sales: 29, revenue: 43500 },
          { name: 'Krishna Idol', sales: 24, revenue: 72000 },
        ]);
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      toast.error('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: CurrencyRupeeIcon, color: 'text-violet-600', bg: 'bg-violet-50', change: '+₹12,400', changeDir: 'up' },
    { name: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingBagIcon, color: 'text-blue-600', bg: 'bg-blue-50', change: '+8', changeDir: 'up' },
    { name: 'Active Products', value: stats.totalProducts || 0, icon: ChartBarIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Total Users', value: stats.totalUsers || 0, icon: UsersIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+14', changeDir: 'up' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-100 rounded-2xl" />
          <div className="h-80 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Welcome back, <span className="font-bold text-gray-600">{user?.name}</span> · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.name} {...s} />
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-black text-gray-900">Revenue & Orders</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={salesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                formatter={(v, name) => [name === 'revenue' ? `₹${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Orders']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-black text-gray-900 mb-5">Order Status</h3>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {orderStatusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 11 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-300">
              <ExclamationCircleIcon className="h-10 w-10 mb-2" />
              <p className="text-xs font-medium">No order data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row: Recent Orders + Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Recent Orders</h3>
            <a href="/orders" className="text-xs text-primary-600 font-bold hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            {stats.recentOrders?.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Order', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentOrders.slice(0, 6).map((order) => {
                    const sc = STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending;
                    const StatusIcon = sc.icon;
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-xs font-bold text-primary-600">
                          #{order.orderNumber || order._id?.slice(-6)}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-700 font-medium">
                          {order.user?.name || 'Guest'}
                        </td>
                        <td className="px-5 py-3 text-xs font-black text-gray-900">
                          ₹{(order.total || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${sc.bg} ${sc.text}`}>
                            <StatusIcon className="h-3 w-3" />
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-gray-300">
                <ShoppingBagIcon className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-400">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-4">Top Products</h3>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-lg font-black text-gray-200">0{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.sales} sold · ₹{p.revenue.toLocaleString()}</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            ))}
          </div>

          {/* Monthly orders bar mini */}
          <div className="mt-6 pt-4 border-t border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Orders / Month</p>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={salesData} barSize={14}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#d1d5db', fontSize: 9 }} />
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 10 }} formatter={v => [v, 'Orders']} />
                <Bar dataKey="orders" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;