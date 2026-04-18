import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  PhoneIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({
    orderStatus: '',
    paymentStatus: '',
    estimatedDeliveryDate: '',
    deliveryNotes: '',
    sendEmail: false
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/admin/orders';
      if (!isSuperAdmin) {
        url = '/admin/orders/my-products';
      }
      const response = await apiCall(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, orderStatus, paymentStatus = null, sendEmail = false, additionalData = {}) => {
    try {
      const updateData = { orderStatus, sendEmail, ...additionalData };
      if (paymentStatus) updateData.paymentStatus = paymentStatus;

      const response = await apiCall(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast.success('Order updated successfully');
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          const detailRes = await apiCall(`/admin/orders/${orderId}`);
          const detailData = await detailRes.json();
          setSelectedOrder(detailData.order);
          setEditData({
            orderStatus: detailData.order.orderStatus || '',
            paymentStatus: detailData.order.paymentStatus || '',
            estimatedDeliveryDate: detailData.order.estimatedDeliveryDate ? new Date(detailData.order.estimatedDeliveryDate).toISOString().split('T')[0] : '',
            deliveryNotes: detailData.order.deliveryNotes || '',
            sendEmail: false
          });
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.orderStatus === statusFilter;
    const searchMatch = !searchTerm ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  if (loading && orders.length === 0) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="section-title mb-1">Order Management</h1>
          <p className="text-gray-500 font-medium">Monitor and process divine art acquisitions.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchOrders} className="btn-outline flex items-center gap-2">
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card-premium p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap items-center gap-3">
            {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${statusFilter === status
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-100'
                  : 'bg-stone-50 text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-11"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order ID</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-primary-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-black text-gray-900 tracking-tight">#{order.orderNumber || order._id.slice(-6)}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs uppercase">
                        {order.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{order.user?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{order.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 font-black text-gray-900">₹{order.total?.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      order.orderStatus === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={async () => {
                        const res = await apiCall(`/admin/orders/${order._id}`);
                        const data = await res.json();
                        setSelectedOrder(data.order);
                        setEditData({
                          orderStatus: data.order.orderStatus || '',
                          paymentStatus: data.order.paymentStatus || '',
                          estimatedDeliveryDate: data.order.estimatedDeliveryDate ? new Date(data.order.estimatedDeliveryDate).toISOString().split('T')[0] : '',
                          deliveryNotes: data.order.deliveryNotes || '',
                          sendEmail: false
                        });
                        setShowModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
                        <ShoppingBagIcon className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No orders found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center p-8 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-6)}</h2>
                <p className="text-gray-500 text-xs font-medium mt-1">Detailed view of the acquisition</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Info */}
                <div className="space-y-6">
                  <div className="bg-stone-50 rounded-[2rem] p-6 border border-gray-100">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Customer Details</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase">
                        {selectedOrder.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-black text-gray-900">{selectedOrder.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500 font-medium">{selectedOrder.user?.email}</div>
                      </div>
                    </div>
                    {selectedOrder.shippingAddress && (
                      <div className="pt-4 border-t border-gray-200/50">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 text-xs">Shipping Address</div>
                        <div className="text-sm text-gray-600 leading-relaxed font-medium">
                          {selectedOrder.shippingAddress.name && <div className="font-bold text-gray-800 mb-1">{selectedOrder.shippingAddress.name}</div>}
                          {selectedOrder.shippingAddress.address || selectedOrder.shippingAddress.street},<br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.zipCode || selectedOrder.shippingAddress.pincode}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-stone-50 rounded-[2rem] p-6 border border-gray-100">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Payment Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium lowercase">Method</span>
                        <div className="flex items-center gap-2">
                          {selectedOrder.paymentMethod === 'razorpay' && <CreditCardIcon className="h-4 w-4 text-indigo-500" />}
                          {selectedOrder.paymentMethod === 'cod' && <BanknotesIcon className="h-4 w-4 text-emerald-500" />}
                          {selectedOrder.paymentMethod === 'qr' && <QrCodeIcon className="h-4 w-4 text-amber-500" />}
                          <span className="text-sm font-black text-gray-900 uppercase">{selectedOrder.paymentMethod}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium lowercase">Status</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      {selectedOrder.paymentId && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/30">
                          <span className="text-xs text-gray-500 font-medium lowercase">Transaction ID</span>
                          <span className="text-[10px] font-mono font-bold text-gray-400 select-all">{selectedOrder.paymentId}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium lowercase">Placed On</span>
                        <span className="text-[10px] font-bold text-gray-600">
                          {new Date(selectedOrder.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                  </div>
                  </div>

                  <div className="bg-stone-50 rounded-[2rem] p-6 border border-gray-100">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Update Status</h3>
                    
                    {/* Refund Information Display */}
                    {(selectedOrder.refundId || selectedOrder.paymentStatus === 'refunded') && (
                      <div className="mb-4 bg-amber-50 rounded-2xl p-4 border border-amber-100 space-y-2">
                        <div className="flex items-center gap-2 text-amber-800">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Refund Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-amber-700 uppercase tracking-tight">
                          <span>Refund ID:</span>
                          <span className="font-mono lowercase text-gray-600 truncate">{selectedOrder.refundId || 'N/A'}</span>
                          <span>Amount:</span>
                          <span className="text-gray-600">₹{selectedOrder.refundAmount?.toLocaleString()}</span>
                          <span>Processed:</span>
                          <span className="text-gray-600">{selectedOrder.refundAt ? new Date(selectedOrder.refundAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        {selectedOrder.refundReason && (
                          <div className="pt-2 border-t border-amber-200/50">
                            <span className="block text-[8px] text-amber-600 mb-1">REASON:</span>
                            <p className="text-[10px] text-gray-600 normal-case italic">"{selectedOrder.refundReason}"</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Order Status</label>
                        <select
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none"
                          value={editData.orderStatus}
                          onChange={(e) => setEditData({ ...editData, orderStatus: e.target.value })}
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
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Payment Status</label>
                        <select
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none"
                          value={editData.paymentStatus}
                          onChange={(e) => setEditData({ ...editData, paymentStatus: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-200/50">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Estimated Delivery Date</label>
                        <input
                          type="date"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10"
                          value={editData.estimatedDeliveryDate}
                          onChange={(e) => setEditData({ ...editData, estimatedDeliveryDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Delivery Notes</label>
                        <textarea
                          rows="2"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary-500/10 resize-none"
                          placeholder="Special instructions for delivery..."
                          value={editData.deliveryNotes}
                          onChange={(e) => setEditData({ ...editData, deliveryNotes: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="sendEmail"
                            className="rounded text-primary-600 focus:ring-primary-500"
                            checked={editData.sendEmail}
                            onChange={(e) => setEditData({ ...editData, sendEmail: e.target.checked })}
                          />
                          <label htmlFor="sendEmail" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Notify</label>
                        </div>
                        
                        <div className="flex gap-2">
                          {/* Cancel & Refund Button */}
                          {selectedOrder.orderStatus !== 'cancelled' && selectedOrder.paymentStatus === 'paid' && selectedOrder.paymentMethod === 'razorpay' && (
                            <button
                              onClick={async () => {
                                const reason = prompt('Please enter a reason for cancellation & refund:');
                                if (!reason) return;
                                
                                try {
                                  const response = await apiCall(`/orders/${selectedOrder._id}/cancel`, {
                                    method: 'POST',
                                    body: JSON.stringify({ reason })
                                  });
                                  
                                  if (response.ok) {
                                    toast.success('Refund initiated and order cancelled');
                                    fetchOrders();
                                    setShowModal(false);
                                  } else {
                                    const error = await response.json();
                                    toast.error(error.message || 'Cancellation failed');
                                  }
                                } catch (err) {
                                  toast.error('Network error occurred');
                                }
                              }}
                              className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 active:scale-95"
                            >
                              Cancel & Refund
                            </button>
                          )}

                          <button
                            onClick={() => updateOrderStatus(selectedOrder._id, editData.orderStatus, editData.paymentStatus, editData.sendEmail, {
                              estimatedDeliveryDate: editData.estimatedDeliveryDate,
                              deliveryNotes: editData.deliveryNotes
                            })}
                            className="bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 active:scale-95"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                {/* Financial Details */}
                <div className="bg-stone-50 rounded-[2rem] p-6 border border-gray-100 mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Financial Footprint</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Method</p>
                      <p className="text-xs font-bold text-gray-900 uppercase">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Status</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                        selectedOrder.paymentStatus === 'refunded' ? 'bg-amber-100 text-amber-700' :
                        'bg-stone-200 text-stone-600'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    {selectedOrder.paymentId && (
                      <div className="col-span-2 space-y-1 pt-2 border-t border-gray-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Transaction ID (Razorpay)</p>
                        <p className="text-[10px] font-mono text-gray-600 truncate">{selectedOrder.paymentId}</p>
                      </div>
                    )}
                    {selectedOrder.refundId && (
                      <div className="col-span-2 space-y-2 pt-2 border-t border-amber-100 bg-amber-50/30 p-2 rounded-lg">
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Refund ID</p>
                          <p className="text-[10px] font-mono text-amber-700 truncate">{selectedOrder.refundId}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Refunded Amount</p>
                          <p className="text-xs font-black text-amber-700">₹{selectedOrder.refundAmount?.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

                {/* Items */}
                <div className="space-y-6">
                  <div className="bg-stone-50 rounded-[2rem] p-6 border border-gray-100">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Acquisitions</h3>
                    <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-50 shadow-sm">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 border border-gray-100 flex-shrink-0">
                            {item.product?.images?.[0]?.url ? (
                              <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><ShoppingBagIcon className="w-6 h-6 text-primary-200" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-gray-900 truncate text-sm">{item.product?.name || 'Product'}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-200/50 space-y-2">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subtotal</span>
                        <span className="text-sm font-bold text-gray-700">₹{selectedOrder.subtotal?.toLocaleString()}</span>
                      </div>
                      
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between items-center px-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
                            Discount {selectedOrder.coupon?.code ? `(${selectedOrder.coupon.code})` : ''}
                          </span>
                          <span className="text-sm font-bold text-rose-500">-₹{selectedOrder.discount?.toLocaleString()}</span>
                        </div>
                      )}

                      {selectedOrder.loyaltyDiscount > 0 && (
                        <div className="flex justify-between items-center px-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-400">Loyalty Points</span>
                          <span className="text-sm font-bold text-primary-500">-₹{selectedOrder.loyaltyDiscount?.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tax / GST</span>
                        <span className="text-sm font-bold text-gray-700">₹{selectedOrder.tax?.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Shipping</span>
                        <span className="text-sm font-bold text-gray-700">
                          {selectedOrder.shippingCost === 0 ? 'FREE' : `₹${selectedOrder.shippingCost?.toLocaleString()}`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center px-2 pt-3 border-t border-gray-100">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Final Total</span>
                        <span className="text-2xl font-black text-primary-600 tracking-tight">₹{selectedOrder.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      className="flex-1 btn-primary py-4 uppercase tracking-widest text-[10px]"
                      onClick={() => setShowModal(false)}
                    >
                      Close View
                    </button>
                    <button
                      className="flex-1 btn-outline py-4 uppercase tracking-widest text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => window.open(`${import.meta.env.VITE_API_URL}/orders/${selectedOrder._id}/invoice`, '_blank')}
                    >
                      Invoice
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

export default Orders;