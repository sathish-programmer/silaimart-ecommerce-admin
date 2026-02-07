import { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, EyeIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';

const CustomOrderManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    adminNotes: '',
    quotedPrice: '',
    estimatedDeliveryDate: '',
    sendEmail: false,
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/admin/custom-order-requests');
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching custom order requests:', error);
      toast.error('Failed to fetch custom order requests');
    } finally {
      setLoading(false);
    }
  };

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setFormData({
      status: request.status,
      adminNotes: request.adminNotes || '',
      quotedPrice: request.quotedPrice || '',
      estimatedDeliveryDate: request.estimatedDeliveryDate ? new Date(request.estimatedDeliveryDate).toISOString().split('T')[0] : '',
      sendEmail: false, // Default to false when opening modal
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      const body = {
        status: formData.status,
        adminNotes: formData.adminNotes,
        quotedPrice: formData.quotedPrice ? parseFloat(formData.quotedPrice) : undefined,
        estimatedDeliveryDate: formData.estimatedDeliveryDate || undefined,
        sendEmail: formData.sendEmail,
      };

      const response = await apiCall(`/admin/custom-order-requests/${selectedRequest._id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Request updated successfully');
        setShowModal(false);
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to update request');
      }
    } catch (error) {
      console.error('Error updating custom order request:', error);
      toast.error('An error occurred while updating the request.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30';
      case 'reviewed': return 'bg-blue-900/20 text-blue-400 border-blue-500/30';
      case 'quoted': return 'bg-green-900/20 text-green-400 border-green-500/30';
      case 'accepted': return 'bg-purple-900/20 text-purple-400 border-purple-500/30';
      case 'rejected': return 'bg-red-900/20 text-red-400 border-red-500/30';
      case 'completed': return 'bg-indigo-900/20 text-indigo-400 border-indigo-500/30';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-bronze" />
          <span>Custom Order Management</span>
        </h1>
        <p className="text-gray-400 mt-1">Manage custom art requests from customers</p>
      </div>

      {/* Requests Grid */}
      <div className="grid gap-6">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Custom Order Requests</h3>
            <p className="text-gray-500">There are no custom order requests to display.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request._id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 hover:border-bronze/50 transition-all">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">Request from {request.user?.name || 'N/A'}</h3>
                  <p className="text-gray-400 text-sm">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                  {request.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-300 mb-4 line-clamp-2">{request.requestDetails}</p>
              {request.quotedPrice && (
                <p className="text-bronze font-semibold mb-1">Quoted Price: ₹{request.quotedPrice.toLocaleString()}</p>
              )}
              {request.estimatedDeliveryDate && (
                <p className="text-gray-400 text-sm">Estimated Delivery: {new Date(request.estimatedDeliveryDate).toLocaleDateString()}</p>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => viewRequestDetails(request)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <EyeIcon className="h-5 w-5" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Request Details and Update */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">Custom Order Request Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-400"><strong>Requested by:</strong> {selectedRequest.user?.name} ({selectedRequest.user?.email})</p>
                <p className="text-gray-400"><strong>Submitted on:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Request Details:</h3>
                <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                  {selectedRequest.sculptureType && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 font-medium">Sculpture Type:</span>
                        <p className="text-white">{selectedRequest.sculptureType}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Material:</span>
                        <p className="text-white">{selectedRequest.material}</p>
                      </div>
                    </div>
                  )}
                  {selectedRequest.size && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 font-medium">Size:</span>
                        <p className="text-white">{selectedRequest.size}</p>
                      </div>
                      {(selectedRequest.height || selectedRequest.width || selectedRequest.depth) && (
                        <div>
                          <span className="text-gray-400 font-medium">Dimensions:</span>
                          <p className="text-white">
                            {selectedRequest.height && `${selectedRequest.height}H`}
                            {selectedRequest.width && ` × ${selectedRequest.width}W`}
                            {selectedRequest.depth && ` × ${selectedRequest.depth}D`}
                            {(selectedRequest.height || selectedRequest.width || selectedRequest.depth) && ' inches'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {(selectedRequest.color || selectedRequest.finish) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRequest.color && (
                        <div>
                          <span className="text-gray-400 font-medium">Color:</span>
                          <p className="text-white">{selectedRequest.color}</p>
                        </div>
                      )}
                      {selectedRequest.finish && (
                        <div>
                          <span className="text-gray-400 font-medium">Finish:</span>
                          <p className="text-white">{selectedRequest.finish}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {(selectedRequest.budget || selectedRequest.timeline) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRequest.budget && (
                        <div>
                          <span className="text-gray-400 font-medium">Budget:</span>
                          <p className="text-white">{selectedRequest.budget}</p>
                        </div>
                      )}
                      {selectedRequest.timeline && (
                        <div>
                          <span className="text-gray-400 font-medium">Timeline:</span>
                          <p className="text-white">{selectedRequest.timeline}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedRequest.description && (
                    <div>
                      <span className="text-gray-400 font-medium">Description:</span>
                      <p className="text-white mt-1">{selectedRequest.description}</p>
                    </div>
                  )}
                  {selectedRequest.specialRequirements && (
                    <div>
                      <span className="text-gray-400 font-medium">Special Requirements:</span>
                      <p className="text-white mt-1">{selectedRequest.specialRequirements}</p>
                    </div>
                  )}
                  {!selectedRequest.sculptureType && (
                    <p className="text-gray-300">{selectedRequest.requestDetails}</p>
                  )}
                </div>
              </div>
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Images:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.images.map((img, index) => (
                      <img key={index} src={img.url} alt="Request Image" className="w-32 h-32 object-cover rounded-lg border border-gray-700" />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <h3 className="text-xl font-semibold text-white">Update Status & Quote:</h3>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="quoted">Quoted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="quotedPrice" className="block text-sm font-medium text-gray-300 mb-2">Quoted Price (₹)</label>
                  <input
                    type="number"
                    id="quotedPrice"
                    name="quotedPrice"
                    value={formData.quotedPrice}
                    onChange={(e) => setFormData({ ...formData, quotedPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
                    placeholder="Enter quoted price"
                  />
                </div>
                <div>
                  <label htmlFor="estimatedDeliveryDate" className="block text-sm font-medium text-gray-300 mb-2">Estimated Delivery Date</label>
                  <input
                    type="date"
                    id="estimatedDeliveryDate"
                    name="estimatedDeliveryDate"
                    value={formData.estimatedDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-300 mb-2">Admin Notes</label>
                  <textarea
                    id="adminNotes"
                    name="adminNotes"
                    value={formData.adminNotes}
                    onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none resize-y"
                    placeholder="Add internal notes or customer communication details."
                  ></textarea>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    name="sendEmail"
                    checked={formData.sendEmail}
                    onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="sendEmail" className="text-sm font-medium text-gray-300">Send email to customer with update</label>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-bronze text-black rounded-lg hover:bg-gold transition-colors"
                  >
                    Save & Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomOrderManager;


