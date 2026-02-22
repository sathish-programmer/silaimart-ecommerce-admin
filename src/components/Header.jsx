import { useAuthStore } from '../store/authStore';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* <img src="/silaimartlogo.png" alt="SilaiMart" className="h-20 w-auto mr-3" /> */}
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Admin Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600 font-medium">
            <UserIcon className="h-5 w-5" />
            <span>{user?.name}</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;