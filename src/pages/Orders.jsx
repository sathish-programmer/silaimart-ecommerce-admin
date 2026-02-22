import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
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
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      let url = '/admin/orders';
      if (!isSuperAdmin) {
        // For regular admins, filter orders based on products they uploaded
        url = '/admin/orders/my-products'; // This endpoint will need to be created
      }
      const response = await apiCall(url);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, orderStatus, paymentStatus = null, notes = null, estimatedDeliveryDate = null, deliveryNotes = null, sendEmail = false) => {
    try {
      const updateData = { orderStatus, sendEmail };
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (notes) updateData.notes = notes;
      if (estimatedDeliveryDate) updateData.estimatedDeliveryDate = estimatedDeliveryDate;
      if (deliveryNotes !== null) updateData.deliveryNotes = deliveryNotes;

      await apiCall(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      toast.success(sendEmail ? 'Order updated and email sent!' : 'Order updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'shipped': return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'refunded': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Orders</h1>
          <p className="text-gray-500 font-medium mt-1">Manage customer orders and payments</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-50 border border-gray-100 rounded-xl px-4 py-2.5 text-gray-900 font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all cursor-pointer"
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
            className="bg-stone-50 border border-gray-100 rounded-xl px-4 py-2.5 text-gray-900 font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all cursor-pointer"
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
          <div key={order._id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <span className="text-primary-700 font-black">#{order.orderNumber?.slice(-4) || order._id.slice(-4)}</span>
                </div>
                <div>
                  <h3 className="text-gray-900 text-xl font-black tracking-tight">{order.user?.name || 'Unknown Customer'}</h3>
                  <p className="text-gray-500 font-medium">{order.user?.email}</p>
                  <p className="text-gray-400 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{order.total?.toLocaleString() || '0'}</p>
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <div className="p-1.5 bg-stone-50 rounded-lg text-gray-400">
                    {getPaymentIcon(order.paymentMethod)}
                  </div>
                  <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">{order.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus?.toUpperCase()}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => viewOrderDetails(order._id)}
                  className="p-3 bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                  title="View Details"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-50 group-hover:border-primary-100 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-xs font-black uppercase tracking-widest mr-2">Quick Actions:</span>
                {order.orderStatus === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'confirmed')}
                    className="px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all duration-200"
                  >
                    Confirm
                  </button>
                )}
                {order.orderStatus === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'processing')}
                    className="px-4 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-600 hover:text-white rounded-lg text-xs font-bold transition-all duration-200"
                  >
                    Process
                  </button>
                )}
                {order.orderStatus === 'processing' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'shipped')}
                    className="px-4 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white rounded-lg text-xs font-bold transition-all duration-200"
                  >
                    Ship
                  </button>
                )}
                {order.paymentMethod === 'qr' && order.paymentStatus === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, order.orderStatus, 'paid')}
                    className="px-4 py-1.5 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-lg text-xs font-bold transition-all duration-200"
                  >
                    Confirm Payment
                  </button>
                )}
              </div>
              <div className="text-gray-500 text-sm font-bold bg-stone-50 px-3 py-1 rounded-lg">
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

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center p-8 border-b border-gray-50">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Order Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all"
              >
                <XCircleIcon className="h-8 w-8" />
              </button>
            </div>

            <div className="p-8 space-y-10">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight border-l-4 border-primary-500 pl-4 uppercase text-xs tracking-[0.2em]">Order Information</h3>
                  <div className="space-y-4 bg-stone-50 p-6 rounded-2xl">
                    <p className="text-gray-900 font-medium"><span className="text-gray-500 block text-xs font-bold uppercase mb-1">Order ID</span> #{selectedOrder.orderNumber || selectedOrder._id}</p>
                    <p className="text-gray-900 font-medium"><span className="text-gray-500 block text-xs font-bold uppercase mb-1">Date</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    <p className="text-gray-900 font-medium"><span className="text-gray-500 block text-xs font-bold uppercase mb-1">Customer</span> {selectedOrder.user?.name}</p>
                    <p className="text-gray-900 font-medium"><span className="text-gray-500 block text-xs font-bold uppercase mb-1">Email</span> {selectedOrder.user?.email}</p>
                    <p className="text-gray-900 font-medium"><span className="text-gray-500 block text-xs font-bold uppercase mb-1">Phone</span> {selectedOrder.user?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight border-l-4 border-primary-500 pl-4 uppercase text-xs tracking-[0.2em]">Status & Payment</h3>
                  <div className="space-y-6 bg-stone-50 p-6 rounded-2xl">
                    <div>
                      <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Order Status</label>
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === 'cancelled') {
                            setShowCancelModal(true);
                          } else {
                            // Auto-set delivery date based on status
                            let deliveryDate = selectedOrder.estimatedDeliveryDate;
                            if (newStatus === 'shipped' && !deliveryDate) {
                              const date = new Date();
                              date.setDate(date.getDate() + 7); // 7 days from now
                              deliveryDate = date.toISOString().split('T')[0];
                            }
                            setSelectedOrder({ ...selectedOrder, orderStatus: newStatus, estimatedDeliveryDate: deliveryDate });
                          }
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder._id, selectedOrder.orderStatus, selectedOrder.paymentStatus, selectedOrder.notes, selectedOrder.estimatedDeliveryDate, selectedOrder.deliveryNotes, false);
                          }}
                          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-sm font-bold active:scale-[0.98]"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder._id, selectedOrder.orderStatus, selectedOrder.paymentStatus, selectedOrder.notes, selectedOrder.estimatedDeliveryDate, selectedOrder.deliveryNotes, true);
                          }}
                          className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-bold active:scale-[0.98] shadow-lg shadow-primary-100"
                        >
                          Update & Email
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Payment Status</label>
                      <select
                        value={selectedOrder.paymentStatus}
                        onChange={(e) => {
                          const newPaymentStatus = e.target.value;
                          if (newPaymentStatus === 'refunded' || newPaymentStatus === 'failed') {
                            setPaymentAction(newPaymentStatus);
                            setShowPaymentModal(true);
                          } else {
                            setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
                          }
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder._id, selectedOrder.orderStatus, selectedOrder.paymentStatus, selectedOrder.notes, selectedOrder.estimatedDeliveryDate, selectedOrder.deliveryNotes, false);
                          }}
                          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-sm font-bold active:scale-[0.98]"
                        >
                          Update Payment
                        </button>
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder._id, selectedOrder.orderStatus, selectedOrder.paymentStatus, selectedOrder.notes, selectedOrder.estimatedDeliveryDate, selectedOrder.deliveryNotes, true);
                          }}
                          className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-bold active:scale-[0.98] shadow-lg shadow-primary-100"
                        >
                          Update & Email
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Order Notes</label>
                      <textarea
                        value={selectedOrder.notes || ''}
                        readOnly
                        placeholder="Notes will appear here when added"
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-gray-500 h-24 resize-none cursor-not-allowed font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Estimated Delivery Date</label>
                      <input
                        type="date"
                        value={selectedOrder.estimatedDeliveryDate ? new Date(selectedOrder.estimatedDeliveryDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          if (newDate) {
                            setSelectedOrder({ ...selectedOrder, estimatedDeliveryDate: newDate });
                          }
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Delivery Notes</label>
                      <textarea
                        value={selectedOrder.deliveryNotes || ''}
                        onChange={(e) => {
                          const notes = e.target.value;
                          setSelectedOrder({ ...selectedOrder, deliveryNotes: notes });
                        }}
                        placeholder="Add delivery instructions or notes"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none h-24 resize-none transition-all"
                      />
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder._id, selectedOrder.orderStatus, selectedOrder.paymentStatus, selectedOrder.notes, selectedOrder.estimatedDeliveryDate, selectedOrder.deliveryNotes, false);
                          }}
                          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-sm font-bold active:scale-[0.98]"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder._id, selectedOrder.orderStatus, selectedOrder.paymentStatus, selectedOrder.notes, selectedOrder.estimatedDeliveryDate, selectedOrder.deliveryNotes, true);
                          }}
                          className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-bold active:scale-[0.98] shadow-lg shadow-primary-100"
                        >
                          Save & Email
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 pt-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                        {selectedOrder.paymentStatus?.toUpperCase()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400">
                          {getPaymentIcon(selectedOrder.paymentMethod)}
                        </div>
                        <span className="text-gray-900 font-bold text-sm capitalize">{selectedOrder.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight border-l-4 border-primary-500 pl-4 uppercase text-xs tracking-[0.2em] mb-6">Order Items</h3>
                <div className="space-y-4">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="flex items-center space-x-6 p-6 bg-stone-50 rounded-2xl border border-gray-100/50 hover:bg-white hover:border-primary-100 hover:shadow-lg hover:shadow-primary-50 transition-all duration-300">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-50 p-2">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="text-gray-300 flex flex-col items-center">
                            <PhotoIcon className="h-8 w-8" />
                            <span className="text-[10px] font-bold uppercase mt-1">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-black tracking-tight">{item.product?.name || 'Product'}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-primary-600 font-bold text-sm bg-primary-50 px-2 py-0.5 rounded-md">Qty: {item.quantity || 0}</span>
                          {item.size && <span className="text-gray-500 font-bold text-xs uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-gray-100">Size: {item.size}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900">₹{(((item.discountPrice || item.price || 0) * (item.quantity || 0))).toLocaleString()}</p>
                        {item.discountPrice && item.discountPrice < (item.price || 0) && (
                          <p className="text-gray-400 text-xs line-through font-bold">₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                    <div className="text-center py-8 text-gray-400">
                      <p>No items found in this order</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-900 rounded-[2rem] p-8 shadow-xl shadow-gray-200">
                <h3 className="text-xl font-bold text-white mb-6 uppercase text-xs tracking-[0.2em]">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-400 font-medium">
                    <span>Subtotal</span>
                    <span className="text-white">₹{selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-rose-400 font-medium">
                      <span>Coupon Discount</span>
                      <span>-₹{selectedOrder.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-amber-400 font-medium">
                      <span>Loyalty Discount ({selectedOrder.loyaltyPointsUsed} pts)</span>
                      <span>-₹{selectedOrder.loyaltyDiscount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400 font-medium">
                    <span>Shipping</span>
                    <span className="text-white">{selectedOrder.shippingCost === 0 ? 'FREE' : `₹${selectedOrder.shippingCost}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 font-medium">
                    <span>Tax (GST)</span>
                    <span className="text-white">₹{selectedOrder.tax?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black text-white border-t border-gray-800 pt-6 mt-2">
                    <span className="tracking-tight uppercase text-xs self-center text-gray-500">Total Amount</span>
                    <span className="text-amber-500 tracking-tighter">₹{selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight border-l-4 border-primary-500 pl-4 uppercase text-xs tracking-[0.2em] mb-6">Shipping Address</h3>
                  <div className="bg-stone-50 border border-gray-100 rounded-2xl p-8">
                    <p className="text-gray-900 text-lg font-black tracking-tight mb-2">{selectedOrder.shippingAddress.name}</p>
                    <div className="space-y-1 text-gray-600 font-medium">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p>{selectedOrder.shippingAddress.pincode}, {selectedOrder.shippingAddress.country}</p>
                      <div className="pt-3 flex items-center space-x-2 text-primary-600">
                        <PhoneIcon className="h-4 w-4" />
                        <span className="font-bold">{selectedOrder.shippingAddress.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center p-8 border-b border-gray-50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Cancel Order</h2>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelNotes('');
                }}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all"
              >
                <XCircleIcon className="h-7 w-7" />
              </button>
            </div>

            <div className="p-8">
              <p className="text-gray-600 font-medium mb-4 italic">Please provide a valid reason for cancelling this order. This will be visible to the customer.</p>
              <textarea
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="Reason for cancellation..."
                className="w-full bg-stone-50 border border-gray-100 rounded-2xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none h-32 resize-none transition-all"
                required
              />

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelNotes('');
                  }}
                  className="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => {
                    if (cancelNotes.trim()) {
                      updateOrderStatus(selectedOrder._id, 'cancelled', selectedOrder.paymentStatus, cancelNotes);
                      setSelectedOrder({ ...selectedOrder, orderStatus: 'cancelled', notes: cancelNotes });
                      setShowCancelModal(false);
                      setCancelNotes('');
                    } else {
                      toast.error('Please provide a cancellation reason');
                    }
                  }}
                  className="px-6 py-3.5 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center p-8 border-b border-gray-50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {paymentAction === 'refunded' ? 'Refund Payment' : 'Payment Failure'}
              </h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentNotes('');
                  setPaymentAction('');
                }}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all"
              >
                <XCircleIcon className="h-7 w-7" />
              </button>
            </div>

            <div className="p-8">
              <p className="text-gray-600 font-medium mb-4">
                {paymentAction === 'refunded'
                  ? 'Provide transaction details for the refund process:'
                  : 'Specify the reason for payment verification failure:'}
              </p>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder={paymentAction === 'refunded'
                  ? 'Transaction ID, Refund Date, etc.'
                  : 'Insufficient funds, invalid card, etc.'}
                className="w-full bg-stone-50 border border-gray-100 rounded-2xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none h-32 resize-none transition-all"
                required
              />

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentNotes('');
                    setPaymentAction('');
                  }}
                  className="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => {
                    if (paymentNotes.trim()) {
                      updateOrderStatus(selectedOrder._id, selectedOrder.orderStatus, paymentAction, paymentNotes);
                      setSelectedOrder({ ...selectedOrder, paymentStatus: paymentAction, notes: paymentNotes });
                      setShowPaymentModal(false);
                      setPaymentNotes('');
                      setPaymentAction('');
                    } else {
                      toast.error('Please provide details');
                    }
                  }}
                  className={`px-6 py-3.5 rounded-2xl font-bold transition-all text-white shadow-lg ${paymentAction === 'refunded'
                      ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-100'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                    }`}
                >
                  {paymentAction === 'refunded' ? 'Confirm Refund' : 'Reject Payment'}
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