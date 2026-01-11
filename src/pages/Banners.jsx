import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: { url: '', alt: '' },
    link: { url: '', text: '', target: '_self' },
    position: 'shop-top',
    order: 0,
    isActive: true,
    backgroundColor: '#CD7F32',
    textColor: '#FFFFFF',
    buttonColor: '#D4AF37'
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/banners/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBanners(response.data.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: {
            url: e.target.result,
            alt: file.name
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');

      if (editBanner) {
        await axios.put(`${API_URL}/banners/${editBanner._id}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Banner updated successfully');
      } else {
        await axios.post(`${API_URL}/banners`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Banner created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error(error.response?.data?.message || 'Failed to save banner');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        const token = localStorage.getItem('admin_token');
        await axios.delete(`${API_URL}/banners/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Banner deleted successfully');
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        toast.error('Failed to delete banner');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: { url: '', alt: '' },
      link: { url: '', text: '', target: '_self' },
      position: 'shop-top',
      order: 0,
      isActive: true,
      backgroundColor: '#CD7F32',
      textColor: '#FFFFFF',
      buttonColor: '#D4AF37'
    });
    setEditBanner(null);
  };

  const openModal = (banner = null) => {
    if (banner) {
      setEditBanner(banner);
      setFormData({
        ...banner,
        image: banner.image || { url: '', alt: '' },
        link: banner.link || { url: '', text: '', target: '_self' }
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Shop Banners</h1>
        <button
          onClick={() => openModal()}
          className="bg-bronze text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gold transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner._id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-bronze/50 transition-all duration-300 group">
            <div className="relative">
              {banner.image?.url ? (
                <img 
                  src={banner.image.url} 
                  alt={banner.image.alt}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                  <PhotoIcon className="h-12 w-12 text-gray-600" />
                </div>
              )}
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  onClick={() => openModal(banner)}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="p-2 bg-black/50 hover:bg-red-600 text-white rounded-full transition-all"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  banner.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-3">
                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-bronze transition-colors">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-gray-400 text-sm">{banner.subtitle}</p>
                )}
              </div>
              {banner.description && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{banner.description}</p>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 bg-gray-800 px-2 py-1 rounded">
                  {banner.position.replace('-', ' ').toUpperCase()}
                </span>
                <span className="text-gray-500">Order: {banner.order}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No banners found</p>
          <button
            onClick={() => openModal()}
            className="mt-4 text-bronze hover:underline"
          >
            Create your first banner
          </button>
        </div>
      )}

      {/* Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {editBanner ? 'Edit Banner' : 'Add Banner'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    <option value="shop-top">Shop Top</option>
                    <option value="hero">Hero Section</option>
                    <option value="category">Category Page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white h-20"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-white mb-2">Banner Image</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="banner-image"
                  />
                  <label
                    htmlFor="banner-image"
                    className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 rounded-lg p-4 transition-colors"
                  >
                    <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-gray-400">Click to upload banner image</span>
                  </label>
                </div>
                {formData.image.url && (
                  <img 
                    src={formData.image.url} 
                    alt="Preview" 
                    className="mt-2 w-full h-32 object-cover rounded"
                  />
                )}
              </div>

              {/* Link Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Button Text</label>
                  <input
                    type="text"
                    value={formData.link.text}
                    onChange={(e) => setFormData({
                      ...formData, 
                      link: {...formData.link, text: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Button Link</label>
                  <input
                    type="url"
                    value={formData.link.url}
                    onChange={(e) => setFormData({
                      ...formData, 
                      link: {...formData.link, url: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
              </div>

              {/* Color Settings */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white mb-2">Background Color</label>
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                    className="w-full h-10 bg-gray-800 border border-gray-700 rounded"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Text Color</label>
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({...formData, textColor: e.target.value})}
                    className="w-full h-10 bg-gray-800 border border-gray-700 rounded"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Button Color</label>
                  <input
                    type="color"
                    value={formData.buttonColor}
                    onChange={(e) => setFormData({...formData, buttonColor: e.target.value})}
                    className="w-full h-10 bg-gray-800 border border-gray-700 rounded"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  Active Banner
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-bronze text-black rounded hover:bg-gold"
                >
                  {editBanner ? 'Update' : 'Create'} Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;