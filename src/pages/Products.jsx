import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import RichTextEditor from '../components/RichTextEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <button
          onClick={() => openModal()}
          className="bg-bronze text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gold transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-white">Name</th>
              <th className="px-6 py-3 text-left text-white">Category</th>
              <th className="px-6 py-3 text-left text-white">Price</th>
              <th className="px-6 py-3 text-left text-white">Stock</th>
              <th className="px-6 py-3 text-left text-white">Status</th>
              <th className="px-6 py-3 text-left text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-gray-800">
                <td className="px-6 py-4 text-white">{product.name}</td>
                <td className="px-6 py-4 text-gray-300">{product.category?.name}</td>
                <td className="px-6 py-4 text-bronze">₹{product.price}</td>
                <td className="px-6 py-4 text-gray-300">{product.stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    product.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(product)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-400 hover:text-red-300"
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

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {editProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-white mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">SKU (Auto-generated)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="Will be auto-generated from product name"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
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
                  <label className="block text-white mb-2">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    required
                  />
                </div>

                {/* Discount Section */}
                <div>
                  <label className="block text-white mb-2">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="amount">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">
                    Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder={formData.discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Final Price (Auto-calculated)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-300 cursor-not-allowed"
                    placeholder="Will be calculated automatically"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    required
                  />
                </div>

                {/* Sculpture Details */}
                <div>
                  <label className="block text-white mb-2">Stone Type</label>
                  <select
                    value={formData.sculptureDetails.stone}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: {...formData.sculptureDetails, stone: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    <option value="">Select Stone</option>
                    <option value="Marble">Marble</option>
                    <option value="Granite">Granite</option>
                    <option value="Sandstone">Sandstone</option>
                    <option value="Limestone">Limestone</option>
                    <option value="Basalt">Basalt</option>
                    <option value="Soapstone">Soapstone</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Finish</label>
                  <select
                    value={formData.sculptureDetails.finish}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: {...formData.sculptureDetails, finish: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    <option value="">Select Finish</option>
                    <option value="Polished">Polished</option>
                    <option value="Matte">Matte</option>
                    <option value="Antique">Antique</option>
                    <option value="Natural">Natural</option>
                    <option value="Carved">Carved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Deity/Subject</label>
                  <input
                    type="text"
                    value={formData.sculptureDetails.deity}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: {...formData.sculptureDetails, deity: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Origin</label>
                  <input
                    type="text"
                    value={formData.sculptureDetails.origin}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: {...formData.sculptureDetails, origin: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Artisan</label>
                  <input
                    type="text"
                    value={formData.sculptureDetails.artisan}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: {...formData.sculptureDetails, artisan: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Technique</label>
                  <input
                    type="text"
                    value={formData.sculptureDetails.technique}
                    onChange={(e) => setFormData({
                      ...formData,
                      sculptureDetails: {...formData.sculptureDetails, technique: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Material</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({...formData, material: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
              </div>

              {/* Dimensions Section */}
              <div>
                <label className="block text-white mb-2">Dimensions (inches)</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Length</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.dimensions.length}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: {...formData.dimensions, length: e.target.value}
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Width</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.dimensions.width}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: {...formData.dimensions, width: e.target.value}
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Height</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.dimensions.height}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: {...formData.dimensions, height: e.target.value}
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Description *</label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({...formData, description: value})}
                  placeholder="Enter product description..."
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-white mb-2">Product Images</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
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
                    className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 rounded-lg p-4 transition-colors"
                  >
                    <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-gray-400">Click to upload images</span>
                    <span className="text-gray-500 text-sm">PNG, JPG, WEBP up to 10MB each</span>
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
              <div>
                <label className="block text-white mb-2">Available Sizes</label>
                <div className="space-y-3">
                  {formData.sizes.map((size, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Size Name</label>
                          <input
                            type="text"
                            value={size.name}
                            onChange={(e) => {
                              const newSizes = [...formData.sizes];
                              newSizes[index].name = e.target.value;
                              setFormData({...formData, sizes: newSizes});
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            placeholder="Small, Medium, Large"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={size.price}
                            onChange={(e) => {
                              const newSizes = [...formData.sizes];
                              newSizes[index].price = e.target.value;
                              setFormData({...formData, sizes: newSizes});
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Stock</label>
                          <input
                            type="number"
                            value={size.stock}
                            onChange={(e) => {
                              const newSizes = [...formData.sizes];
                              newSizes[index].stock = e.target.value;
                              setFormData({...formData, sizes: newSizes});
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={size.weight}
                            onChange={(e) => {
                              const newSizes = [...formData.sizes];
                              newSizes[index].weight = e.target.value;
                              setFormData({...formData, sizes: newSizes});
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              const newSizes = formData.sizes.filter((_, i) => i !== index);
                              setFormData({...formData, sizes: newSizes});
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Remove
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
                      setFormData({...formData, sizes: [...formData.sizes, newSize]});
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    Add Size Option
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="sculpture, handmade, religious"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="mr-2"
                  />
                  Featured Product
                </label>

                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-800">
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
                  {editProduct ? 'Update' : 'Create'} Product
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