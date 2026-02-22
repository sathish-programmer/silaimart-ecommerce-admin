import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, PhotoIcon, SparklesIcon, GlobeAltIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
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
    backgroundColor: '#7c3aed',
    textColor: '#FFFFFF',
    buttonColor: '#FFFFFF'
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
      buttonColor: '#FFFFFF'
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

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        <SparklesIcon className="h-6 w-6 text-primary-400 absolute inset-0 m-auto animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 p-8 lg:p-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">PROMOTIONAL BANNERS</h1>
          <p className="text-gray-500 font-medium">Curate high-impact visual narratives for your sanctuary.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-3 py-4 shadow-2xl shadow-primary-200"
        >
          <PlusIcon className="h-5 w-5 stroke-[3]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Add New Narrative</span>
        </button>
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {banners.map((banner) => (
          <div key={banner._id} className="card-premium group overflow-hidden">
            {/* Visual Preview */}
            <div className="relative h-64 overflow-hidden bg-stone-100">
              {banner.image?.url ? (
                <img
                  src={banner.image.url}
                  alt={banner.image.alt}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: banner.backgroundColor }}
                >
                  <PhotoIcon className="h-16 w-16 text-white/50" />
                </div>
              )}

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                <button
                  onClick={() => openModal(banner)}
                  className="p-4 bg-white text-primary-600 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <PencilIcon className="h-6 w-6 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="p-4 bg-white text-rose-600 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <TrashIcon className="h-6 w-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="absolute top-6 left-6">
                <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${banner.isActive
                  ? 'bg-emerald-500/90 text-white border-emerald-400/50'
                  : 'bg-rose-500/90 text-white border-rose-400/50'
                  }`}>
                  {banner.isActive ? 'Active Narrative' : 'Inactive'}
                </span>
              </div>

              {/* Position Badge */}
              <div className="absolute bottom-6 left-6">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/20">
                  <GlobeAltIcon className="h-3 w-3 text-white" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">{banner.position.replace('-', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority Index: {banner.order}</span>
                <div className="flex gap-1.5">
                  <div className="w-4 h-4 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: banner.backgroundColor }} />
                  <div className="w-4 h-4 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: banner.textColor }} />
                  <div className="w-4 h-4 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: banner.buttonColor }} />
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2 truncate group-hover:text-primary-600 transition-colors">
                {banner.title}
              </h3>
              {banner.subtitle && (
                <p className="text-sm font-bold text-gray-500 mb-4 tracking-tight line-clamp-1">{banner.subtitle}</p>
              )}
              {banner.description && (
                <p className="text-xs font-medium text-gray-400 leading-relaxed mb-6 line-clamp-2">{banner.description}</p>
              )}

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary-600">
                  <span className="text-[10px] font-black uppercase tracking-widest">Link: {banner.link?.url || 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {banners.length === 0 && (
        <div className="card-premium py-32 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-8 border border-gray-100">
            <PhotoIcon className="h-12 w-12 text-gray-300" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-3">No Promotional Narratives</h3>
          <p className="text-gray-500 font-medium mb-10 max-w-sm">Bring your collections to life with high-impact visual stories.</p>
          <button
            onClick={() => openModal()}
            className="btn-primary px-10 py-4"
          >
            Create First Narrative
          </button>
        </div>
      )}

      {/* Management Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl border border-gray-100 relative my-auto">
            <div className="flex justify-between items-center p-10 border-b border-gray-50">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                  {editBanner ? 'Refine Narrative' : 'New Narrative'}
                </h2>
                <p className="text-gray-500 font-medium text-sm mt-1">Configure your promotional visual story.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-3 bg-stone-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
              >
                <XMarkIcon className="h-7 w-7 stroke-[2]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Hero Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. DIVINE SUMMER SALE"
                      className="input-premium py-4 font-black uppercase tracking-tighter"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Refined Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="e.g. Exclusive Sacred Collections"
                      className="input-premium py-4"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Placement</label>
                      <select
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="input-premium py-4 font-bold"
                      >
                        <option value="shop-top">Shop Sanctuary</option>
                        <option value="hero">Grand Hero</option>
                        <option value="category">Category Flow</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Priority Order</label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        className="input-premium py-4 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Creative Artwork</label>
                    <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border-2 border-dashed border-gray-100 bg-stone-50 group/upload cursor-pointer transition-all hover:border-primary-300">
                      {formData.image.url ? (
                        <>
                          <img src={formData.image.url} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-all flex items-center justify-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-primary-600 px-4 py-2 rounded-full">Change Artwork</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                          <PhotoIcon className="h-12 w-12 text-gray-300 mb-3" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Visual</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-stone-50 p-6 rounded-[2rem] border border-gray-100/50">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Active Visibility</p>
                      <p className="text-[9px] text-gray-400 font-medium">Control live sanctuary visibility</p>
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
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">The Chronicle (Description)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell the story of this promotion..."
                  className="input-premium h-32 py-5 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary-600">
                    <GlobeAltIcon className="h-4 w-4" /> Celestial Links
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Button Text</label>
                      <input
                        type="text"
                        value={formData.link.text}
                        onChange={(e) => setFormData({ ...formData, link: { ...formData.link, text: e.target.value } })}
                        placeholder="e.g. SHOP NOW"
                        className="input-premium py-4"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Path / URL</label>
                      <input
                        type="text"
                        value={formData.link.url}
                        onChange={(e) => setFormData({ ...formData, link: { ...formData.link, url: e.target.value } })}
                        placeholder="e.g. /shop"
                        className="input-premium py-4"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary-600">
                    <PaintBrushIcon className="h-4 w-4" /> Visual Essence
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 text-center">Surface</label>
                      <input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-full h-12 bg-stone-50 border border-gray-100 rounded-xl cursor-pointer p-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 text-center">Script</label>
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-full h-12 bg-stone-50 border border-gray-100 rounded-xl cursor-pointer p-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 text-center">Focus</label>
                      <input
                        type="color"
                        value={formData.buttonColor}
                        onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                        className="w-full h-12 bg-stone-50 border border-gray-100 rounded-xl cursor-pointer p-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-5 pt-10 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-10 py-5 bg-stone-50 text-gray-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-stone-100 transition-all"
                >
                  Return
                </button>
                <button
                  type="submit"
                  className="btn-primary px-12 py-5 rounded-[2rem] shadow-2xl shadow-primary-200"
                >
                  {editBanner ? 'Finalize Narrative' : 'Publish to Sanctuary'}
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