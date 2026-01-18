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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-gray-400">User not found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-3xl font-bold text-white">User Details: {user.name}</h1>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Personal Information</h2>
          <p className="text-gray-300"><strong>Name:</strong> {user.name}</p>
          <p className="text-gray-300"><strong>Email:</strong> {user.email}</p>
          <p className="text-gray-300"><strong>Phone:</strong> {user.phone || 'N/A'}</p>
          <p className="text-gray-300"><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
          <p className="text-gray-300"><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          <p className="text-gray-300"><strong>Status:</strong> {user.isBlocked ? <span className="text-red-400">Blocked</span> : <span className="text-green-400">Active</span>}</p>
          <p className="text-gray-300"><strong>Loyalty Points:</strong> {user.loyaltyPoints || 0}</p>
        </div>

        {user.addresses && user.addresses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mt-4 mb-2">Addresses</h2>
            <div className="space-y-3">
              {user.addresses.map((address, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-white font-semibold">{address.fullName}</p>
                  <p className="text-gray-300">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                  <p className="text-gray-300">{address.country} {address.isDefault && <span className="text-blue-400">(Default)</span>}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* You can add more sections here like recent orders, etc. */}
      </div>
    </div>
  );
};

export default UserDetail;
