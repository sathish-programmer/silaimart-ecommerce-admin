import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
  PhotoIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectingBlog, setSelectingBlog] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/admin/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      } else {
        toast.error('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm('Are you certain you wish to remove this chronicle?')) return;
    try {
      const response = await apiCall(`/admin/blogs/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Blog post removed');
        fetchBlogs();
      }
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && blogs.length === 0) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="section-title mb-1">Chronicles & Stories</h1>
          <p className="text-gray-500 font-medium">Curate the latest narratives and divine inspirations.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Chronicle
          </button>
        </div>
      </div>

      {/* Search Header */}
      <div className="card-premium p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-11"
            />
          </div>
          <button onClick={fetchBlogs} className="btn-outline flex items-center gap-2">
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.length > 0 ? filteredBlogs.map((blog) => (
          <div key={blog._id} className="card-premium group overflow-hidden">
            <div className="relative h-56 overflow-hidden">
              {blog.featuredImage?.url ? (
                <img src={blog.featuredImage.url} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                  <PhotoIcon className="h-12 w-12 text-stone-300" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${blog.published ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                  {blog.published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-black text-gray-900 leading-tight mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {blog.title}
              </h3>
              <p className="text-gray-500 text-xs font-medium mb-6 line-clamp-3 leading-relaxed">
                {blog.summary || blog.content?.replace(/<[^>]*>/g, '').slice(0, 120) + '...'}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-[10px]">
                    {blog.author?.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-900 uppercase tracking-wider">{blog.author?.name}</div>
                    <div className="text-[9px] text-gray-400 font-bold">{new Date(blog.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteBlog(blog._id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-200 mb-4" />
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No chronicles discovered</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;