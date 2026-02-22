import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import RichTextEditor from '../components/RichTextEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [masterValues, setMasterValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    discountType: 'percentage', // 'percentage' or 'amount'
    discountValue: '',
    category: '',
    stock: '',
    sku: '',
    material: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    sculptureDetails: {
      stone: '',
      finish: '',
      deity: '',
      origin: '',
      artisan: '',
      technique: ''
    },
    images: [],
    sizes: [],
    colors: [],
    tags: '',
    isFeatured: false,
    isActive: true
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchMasterValues();
  }, []);

  // Auto-generate SKU when name changes
  useEffect(() => {
    if (formData.name && !editProduct) {
      const sku = generateSKU(formData.name);
      setFormData(prev => ({ ...prev, sku }));
    }
  }, [formData.name, editProduct]);

  // Calculate discount price when discount changes
  useEffect(() => {
    if (formData.price && formData.discountValue) {
      const price = parseFloat(formData.price);
      const discountValue = parseFloat(formData.discountValue);
      let discountPrice;

      if (formData.discountType === 'percentage') {
        discountPrice = price - (price * discountValue / 100);
      } else {
        discountPrice = price - discountValue;
      }

      setFormData(prev => ({ ...prev, discountPrice: Math.max(0, discountPrice).toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, discountPrice: '' }));
    }
  }, [formData.price, formData.discountValue, formData.discountType]);

  const generateSKU = (name) => {
    const prefix = 'SM'; // SilaiMart prefix
    const nameCode = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${nameCode}-${timestamp}`;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            url: e.target.result,
            alt: file.name,
            file: file
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...images]
      }));
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      console.log('Categories response:', response.data);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchMasterValues = async () => {
    try {
      const response = await axios.get(`${API_URL}/master-values`);
      setMasterValues(response.data.masterValues || {});
    } catch (error) {
      console.error('Error fetching master values:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editProduct) {
        await axios.put(`${API_URL}/admin/products/${editProduct._id}`, submitData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API_URL}/admin/products`, submitData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Product created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('admin_token');
        await axios.delete(`${API_URL}/admin/products/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      discountType: 'percentage',
      discountValue: '',
      category: '',
      stock: '',
      sku: '',
      material: '',
      weight: '',
      dimensions: { length: '', width: '', height: '' },
      sculptureDetails: {
        stone: '',
        finish: '',
        deity: '',
        origin: '',
        artisan: '',
        technique: ''
      },
      images: [],
      sizes: [],
      colors: [],
      tags: '',
      isFeatured: false,
      isActive: true
    });
    setEditProduct(null);
  };

  const openModal = (product = null) => {
    if (product) {
      setEditProduct(product);
      setFormData({
        ...product,
        category: product.category?._id || product.category || '',
        discountPrice: product.discountPrice || '',
        discountValue: product.discountValue || '',
        discountType: product.discountType || 'percentage',
        tags: product.tags?.join(', ') || '',
        dimensions: product.dimensions || { length: '', width: '', height: '' },
        sculptureDetails: product.sculptureDetails || {
          stone: '',
          finish: '',
          deity: '',
          origin: '',
          artisan: '',
          technique: ''
        }
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  if (loading) return (
    <div className="flex justify-center p-12">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-primary-100"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="font-semibold">Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-gray-50 hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-gray-900 font-medium">{product.name}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{product.category?.name}</td>
                <td className="px-6 py-4 text-primary-600 font-bold">₹{product.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600 font-medium">{product.stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => openModal(product)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center p-8 border-b border-gray-50">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    placeholder="Enter product title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">SKU (Auto-generated)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))
                    ) : (
                      <option disabled>Loading categories...</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    required
                  />
                </div>

                {/* Discount Section */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="amount">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    placeholder={formData.discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Final Price</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-primary-600 font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    required
                  />
                </div>

                {/* Sculpture Details */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stone Type</label>
                  <select
                    value={formData.sculptureDetails.stone}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: { ...formData.sculptureDetails, stone: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  >
                    <option value="">Select Stone</option>
                    {masterValues.stone_types?.map(stone => (
                      <option key={stone._id} value={stone.value}>{stone.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Finish</label>
                  <select
                    value={formData.sculptureDetails.finish}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: { ...formData.sculptureDetails, finish: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  >
                    <option value="">Select Finish</option>
                    {masterValues.finishes?.map(finish => (
                      <option key={finish._id} value={finish.value}>{finish.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deity/Subject</label>
                  <input
                    type="text"
                    value={formData.sculptureDetails.deity}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: { ...formData.sculptureDetails, deity: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Origin</label>
                  <input
                    type="text"
                    value={formData.sculptureDetails.origin}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: { ...formData.sculptureDetails, origin: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Artisan</label>
                  <input
                    type="text"
                    value={formData.sculptureDetails.artisan}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: { ...formData.sculptureDetails, artisan: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Technique</label>
                  <input
                    type="text"
                    value={formData.sculptureDetails.technique}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: { ...formData.sculptureDetails, technique: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Material</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Dimensions Section */}
              <div className="space-y-4">
                <label className="block text-gray-700 font-bold uppercase text-[10px] tracking-[0.2em] pl-1">Dimensions (inches)</label>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Length</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.dimensions.length}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, length: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Width</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.dimensions.width}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, width: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Height</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.dimensions.height}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, height: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Description *</label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Enter product description..."
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="block text-gray-700 font-bold uppercase text-[10px] tracking-[0.2em] pl-1">Product Images</label>
                <div className="border-2 border-dashed border-stone-200 rounded-3xl p-8 bg-stone-50 group hover:border-primary-300 hover:bg-primary-50/10 transition-all duration-300">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer p-4 group"
                  >
                    <PhotoIcon className="h-12 w-12 text-gray-300 mb-4 group-hover:text-primary-500 transition-colors" />
                    <span className="text-gray-500 font-black text-xs uppercase tracking-widest">Click to upload assets</span>
                    <span className="text-gray-400 text-[10px] font-medium mt-1">PNG, JPG, WEBP • Max 10MB</span>
                  </label>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sizes Section */}
              <div className="space-y-6">
                <label className="block text-gray-700 font-bold uppercase text-[10px] tracking-[0.2em] pl-1">Available Specifications (Options)</label>
                <div className="space-y-4">
                  {formData.sizes.map((size, index) => (
                    <div key={index} className="bg-stone-50 p-6 rounded-3xl border border-gray-50 relative group">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        <div>
                          <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Label</label>
                          <input
                            type="text"
                            value={size.name}
                            onChange={(e) => {
                              const newSizes = [...formData.sizes];
                              newSizes[index].name = e.target.value;
                              setFormData({ ...formData, sizes: newSizes });
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                            placeholder="e.g. 12 Inch"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Price (₹)</label>
                          <input
                            type="number"
                            value={size.price}
                            onChange={(e) => {
                              const newSizes = [...formData.sizes];
                              newSizes[index].price = e.target.value;
                              setFormData({ ...formData, sizes: newSizes });
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Stock</label>
                          <input
                            type="number"
                            value={size.stock}
                            onChange={(e) => {
                              const newSizes = [...formData.sizes];
                              newSizes[index].stock = e.target.value;
                              setFormData({ ...formData, sizes: newSizes });
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Mass (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={size.weight}
                            onChange={(e) => {
                              const newSizes = [...formData.sizes];
                              newSizes[index].weight = e.target.value;
                              setFormData({ ...formData, sizes: newSizes });
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              const newSizes = formData.sizes.filter((_, i) => i !== index);
                              setFormData({ ...formData, sizes: newSizes });
                            }}
                            className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newSize = {
                        name: '',
                        price: '',
                        stock: '',
                        weight: '',
                        dimensions: { length: '', width: '', height: '' }
                      };
                      setFormData({ ...formData, sizes: [...formData.sizes, newSize] });
                    }}
                    className="w-full py-4 border-2 border-dashed border-stone-200 text-gray-400 font-black text-xs uppercase tracking-widest rounded-[2rem] hover:bg-stone-50 hover:text-primary-600 hover:border-primary-200 transition-all active:scale-[0.99]"
                  >
                    + Manifest New Size Option
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Core Keywords (Tags)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  placeholder="sculpture, handmade, religious"
                />
              </div>

              <div className="flex items-center space-x-12 px-2">
                <label className="flex items-center text-gray-700 font-bold text-xs uppercase tracking-widest cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-100 text-primary-600 focus:ring-primary-500 mr-3 transition-all"
                  />
                  Promote to Featured
                </label>

                <label className="flex items-center text-gray-700 font-bold text-xs uppercase tracking-widest cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-100 text-primary-600 focus:ring-primary-500 mr-3 transition-all"
                  />
                  Core Activation
                </label>
              </div>

              <div className="flex justify-end space-x-6 pt-10 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 bg-stone-100 text-gray-500 font-black rounded-2xl hover:bg-stone-200 transition-all active:scale-[0.98] text-xs uppercase tracking-widest"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-10 py-3 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-[0.98] text-xs uppercase tracking-widest"
                >
                  {editProduct ? 'Commit Update' : 'Initialize Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;