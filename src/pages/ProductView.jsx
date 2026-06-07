import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiCall(`/products/${id}`);
        const data = await response.json();
        if (response.ok) {
          setProduct(data.product || data);
        } else {
          toast.error(data.message || 'Failed to fetch product');
          navigate('/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to fetch product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center text-gray-400">Product not found.</div>;
  }

  return (
    <div className="p-6 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate('/products')}
            className="p-3 bg-white text-gray-400 hover:text-primary-600 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md active:scale-95"
          >
            <ArrowLeftIcon className="h-6 w-6 stroke-[3px]" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{product.name}</h1>
            <p className="text-gray-500 font-medium">Internal Product View</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column: Images */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary-600 rounded-full"></div>
              Product Media
            </h2>
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {product.images.map((img, i) => (
                  <img key={i} src={img.url} alt={`Product ${i}`} className="w-full h-48 object-cover rounded-2xl border border-gray-100 shadow-sm" />
                ))}
              </div>
            ) : (
              <div className="p-10 bg-stone-50 rounded-[2rem] border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No Images</p>
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="space-y-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-amber-400 rounded-full"></div>
              Product Specifications
            </h2>
            <div className="grid gap-6">
              {[
                { label: 'Base Price', value: `₹${product.price}` },
                { label: 'Discount', value: product.discountValue ? `${product.discountValue} ${product.discountType === 'percentage' ? '%' : '₹'} Off` : 'None', highlight: true },
                { label: 'Stock Status', value: product.stock > 0 ? `${product.stock} Units` : 'Out of Stock', status: true },
                { label: 'Category', value: product.category?.name || 'N/A' },
                { label: 'Brand', value: product.brand || 'N/A' },
                { label: 'SKU', value: product.sku || 'N/A' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-1">{item.label}</span>
                  <span className={`text-gray-900 font-black tracking-tight ${item.highlight ? 'text-amber-600 uppercase' :
                      item.status ? (product.stock > 0 ? 'text-green-600' : 'text-rose-600') :
                        'text-lg'
                    }`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-2 block">Custom Specifications</span>
              {product.allSpecifications && Object.keys(product.allSpecifications).length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.allSpecifications)
                    .filter(([_, v]) => v !== '' && v != null)
                    .map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <span className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">{k}</span>
                      <span className="text-gray-900 font-bold text-sm">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No custom specifications added.</p>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-2 block">Description</span>
              <div className="prose prose-sm prose-stone text-gray-600" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
