import { useState, useEffect } from 'react';
import { StarIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

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
      const response = await fetch(`http://localhost:5001/api/reviews/admin${statusParam}`, {
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
      const res = await fetch(`http://localhost:5001/api/reviews/admin/${reviewId}`, {
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
      const response = await fetch(`http://localhost:5001/api/reviews/admin/${reviewId}`, {
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
      const response = await fetch(`http://localhost:5001/api/reviews/admin/${selectedReview._id}`, {
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
        <StarSolid key={i} className="h-4 w-4 text-yellow-400" /> :
        <StarIcon key={i} className="h-4 w-4 text-gray-300" />
    ));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Reviews Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-bronze text-black' : 'bg-gray-700 text-white'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-bronze text-black' : 'bg-gray-700 text-white'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-bronze text-black' : 'bg-gray-700 text-white'}`}
          >
            Approved
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={review.product.images[0]?.url || '/placeholder.jpg'}
                  alt={review.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="text-white font-semibold">{review.product.name}</h3>
                  <p className="text-gray-400">by {review.user.name}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  review.isApproved ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                }`}>
                  {review.isApproved ? 'Approved' : 'Pending'}
                </span>
                <span className="text-gray-400 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <p className="text-gray-300 mb-4">{review.comment}</p>

            {review.images && review.images.length > 0 && (
              <div className="flex space-x-2 mb-4">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}

            {review.adminResponse && (
              <div className="bg-gray-700 p-3 rounded mb-4">
                <p className="text-sm text-gray-300">
                  <strong>Admin Response:</strong> {review.adminResponse}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => openEditModal(review)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              {!review.isApproved && (
                <>
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <CheckIcon className="h-4 w-4 inline mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => updateReviewStatus(review._id, false)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <XMarkIcon className="h-4 w-4 inline mr-1" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => deleteReview(review._id)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <TrashIcon className="h-4 w-4 inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">Approve Review</h3>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Optional admin response..."
              className="w-full p-3 bg-gray-700 text-white rounded mb-4"
              rows="3"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setAdminResponse('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => updateReviewStatus(selectedReview._id, true, adminResponse)}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">Edit Review</h3>
            
            <form onSubmit={updateReview} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm({...editForm, rating: star})}
                      className="hover:scale-110 transition-transform"
                    >
                      {star <= editForm.rating ? 
                        <StarSolid className="h-6 w-6 text-yellow-400" /> :
                        <StarIcon className="h-6 w-6 text-gray-300" />
                      }
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Comment</label>
                <textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={editForm.isApproved}
                    onChange={(e) => setEditForm({...editForm, isApproved: e.target.checked})}
                    className="mr-2"
                  />
                  Approved
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-bronze text-black rounded"
                >
                  Update
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