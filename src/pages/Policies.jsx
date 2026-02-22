import { useState, useEffect } from 'react';
import { DocumentTextIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';
import { useAuthStore } from '../store/authStore';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isActive: true
  });
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';

  const policyTypes = [
    { type: 'terms', label: 'Terms & Conditions', icon: '📋' },
    { type: 'return', label: 'Return Policy', icon: '↩️' },
    { type: 'cancellation', label: 'Cancellation Policy', icon: '❌' },
    { type: 'privacy', label: 'Privacy Policy', icon: '🔒' },
    { type: 'shipping', label: 'Shipping Policy', icon: '🚚' }
  ];

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await apiCall('/admin/policies');
      const data = await response.json();
      setPolicies(data.policies || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can edit policies');
      return;
    }
    const policy = policies.find(p => p.type === type);
    if (policy) {
      setFormData({
        title: policy.title,
        content: policy.content,
        isActive: policy.isActive
      });
    } else {
      const policyType = policyTypes.find(pt => pt.type === type);
      setFormData({
        title: policyType.label,
        content: '',
        isActive: true
      });
    }
    setEditingPolicy(type);
  };

  const handleSave = async () => {
    if (!isSuperAdmin) return;
    try {
      await apiCall(`/admin/policies/${editingPolicy}`, {
        method: 'PUT',
        body: JSON.stringify({
          type: editingPolicy,
          ...formData
        })
      });

      toast.success('Policy updated successfully');
      setEditingPolicy(null);
      fetchPolicies();
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error('Failed to save policy');
    }
  };

  const handleCancel = () => {
    setEditingPolicy(null);
    setFormData({ title: '', content: '', isActive: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center space-x-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
            </div>
            <span>Legal & Policies</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1 pl-16">Institutionalize your store's governance and trust standards</p>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 gap-10">
        {policyTypes.map((policyType) => {
          const policy = policies.find(p => p.type === policyType.type);
          const isEditing = editingPolicy === policyType.type;

          return (
            <div key={policyType.type} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                <span className="text-9xl">{policyType.icon}</span>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 relative z-10">
                <div className="flex items-center space-x-6">
                  <div className="text-4xl p-4 bg-stone-50 rounded-3xl group-hover:bg-primary-50 transition-colors">{policyType.icon}</div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{policyType.label}</h3>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest pl-1">
                      {policy ? `Updated: ${new Date(policy.lastUpdated).toLocaleDateString(undefined, { dateStyle: 'medium' })}` : 'Not Configured'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {policy && (
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${policy.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-rose-50 text-rose-700 border-rose-100 shadow-sm'
                      }`}>
                      {policy.isActive ? 'Active live' : 'Offline'}
                    </span>
                  )}

                  {!isEditing ? (
                    isSuperAdmin && (
                      <button
                        onClick={() => handleEdit(policyType.type)}
                        className="bg-primary-50 text-primary-600 p-3.5 rounded-2xl hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Modify Content"
                      >
                        <PencilIcon className="h-5 w-5 stroke-2" />
                      </button>
                    )
                  ) : (
                    isSuperAdmin && (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSave}
                          className="bg-green-500 text-white p-3.5 rounded-2xl hover:bg-green-600 shadow-lg shadow-green-100 transition-all active:scale-95"
                          title="Save Changes"
                        >
                          <CheckIcon className="h-5 w-5 stroke-[3px]" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-stone-100 text-gray-400 p-3.5 rounded-2xl hover:bg-stone-200 hover:text-gray-900 transition-all active:scale-95"
                          title="Discard Edits"
                        >
                          <XMarkIcon className="h-5 w-5 stroke-2" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-8 relative z-10">
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Document Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                      disabled={!isSuperAdmin}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Legal Content (HTML Supported)</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-6 py-6 bg-stone-50 border border-gray-100 rounded-[2.5rem] text-gray-700 font-medium h-96 resize-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all leading-relaxed"
                      placeholder="Start drafting your institutional policies..."
                      disabled={!isSuperAdmin}
                    />
                    <div className="flex items-center space-x-4 mt-4 pl-4 text-gray-400">
                      <span className="text-[10px] font-black uppercase tracking-widest">Syntax Guide:</span>
                      <code className="text-[10px] bg-stone-100 px-2 py-0.5 rounded">&lt;h3&gt;</code>
                      <code className="text-[10px] bg-stone-100 px-2 py-0.5 rounded">&lt;p&gt;</code>
                      <code className="text-[10px] bg-stone-100 px-2 py-0.5 rounded">&lt;ul&gt;</code>
                      <code className="text-[10px] bg-stone-100 px-2 py-0.5 rounded">&lt;strong&gt;</code>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-6 rounded-[2rem] flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 font-black text-sm uppercase tracking-widest">Document Status</p>
                      <p className="text-gray-500 text-xs font-medium">Control live visibility on consumer portal</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only peer"
                        disabled={!isSuperAdmin}
                      />
                      <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-100/50 rounded-[2.5rem] p-8 border border-gray-50/50 group-hover:bg-white transition-colors duration-500 relative z-10">
                  {policy ? (
                    <div
                      className="text-gray-600 font-medium text-sm max-h-48 overflow-y-auto leading-relaxed scrollbar-hide"
                      dangerouslySetInnerHTML={{ __html: policy.content.substring(0, 450) + '...' }}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 font-bold italic tracking-wide">Institutional content pending configuration.</p>
                      <p className="text-gray-300 text-xs mt-2 uppercase tracking-widest">Click the pencil icon to begin</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Policies;