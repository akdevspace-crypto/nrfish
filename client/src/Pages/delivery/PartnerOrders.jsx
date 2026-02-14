import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Phone, Package, Clock, CheckCircle, Navigation } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PartnerOrders = () => {
    const [activeTab, setActiveTab] = useState('pending'); // pending, active, completed
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock Data for UI Dev if API fails or is empty
    const mockOrders = [
        {
            id: 'ORD-001',
            amount: 450,
            payment_type: 'COD',
            delivery_status: 'ASSIGNED',
            address: {
                first_name: 'John',
                last_name: 'Doe',
                phone: '9876543210',
                address: '123, Green Street',
                city: 'Chennai',
                pincode: '600028'
            },
            items: [{ name: 'Chicken Biryani', quantity: 2 }, { name: 'Coke', quantity: 1 }]
        },
        {
            id: 'ORD-002',
            amount: 1200,
            payment_type: 'ONLINE',
            delivery_status: 'ACCEPTED',
            address: {
                first_name: 'Jane',
                last_name: 'Smith',
                phone: '9123456780',
                address: '45/2, Anna Salai',
                city: 'Chennai',
                pincode: '600002'
            },
            items: [{ name: 'Family Combo', quantity: 1 }]
        }
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('dToken');
            // const { data } = await axios.get('/api/delivery/orders', { headers: { token } });
            // if (data.success) {
            //     setOrders(data.orders);
            // }
            // Using mock data for UI demo stability
            setOrders(mockOrders);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ASSIGNED': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'ACCEPTED': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
            case 'ON_THE_WAY': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'REACHED_DESTINATION': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const filterOrders = () => {
        if (activeTab === 'pending') return orders.filter(o => o.delivery_status === 'ASSIGNED');
        if (activeTab === 'active') return orders.filter(o => ['ACCEPTED', 'ON_THE_WAY', 'REACHED_DESTINATION', 'PAYMENT_COLLECTED'].includes(o.delivery_status));
        if (activeTab === 'completed') return orders.filter(o => o.delivery_status === 'DELIVERED' || o.delivery_status === 'CANCELLED');
        return orders;
    };

    const filteredOrders = filterOrders();

    return (
        <div className="p-5 font-sans min-h-screen bg-gray-50/50 pb-24">
            <h1 className="text-2xl font-black text-gray-900 mb-6">My Orders</h1>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-6 sticky top-0 z-20">
                {['pending', 'active', 'completed'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 ${activeTab === tab
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                            }`}
                    >
                        {tab} <span className="ml-1 text-[10px] opacity-60">({
                            tab === 'pending' ? orders.filter(o => o.delivery_status === 'ASSIGNED').length :
                                tab === 'active' ? orders.filter(o => ['ACCEPTED', 'ON_THE_WAY', 'REACHED_DESTINATION', 'PAYMENT_COLLECTED'].includes(o.delivery_status)).length :
                                    orders.filter(o => o.delivery_status === 'DELIVERED').length
                        })</span>
                    </button>
                ))}
            </div>

            {/* Order List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Package size={48} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm font-bold text-gray-400">No {activeTab} orders</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                            {/* Status Badge */}
                            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.delivery_status)}`}>
                                {order.delivery_status.replace(/_/g, ' ')}
                            </div>

                            <div className="mb-4">
                                <span className="text-[10px] font-black text-gray-400 tracking-wider">#{order.id}</span>
                                <h3 className="text-lg font-black text-gray-900 mt-1 flex items-center gap-2">
                                    ₹{order.amount}
                                    {order.payment_type === 'COD' && (
                                        <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full border border-yellow-200">
                                            Cash on Delivery
                                        </span>
                                    )}
                                </h3>
                            </div>

                            {/* Location Details */}
                            <div className="space-y-4 relative">
                                {/* Pickup Line */}
                                <div className="absolute left-[7px] top-2 bottom-6 w-0.5 bg-gray-100 -z-0"></div>

                                <div className="flex gap-3 relative z-10">
                                    <div className="w-4 h-4 rounded-full bg-black shrink-0 mt-1 shadow-sm ring-4 ring-white"></div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Pickup</p>
                                        <p className="text-sm font-bold text-gray-900">Restaurant / Warehouse</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 relative z-10">
                                    <div className="w-4 h-4 rounded-full bg-green-500 shrink-0 mt-1 shadow-sm ring-4 ring-white"></div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Drop</p>
                                        <p className="text-sm font-bold text-gray-900">{order.address.first_name}</p>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
                                            {order.address.address}, {order.address.city}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-5 pt-4 border-t border-gray-50 flex gap-3">
                                {activeTab === 'pending' ? (
                                    <>
                                        <button className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold uppercase hover:bg-red-50 hover:text-red-500 transition-colors">
                                            Ignore
                                        </button>
                                        <button className="flex-1 py-3 rounded-xl bg-black text-white text-xs font-bold uppercase shadow-lg shadow-gray-200 hover:bg-gray-800 transition-colors">
                                            Accept Order
                                        </button>
                                    </>
                                ) : activeTab === 'active' ? (
                                    <button className="w-full py-3 rounded-xl bg-[#42cbf5] text-white text-xs font-bold uppercase shadow-lg shadow-cyan-100 hover:bg-[#32b5dd] flex items-center justify-center gap-2">
                                        <Navigation size={16} /> Navigate
                                    </button>
                                ) : (
                                    <div className="w-full py-2 flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-xl">
                                        <CheckCircle size={16} /> <span className="text-xs font-bold uppercase">Completed</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PartnerOrders;
