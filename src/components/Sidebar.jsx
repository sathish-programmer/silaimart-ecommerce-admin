import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  ScaleIcon,
  StarIcon,
  RectangleStackIcon,
  EnvelopeIcon,
  UsersIcon,
  DocumentPlusIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Reviews', href: '/reviews', icon: StarIcon },
    { name: 'Blogs', href: '/blogs', icon: DocumentTextIcon },
    { name: 'Coupons', href: '/coupons', icon: TicketIcon },
    { name: 'Banners', href: '/banners', icon: RectangleStackIcon },
    { name: 'Custom Orders', href: '/custom-orders', icon: DocumentPlusIcon },
    { name: 'Users', href: '/users', icon: UsersIcon },
    ...(isSuperAdmin ? [
      { name: 'Policies', href: '/policies', icon: ScaleIcon },
      { name: 'AI Chatbot', href: '/chatbot', icon: ChatBubbleLeftRightIcon },
      { name: 'Master Values', href: '/master-values', icon: AdjustmentsHorizontalIcon },
      { name: 'Settings', href: '/settings', icon: CogIcon },
      { name: 'Email Marketing', href: '/email-marketing', icon: EnvelopeIcon }
    ] : [])
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-8">
        <Link to="/" className="block group">
          <div className="text-2xl font-black text-gray-900 tracking-tighter group-hover:text-primary-600 transition-colors">
            SILAI<span className="text-primary-600 group-hover:text-gray-900 transition-colors">MART</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              {isSuperAdmin ? 'Divine Super Admin' : 'Divine Administrator'}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-8 space-y-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-2">Main Sanctuary</p>
        </div>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                ? 'bg-primary-600 text-white shadow-xl shadow-primary-100 scale-[1.02]'
                : 'text-gray-500 hover:bg-stone-50 hover:text-gray-900'
                }`}
            >
              <item.icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className={`text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-6 border-t border-gray-50 bg-stone-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-primary-600 font-bold uppercase transition-transform hover:rotate-12">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;