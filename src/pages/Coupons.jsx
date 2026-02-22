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

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Coupons</h1>
          <p className="text-gray-500 font-medium mt-1">Manage discounts and promotional offers</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 font-bold active:scale-[0.98]"
        >
          <PlusIcon className="h-5 w-5 stroke-2" />
          <span>New Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm shadow-gray-200/50">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-left text-gray-400 font-black uppercase text-xs tracking-widest pl-10">Code</th>
              <th className="px-8 py-5 text-left text-gray-400 font-black uppercase text-xs tracking-widest">Type</th>
              <th className="px-8 py-5 text-left text-gray-400 font-black uppercase text-xs tracking-widest">Value</th>
              <th className="px-8 py-5 text-left text-gray-400 font-black uppercase text-xs tracking-widest">Status</th>
              <th className="px-8 py-5 text-left text-gray-400 font-black uppercase text-xs tracking-widest">Expiry</th>
              <th className="px-8 py-5 text-right text-gray-400 font-black uppercase text-xs tracking-widest pr-10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="border-b border-gray-50 last:border-0 hover:bg-stone-50/50 transition-colors group">
                <td className="px-8 py-5 pl-10">
                  <span className="bg-stone-100 text-gray-900 font-black px-3 py-1.5 rounded-lg font-mono text-sm tracking-widest">
                    {coupon.code}
                  </span>
                </td>
                <td className="px-8 py-5 text-gray-500 font-bold capitalize">{coupon.type}</td>
                <td className="px-8 py-5">
                  <span className="text-primary-600 font-black text-lg">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${coupon.isActive
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                    {coupon.isActive ? 'Active' : 'Passive'}
                  </span>
                </td>
                <td className="px-8 py-5 text-gray-400 font-medium">
                  {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Lifetime'}
                </td>
                <td className="px-8 py-5 text-right pr-10">
                  <div className="flex justify-end space-x-1">
                    <button
                      onClick={() => openModal(coupon)}
                      className="p-2.5 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                    >
                      <PencilIcon className="h-5 w-5 stroke-2" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <TrashIcon className="h-5 w-5 stroke-2" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md max-h-screen overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {editCoupon ? 'Edit Coupon' : 'New Promo'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all"
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Unique Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE50"
                  className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-black font-mono tracking-widest focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Offer Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Benefit Value</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="e.g. 20"
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Min. Purchase (₹)</label>
                <input
                  type="number"
                  value={formData.minimumAmount}
                  onChange={(e) => setFormData({ ...formData, minimumAmount: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">End Date</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="bg-stone-50 p-6 rounded-[2rem] flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-black text-sm uppercase tracking-widest">Active Status</p>
                  <p className="text-gray-500 text-xs font-medium">Global toggle for this discount</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                </label>
              </div>
              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all font-bold"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-[0.98]"
                >
                  {editCoupon ? 'Save Changes' : 'Create Coupon'}
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