import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const BillingDashboard = () => {
    const { currency, axios } = useAppContext();
    const [orders, setOrders] = useState([]); // This will hold Approved/Billed orders
    const [loading, setLoading] = useState(true);

    // Metrics State
    const [metrics, setMetrics] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingBills: 0,
        generatedBills: 0
    });

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/order/seller');
            if (data.success) {
                const allOrders = data.orders;

                // Calculate Metrics
                const totalRev = allOrders.reduce((acc, order) => acc + (parseFloat(order.amount) || 0), 0);
                const pending = allOrders.filter(o => !o.is_billed && o.status !== 'Cancelled').length;
                const generated = allOrders.filter(o => o.is_billed).length;

                setMetrics({
                    totalOrders: allOrders.length,
                    totalRevenue: totalRev,
                    pendingBills: pending,
                    generatedBills: generated
                });

                // For Dashboard Table: Show "Recently Approved Bills" (Generated Bills)
                // Filter where is_billed is true. If no billing logic yet, show 'Completed' or all for now but user asked for "Approved Bills"
                // Assuming 'is_billed' flag exists or we simulate it.
                // Let's assume for now we show all, but visually distinguish?
                // User said: "recently approved bills list have to show bellow the stats"
                const approvedOrders = allOrders.filter(o => o.is_billed);
                // If no is_billed, let's just show top 5 recent orders as "Recent Activity" or similar default
                setOrders(approvedOrders);

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

    if (loading) return <div className="p-10 text-center">Loading Billing Dashboard...</div>;

    return (
        <div className="flex-1 h-[95vh] overflow-y-scroll custom-scrollbar bg-gray-50/50 p-8 font-sans">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Billing Dashboard</h1>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
                    {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Orders"
                    value={metrics.totalOrders}
                    icon="📦"
                    color="bg-blue-50 text-blue-700 border-blue-100"
                />
                <MetricCard
                    title="Total Revenue"
                    value={`${currency}${metrics.totalRevenue.toLocaleString()}`}
                    icon="💰"
                    color="bg-green-50 text-green-700 border-green-100"
                />
                <MetricCard
                    title="Pending Bills"
                    value={metrics.pendingBills}
                    icon="⏳"
                    color="bg-yellow-50 text-yellow-700 border-yellow-100"
                />
                <MetricCard
                    title="Generated Bills"
                    value={metrics.generatedBills}
                    icon="✅"
                    color="bg-gray-50 text-gray-700 border-gray-100"
                />
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <h3 className="font-bold text-gray-800 text-lg">Recently Approved Bills</h3>
                    {/* Add Filter/Search here later */}
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
                                <tr key={order.order_id} className="hover:bg-gray-50/50 transition-colors group">
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
                                            {order.is_billed ? 'Billed' : (order.is_paid ? 'Paid' : 'Pending')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 text-base">
                                        {currency}{order.amount}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* Action: View Bill if generated, else ... */}
                                        <Link
                                            to={`/billing/orders/${order.order_id}`}
                                            className="text-gray-500 hover:text-black font-bold text-sm underline"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && (
                    <div className="p-10 text-center text-gray-400">
                        <p>No recent activity.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, color }) => (
    <div className={`p-6 rounded-2xl shadow-sm border ${color} flex items-center justify-between transition-transform hover:scale-[1.02]`}>
        <div>
            <p className="opacity-80 text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-extrabold">{value}</h3>
        </div>
        <div className="text-3xl opacity-50 grayscale">{icon}</div>
    </div>
);

export default BillingDashboard;
