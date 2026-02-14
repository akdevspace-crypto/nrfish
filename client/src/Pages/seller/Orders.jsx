import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets';
import {
  Package, Truck, CheckCircle, XCircle, Clock, Loader, User, Smartphone, MapPin, CreditCard, Banknote, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


function Orders() {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const interactingRef = useRef(false);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch orders
  async function fetchOrders() {
    try {
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Fetch delivery partners
  const [partners, setPartners] = useState([]);
  async function fetchPartners() {
    try {
      const { data } = await axios.get('/api/delivery/admin/list');
      if (data.success) {
        setPartners(data.partners.filter(p => p.is_active && p.is_verified));
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchOrders();
    fetchPartners();
    const interval = setInterval(() => {
      if (!interactingRef.current && !showOtpModal && !showAssignModal) fetchOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [showOtpModal]); // Added dependency to refresh on modal close if needed

  // Assign Partner State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  async function handleAssignOrder() {
    if (!selectedPartnerId) return toast.error("Select a partner");
    setLoading(true);
    try {
      const { data } = await axios.post('/api/delivery/admin/assign', { orderId: assignOrderId, deliveryPartnerId: selectedPartnerId });
      if (data.success) {
        toast.success("Assigned Successfully");
        setShowAssignModal(false);
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Assignment Failed");
    } finally {
      setLoading(false);
    }
  }

  // Handle OTP Submit
  async function verifyDeliveryOtp() {
    if (!otpInput || otpInput.length !== 6) {
      toast.error("Please enter valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.patch('/api/order/status', {
        orderId: selectedOrderId,
        status: 'Delivered',
        otp: otpInput
      });

      if (data.success) {
        toast.success("Order Delivered Successfully! ✅");
        setShowOtpModal(false);
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification Failed");
    } finally {
      setLoading(false);
    }
  }

  // Status Icon Mapping
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      case 'Out for Delivery': return <Truck className="w-4 h-4" />;
      case 'Processing': return <Loader className="w-4 h-4 animate-spin" />;
      default: return <Clock className="w-4 h-4" />;
    }
  }

  // Filter Logic
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'All') return true;
    return order.status === filterStatus;
  });

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-50/50 p-6 md:p-10 pb-20 font-sans relative text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER & FILTERS */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
              Order Management
            </h2>
            <p className="text-gray-500 mt-1">Track and manage customer orders efficiently</p>
          </div>

          {/* STATUS FILTER TABS */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Order Placed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${filterStatus === status
                  ? 'bg-[#42cbf5] text-black border-[#42cbf5] shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* ORDERS LIST */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={order.order_id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* HERO HEADER */}
                  <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400">
                        <Package size={28} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-xl text-gray-900">Order #{order.order_id}</h3>
                          {order.payment_type === 'COD' && <span className="text-[10px] font-black bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200">COD</span>}
                        </div>
                        <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mt-1">
                          <Clock size={14} /> {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* DELIVERY STATUS BADGE */}
                      {order.delivery_partner_name && (
                        <div className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-bold flex items-center gap-2">
                          <Truck size={14} />
                          {order.delivery_partner_name} ({order.delivery_status})
                        </div>
                      )}

                      <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border shadow-sm
                        ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                          order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                            order.status === 'Out for Delivery' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                              'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {getStatusIcon(order.status)}
                        {order.status || 'Order Placed'}
                      </div>
                    </div>
                  </div>

                  {/* CONTENT GRID */}
                  <div className="p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8 xl:gap-12">

                    {/* PRODUCTS */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        Items in Order ({order.products.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {order.products.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                            <div className="w-20 h-20 rounded-xl bg-white border border-gray-100 p-2 shrink-0 shadow-sm">
                              <img
                                src={item.image?.[0] || assets.upload_area}
                                alt={item.product_name}
                                className="w-full h-full object-contain"
                                onError={(e) => e.target.src = assets.upload_area}
                              />
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                              <p className="font-bold text-gray-900 truncate text-lg">{item.product_name}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">Qty: {item.quantity}</span>
                                <span>x</span>
                                <span>{currency}{item.price}</span>
                              </div>
                            </div>
                            <div className="self-center font-bold text-lg text-gray-900">
                              {currency}{item.price * item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CUSTOMER & PAYMENT - SIDEBAR */}
                    <div className="flex flex-col gap-6 xl:border-l border-gray-100 xl:pl-10">
                      {/* CUSTOMER CARD */}
                      <div className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-200/60 pb-4">
                          <div className="w-10 h-10 rounded-full bg-[#42cbf5] flex items-center justify-center text-black font-bold shadow-sm shadow-blue-200">
                            {order.address.first_name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{order.address.first_name} {order.address.last_name}</p>
                            <p className="text-xs text-gray-500 font-medium">{order.address.email || 'No Email'}</p>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm text-gray-600 font-medium">
                          <div className="flex gap-3">
                            <Smartphone size={16} className="text-gray-400 shrink-0" />
                            <span>{order.address.phone}</span>
                          </div>
                          <div className="flex gap-3">
                            <MapPin size={16} className="text-gray-400 shrink-0" />
                            <span className="leading-snug">
                              {order.address.address}, {order.address.city}, {order.address.pincode}
                            </span>
                          </div>
                          {order.delivery_slot && (
                            <div className="flex gap-3">
                              <Clock size={16} className="text-[#42cbf5] shrink-0" />
                              <span className="text-gray-900">Slot: {order.delivery_slot}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PAYMENT SUMMARY */}
                      <div className="mt-auto space-y-4">
                        <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                          <span>Payment Method</span>
                          <span className="flex items-center gap-1.5 text-gray-900">
                            {order.payment_type === 'COD' ? <Banknote size={16} /> : <CreditCard size={16} />}
                            {order.payment_type}
                          </span>
                        </div>

                        {/* ONLINE PAYMENT DETAILS */}
                        {order.payment_type === 'Online' && (
                          <div className="bg-blue-50/50 rounded-xl p-3 space-y-2 border border-blue-100/50">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Transaction ID</span>
                              <span className="font-mono font-bold text-gray-700 select-all">{order.transaction_id || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Paid Via</span>
                              <span className="font-bold text-gray-700">{order.payment_mode || 'Cashfree'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Paid At</span>
                              <span className="font-bold text-gray-700">
                                {order.payment_date ? new Date(order.payment_date).toLocaleString() : '-'}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-baseline pt-4 border-t border-dashed border-gray-300">
                          <span className="text-lg font-bold text-gray-600">Total</span>
                          <span className="text-4xl font-black text-gray-900 tracking-tight">{currency}{order.amount}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* ACTION FOOTER */}
                  <div className="bg-gray-50 px-6 lg:px-8 py-5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                      <span className="text-xs font-bold text-gray-400 uppercase">Update Status</span>
                      <div className='relative'>
                        <select
                          value={order.status || 'Order Placed'}
                          onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                          className="py-1 pr-8 bg-transparent text-sm font-bold text-gray-900 outline-none cursor-pointer appearance-none hover:text-[#0b8bb0] transition-colors"
                          disabled={order.status === 'Delivered' || order.status === 'Cancelled' || (order.payment_type === 'Online' && order.payment_status !== 'Success')}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <Navigation size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                      </div>
                      {order.payment_type === 'Online' && order.payment_status !== 'Success' && (
                        <span className="text-xs font-bold text-red-500 whitespace-nowrap">Payment Unverified</span>
                      )}
                    </div>

                    <div className="flex gap-3 ml-auto">
                      {/* ASSIGN PARTNER BUTTON */}
                      {!order.delivery_partner_id && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button
                          onClick={() => {
                            setAssignOrderId(order.order_id);
                            setShowAssignModal(true);
                            setSelectedPartnerId("");
                          }}
                          className="bg-white border-2 border-dashed border-gray-300 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:border-[#42cbf5] hover:text-[#42cbf5] flex items-center gap-2"
                        >
                          <Truck size={16} /> Assign Partner
                        </button>
                      )}

                      {(order.payment_type === 'Online' && order.payment_status !== 'Success') ? (
                        <button disabled className="bg-gray-100 text-gray-400 px-6 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed flex items-center gap-2">
                          <Loader size={16} /> Awaiting Verification
                        </button>
                      ) : (
                        <>
                          {!order.status || order.status === 'Order Placed' ? (
                            <button
                              onClick={() => updateOrderStatus(order.order_id, 'Processing')}
                              className="bg-[#42cbf5] text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1dc1f2] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
                            >
                              <Loader size={16} /> Accept Order
                            </button>
                          ) : order.status === 'Processing' ? (
                            <button
                              onClick={() => updateOrderStatus(order.order_id, 'Out for Delivery')}
                              className="bg-[#42cbf5] text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1dc1f2] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
                            >
                              <Package size={16} /> Ship Order
                            </button>
                          ) : order.status === 'Out for Delivery' ? (
                            <button
                              onClick={() => updateOrderStatus(order.order_id, 'Delivered')}
                              className="bg-[#42cbf5] text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1dc1f2] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
                            >
                              <CheckCircle size={16} /> Mark Delivered
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>

                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No Orders Found</h3>
                <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                  {filterStatus === 'All' ? "You haven't received any orders yet." : `No orders found with status "${filterStatus}"`}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* DELIVERY OTP MODAL */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-gray-100"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#f0f9ff] text-[#42cbf5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-50">
                  <div className="text-4xl">🔐</div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Verify Delivery</h3>
                <p className="text-gray-500 mt-3 font-medium">Ask customer for the 6-digit OTP sent to their mobile number.</p>
              </div>

              <div className="space-y-6">
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setOtpInput(val);
                  }}
                  placeholder="0 0 0 0 0 0"
                  className="w-full text-center text-4xl font-black tracking-[0.5em] py-5 border-2 border-gray-200 rounded-2xl focus:border-[#42cbf5] focus:ring-4 focus:ring-[#42cbf5]/10 outline-none transition-all placeholder:text-gray-200 font-mono"
                  autoFocus
                />

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="py-4 px-4 rounded-xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyDeliveryOtp}
                    disabled={loading || otpInput.length !== 6}
                    className="py-4 px-4 rounded-xl font-bold text-black bg-[#42cbf5] hover:bg-[#1dc1f2] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-95"
                  >
                    {loading ? <Loader className="animate-spin" /> : 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ASSIGN PARTNER MODAL */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl overflow-hidden"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Assign Delivery Partner</h3>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto mb-6 pr-2">
                {partners.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">No active partners found.</p>
                ) : (
                  partners.map(partner => (
                    <div
                      key={partner.id}
                      onClick={() => setSelectedPartnerId(partner.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedPartnerId === partner.id ? 'border-[#42cbf5] bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img src={partner.partner_photo || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{partner.name}</h4>
                        <p className="text-xs text-gray-500">{partner.vehicle_no}</p>
                      </div>
                      {selectedPartnerId === partner.id && <CheckCircle className="text-[#42cbf5]" />}
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowAssignModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button onClick={handleAssignOrder} disabled={loading || !selectedPartnerId} className="flex-1 py-3 rounded-xl font-bold bg-[#42cbf5] text-black hover:bg-[#1dc1f2] shadow-lg disabled:opacity-50">
                  {loading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helper component for ClipboardList since I used it in Title and didn't import standard Icon there
function ClipboardList({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
  )
}

export default Orders;
