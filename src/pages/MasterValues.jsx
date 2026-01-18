import { useState, useEffect } from 'react';
import { CogIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';

const MasterValues = () => {
  const [masterValues, setMasterValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('stone_types');
  const [showModal, setShowModal] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    description: '',
    metadata: {}
  });

  const categories = [
    { key: 'stone_types', label: 'Stone Types' },
    { key: 'finishes', label: 'Finishes' },
    { key: 'materials', label: 'Materials' },
    { key: 'sculpture_types', label: 'Sculpture Types' },
    { key: 'sizes', label: 'Sizes' },
    { key: 'colors', label: 'Colors' }
  ];

  useEffect(() => {
    fetchMasterValues();
  }, []);

  const fetchMasterValues = async () => {
    try {
      const response = await apiCall('/master-values');
      const data = await response.json();
      setMasterValues(data.masterValues || {});
    } catch (error) {
      console.error('Error fetching master values:', error);
      toast.error('Failed to fetch master values');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingValue(null);
    setFormData({ label: '', value: '', description: '', metadata: {} });
    setShowModal(true);
  };

  const handleEdit = (value) => {
    setEditingValue(value);
    setFormData({
      label: value.label,
      value: value.value,
      description: value.description || '',
      metadata: value.metadata || {}
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingValue) {
        // Update existing value
        const updatedValues = masterValues[selectedCategory].map(v => 
          v._id === editingValue._id ? { ...v, ...formData } : v
        );
        
        await apiCall(`/master-values/${selectedCategory}`, {
          method: 'PUT',
          body: JSON.stringify({ values: updatedValues })
        });
      } else {
        // Add new value
        await apiCall(`/master-values/${selectedCategory}`, {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      
      toast.success(`Master value ${editingValue ? 'updated' : 'added'} successfully`);
      setShowModal(false);
      fetchMasterValues();
    } catch (error) {
      console.error('Error saving master value:', error);
      toast.error('Failed to save master value');
    }
  };

  const handleDelete = async (valueId) => {
    if (!window.confirm('Are you sure you want to delete this value?')) return;
    
    try {
      await apiCall(`/master-values/${selectedCategory}/${valueId}`, {
        method: 'DELETE'
      });
      
      toast.success('Master value deleted successfully');
      fetchMasterValues();
    } catch (error) {
      console.error('Error deleting master value:', error);
      toast.error('Failed to delete master value');
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <CogIcon className="h-8 w-8 text-bronze" />
            <span>Master Values</span>
          </h1>
          <p className="text-gray-400 mt-1">Manage configurable dropdown options</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-bronze text-black rounded-xl hover:bg-gold transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Value</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-bronze text-black'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Values List */}
        <div className="lg:col-span-3 bg-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">
              {categories.find(c => c.key === selectedCategory)?.label} Values
            </h3>
          </div>

          {masterValues[selectedCategory]?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No values found for this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {masterValues[selectedCategory]?.map((value) => (
                <div key={value._id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{value.label}</h4>
                    <p className="text-gray-400 text-sm">Value: {value.value}</p>
                    {value.description && (
                      <p className="text-gray-500 text-sm mt-1">{value.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(value)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(value._id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {editingValue ? 'Edit Value' : 'Add New Value'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Label</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
                  placeholder="Display name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Value</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
                  placeholder="Internal value"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
                  rows="3"
                  placeholder="Additional description"
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-bronze text-black rounded-lg hover:bg-gold transition-colors"
                >
                  {editingValue ? 'Update' : 'Add'} Value
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterValues;