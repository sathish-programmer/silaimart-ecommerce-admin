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
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <GiftIcon className="h-6 w-6 text-bronze mr-3" />
        <h2 className="text-xl font-bold text-white">Send Offer Notification</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Send To Options */}
        <div>
          <label className="block text-white mb-3 font-medium">Send To</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="sendTo"
                checked={formData.sendToAll}
                onChange={() => setFormData({ ...formData, sendToAll: true, userId: '' })}
                className="text-bronze focus:ring-bronze"
              />
              <UserGroupIcon className="h-5 w-5 text-bronze mx-2" />
              <span className="text-white">All Users</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sendTo"
                checked={!formData.sendToAll}
                onChange={() => setFormData({ ...formData, sendToAll: false })}
                className="text-bronze focus:ring-bronze"
              />
              <UserIcon className="h-5 w-5 text-bronze mx-2" />
              <span className="text-white">Specific User</span>
            </label>
          </div>
        </div>

        {/* User ID (if specific user selected) */}
        {!formData.sendToAll && (
          <div>
            <label className="block text-white mb-2">User ID</label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-bronze focus:outline-none"
              placeholder="Enter user ID"
              required={!formData.sendToAll}
            />
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-white mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-bronze focus:outline-none"
            placeholder="e.g., Special Diwali Offer!"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-white mb-2">Message *</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-bronze focus:outline-none h-24"
            placeholder="e.g., Get 20% off on all divine sculptures. Limited time offer!"
            required
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-white mb-2">Redirect URL</label>
          <input
            type="text"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-bronze focus:outline-none"
            placeholder="/shop or /product/123"
          />
        </div>

        {/* Coupon Code */}
        <div>
          <label className="block text-white mb-2">Coupon Code (Optional)</label>
          <input
            type="text"
            value={formData.couponCode}
            onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-bronze focus:outline-none"
            placeholder="e.g., DIWALI20"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-bronze text-black py-3 rounded font-semibold hover:bg-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="h-5 w-5" />
              <span>Send Notification</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SendOfferNotification;