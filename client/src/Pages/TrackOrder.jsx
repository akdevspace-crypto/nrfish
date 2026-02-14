import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../Context/AppContext';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    ChevronDown,
    ChevronUp,
    CheckCircle,
    Package,
    Truck,
    MapPin,
    CheckSquare,
    XCircle,
    Clock,
    CreditCard,
    User,
    Phone,
    Navigation,
    ArrowRight
} from 'lucide-react';
import { assets } from '../assets/assets';
import { motion, AnimatePresence } from 'framer-motion';

const TrackOrder = () => {
    const { user, setShowUserLogin, axios, currency } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId } = useParams(); // Get orderId from URL

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const pollingInterval = useRef(null);

    // Timeline Steps Definition
    const timelineSteps = [
        { status: 'Order Placed', label: 'Order Placed', desc: 'Order received.', icon: CheckSquare },
        { status: 'Order Confirmed', label: 'Order Confirmed', desc: 'Admin confirmed availability.', icon: CheckCircle },
        { status: 'Preparing', label: 'Preparing the Order', desc: 'Freshly cut & prepared.', icon: Package },
        { status: 'Packing', label: 'Packing the Order', desc: 'Vacuum encoded & sealed.', icon: Package },
        { status: 'Out for Delivery', label: 'Order Out for Delivery', desc: 'Assigned to delivery partner.', icon: Truck },
        { status: 'Shipping', label: 'Shipping', desc: 'En route to location.', icon: Truck },
        { status: 'Destination Reached', label: 'Destination Reached', desc: 'Agent at location.', icon: MapPin },
        { status: 'Waiting for Customer', label: 'Waiting for Customer', desc: 'Waiting for handover.', icon: User },
        { status: 'Payment Verification', label: 'Payment Verification', desc: 'Verifying payment.', icon: CreditCard },
        { status: 'Delivered', label: 'Order Delivered', desc: 'Handed over to customer.', icon: CheckCircle },
        { status: 'Completed', label: 'Order Completed', desc: 'Transaction closed.', icon: CheckCircle },
    ];

    // Helper to determine active step index based on DB status
    const getActiveStepIndex = (status) => {
        const index = timelineSteps.findIndex(step => step.status === status);
        return index !== -1 ? index : 0;
    };

    // Fetch Single Order details (Polled)
    const fetchSingleOrder = async () => {
        try {
            const { data } = await axios.post('/api/order/single', { orderId });
            if (data.success) {
                setSelectedOrder(data.order);
            }
        } catch (error) {
            console.error("Polling Error:", error);
        }
    };

    // Initial Load & Auth Check
    useEffect(() => {
        if (!user) {
            toast.error("Please login to track orders");
            setShowUserLogin(true);
            navigate('/');
            return;
        }

        const init = async () => {
            setLoading(true);
            try {
                if (orderId) {
                    await fetchSingleOrder();
                    pollingInterval.current = setInterval(fetchSingleOrder, 5000);
                } else {
                    const { data } = await axios.get('/api/order/user');
                    if (data.success) {
                        setOrders(data.orders);
                    } else {
                        toast.error("Failed to fetch orders");
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error("Error loading order data");
            } finally {
                setLoading(false);
            }
        };

        if (user) init();

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [user, navigate, setShowUserLogin, axios, orderId]);


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#42cbf5] border-t-transparent rounded-full"
            />
        </div>
    );

    // --- VIEW: SINGLE ORDER TRACKING (3-Section Layout) ---
    if (orderId && selectedOrder) {
        const activeIndex = getActiveStepIndex(selectedOrder.status);
        const isOutForDelivery = activeIndex >= timelineSteps.findIndex(s => s.status === 'Out for Delivery');

        return (
            <div className="pt-32 pb-16 px-4 md:px-8 bg-gray-50 min-h-screen font-sans">
                <div className="max-w-7xl mx-auto">
                    {/* Header with Back Button */}
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate('/track-order')} className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 transition">
                            <ArrowRight className="rotate-180 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Track Order #{String(selectedOrder.order_id).slice(0, 8)}</h1>
                            <p className="text-sm text-gray-500">Real-time status updates</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* SECTION 1: TIMELINE (Left - Cols 1-7) */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-7"
                        >
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2 flex items-center gap-2">
                                    <Clock size={20} className="text-[#42cbf5]" />
                                    Order Timeline
                                </h3>

                                <div className="relative pl-2">
                                    {/* Vertical Line Background */}
                                    <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-100 rounded-full"></div>

                                    {/* Vertical Line Progress */}
                                    <motion.div
                                        className="absolute left-[19px] top-2 w-0.5 bg-[#42cbf5] rounded-full"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.min((activeIndex / (timelineSteps.length - 1)) * 100, 100)}%` }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                    ></motion.div>

                                    <div className="space-y-6">
                                        {timelineSteps.map((step, index) => {
                                            const isCompleted = index <= activeIndex;
                                            const isCurrent = index === activeIndex;

                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: isCompleted ? 1 : 0.4, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className={`relative flex items-center pl-10 transition-all duration-500`}
                                                >
                                                    {/* Dot/Icon */}
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: isCompleted ? 1 : 0.8 }}
                                                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-white
                                                            ${isCompleted ? 'border-[#42cbf5] text-[#42cbf5] shadow-md' : 'border-gray-200 text-gray-300'}
                                                        `}
                                                    >
                                                        <step.icon size={16} />
                                                    </motion.div>

                                                    {/* Text */}
                                                    <div>
                                                        <h4 className={`font-bold text-sm ${isCurrent ? 'text-black' : 'text-gray-700'}`}>{step.label}</h4>
                                                        {isCurrent && (
                                                            <motion.span
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="text-xs text-[#42cbf5] font-semibold"
                                                            >
                                                                In Progress...
                                                            </motion.span>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* RIGHT SECTION: DELIVERY INFO & ORDER ITEMS (Cols 8-12) */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* 1. Delivery Address */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                    <MapPin size={20} className="text-gray-400" />
                                    Delivery Address
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                            <User size={14} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold">Customer</p>
                                            <p className="font-semibold text-gray-800">{selectedOrder.address.first_name} {selectedOrder.address.last_name}</p>
                                            <p className="text-sm text-gray-500">{selectedOrder.address.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                            <MapPin size={14} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold">Address</p>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {selectedOrder.address.address}, {selectedOrder.address.city}, {selectedOrder.address.state}, {selectedOrder.address.pincode}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* 2. Delivery Agent Info (Conditional) */}
                            <AnimatePresence>
                                {isOutForDelivery && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-gradient-to-br from-[#42cbf5]/10 to-white rounded-2xl shadow-sm border border-[#42cbf5]/30 p-6 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                                            <Truck size={100} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                                            <Truck size={20} className="text-[#42cbf5]" />
                                            Delivery Partner
                                        </h3>

                                        {selectedOrder.delivery_agent_name ? (
                                            <div className="space-y-4 relative z-10">
                                                <div className="flex gap-3 items-center">
                                                    <div className="w-12 h-12 rounded-full bg-black text-[#42cbf5] flex items-center justify-center font-bold text-lg shadow-md">
                                                        {selectedOrder.delivery_agent_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-lg">{selectedOrder.delivery_agent_name}</p>
                                                        <motion.p
                                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                            className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full w-fit"
                                                        >
                                                            {selectedOrder.delivery_live_status || 'Assigned'}
                                                        </motion.p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <div className="bg-white/60 p-2 rounded-lg backdrop-blur-sm">
                                                        <p className="text-xs text-gray-500">Vehicle</p>
                                                        <p className="font-mono font-bold text-gray-800">{selectedOrder.delivery_vehicle_no || 'N/A'}</p>
                                                    </div>
                                                    <div className="bg-white/60 p-2 rounded-lg backdrop-blur-sm">
                                                        <p className="text-xs text-gray-500">Phone</p>
                                                        <p className="font-mono font-bold text-gray-800">{selectedOrder.delivery_agent_phone || 'Locked'}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="w-full py-2 bg-black text-[#42cbf5] rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg"
                                                    >
                                                        <Phone size={14} /> Call Agent
                                                    </motion.button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-500 text-sm">
                                                <motion.p
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="font-medium"
                                                >
                                                    Assigning Delivery Agent...
                                                </motion.p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 3. Order Items */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Order Items</h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedOrder.products.map((item, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                                <img src={item.image ? item.image[0] : assets.upload_area} alt={item.product_name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 text-sm line-clamp-2">{item.product_name}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    <p className="font-bold text-sm text-gray-900">{currency}{item.price * item.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t mt-4 pt-4 flex justify-between items-center">
                                    <span className="font-bold text-gray-600">Total Amount</span>
                                    <span className="font-bold text-xl text-[#42cbf5]">{currency}{selectedOrder.amount}</span>
                                </div>
                                <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                                    <span>Payment Method</span>
                                    <span className="font-medium bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                        <CreditCard size={12} /> {selectedOrder.payment_type}
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: ORDER LIST (Fallback) ---
    return (
        <div className="pt-32 pb-16 px-4 md:px-12 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">Track Your Orders</h1>
            <div className="max-w-4xl mx-auto space-y-6">
                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center text-gray-500 py-10"
                    >
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        You have no orders to track.
                    </motion.div>
                ) : (
                    orders.map((order, index) => (
                        <motion.div
                            key={order.order_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            onClick={() => navigate(`/track-order/${order.order_id}`)}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                            <div>
                                <p className="font-bold text-lg">Order #{String(order.order_id).slice(0, 8)}</p>
                                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString()}</p>
                            </div>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold w-full md:w-auto text-center flex items-center justify-center gap-2
                                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-800'}
                                `}>
                                    {order.status === 'Delivered' ? <CheckCircle size={14} /> : order.status === 'Cancelled' ? <XCircle size={14} /> : <Clock size={14} />}
                                    {order.status || 'Processing'}
                                </span>
                                <div className="text-right w-full md:w-auto">
                                    <p className="font-bold text-lg text-gray-900">{currency}{order.amount}</p>
                                    <p className="text-xs text-gray-400">{order.payment_type}</p>
                                </div>
                                <div className="bg-[#42cbf5] p-2 rounded-full shadow-lg hidden md:block">
                                    <ArrowRight size={18} className="text-black" />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
