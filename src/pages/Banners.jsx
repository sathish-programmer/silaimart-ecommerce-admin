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
    backgroundColor: '#7c3aed', // primary-600
    textColor: '#FFFFFF',
    buttonColor: '#fbbf24' // amber-400
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
      backgroundColor: '#7c3aed',
      textColor: '#FFFFFF',
      buttonColor: '#fbbf24'
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

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shop Banners</h1>
          <p className="text-gray-500 font-medium mt-1">Design eye-catching promotions for your store</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 font-bold active:scale-[0.98]"
        >
          <PlusIcon className="h-5 w-5 stroke-2" />
          <span>Add New Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {banners.map((banner) => (
          <div key={banner._id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 group">
            <div className="relative h-56 overflow-hidden">
              {banner.image?.url ? (
                <img
                  src={banner.image.url}
                  alt={banner.image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-stone-50 flex items-center justify-center">
                  <PhotoIcon className="h-12 w-12 text-gray-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-4 right-4 flex space-x-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={() => openModal(banner)}
                  className="p-3 bg-white/90 backdrop-blur-md hover:bg-white text-primary-600 rounded-2xl shadow-lg transition-all active:scale-90"
                >
                  <PencilIcon className="h-5 w-5 stroke-2" />
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="p-3 bg-white/90 backdrop-blur-md hover:bg-rose-50 text-rose-600 rounded-2xl shadow-lg transition-all active:scale-90"
                >
                  <TrashIcon className="h-5 w-5 stroke-2" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${banner.isActive
                  ? 'bg-green-500/80 text-white border-green-400/50'
                  : 'bg-rose-500/80 text-white border-rose-400/50'
                  }`}>
                  {banner.isActive ? 'Active' : 'Passive'}
                </span>
              </div>
            </div>
            <div className="p-8">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 bg-primary-50 px-3 py-1 rounded-lg">
                    {banner.position.replace('-', ' ')}
                  </span>
                  <span className="text-gray-400 font-bold text-xs">Order: {banner.order}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-primary-600 transition-colors uppercase truncate">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-gray-500 font-bold text-sm tracking-wide">{banner.subtitle}</p>
                )}
              </div>
              {banner.description && (
                <p className="text-gray-500 font-medium text-sm mb-6 line-clamp-2 leading-relaxed">{banner.description}</p>
              )}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-50">
                <div className="w-8 h-8 rounded-full border border-gray-100 shadow-inner" style={{ backgroundColor: banner.backgroundColor }} title="Background" />
                <div className="w-8 h-8 rounded-full border border-gray-100 shadow-inner" style={{ backgroundColor: banner.textColor }} title="Text Color" />
                <div className="w-8 h-8 rounded-full border border-gray-100 shadow-inner" style={{ backgroundColor: banner.buttonColor }} title="Button Color" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <PhotoIcon className="h-10 w-10 text-gray-300" />
          </div>
          <p className="text-gray-900 text-xl font-black tracking-tight mb-2">No promotional banners</p>
          <p className="text-gray-500 font-medium mb-8">Start highlighting your best collections and offers</p>
          <button
            onClick={() => openModal()}
            className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
          >
            Create first banner
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center p-8 border-b border-gray-50">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {editBanner ? 'Edit Promo' : 'New Promo'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all"
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Visual Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. SUMMER SALE"
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Up to 50% Off"
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Placement</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none"
                  >
                    <option value="shop-top">Shop Top</option>
                    <option value="hero">Hero Section</option>
                    <option value="category">Category Page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Index Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Campaign Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Elaborate on the offer..."
                  className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-medium h-28 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none resize-none transition-all"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Promotion Artwork</label>
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 bg-stone-50/50 hover:bg-stone-50 hover:border-primary-300 transition-all group/upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="banner-image"
                  />
                  <label
                    htmlFor="banner-image"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <PhotoIcon className="h-12 w-12 text-gray-300 mb-4 group-hover/upload:scale-110 group-hover/upload:text-primary-500 transition-all" />
                    <span className="text-gray-900 font-bold">Select high-quality artwork</span>
                    <span className="text-gray-400 text-[10px] font-black uppercase mt-1 tracking-widest">Recommended: 1920x600 for wide banners</span>
                  </label>
                </div>
                {formData.image.url && (
                  <div className="mt-6 relative rounded-2xl overflow-hidden border border-gray-100 group/preview">
                    <img
                      src={formData.image.url}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-black text-xs uppercase tracking-widest">Current Artwork</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Link Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Call to Action Text</label>
                  <input
                    type="text"
                    value={formData.link.text}
                    onChange={(e) => setFormData({
                      ...formData,
                      link: { ...formData.link, text: e.target.value }
                    })}
                    placeholder="e.g. SHOP NOW"
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Target Path / URL</label>
                  <input
                    type="text"
                    value={formData.link.url}
                    onChange={(e) => setFormData({
                      ...formData,
                      link: { ...formData.link, url: e.target.value }
                    })}
                    placeholder="e.g. /shop or https://..."
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Color Settings */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Surface Color</label>
                  <div className="flex items-center space-x-3 bg-stone-50 p-3 rounded-2xl border border-gray-100">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-10 h-10 bg-transparent border-0 rounded-lg cursor-pointer transition-transform hover:scale-110"
                    />
                    <span className="text-[10px] font-black font-mono text-gray-400">{formData.backgroundColor.toUpperCase()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Typography Color</label>
                  <div className="flex items-center space-x-3 bg-stone-50 p-3 rounded-2xl border border-gray-100">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-10 h-10 bg-transparent border-0 rounded-lg cursor-pointer transition-transform hover:scale-110"
                    />
                    <span className="text-[10px] font-black font-mono text-gray-400">{formData.textColor.toUpperCase()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Action Color</label>
                  <div className="flex items-center space-x-3 bg-stone-50 p-3 rounded-2xl border border-gray-100">
                    <input
                      type="color"
                      value={formData.buttonColor}
                      onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                      className="w-10 h-10 bg-transparent border-0 rounded-lg cursor-pointer transition-transform hover:scale-110"
                    />
                    <span className="text-[10px] font-black font-mono text-gray-400">{formData.buttonColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-6 rounded-[2rem] flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-black text-sm uppercase tracking-widest">Active Status</p>
                  <p className="text-gray-500 text-xs font-medium">Control if this banner is visible live</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-[0.98]"
                >
                  {editBanner ? 'Save Changes' : 'Publish Banner'}
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