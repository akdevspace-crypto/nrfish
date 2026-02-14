import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const BillingOrders = () => {
    const { currency, axios } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/order/seller');
            if (data.success) {
                // Filter for "Requested" / Pending orders (e.g., not yet billed or specific status)
                // For now, assuming all non-billed orders are "Requested"
                // Or orders with status 'Order Placed'
                const requestedOrders = data.orders.filter(o => !o.is_billed && o.status !== 'Cancelled');
                setOrders(requestedOrders);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading Orders...</div>;

    return (
        <div className="flex-1 h-[95vh] overflow-y-scroll custom-scrollbar bg-gray-50/50 p-8 font-sans">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Requested Orders <span className="text-sm font-medium text-gray-500 ml-2">(Waiting for Admin)</span></h1>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
                    {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Orders Table - No Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <h3 className="font-bold text-gray-800 text-lg">Pending Requests</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-bold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 rounded-tr-xl text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.order_id} className="hover:bg-[#42cbf5]/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">#{order.order_id}</span>
                                        <div className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{order.address.first_name} {order.address.last_name}</span>
                                            <span className="text-xs text-gray-500">{order.address.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${!order.is_paid
                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            : 'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {order.is_paid ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 text-base">
                                        {currency}{order.amount}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link
                                            to={`/billing/orders/${order.order_id}`}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-black bg-[#42cbf5] rounded-xl shadow-sm hover:bg-[#1dc1f2] active:scale-95 transition-all"
                                        >
                                            Generate Bill
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && (
                    <div className="p-10 text-center text-gray-400">
                        <p>No pending orders found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillingOrders;
