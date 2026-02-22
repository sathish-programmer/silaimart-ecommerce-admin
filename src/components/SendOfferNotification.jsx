import { useState } from 'react';
import { PaperAirplaneIcon, GiftIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const SendOfferNotification = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    url: '/shop',
    couponCode: '',
    sendToAll: true,
    userId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    if (!formData.sendToAll && !formData.userId.trim()) {
      toast.error('User ID is required when not sending to all users');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const endpoint = formData.sendToAll ? '/offers/send-to-all' : '/offers/send-to-user';

      const payload = {
        title: formData.title,
        message: formData.message,
        url: formData.url || '/shop',
        couponCode: formData.couponCode || undefined
      };

      if (!formData.sendToAll) {
        payload.userId = formData.userId;
      }

      const response = await axios.post(`${API_URL}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(response.data.message);

      // Reset form
      setFormData({
        title: '',
        message: '',
        url: '/shop',
        couponCode: '',
        sendToAll: true,
        userId: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
      <div className="flex items-center mb-10">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mr-4 shadow-sm border border-amber-100">
          <GiftIcon className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Promotional Reach</h2>
          <p className="text-gray-500 text-sm font-medium">Broadcast offers and notifications to your customers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Send To Options */}
        <div className="bg-stone-50/50 p-6 rounded-3xl border border-gray-50">
          <label className="block text-gray-700 font-bold mb-4 uppercase text-xs tracking-widest pl-1">Target Audience</label>
          <div className="flex space-x-6">
            <label className="flex items-center group cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="radio"
                  name="sendTo"
                  checked={formData.sendToAll}
                  onChange={() => setFormData({ ...formData, sendToAll: true, userId: '' })}
                  className="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500/20"
                />
              </div>
              <div className="flex items-center ml-3">
                <UserGroupIcon className={`h-5 w-5 mr-2 ${formData.sendToAll ? 'text-primary-600' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${formData.sendToAll ? 'text-gray-900' : 'text-gray-500'}`}>All Users</span>
              </div>
            </label>
            <label className="flex items-center group cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="radio"
                  name="sendTo"
                  checked={!formData.sendToAll}
                  onChange={() => setFormData({ ...formData, sendToAll: false })}
                  className="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500/20"
                />
              </div>
              <div className="flex items-center ml-3">
                <UserIcon className={`h-5 w-5 mr-2 ${!formData.sendToAll ? 'text-primary-600' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${!formData.sendToAll ? 'text-gray-900' : 'text-gray-500'}`}>Specific User</span>
              </div>
            </label>
          </div>
        </div>

        {/* User ID (if specific user selected) */}
        {!formData.sendToAll && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">User Reference ID</label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-6 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
              placeholder="Paste user ID here..."
              required={!formData.sendToAll}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Title */}
          <div>
            <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Campaign Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-6 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
              placeholder="e.g., Special Diwali Offer!"
              required
            />
          </div>

          {/* Coupon Code */}
          <div>
            <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Coupon Link (Optional)</label>
            <input
              type="text"
              value={formData.couponCode}
              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
              className="w-full px-6 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold tracking-wider placeholder:tracking-normal focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder:text-gray-300"
              placeholder="e.g., DIWALI20"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Notification Message *</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-6 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-medium h-32 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none resize-none transition-all placeholder:text-gray-300"
            placeholder="Describe the offer or update clearly..."
            required
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Action Destination URL</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-medium">/</span>
            <input
              type="text"
              value={formData.url.startsWith('/') ? formData.url.slice(1) : formData.url}
              onChange={(e) => setFormData({ ...formData, url: `/${e.target.value}` })}
              className="w-full pl-10 pr-6 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
              placeholder="shop/categories/bronze"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
              <span>Broadcasting...</span>
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="h-5 w-5" />
              <span>Launch Campaign</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SendOfferNotification;