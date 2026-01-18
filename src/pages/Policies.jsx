import { useState, useEffect } from 'react';
import { DocumentTextIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
          <DocumentTextIcon className="h-8 w-8 text-bronze" />
          <span>Policies & Terms</span>
        </h1>
        <p className="text-gray-400 mt-1">Manage your store policies and terms</p>
      </div>

      {/* Policies Grid */}
      <div className="grid gap-6">
        {policyTypes.map((policyType) => {
          const policy = policies.find(p => p.type === policyType.type);
          const isEditing = editingPolicy === policyType.type;

          return (
            <div key={policyType.type} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{policyType.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{policyType.label}</h3>
                    <p className="text-gray-400 text-sm">
                      {policy ? `Last updated: ${new Date(policy.lastUpdated).toLocaleDateString()}` : 'Not configured'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {policy && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      policy.isActive ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                    }`}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                  
                  {!isEditing ? (
                    isSuperAdmin && (
                      <button
                        onClick={() => handleEdit(policyType.type)}
                        className="p-2 bg-bronze hover:bg-gold text-black rounded-lg transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )
                  ) : (
                    isSuperAdmin && (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Content</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none h-64 resize-none"
                      placeholder="Enter policy content... You can use HTML tags for formatting."
                      disabled={!isSuperAdmin}
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Tip: Use HTML tags like &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt; for formatting
                    </p>
                  </div>
                  
                  <div>
                    <label className="flex items-center text-white">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="mr-3"
                        disabled={!isSuperAdmin}
                      />
                      Active
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4">
                  {policy ? (
                    <div 
                      className="text-gray-300 text-sm max-h-32 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: policy.content.substring(0, 300) + '...' }}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm italic">No content configured yet. Click edit to add content.</p>
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