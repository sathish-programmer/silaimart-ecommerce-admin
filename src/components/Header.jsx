import { useAuthStore } from '../store/authStore';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import NotificationDropdown from './NotificationDropdown';

const Header = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Sanctuary session terminated safely');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-10 py-5 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="relative group hidden md:block">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-600 transition-colors" />
            <input
              type="text"
              placeholder="Quick search across sanctuary..."
              className="bg-stone-50 border-none rounded-xl pl-11 pr-6 py-2.5 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary-500/10 transition-all w-80 placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <NotificationDropdown />

          <div className="h-8 w-px bg-gray-100"></div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">{user?.name}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user?.role}</p>
            </div>

            <div className="group relative">
              <div className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-stone-50 rounded-2xl transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary-100 group-hover:rotate-6 transition-transform">
                  {user?.name?.charAt(0)}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;