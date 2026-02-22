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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center space-x-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-600" />
          </div>
          <span>Custom Commissions</span>
        </h1>
        <p className="text-gray-500 font-medium mt-1 pl-16">Monitor and manage bespoke sculpture requests from global patrons</p>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {requests.length === 0 ? (
          <div className="col-span-full text-center py-24 flex flex-col items-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
              <ClockIcon className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Registry Inactive</h3>
            <p className="text-gray-500 font-medium">Commission requests will manifest here upon submission by patrons.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request._id} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 group relative">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase tracking-[0.2em]">New Commission</span>
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                    {request.user?.name || 'Patron Anonymous'}
                  </h3>
                </div>
                <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${request.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    request.status === 'quoted' ? 'bg-primary-50 text-primary-700 border-primary-100' :
                      request.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                        'bg-stone-100 text-gray-500 border-stone-200'
                  }`}>
                  {request.status}
                </div>
              </div>

              <div className="bg-stone-50/50 p-6 rounded-3xl border border-gray-50 mb-8 overflow-hidden relative">
                <p className="text-gray-600 font-medium text-sm leading-relaxed line-clamp-3">"{request.requestDetails || request.description}"</p>
                <div className="absolute bottom-0 right-0 p-2 opacity-5">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-900" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  {request.quotedPrice && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Proposed Quote</span>
                      <span className="text-primary-700 font-black text-lg tracking-tight">₹{request.quotedPrice.toLocaleString()}</span>
                    </div>
                  )}
                  {request.estimatedDeliveryDate && (
                    <div className="flex flex-col border-l border-gray-100 pl-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expected Release</span>
                      <span className="text-gray-900 font-black text-sm tracking-tight">{new Date(request.estimatedDeliveryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => viewRequestDetails(request)}
                  className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.1em] hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 active:scale-95 flex items-center gap-3"
                >
                  <EyeIcon className="h-4 w-4 stroke-[3px]" />
                  Execute Review
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Request Details and Update */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-100 shadow-2xl flex flex-col scale-in-center">
            <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 bg-stone-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Commission Dossier</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Reviewing intent from {selectedRequest.user?.name}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm border border-gray-100 transition-all active:scale-95"
              >
                <XMarkIcon className="h-6 w-6 stroke-2" />
              </button>
            </div>

            <div className="overflow-y-auto p-10 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Artifact Specifications */}
                <div className="space-y-10">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-amber-400 rounded-full"></div>
                    Patron Requirements
                  </h3>

                  <div className="bg-stone-50/50 p-8 rounded-[2.5rem] border border-gray-50 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      {[
                        { label: 'Artifact Type', value: selectedRequest.sculptureType },
                        { label: 'Medium', value: selectedRequest.material },
                        { label: 'Scale Class', value: selectedRequest.size },
                        { label: 'Color Theory', value: selectedRequest.color },
                        { label: 'Economic Budget', value: selectedRequest.budget },
                        { label: 'Temporal Limit', value: selectedRequest.timeline },
                      ].map((spec, i) => spec.value && (
                        <div key={i} className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{spec.label}</span>
                          <span className="text-gray-900 font-bold tracking-tight">{spec.value}</span>
                        </div>
                      ))}
                    </div>

                    {(selectedRequest.height || selectedRequest.width || selectedRequest.depth) && (
                      <div className="pt-4 border-t border-gray-100">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Precise Dimensions</span>
                        <p className="text-gray-900 font-black text-lg tracking-tight">
                          {selectedRequest.height && `${selectedRequest.height}″ H`}
                          {selectedRequest.width && ` × ${selectedRequest.width}″ W`}
                          {selectedRequest.depth && ` × ${selectedRequest.depth}″ D`}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Manifesto / Description</span>
                      <p className="text-gray-600 font-medium text-sm leading-relaxed whitespace-pre-line bg-white p-6 rounded-2xl border border-gray-50 shadow-inner">
                        {selectedRequest.description || selectedRequest.requestDetails}
                      </p>
                    </div>
                  </div>

                  {selectedRequest.images && selectedRequest.images.length > 0 && (
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Visonal References</h4>
                      <div className="grid grid-cols-4 gap-4">
                        {selectedRequest.images.map((img, index) => (
                          <img key={index} src={img.url} alt="Reference" className="w-full aspect-square object-cover rounded-2xl border border-gray-100 shadow-sm hover:scale-105 transition-transform" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Administrative Controls */}
                <div className="space-y-10">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary-600 rounded-full"></div>
                    Strategic Update
                  </h3>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-inner space-y-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Operational Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                          {['pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'completed'].map(s => (
                            <option key={s} value={s}>{s.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Financial Quote (₹)</label>
                          <input
                            type="number"
                            value={formData.quotedPrice}
                            onChange={(e) => setFormData({ ...formData, quotedPrice: e.target.value })}
                            className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Estimated Dispatch</label>
                          <input
                            type="date"
                            value={formData.estimatedDeliveryDate}
                            onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
                            className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Director's Notes (Internal / Narrative)</label>
                        <textarea
                          value={formData.adminNotes}
                          onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                          rows="5"
                          className="w-full px-6 py-6 bg-stone-50 border border-gray-100 rounded-[2rem] text-gray-700 font-medium h-40 resize-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all leading-relaxed"
                          placeholder="Document internal deliberations or communication details..."
                        />
                      </div>

                      <div className="flex items-center px-2 py-4 bg-primary-50/30 rounded-2xl border border-primary-50">
                        <label className="relative inline-flex items-center cursor-pointer ml-2">
                          <input
                            type="checkbox"
                            checked={formData.sendEmail}
                            onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-primary-900">Notify Patron via Email</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-5 bg-stone-100 text-gray-600 font-black rounded-3xl hover:bg-stone-200 transition-all active:scale-95 text-xs uppercase tracking-widest"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="flex-1 py-5 bg-primary-600 text-white font-black rounded-3xl hover:bg-primary-700 shadow-xl shadow-primary-100 transition-all active:scale-95 text-xs uppercase tracking-widest"
                    >
                      Execute Protocol
                    </button>
                  </div>
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


