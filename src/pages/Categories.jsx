import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');

      if (editCategory) {
        await axios.put(`${API_URL}/admin/categories/${editCategory._id}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Category updated successfully');
      } else {
        await axios.post(`${API_URL}/admin/categories`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Category created successfully');
      }

      setShowModal(false);
      setEditCategory(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const token = localStorage.getItem('admin_token');
        await axios.delete(`${API_URL}/admin/categories/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const openModal = (category = null) => {
    setEditCategory(category);
    setFormData(category ? { name: category.name, description: category.description || '' } : { name: '', description: '' });
    setShowModal(true);
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Categories</h1>
          <p className="text-gray-500 font-medium mt-1">Organize your sculptures by type and style</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 font-bold active:scale-[0.98]"
        >
          <PlusIcon className="h-5 w-5 stroke-2" />
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(categories) && categories.map((category) => (
          <div key={category._id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-300">
                <PlusIcon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(category)}
                  className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-primary-600 transition-colors">{category.name}</h3>
            <p className="text-gray-500 font-medium line-clamp-2 min-h-[3rem] mb-6">{category.description || 'No description provided for this collection.'}</p>
            <div className="border-t border-gray-50 pt-4 mt-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Unique Slug</span>
              <p className="text-gray-900 font-bold mt-1 bg-stone-50 px-3 py-1.5 rounded-lg inline-block">{category.slug}</p>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <PlusIcon className="h-10 w-10 text-gray-300" />
          </div>
          <p className="text-gray-900 text-xl font-black tracking-tight mb-2">No collections yet</p>
          <p className="text-gray-500 font-medium mb-8">Start organizing your products into meaningful categories</p>
          <button
            onClick={() => openModal()}
            className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
          >
            Create first category
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {editCategory ? 'Edit Type' : 'New Type'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all"
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bronze Sculptures"
                  className="w-full bg-stone-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-stone-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 font-medium h-32 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none resize-none transition-all"
                  placeholder="Tell customers about this collection..."
                />
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3.5 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-[0.98]"
                >
                  {editCategory ? 'Save Changes' : 'Create Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;