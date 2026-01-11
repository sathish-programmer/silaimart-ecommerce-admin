import { useAuthStore } from '../store/authStore';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* <img src="/silaimartlogo.png" alt="SilaiMart" className="h-20 w-auto mr-3" /> */}
          <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <UserIcon className="h-5 w-5" />
            <span>{user?.name}</span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;