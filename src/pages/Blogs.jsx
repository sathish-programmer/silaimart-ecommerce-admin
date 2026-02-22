import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import RichTextEditor from '../components/RichTextEditor';
import { apiCall } from '../utils/api';
import { useAuthStore } from '../store/authStore';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    isPublished: false,
    featuredImage: { url: '', alt: '' }
  });
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchBlogs();
  }, [isSuperAdmin]);

  const fetchBlogs = async () => {
    try {
      const endpoint = isSuperAdmin ? '/admin/blogs' : '/admin/blogs/my-blogs';
      const response = await apiCall(endpoint);
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editBlog) {
        // Check if the current user is the creator or a superadmin
        if (!isSuperAdmin && user.userId !== editBlog.createdBy._id) {
          toast.error('You can only edit your own blogs.');
          return;
        }
        await apiCall(`/admin/blogs/${editBlog._id}`, {
          method: 'PUT',
          body: JSON.stringify(submitData)
        });
        toast.success('Blog updated successfully');
      } else {
        await apiCall('/admin/blogs', {
          method: 'POST',
          body: JSON.stringify(submitData)
        });
        toast.success('Blog created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(error.response?.data?.message || 'Failed to save blog');
    }
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

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      tags: '',
      isPublished: false,
      featuredImage: { url: '', alt: '' }
    });
    setEditBlog(null);
  };

  const openModal = (blog = null) => {
    if (blog) {
      // Allow superadmin to edit any blog, and regular admin to edit their own.
      if (!isSuperAdmin && user.userId !== blog.createdBy._id) {
        toast.error('You can only edit your own blogs.');
        return;
      }
      setEditBlog(blog);
      setFormData({
        ...blog,
        tags: blog.tags?.join(', ') || '',
        featuredImage: blog.featuredImage || { url: '', alt: '' }
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    // Check if the current user is the creator or a superadmin
    const blogToDelete = blogs.find(blog => blog._id === id);
    if (blogToDelete && !isSuperAdmin && user.userId !== blogToDelete.createdBy._id) {
      toast.error('You can only delete your own blogs.');
      return;
    }

    if (window.confirm('Are you sure?')) {
      try {
        await apiCall(`/admin/blogs/${id}`, {
          method: 'DELETE'
        });
        toast.success('Blog deleted successfully');
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Failed to delete blog');
      }
    }
  };

  const togglePublish = async (id, isPublished) => {
    // Check if the current user is the creator or a superadmin
    const blogToToggle = blogs.find(blog => blog._id === id);
    if (blogToToggle && !isSuperAdmin && user.userId !== blogToToggle.createdBy._id) {
      toast.error('You can only change the publish status of your own blogs.');
      return;
    }

    try {
      await apiCall(`/admin/blogs/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ isPublished: !isPublished })
        }
      );
      toast.success(`Blog ${!isPublished ? 'published' : 'unpublished'} successfully`);
      fetchBlogs();
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Failed to update blog');
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Blogs</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your platform stories and updates</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 font-bold active:scale-[0.98]"
        >
          <PlusIcon className="h-5 w-5 stroke-2" />
          <span>Add New Blog</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm shadow-gray-200/50">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-left text-gray-400 font-black uppercase text-xs tracking-widest">Title</th>
              <th className="px-8 py-5 text-left text-gray-400 font-black uppercase text-xs tracking-widest">Author</th>
              <th className="px-8 py-5 text-left text-gray-400 font-black uppercase text-xs tracking-widest">Status</th>
              <th className="px-8 py-5 text-left text-gray-400 font-black uppercase text-xs tracking-widest">Date</th>
              <th className="px-8 py-5 text-right text-gray-400 font-black uppercase text-xs tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id} className="border-b border-gray-50 last:border-0 hover:bg-stone-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <span className="text-gray-900 font-bold group-hover:text-primary-600 transition-colors line-clamp-1">{blog.title}</span>
                </td>
                <td className="px-8 py-5 text-gray-500 font-medium">{blog.author?.name}</td>
                <td className="px-8 py-5">
                  <button
                    onClick={() => togglePublish(blog._id, blog.isPublished)}
                    className={`px-4 py-1 rounded-full text-xs font-black transition-all ${blog.isPublished
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                  >
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-8 py-5 text-gray-400 font-medium">
                  {new Date(blog.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end space-x-2">
                    <button className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openModal(blog)}
                      className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center p-8 border-b border-gray-50">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight tracking-tighter">
                {editBlog ? 'Edit Story' : 'New Story'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all"
              >
                <XMarkIcon className="h-8 w-8" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Story Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter an engaging title..."
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-medium h-24 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none transition-all resize-none"
                    placeholder="Brief description that hook readers..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Cover Image</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-stone-50/50 hover:bg-stone-50 hover:border-primary-300 transition-all group/upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="blog-image-upload"
                    />
                    <label
                      htmlFor="blog-image-upload"
                      className="flex flex-col items-center justify-center cursor-pointer p-4"
                    >
                      <PhotoIcon className="h-10 w-10 text-gray-400 mb-3 group-hover/upload:scale-110 group-hover/upload:text-primary-500 transition-all" />
                      <span className="text-gray-500 font-bold group-hover/upload:text-gray-900">Upload high-res image</span>
                      <span className="text-gray-400 text-[10px] font-black uppercase mt-1 tracking-widest">PNG, JPG, WEBP up to 10MB</span>
                    </label>
                  </div>
                  {formData.featuredImage?.url && (
                    <div className="mt-4 relative">
                      <img
                        src={formData.featuredImage.url}
                        alt={formData.featuredImage.alt || 'Preview'}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, featuredImage: { url: '', alt: '' } }))}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none transition-all"
                    placeholder="sculpture, art, culture (separated by comma)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-4 uppercase text-xs tracking-widest pl-1">Story Content *</label>
                <div className="rounded-2xl overflow-hidden border border-gray-100 ring-1 ring-gray-50">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Unfold your story..."
                  />
                </div>
              </div>

              <div className="bg-stone-50 p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl border ${formData.isPublished ? 'bg-green-500 text-white border-green-400' : 'bg-white text-gray-400 border-gray-100'}`}>
                    <PlusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-black text-sm">Status: {formData.isPublished ? 'Live' : 'Private Draft'}</p>
                    <p className="text-gray-500 text-xs font-medium">{formData.isPublished ? 'Visible to all customers' : 'Visible only to admins'}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all font-bold"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-[0.98]"
                >
                  {editBlog ? 'Update' : 'Create'} Story
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