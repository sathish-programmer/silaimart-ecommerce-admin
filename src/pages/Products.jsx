import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
          onClick={() => navigate('/products/new')}
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
                    <Link
                      to={`/products/${product._id}`}
                      className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors inline-block"
                      title="View Product Internal"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => navigate(`/products/edit/${product._id}`)}
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
    </div>
  );
};

export default Products;