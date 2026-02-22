import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await apiCall(`/auth/users/${id}`);
        const data = await response.json();
        if (response.ok) {
          setUser(data);
        } else {
          toast.error(data.message || 'Failed to fetch user details');
          navigate('/users'); // Redirect back to user list on error
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Failed to fetch user details');
        navigate('/users'); // Redirect back to user list on error
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-gray-400">User not found.</div>;
  }

  return (
    <div className="p-6 space-y-10">
      <div className="flex items-center space-x-6 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white text-gray-400 hover:text-primary-600 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md active:scale-95"
        >
          <ArrowLeftIcon className="h-6 w-6 stroke-[3px]" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Identity Profile</h1>
          <p className="text-gray-500 font-medium">Comprehensive data for user {user.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary-600 rounded-full"></div>
              Personal Information
            </h2>
            <div className="grid gap-6">
              {[
                { label: 'Full Name', value: user.name },
                { label: 'Contact Email', value: user.email },
                { label: 'Verified Phone', value: user.phone || 'N/A' },
                { label: 'System Role', value: user.role, highlight: true },
                { label: 'Registration Date', value: new Date(user.createdAt).toLocaleDateString() },
                { label: 'Account Status', value: user.isBlocked ? 'Blocked' : 'Active', status: true },
                { label: 'Loyalty Points', value: `${user.loyaltyPoints || 0} PTS`, accent: true },
              ].map((item, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-1">{item.label}</span>
                  <span className={`text-gray-900 font-black tracking-tight ${item.highlight ? 'text-primary-600 uppercase text-xs' :
                    item.accent ? 'text-primary-700' :
                      item.status ? (item.value === 'Active' ? 'text-green-600' : 'text-rose-600') :
                        'text-lg'
                    }`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-amber-400 rounded-full"></div>
              Verified Addresses
            </h2>
            <div className="space-y-4">
              {user.addresses && user.addresses.length > 0 ? user.addresses.map((address, index) => (
                <div key={index} className="bg-stone-50/50 p-6 rounded-[2rem] border border-gray-50 relative group hover:bg-white hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-300">
                  {address.isDefault && (
                    <span className="absolute top-6 right-6 px-3 py-1 bg-primary-100 text-primary-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-primary-200 shadow-sm">Primary</span>
                  )}
                  <p className="text-gray-900 font-black text-sm mb-2 uppercase tracking-tight">{address.fullName}</p>
                  <p className="text-gray-600 font-medium text-sm leading-relaxed">{address.street}</p>
                  <p className="text-gray-600 font-medium text-sm">{address.city}, {address.state} {address.pincode}</p>
                  <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-3">{address.country}</p>
                </div>
              )) : (
                <div className="p-10 bg-stone-50 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                  <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No address found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* You can add more sections here like recent orders, etc. */}
    </div>
  );
};

export default UserDetail;


