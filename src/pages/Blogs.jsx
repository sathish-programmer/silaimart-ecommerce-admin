import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import RichTextEditor from '../components/RichTextEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
    featuredImage: ''
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/admin/blogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBlogs(response.data.blogs || []);
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
      const token = localStorage.getItem('admin_token');
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editBlog) {
        await axios.put(`${API_URL}/admin/blogs/${editBlog._id}`, submitData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Blog updated successfully');
      } else {
        await axios.post(`${API_URL}/admin/blogs`, submitData, {
          headers: { 'Authorization': `Bearer ${token}` }
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

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      tags: '',
      isPublished: false,
      featuredImage: ''
    });
    setEditBlog(null);
  };

  const openModal = (blog = null) => {
    if (blog) {
      setEditBlog(blog);
      setFormData({
        ...blog,
        tags: blog.tags?.join(', ') || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('admin_token');
        await axios.delete(`${API_URL}/admin/blogs/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
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
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`${API_URL}/admin/blogs/${id}`, 
        { isPublished: !isPublished },
        { headers: { 'Authorization': `Bearer ${token}` } }
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
                  <label className="block text-white mb-2">Featured Image URL</label>
                  <input
                    type="url"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="https://example.com/image.jpg"
                  />
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