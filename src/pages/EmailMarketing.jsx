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
    <div className="p-6 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center space-x-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
            <EnvelopeIcon className="h-8 w-8 text-primary-600" />
          </div>
          <span>Direct Communication</span>
        </h1>
        <p className="text-gray-500 font-medium mt-1 pl-16">Formulate and dispatch targeted HTML updates to your customer segments</p>
      </div>

      {/* Email Type Selection */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Campaign Strategy</h2>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-[0.1em] mt-1">Select recipient scope</p>
        </div>
        <div className="flex space-x-2 bg-stone-100/50 p-1.5 rounded-2xl border border-gray-100">
          <button
            onClick={() => setEmailType('individual')}
            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${emailType === 'individual'
                ? 'bg-white text-primary-600 shadow-sm border border-gray-50'
                : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            Laser Targeted
          </button>
          <button
            onClick={() => setEmailType('bulk')}
            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${emailType === 'bulk'
                ? 'bg-white text-primary-600 shadow-sm border border-gray-50'
                : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            Mass Campaign
          </button>
        </div>
      </div>

      {/* Email Form */}
      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-10 max-w-5xl">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Compose Newsletter</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {emailType === 'individual' ? (
            <div>
              <label htmlFor="recipient" className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Target Recipient Address</label>
              <input
                type="email"
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                placeholder="e.g., collector@silaimart.com"
                disabled={loading || !isSuperAdmin}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="recipientType" className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Audience Segment</label>
              <select
                id="recipientType"
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value)}
                className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                disabled={loading || !isSuperAdmin}
              >
                <option value="all_users">Authenticated Users Only</option>
                <option value="all_admins">Administrative Network</option>
                <option value="all">Complete Ecosystem</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="subject" className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Campaign Subject Line</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
              placeholder="Announcing new arrivals..."
              disabled={loading || !isSuperAdmin}
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Content Manifest (Full HTML Enabled)</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-6 py-6 bg-stone-50 border border-gray-100 rounded-[2.5rem] text-gray-700 font-medium h-96 resize-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all leading-relaxed placeholder:text-gray-300"
            placeholder="Structure your HTML content here. Standard tags are processed for rich formatting..."
            disabled={loading || !isSuperAdmin}
          ></textarea>
          <div className="flex items-center space-x-2 mt-4 pl-2 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">HTML 5.0 Engine Ready</p>
          </div>
        </div>

        {isSuperAdmin ? (
          <button
            onClick={handleSendEmail}
            className={`w-full py-5 rounded-[2rem] text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-primary-100 active:scale-[0.99] ${loading ? 'bg-gray-200 cursor-not-allowed text-gray-400' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200 hover:shadow-primary-300'
              }`}
            disabled={loading}
          >
            {loading ? 'Processing Dispatch...' : 'Execute Dispatch'}
          </button>
        ) : (
          <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex items-center justify-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
            <p className="text-rose-700 text-xs font-black uppercase tracking-widest">Administrative overhead required for dispatch</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailMarketing;