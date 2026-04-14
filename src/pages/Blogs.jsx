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
import RichTextEditor from '../components/RichTextEditor';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBlog, setEditBlog] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: { url: '', alt: '' },
    isPublished: false
  });

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
      } else {
        toast.error('Failed to delete blog');
      }
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const openModal = (blog = null) => {
    setEditBlog(blog);
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        featuredImage: blog.featuredImage || { url: '', alt: '' },
        isPublished: blog.isPublished || false
      });
    } else {
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: { url: '', alt: '' },
        isPublished: false
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          featuredImage: {
            url: e.target.result,
            alt: file.name
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      featuredImage: { url: '', alt: '' }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      return toast.error('Title and content are required');
    }

    try {
      const endpoint = editBlog ? `/admin/blogs/${editBlog._id}` : '/admin/blogs';
      const method = editBlog ? 'PUT' : 'POST';

      const response = await apiCall(endpoint, {
        method,
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (response.ok) {
        toast.success(editBlog ? 'Blog updated successfully' : 'Blog created successfully');
        setShowModal(false);
        setEditBlog(null);
        fetchBlogs();
      } else {
        toast.error(data.message || 'Failed to save blog');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
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
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="section-title mb-1">Chronicles & Stories</h1>
          <p className="text-gray-500 font-medium">Curate the latest narratives and divine inspirations.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
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
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${blog.isPublished ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                  {blog.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-black text-gray-900 leading-tight mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {blog.title}
              </h3>
              <p className="text-gray-500 text-xs font-medium mb-6 line-clamp-3 leading-relaxed">
                {blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').slice(0, 120) + '...'}
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
                  <button onClick={() => openModal(blog)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
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

      {/* Modal for Creating / Editing Blog */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {editBlog ? 'Edit Chronicle' : 'New Chronicle'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      className="input-premium w-full"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Excerpt</label>
                    <textarea
                      className="input-premium w-full h-24 resize-none"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="A short summary of the blog post..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Content *</label>
                    <div className="bg-stone-50 rounded-2xl overflow-hidden border border-gray-100">
                      <RichTextEditor
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Featured Image</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-primary-400 transition-colors bg-stone-50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="blog-image"
                      />
                      <label htmlFor="blog-image" className="cursor-pointer flex flex-col items-center">
                        <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 font-medium">Click to upload image</span>
                      </label>
                    </div>

                    {formData.featuredImage?.url && (
                      <div className="mt-4 relative rounded-xl overflow-hidden aspect-video border border-gray-100">
                        <img src={formData.featuredImage.url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg shadow-sm hover:bg-rose-600 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 bg-stone-50 p-4 rounded-xl border border-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-bold text-gray-700">Publish immediately</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-8"
                >
                  {editBlog ? 'Save Changes' : 'Create Chronicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;