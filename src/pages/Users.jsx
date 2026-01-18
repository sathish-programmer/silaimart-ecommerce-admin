import { useState, useEffect,  } from 'react';
import { UserIcon, MagnifyingGlassIcon, ArrowLeftIcon, ArrowRightIcon, TrashIcon, NoSymbolIcon, CheckCircleIcon, BellAlertIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiCall(`/auth/users?page=${currentPage}&limit=10&search=${searchQuery}`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const response = await apiCall(`/admin/users/${userId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleBlockUser = async (userId) => {
    if (!window.confirm('Are you sure you want to block this user?')) return;
    try {
      const response = await apiCall(`/admin/users/${userId}/block`, { method: 'PUT' });
      if (response.ok) {
        toast.success('User blocked successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unblock this user?')) return;
    try {
      const response = await apiCall(`/admin/users/${userId}/unblock`, { method: 'PUT' });
      if (response.ok) {
        toast.success('User unblocked successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const navigate = useNavigate();

  const viewUserDetails = (userId) => {
    navigate(`/users/${userId}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Users Management</h1>
          <p className="text-gray-400 mt-1">
            {isSuperAdmin ? 
              'Manage all registered users' :
              'View users who have purchased your products'
            }
          </p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-64 px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-white">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        user.role === 'superadmin' ? 'bg-bronze/20 text-bronze' :
                        user.role === 'admin' ? 'bg-blue-600/20 text-blue-400' :
                        'bg-gray-600/20 text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewUserDetails(user._id)}
                        className="text-bronze hover:text-gold mr-3"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {isSuperAdmin && currentUser?._id !== user._id && user.role !== 'superadmin' && (
                        <>
                          {user.isBlocked ? (
                            <button
                              onClick={() => handleUnblockUser(user._id)}
                              className="text-green-500 hover:text-green-700 mr-3"
                              title="Unblock User"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockUser(user._id)}
                              className="text-yellow-500 hover:text-yellow-700 mr-3"
                              title="Block User"
                            >
                              <NoSymbolIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete User"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <UserIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Users Found</h3>
            <p className="text-gray-500">No users match your current criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="flex items-center justify-between pt-4"
            aria-label="Pagination"
          >
            <div className="flex-1 flex justify-between sm:justify-end">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-300">
                  Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(currentPage * 10, users.length + (currentPage - 1) * 10)}</span> of <span className="font-medium">{users.length + (currentPage - 1) * 10}</span> results
                </p>
              </div>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Users;
