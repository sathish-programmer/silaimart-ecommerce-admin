import { useState, useEffect, } from 'react';
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Users Management</h1>
          <p className="text-gray-500 font-medium mt-1">
            {isSuperAdmin ?
              'Manage and monitor all platform members' :
              'View customers who support your craft'
            }
          </p>
        </div>
        <div className="relative group">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full md:w-80 px-5 py-3 pl-12 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm shadow-gray-200/50 p-2">
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest pl-10">Name</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Email</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                  <th scope="col" className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest pr-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap pl-10">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-50 rounded-full flex items-center justify-center mr-3 group-hover:bg-primary-600 transition-colors">
                          <UserIcon className="h-5 w-5 text-primary-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-sm font-bold text-gray-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-medium">{user.email}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${user.role === 'superadmin' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          user.role === 'admin' ? 'bg-primary-50 text-primary-700 border border-primary-100' :
                            'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-400 font-medium">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right pr-10">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => viewUserDetails(user._id)}
                          className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {isSuperAdmin && currentUser?._id !== user._id && user.role !== 'superadmin' && (
                          <>
                            {user.isBlocked ? (
                              <button
                                onClick={() => handleUnblockUser(user._id)}
                                className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                title="Unblock User"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlockUser(user._id)}
                                className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all"
                                title="Block User"
                              >
                                <NoSymbolIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Delete User"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserIcon className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">No users found</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto">We couldn't find any users matching your current criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between rounded-b-[2rem]">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-500 font-medium">
                Showing <span className="font-black text-gray-900">{(currentPage - 1) * 10 + 1}</span> to <span className="font-black text-gray-900">{Math.min(currentPage * 10, users.length + (currentPage - 1) * 10)}</span> of <span className="font-black text-gray-900">{users.length + (currentPage - 1) * 10}</span> results
              </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end gap-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-6 py-2.5 bg-white border border-gray-100 text-sm font-bold rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2 stroke-2" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-6 py-2.5 bg-white border border-gray-100 text-sm font-bold rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
              >
                Next <ArrowRightIcon className="h-4 w-4 ml-2 stroke-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
