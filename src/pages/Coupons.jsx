import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';
import { useAuthStore } from '../store/authStore';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minimumAmount: '',
    maximumDiscount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: '',
    isActive: true
  });
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchCoupons();
  }, [isSuperAdmin]);

  const fetchCoupons = async () => {
    try {
      const endpoint = isSuperAdmin ? '/admin/coupons' : '/admin/coupons/my-coupons';
      const response = await apiCall(endpoint);
      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can manage coupons.');
      return;
    }
    try {
      if (editCoupon) {
        await apiCall(`/admin/coupons/${editCoupon._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        toast.success('Coupon updated successfully');
      } else {
        await apiCall('/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        toast.success('Coupon created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can delete coupons.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await apiCall(`/admin/coupons/${id}`, {
          method: 'DELETE'
        });
        toast.success('Coupon deleted successfully');
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        toast.error('Failed to delete coupon');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minimumAmount: '',
      maximumDiscount: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      usageLimit: '',
      isActive: true
    });
    setEditCoupon(null);
  };

  const openModal = (coupon = null) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can add or edit coupons.');
      return;
    }
    if (coupon) {
      setEditCoupon(coupon);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minimumAmount: coupon.minimumAmount || '',
        maximumDiscount: coupon.maximumDiscount || '',
        validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
        usageLimit: coupon.usageLimit || '',
        isActive: coupon.isActive
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <button
          onClick={() => openModal()}
          className="bg-bronze text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gold"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Coupon</span>
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-white">Code</th>
              <th className="px-6 py-3 text-left text-white">Type</th>
              <th className="px-6 py-3 text-left text-white">Value</th>
              <th className="px-6 py-3 text-left text-white">Status</th>
              <th className="px-6 py-3 text-left text-white">Expiry</th>
              <th className="px-6 py-3 text-left text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="border-b border-gray-800">
                <td className="px-6 py-4 text-white font-mono">{coupon.code}</td>
                <td className="px-6 py-4 text-gray-300 capitalize">{coupon.type}</td>
                <td className="px-6 py-4 text-bronze">
                  {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    coupon.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No expiry'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(coupon)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editCoupon ? 'Edit Coupon' : 'Add Coupon'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-white mb-2">Value</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Min Order Amount</label>
                <input
                  type="number"
                  value={formData.minimumAmount}
                  onChange={(e) => setFormData({ ...formData, minimumAmount: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Valid From *</label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Valid Until *</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div className="flex items-center mb-4">
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  Active Coupon
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-bronze text-black px-4 py-2 rounded hover:bg-gold"
                >
                  {editCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;