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
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-primary-600">
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
        </Link>
        <p className="text-xs text-gray-500 mt-1 font-medium">{user?.name}</p>
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
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
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