import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center space-x-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
              <Cog6ToothIcon className="h-8 w-8 text-primary-600" />
            </div>
            <span>System Metadata</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1 pl-16">Configure global dropdowns and product attribute values</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-[0.98] flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5 stroke-[3px]" />
          <span>Define New Value</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm self-start">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-4">Registry Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold transition-all ${selectedCategory === category.key
                  ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100'
                  : 'text-gray-500 hover:bg-stone-50'
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Values List */}
        <div className="lg:col-span-3 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm min-h-[500px]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {categories.find(c => c.key === selectedCategory)?.label} Definitions
            </h3>
            <span className="px-4 py-1.5 bg-stone-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
              {masterValues[selectedCategory]?.length || 0} Registered Items
            </span>
          </div>

          {masterValues[selectedCategory]?.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                <Cog6ToothIcon className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-gray-900 font-black text-xl mb-2">Registry is empty</p>
              <p className="text-gray-500 font-medium">No values have been defined for this metadata category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {masterValues[selectedCategory]?.map((value) => (
                <div key={value._id} className="bg-stone-50/50 rounded-3xl p-6 border border-gray-50 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-black text-lg tracking-tight mb-1">{value.label}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase tracking-widest">Identifier</span>
                      <code className="text-gray-500 text-xs font-bold font-mono">{value.value}</code>
                    </div>
                    {value.description && (
                      <p className="text-gray-500 text-sm mt-3 font-medium line-clamp-1">{value.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(value)}
                      className="p-3 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
                      title="Edit Entry"
                    >
                      <PencilIcon className="h-5 w-5 stroke-2" />
                    </button>
                    <button
                      onClick={() => handleDelete(value._id)}
                      className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                      title="Remove Entry"
                    >
                      <TrashIcon className="h-5 w-5 stroke-2" />
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md border border-gray-100 shadow-2xl overflow-hidden scale-in-center">
            <div className="flex justify-between items-center p-10 border-b border-gray-50 bg-stone-50/50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {editingValue ? 'Modify Metadata' : 'Define Entry'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Display Label</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="e.g. Italian Carrara"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">System Value (Unique)</label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-mono font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="stone_carrara"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Technical Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-medium h-32 resize-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="Specify physical properties or characteristics..."
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-stone-100 text-gray-600 font-black rounded-2xl hover:bg-stone-200 transition-all active:scale-[0.98]"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-[0.98]"
                >
                  {editingValue ? 'Commit Changes' : 'Register Entry'}
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