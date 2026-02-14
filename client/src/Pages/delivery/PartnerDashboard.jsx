import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, LogOut, Package, MapPin, Phone, CheckCircle, Clock, Navigation, User, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function PartnerDashboard() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [partnerInfo, setPartnerInfo] = useState(null);

    // OTP Modal
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState(null); // For demo purposes, or we send it to backend to SMS
    const [processingOrder, setProcessingOrder] = useState(null);

    // Auth Check
    useEffect(() => {
        const token = localStorage.getItem('dToken');
        const info = localStorage.getItem('partnerInfo');
        if (!token) {
            navigate('/delivery/login');
        } else {
            setPartnerInfo(JSON.parse(info));
            fetchAssignedOrders(token);
        }
    }, []);

    const fetchAssignedOrders = async (token) => {
        try {
            const { data } = await axios.get('/api/delivery/orders', {
                headers: { token }
            });
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('dToken');
        localStorage.removeItem('partnerInfo');
        navigate('/delivery/login');
    };

    const handleStatusUpdate = async (orderId, status) => {
        const token = localStorage.getItem('dToken');

        // If delivering, trigger OTP flow logic (On Admin side, the delivery needs verification, BUT 
        // usually the Partner ASKS for OTP. 
        // Wait, the flow in `deliveryController` `updateDeliveryStatus` handles 'Delivered' 
        // by verifying `otp` from body.

        if (status === 'Delivered') {
            setProcessingOrder(orderId);
            setShowOtpModal(true);
            return;
        }

        try {
            const { data } = await axios.post('/api/delivery/order/status',
                { orderId, status },
                { headers: { token } }
            );

            if (data.success) {
                toast.success(data.message);
                fetchAssignedOrders(token);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        }
    };

    const handleDeliverySubmit = async () => {
        if (!otp || otp.length !== 6) return toast.error("Enter 6-digit OTP");

        const token = localStorage.getItem('dToken');
        try {
            const { data } = await axios.post('/api/delivery/order/complete',
                { orderId: processingOrder, otp },
                { headers: { token } }
            );

            if (data.success) {
                toast.success("Order Delivered Successfully!");
                setShowOtpModal(false);
                setOtp("");
                setProcessingOrder(null);
                fetchAssignedOrders(token);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Delivery verification failed");
        }
    }


    const getStatusColor = (status) => {
        switch (status) {
            case 'ASSIGNED': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'ACCEPTED': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
            case 'ON_THE_WAY': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'REACHED_DESTINATION': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'PAYMENT_COLLECTED': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Truck className="animate-bounce text-[#42cbf5]" size={40} />
                <p className="font-bold text-gray-400">Loading Dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100/50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-30 border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#42cbf5] rounded-xl flex items-center justify-center text-white">
                        <Truck size={20} />
                    </div>
                    <div>
                        <h1 className="font-black text-lg text-gray-900 leading-none">Partner App</h1>
                        <p className="text-xs font-bold text-gray-400 mt-1">Hello, {partnerInfo?.name}</p>
                    </div>
                </div>
                <button onClick={logout} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                    <LogOut size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="max-w-xl mx-auto p-4 space-y-4">
                <h2 className="font-bold text-gray-500 uppercase tracking-widest text-xs ml-1">Assigned Orders ({orders.filter(o => o.delivery_status !== 'DELIVERED').length})</h2>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Package className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="font-bold text-gray-900">No Orders Assigned</h3>
                        <p className="text-sm text-gray-500 px-10 mt-1">Wait for admin to assign new deliveries to you.</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4 relative overflow-hidden">
                            {/* Top Bar */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide">
                                        #{order.id.substring(0, 8)}...
                                    </span>
                                    <h3 className="font-black text-xl text-gray-900 mt-1 flex items-center gap-2">
                                        ₹{order.amount}
                                        {order.payment_type === 'COD' && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded border border-yellow-200">COD</span>}
                                    </h3>
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(order.delivery_status)}`}>
                                    {order.delivery_status.replace(/_/g, ' ')}
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className="bg-gray-50/50 rounded-2xl p-4 space-y-3 border border-gray-100">
                                <div className="flex items-start gap-3">
                                    <User className="text-gray-400 shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{order.address.first_name} {order.address.last_name}</p>
                                        <a href={`tel:${order.address.phone}`} className="text-xs font-bold text-[#42cbf5] mt-0.5 block flex items-center gap-1">
                                            <Phone size={12} /> {order.address.phone}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-gray-400 shrink-0 mt-0.5" size={16} />
                                    <p className="text-sm font-medium text-gray-600 leading-snug">
                                        {order.address.address}, {order.address.city}, {order.address.pincode}
                                    </p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address.address + " " + order.address.city)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full bg-white border border-gray-200 py-2 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50"
                                >
                                    <Navigation size={14} /> Open in Maps
                                </a>
                            </div>

                            {/* Actions - Strict Workflow */}
                            {order.delivery_status !== 'DELIVERED' && (
                                <div className="grid grid-cols-2 gap-3 pt-2">

                                    {/* 1. Accept Order */}
                                    {order.delivery_status === 'ASSIGNED' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')}
                                            className="col-span-2 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                                        >
                                            Accept Order
                                        </button>
                                    )}

                                    {/* 2. Start Delivery */}
                                    {order.delivery_status === 'ACCEPTED' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'ON_THE_WAY')}
                                            className="col-span-2 py-3 bg-[#42cbf5] text-white rounded-xl font-bold text-sm hover:bg-[#32b5dd] transition-colors"
                                        >
                                            Start Delivery
                                        </button>
                                    )}

                                    {/* 3. Reached Destination */}
                                    {order.delivery_status === 'ON_THE_WAY' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'REACHED_DESTINATION')}
                                            className="col-span-2 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors"
                                        >
                                            Reached Destination
                                        </button>
                                    )}

                                    {/* 4. Payment Collection (COD ONLY) */}
                                    {order.delivery_status === 'REACHED_DESTINATION' && order.payment_type === 'COD' && !order.is_paid && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'PAYMENT_COLLECTED')}
                                            className="col-span-2 py-3 bg-yellow-400 text-black rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors"
                                        >
                                            Collect Cash ₹{order.amount}
                                        </button>
                                    )}

                                    {/* 5. Complete Delivery */}
                                    {/* Show if:
                                        - Status is REACHED_DESTINATION AND Not COD (Online Paid)
                                        - OR Status is PAYMENT_COLLECTED (COD Paid)
                                    */}
                                    {((order.delivery_status === 'REACHED_DESTINATION' && order.payment_type !== 'COD') ||
                                        order.delivery_status === 'PAYMENT_COLLECTED') && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                                                className="col-span-2 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
                                            >
                                                Verify OTP & Complete
                                            </button>
                                        )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-gray-900">Enter OTP</h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">Ask customer for 6-digit PIN</p>
                        </div>
                        <input
                            type="text"
                            className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 rounded-xl border-2 border-gray-200 focus:border-[#42cbf5] focus:outline-none mb-6 font-mono"
                            placeholder="000000"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            autoFocus
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowOtpModal(false)} className="py-3 rounded-xl font-bold text-gray-600 bg-gray-100">Cancel</button>
                            <button onClick={handleDeliverySubmit} disabled={otp.length !== 6} className="py-3 rounded-xl font-bold text-white bg-[#42cbf5] shadow-lg shadow-cyan-200 disabled:opacity-50">Verify</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PartnerDashboard;
