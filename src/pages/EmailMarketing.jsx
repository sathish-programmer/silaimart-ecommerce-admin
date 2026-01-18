import React, { useState } from 'react';
import { EnvelopeIcon, UsersIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';
import { useAuthStore } from '../store/authStore';

const EmailMarketing = () => {
  const [emailType, setEmailType] = useState('individual'); // 'individual' or 'bulk'
  const [recipient, setRecipient] = useState(''); // For individual email
  const [recipientType, setRecipientType] = useState('all_users'); // For bulk email: 'all_users', 'all_admins', 'all'
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';

  const handleSendEmail = async () => {
    if (emailType === 'individual' && !recipient) {
      toast.error('Please enter a recipient email address.');
      return;
    }
    if (emailType === 'bulk' && !recipientType) {
      toast.error('Please select a recipient type for bulk email.');
      return;
    }
    if (!subject) {
      toast.error('Please enter a subject.');
      return;
    }
    if (!message) {
      toast.error('Please enter a message.');
      return;
    }

    setLoading(true);
    try {
      let endpoint = '';
      let body = {};

      if (emailType === 'individual') {
        endpoint = '/admin/emails/send-custom';
        body = { to: recipient, subject, message };
      } else {
        endpoint = '/admin/emails/send-bulk';
        body = { recipientType, subject, message };
      }

      const response = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        // Clear form after successful send
        setRecipient('');
        setSubject('');
        setMessage('');
      } else {
        toast.error(data.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
          <EnvelopeIcon className="h-8 w-8 text-bronze" />
          <span>Email Marketing</span>
        </h1>
        <p className="text-gray-400 mt-1">Send custom emails to users or bulk emails for promotions and updates.</p>
      </div>

      {/* Email Type Selection */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Select Email Type</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setEmailType('individual')}
            className={`px-4 py-2 rounded-lg transition-all ${
              emailType === 'individual'
                ? 'bg-bronze text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Individual Email
          </button>
          <button
            onClick={() => setEmailType('bulk')}
            className={`px-4 py-2 rounded-lg transition-all ${
              emailType === 'bulk'
                ? 'bg-bronze text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Bulk Email
          </button>
        </div>
      </div>

      {/* Email Form */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Compose Email</h2>

        {emailType === 'individual' ? (
          <div>
            <label htmlFor="recipient" className="block text-white text-sm font-medium mb-2">Recipient Email</label>
            <input
              type="email"
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
              placeholder="e.g., user@example.com"
              disabled={loading || !isSuperAdmin}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="recipientType" className="block text-white text-sm font-medium mb-2">Send To</label>
            <select
              id="recipientType"
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
              disabled={loading || !isSuperAdmin}
            >
              <option value="all_users">All Users</option>
              <option value="all_admins">All Admins</option>
              <option value="all">All (Users & Admins)</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="subject" className="block text-white text-sm font-medium mb-2">Subject</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
            placeholder="Enter email subject"
            disabled={loading || !isSuperAdmin}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-white text-sm font-medium mb-2">Message (HTML supported)</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="10"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none resize-y"
            placeholder="Enter your email content. Basic HTML tags like <p>, <strong>, <a> are supported."
            disabled={loading || !isSuperAdmin}
          ></textarea>
          <p className="text-gray-500 text-xs mt-1">Tip: Use HTML tags for rich formatting.</p>
        </div>

        {isSuperAdmin ? (
          <button
            onClick={handleSendEmail}
            className={`w-full px-4 py-3 rounded-lg text-black font-semibold transition-colors ${
              loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-bronze hover:bg-gold'
            }`}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        ) : (
          <p className="text-red-400 text-center">Only Super Admins can send emails.</p>
        )}
      </div>
    </div>
  );
};

export default EmailMarketing;