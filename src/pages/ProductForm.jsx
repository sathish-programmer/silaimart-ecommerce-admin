import { useState, useEffect } from 'react';
import { TrashIcon, PhotoIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    discountType: 'percentage', // 'percentage' or 'amount'
    discountValue: '',
    category: '',
    subCategory: '',
    brand: '',
    stock: '',
    sku: '',
    material: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    specifications: {},
    images: [],
    sizes: [],
    tags: '',
    isFeatured: false,
    isTrending: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    seo: {
      title: '',
      description: '',
      keywords: ''
    }
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  // Auto-generate SKU when name changes (only for new products)
  useEffect(() => {
    if (formData.name && !id) {
      const sku = generateSKU(formData.name);
      setFormData(prev => ({ ...prev, sku }));
    }
  }, [formData.name, id]);

  // Calculate discount price for main product when discount changes
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
    } else if (!formData.discountValue) {
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      const flatCats = response.data.categories || [];
      
      const catMap = {};
      const roots = [];
      
      flatCats.forEach(cat => {
        catMap[cat._id] = { ...cat, subCategories: [] };
      });
      
      flatCats.forEach(cat => {
        if (cat.parent && catMap[cat.parent]) {
          catMap[cat.parent].subCategories.push(catMap[cat._id]);
        } else {
          roots.push(catMap[cat._id]);
        }
      });
      
      setCategories(roots);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchProduct = async (productId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/products/${productId}`, { // Changed to use the generic route
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const product = response.data.product;
      setFormData({
        ...product,
        category: product.category?._id || product.category || '',
        subCategory: product.subCategory?._id || product.subCategory || '',
        brand: product.brand || '',
        discountPrice: product.discountPrice || '',
        discountValue: product.discountValue || '',
        discountType: product.discountType || 'percentage',
        tags: product.tags?.join(', ') || '',
        dimensions: product.dimensions || { length: '', width: '', height: '' },
        specifications: product.specifications || {},
        isTrending: product.isTrending || false,
        isBestSeller: product.isBestSeller || false,
        isNewArrival: product.isNewArrival || false,
        seo: product.seo || { title: '', description: '', keywords: '' },
        sizes: product.sizes?.map(size => ({
          ...size,
          discountType: size.discountType || 'percentage',
          discountValue: size.discountValue || '',
          discountPrice: size.discountPrice || ''
        })) || []
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  // Add recalculation for size discount price
  const recalculateSizeDiscount = (size, price, discountType, discountValue) => {
    if (!price || !discountValue) return '';
    const p = parseFloat(price);
    const dv = parseFloat(discountValue);
    let dp;
    if (discountType === 'percentage') {
        dp = p - (p * dv / 100);
    } else {
        dp = p - dv;
    }
    return Math.max(0, dp).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (id) {
        await axios.put(`${API_URL}/admin/products/${id}`, submitData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API_URL}/admin/products`, submitData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id && !formData.name) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/products')}
          className="p-2 bg-white text-gray-500 hover:text-gray-900 rounded-full transition-colors shadow-sm border border-gray-100"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {id ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Product Name *</label>
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
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sub-Category</label>
              <select
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              >
                <option value="">Select Sub-Category</option>
                {categories.find(c => c._id === formData.category)?.subCategories?.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Price *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                required
              />
            </div>
            
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Stock *</label>
                <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    required
                />
            </div>
          </div>
        </div>

        {/* Pricing & Discount Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Pricing & Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Discount Type</label>
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
          </div>
        </div>

        {/* Attributes & Specifications Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Attributes & Dimensions</h3>
          
          <div className="space-y-4">
            <label className="block text-gray-700 font-bold uppercase text-[10px] tracking-[0.2em] pl-1">Product Specifications</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.specifications).map(([key, value], idx) => (
                <div key={idx} className="flex space-x-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newSpecs = { ...formData.specifications };
                      const val = newSpecs[key];
                      delete newSpecs[key];
                      newSpecs[e.target.value] = val;
                      setFormData({ ...formData, specifications: newSpecs });
                    }}
                    className="w-1/3 px-4 py-2 bg-stone-50 border border-gray-100 rounded-xl text-xs font-bold"
                    placeholder="Attribute Name"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        specifications: { ...formData.specifications, [key]: e.target.value }
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-stone-50 border border-gray-100 rounded-xl text-xs"
                    placeholder="Value"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newSpecs = { ...formData.specifications };
                      delete newSpecs[key];
                      setFormData({ ...formData, specifications: newSpecs });
                    }}
                    className="p-2 text-rose-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, specifications: { ...formData.specifications, '': '' } })}
                className="text-primary-600 text-xs font-bold py-2 border-2 border-dashed border-primary-100 rounded-xl"
              >
                + Add Specification
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              placeholder="e.g. SilaiMart"
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
        </div>

        {/* Media & Details Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Media & Details</h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide pl-1">Description *</label>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-4">
                    <div className="col-span-2">
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
                      <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Base Price (₹)</label>
                      <input
                        type="number"
                        value={size.price}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[index].price = e.target.value;
                          newSizes[index].discountPrice = recalculateSizeDiscount(size, e.target.value, size.discountType, size.discountValue);
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
                    <div className="flex items-end justify-end">
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
                  
                  {/* Size Specific Discount Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
                    <div>
                        <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Discount Type</label>
                        <select
                            value={size.discountType}
                            onChange={(e) => {
                                const newSizes = [...formData.sizes];
                                newSizes[index].discountType = e.target.value;
                                newSizes[index].discountPrice = recalculateSizeDiscount(size, size.price, e.target.value, size.discountValue);
                                setFormData({ ...formData, sizes: newSizes });
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="amount">Fixed Amount (₹)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Discount Value {size.discountType === 'percentage' ? '(%)' : '(₹)'}</label>
                        <input
                            type="number"
                            value={size.discountValue}
                            onChange={(e) => {
                                const newSizes = [...formData.sizes];
                                newSizes[index].discountValue = e.target.value;
                                newSizes[index].discountPrice = recalculateSizeDiscount(size, size.price, size.discountType, e.target.value);
                                setFormData({ ...formData, sizes: newSizes });
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Final Size Price (₹)</label>
                        <input
                            type="number"
                            value={size.discountPrice}
                            readOnly
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-primary-600 font-bold cursor-not-allowed"
                            placeholder="Same as Base Price if no discount"
                        />
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
                    discountType: 'percentage',
                    discountValue: '',
                    discountPrice: '',
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
              placeholder="handmade, artisan, home-decor, gift"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 px-2">
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
                checked={formData.isTrending}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                className="w-5 h-5 rounded border-gray-100 text-primary-600 focus:ring-primary-500 mr-3 transition-all"
              />
              Trending
            </label>

            <label className="flex items-center text-gray-700 font-bold text-xs uppercase tracking-widest cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                className="w-5 h-5 rounded border-gray-100 text-primary-600 focus:ring-primary-500 mr-3 transition-all"
              />
              Best Seller
            </label>

            <label className="flex items-center text-gray-700 font-bold text-xs uppercase tracking-widest cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                className="w-5 h-5 rounded border-gray-100 text-primary-600 focus:ring-primary-500 mr-3 transition-all"
              />
              New Arrival
            </label>

            <label className="flex items-center text-gray-700 font-bold text-xs uppercase tracking-widest cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-gray-100 text-primary-600 focus:ring-primary-500 mr-3 transition-all"
              />
              Active
            </label>
          </div>

          {/* SEO Section */}
          <div className="space-y-6 border-t border-gray-50 pt-8">
            <label className="block text-gray-700 font-bold uppercase text-[10px] tracking-[0.2em] pl-1">Enterprise SEO (Optional)</label>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={formData.seo.title}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
                  className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  placeholder="Enter optimized title"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={formData.seo.description}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })}
                  className="w-full px-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none h-24"
                  placeholder="Enter optimized description"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 pb-8">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-8 py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3.5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Saving...' : id ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
      </form>
    </div>
  );
};

export default ProductForm;
