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

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Blogs</h1>
        <button 
          onClick={() => openModal()}
          className="bg-bronze text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gold"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Blog</span>
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-white">Title</th>
              <th className="px-6 py-3 text-left text-white">Author</th>
              <th className="px-6 py-3 text-left text-white">Status</th>
              <th className="px-6 py-3 text-left text-white">Date</th>
              <th className="px-6 py-3 text-left text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id} className="border-b border-gray-800">
                <td className="px-6 py-4 text-white">{blog.title}</td>
                <td className="px-6 py-4 text-gray-300">{blog.author?.name}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => togglePublish(blog._id, blog.isPublished)}
                    className={`px-3 py-1 rounded text-sm ${
                      blog.isPublished ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button className="text-blue-400 hover:text-blue-300">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => openModal(blog)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
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

      {/* Blog Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {editBlog ? 'Edit Blog' : 'Add Blog'}
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
                <div className="md:col-span-2">
                  <label className="block text-white mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white h-20"
                    placeholder="Brief description of the blog post..."
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Featured Image</label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="blog-image-upload"
                    />
                    <label
                      htmlFor="blog-image-upload"
                      className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 rounded-lg p-4 transition-colors"
                    >
                      <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-gray-400">Click to upload featured image</span>
                      <span className="text-gray-500 text-sm mt-1">PNG, JPG, WEBP up to 10MB</span>
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
                  <label className="block text-white mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="sculpture, art, culture"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Content *</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({...formData, content: value})}
                  placeholder="Write your blog content here..."
                />
              </div>

              <div>
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                    className="mr-2"
                  />
                  Publish immediately
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
                  {editBlog ? 'Update' : 'Create'} Blog
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