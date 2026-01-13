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
  RectangleStackIcon
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
    ...(isSuperAdmin ? [
      { name: 'Policies', href: '/policies', icon: ScaleIcon },
      { name: 'AI Chatbot', href: '/chatbot', icon: ChatBubbleLeftRightIcon },
      { name: 'Settings', href: '/settings', icon: CogIcon },
    ] : [])
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-bronze">
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
        </Link>
        <p className="text-xs text-gray-400 mt-1">{user?.name}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-bronze text-black'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;