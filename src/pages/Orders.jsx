import { useState, useEffect } from 'react';
import { EyeIcon, CheckCircleIcon, TruckIcon, XCircleIcon, ClockIcon, CreditCardIcon, BanknotesIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelNotes, setCancelNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAction, setPaymentAction] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiCall('/admin/orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, orderStatus, paymentStatus = null, notes = null) => {
    try {
      const updateData = { orderStatus };
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (notes) updateData.notes = notes;
      
      await apiCall(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      toast.success('Order updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-900/20 text-blue-400 border-blue-500/30';
      case 'processing': return 'bg-purple-900/20 text-purple-400 border-purple-500/30';
      case 'shipped': return 'bg-indigo-900/20 text-indigo-400 border-indigo-500/30';
      case 'delivered': return 'bg-green-900/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-900/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-900/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-900/20 text-red-400 border-red-500/30';
      case 'refunded': return 'bg-gray-900/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'razorpay': return <CreditCardIcon className="h-4 w-4" />;
      case 'stripe': return <CreditCardIcon className="h-4 w-4" />;
      case 'cod': return <BanknotesIcon className="h-4 w-4" />;
      case 'qr': return <QrCodeIcon className="h-4 w-4" />;
      default: return <CreditCardIcon className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.orderStatus === statusFilter;
    const paymentMatch = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    return statusMatch && paymentMatch;
  });

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await apiCall(`/admin/orders/${orderId}`);
      const data = await response.json();
      setSelectedOrder(data.order);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders Management</h1>
          <p className="text-gray-400 mt-1">Manage customer orders and payments</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-bronze focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-bronze focus:outline-none"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 hover:border-bronze/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-bronze/20 rounded-lg flex items-center justify-center">
                  <span className="text-bronze font-bold">#{order.orderNumber?.slice(-4) || order._id.slice(-4)}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{order.user?.name || 'Unknown Customer'}</h3>
                  <p className="text-gray-400 text-sm">{order.user?.email}</p>
                  <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-bronze">₹{order.total?.toLocaleString() || '0'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getPaymentIcon(order.paymentMethod)}
                  <span className="text-gray-400 text-sm capitalize">{order.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus?.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => viewOrderDetails(order._id)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  title="View Details"
                >
                  <EyeIcon className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Quick Actions:</span>
                {order.orderStatus === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'confirmed')}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors"
                  >
                    Confirm
                  </button>
                )}
                {order.orderStatus === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'processing')}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs text-white transition-colors"
                  >
                    Process
                  </button>
                )}
                {order.orderStatus === 'processing' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'shipped')}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs text-white transition-colors"
                  >
                    Ship
                  </button>
                )}
                {order.paymentMethod === 'qr' && order.paymentStatus === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, order.orderStatus, 'paid')}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs text-white transition-colors"
                  >
                    Confirm Payment
                  </button>
                )}
              </div>
              <div className="text-gray-400 text-sm">
                {order.items?.length || 0} item(s)
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Orders Found</h3>
          <p className="text-gray-500">No orders match your current filters.</p>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">Order Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Order Information</h3>
                  <div className="space-y-2">
                    <p className="text-gray-300"><span className="text-gray-400">Order ID:</span> #{selectedOrder.orderNumber || selectedOrder._id}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Customer:</span> {selectedOrder.user?.name}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Email:</span> {selectedOrder.user?.email}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Phone:</span> {selectedOrder.user?.phone || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Status & Payment</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Order Status</label>
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === 'cancelled') {
                            setShowCancelModal(true);
                          } else {
                            updateOrderStatus(selectedOrder._id, newStatus);
                            setSelectedOrder({...selectedOrder, orderStatus: newStatus});
                          }
                        }}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-bronze focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Payment Status</label>
                      <select
                        value={selectedOrder.paymentStatus}
                        onChange={(e) => {
                          const newPaymentStatus = e.target.value;
                          if (newPaymentStatus === 'refunded' || newPaymentStatus === 'failed') {
                            setPaymentAction(newPaymentStatus);
                            setShowPaymentModal(true);
                          } else {
                            updateOrderStatus(selectedOrder._id, selectedOrder.orderStatus, newPaymentStatus);
                            setSelectedOrder({...selectedOrder, paymentStatus: newPaymentStatus});
                          }
                        }}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-bronze focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Order Notes</label>
                      <textarea
                        value={selectedOrder.notes || ''}
                        readOnly
                        placeholder="Notes will appear here when added"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 h-20 resize-none cursor-not-allowed"
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                        {selectedOrder.paymentStatus?.toUpperCase()}
                      </span>
                      <div className="flex items-center space-x-2">
                        {getPaymentIcon(selectedOrder.paymentMethod)}
                        <span className="text-gray-400 text-sm capitalize">{selectedOrder.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-gray-500 text-xs">No Image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{item.product?.name || 'Product'}</h4>
                        <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-bronze font-semibold">₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}</p>
                        {item.discountPrice && item.discountPrice < item.price && (
                          <p className="text-gray-500 text-sm line-through">₹{(item.price * item.quantity).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount:</span>
                      <span>-₹{selectedOrder.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping:</span>
                    <span>{selectedOrder.shippingCost === 0 ? 'Free' : `₹${selectedOrder.shippingCost}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax:</span>
                    <span>₹{selectedOrder.tax?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-bronze border-t border-gray-700 pt-2">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Shipping Address</h3>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-white font-medium">{selectedOrder.shippingAddress.name}</p>
                    <p className="text-gray-300">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-gray-300">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                    <p className="text-gray-300">{selectedOrder.shippingAddress.pincode}, {selectedOrder.shippingAddress.country}</p>
                    <p className="text-gray-300">Phone: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Cancel Order</h2>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelNotes('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-300 mb-4">Please provide a reason for cancelling this order:</p>
              <textarea
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-bronze focus:outline-none h-24 resize-none"
                required
              />
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelNotes('');
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (cancelNotes.trim()) {
                      updateOrderStatus(selectedOrder._id, 'cancelled', selectedOrder.paymentStatus, cancelNotes);
                      setSelectedOrder({...selectedOrder, orderStatus: 'cancelled', notes: cancelNotes});
                      setShowCancelModal(false);
                      setCancelNotes('');
                    } else {
                      toast.error('Please provide a cancellation reason');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {paymentAction === 'refunded' ? 'Refund Payment' : 'Mark Payment Failed'}
              </h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentNotes('');
                  setPaymentAction('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                {paymentAction === 'refunded' 
                  ? 'Please provide details about the refund:' 
                  : 'Please provide reason for payment failure:'}
              </p>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder={paymentAction === 'refunded' 
                  ? 'Enter refund details, transaction ID, etc.' 
                  : 'Enter failure reason...'}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-bronze focus:outline-none h-24 resize-none"
                required
              />
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentNotes('');
                    setPaymentAction('');
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (paymentNotes.trim()) {
                      updateOrderStatus(selectedOrder._id, selectedOrder.orderStatus, paymentAction, paymentNotes);
                      setSelectedOrder({...selectedOrder, paymentStatus: paymentAction, notes: paymentNotes});
                      setShowPaymentModal(false);
                      setPaymentNotes('');
                      setPaymentAction('');
                    } else {
                      toast.error('Please provide details');
                    }
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors text-white ${
                    paymentAction === 'refunded' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {paymentAction === 'refunded' ? 'Process Refund' : 'Mark as Failed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;