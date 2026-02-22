import { useState, useEffect } from 'react';
import { StarIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: '',
    isApproved: false
  });

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`${API_URL}/reviews/admin${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      setReviews(data.reviews);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId, isApproved, response = '') => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/reviews/admin/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved, adminResponse: response })
      });

      if (res.ok) {
        toast.success(isApproved ? 'Review approved' : 'Review rejected');
        fetchReviews();
        setSelectedReview(null);
        setAdminResponse('');
      }
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/reviews/admin/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Review deleted');
        fetchReviews();
      }
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const openEditModal = (review) => {
    setEditForm({
      rating: review.rating,
      comment: review.comment,
      isApproved: review.isApproved
    });
    setSelectedReview(review);
    setShowEditModal(true);
  };

  const updateReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/reviews/admin/${selectedReview._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: editForm.rating,
          comment: editForm.comment,
          isApproved: editForm.isApproved
        })
      });

      if (response.ok) {
        toast.success('Review updated');
        setShowEditModal(false);
        fetchReviews();
      }
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      i < rating ?
        <StarSolid key={i} className="h-5 w-5 text-amber-400 drop-shadow-sm" /> :
        <StarIcon key={i} className="h-5 w-5 text-stone-200" />
    ));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reviews Management</h1>
          <p className="text-gray-500 font-medium mt-1">Hear what your customers are saying</p>
        </div>
        <div className="flex p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
          {['all', 'pending', 'approved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${filter === f
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                  : 'text-gray-500 hover:bg-stone-50'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 relative group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div className="flex items-center space-x-6">
                <div className="relative group/img">
                  <img
                    src={review.product.images[0]?.url || '/placeholder.jpg'}
                    alt={review.product.name}
                    className="w-20 h-20 object-cover rounded-[1.5rem] shadow-md group-hover/img:scale-105 transition-transform"
                  />
                  <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-sm border border-gray-50 transition-transform group-hover/img:rotate-12">
                    <StarSolid className="h-4 w-4 text-amber-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1">{review.product.name}</h3>
                  <div className="flex items-center text-gray-500 font-bold text-sm">
                    <span className="bg-stone-50 px-3 py-1 rounded-lg">by {review.user.name}</span>
                    <span className="mx-2 text-gray-200">/</span>
                    <span className="text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${review.isApproved
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                  {review.isApproved ? 'Approved' : 'Pending Verification'}
                </span>
                <div className="flex items-center space-x-1 pl-4 border-l border-gray-100">
                  {renderStars(review.rating)}
                </div>
              </div>
            </div>

            <div className="relative mb-8">
              <span className="absolute -left-6 top-0 text-7xl font-serif text-gray-50 leading-none select-none">"</span>
              <p className="text-gray-600 font-medium text-lg leading-relaxed relative z-10">{review.comment}</p>
            </div>

            {review.images && review.images.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-8">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-2xl hover:scale-110 transition-transform shadow-sm cursor-zoom-in"
                  />
                ))}
              </div>
            )}

            {review.adminResponse && (
              <div className="bg-primary-50 px-8 py-6 rounded-[2rem] mb-8 border border-primary-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CheckIcon className="h-16 w-16 text-primary-600" />
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 block mb-2">Team Response</span>
                  <p className="text-primary-900 font-bold leading-relaxed">{review.adminResponse}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-50">
              <button
                onClick={() => openEditModal(review)}
                className="px-6 py-3 font-bold text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
              >
                Edit Content
              </button>
              {!review.isApproved && (
                <>
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="px-8 py-3.5 bg-green-500 text-white font-black rounded-2xl hover:bg-green-600 shadow-lg shadow-green-100 transition-all flex items-center"
                  >
                    <CheckIcon className="h-5 w-5 mr-2 stroke-[3px]" />
                    Approve
                  </button>
                  <button
                    onClick={() => updateReviewStatus(review._id, false)}
                    className="px-8 py-3.5 bg-rose-50 text-rose-600 font-black rounded-2xl hover:bg-rose-100 transition-all flex items-center"
                  >
                    <XMarkIcon className="h-5 w-5 mr-2 stroke-[3px]" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => deleteReview(review._id)}
                className="p-3.5 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                title="Delete Permanentally"
              >
                <TrashIcon className="h-5 w-5 stroke-2" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Modal */}
      {selectedReview && !showEditModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-gray-100">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Official Response</h3>
            <p className="text-gray-500 font-medium mb-8">Add a formal reply to this customer's feedback.</p>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="e.g. Thank you for your kind words! We are glad you liked our craft."
              className="w-full p-5 bg-stone-50 border border-gray-100 rounded-3xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 outline-none resize-none h-40 transition-all"
            />
            <div className="flex justify-end space-x-4 mt-10 pt-8 border-t border-gray-50">
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setAdminResponse('');
                }}
                className="px-8 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-all"
              >
                Skip
              </button>
              <button
                onClick={() => updateReviewStatus(selectedReview._id, true, adminResponse)}
                className="px-10 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-200 transition-all"
              >
                Approve & Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && selectedReview && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Modify Content</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all"
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>

            <form onSubmit={updateReview} className="space-y-10">
              <div>
                <label className="block text-gray-700 font-bold mb-4 uppercase text-xs tracking-widest pl-1">Star Rating</label>
                <div className="flex space-x-3 bg-stone-50 p-4 rounded-3xl justify-center scale-110">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, rating: star })}
                      className="hover:scale-125 transition-transform"
                    >
                      {star <= editForm.rating ?
                        <StarSolid className="h-8 w-8 text-amber-400 drop-shadow-sm" /> :
                        <StarIcon className="h-8 w-8 text-stone-200" />
                      }
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-xs tracking-widest pl-1">Review Statement</label>
                <textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full p-5 bg-stone-50 border border-gray-100 rounded-3xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 outline-none resize-none h-40 transition-all"
                  placeholder="The customer's words..."
                  required
                />
              </div>

              <div className="bg-stone-50 p-6 rounded-[2rem] flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-black text-sm uppercase tracking-widest">Visibility</p>
                  <p className="text-gray-500 text-xs font-medium">Approved status of this review</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isApproved}
                    onChange={(e) => setEditForm({ ...editForm, isApproved: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-8 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="px-10 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-200 transition-all"
                >
                  Secure Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;