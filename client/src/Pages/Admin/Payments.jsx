
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../Context/AppContext';
import { Check, X, Clock, Search, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const Payments = () => {
    const { axios, currency } = useAppContext();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, VERIFIED

    const fetchPayments = async () => {
        try {
            const { data } = await axios.get('/api/payment/list');
            if (data.success) {
                setPayments(data.payments);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleVerify = async (paymentId, status) => {
        if (!window.confirm(`Are you sure you want to mark this payment as ${status}?`)) return;

        try {
            const { data } = await axios.put('/api/payment/admin/verify', { paymentId, status });
            if (data.success) {
                toast.success(data.message);
                fetchPayments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Verification failed");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'FAILED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getVerifyColor = (status) => {
        switch (status) {
            case 'VERIFIED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'PENDING': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredPayments = payments.filter(p => {
        if (filter === 'ALL') return true;
        return p.verification_status === filter;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
                    <p className="text-gray-500 mt-1">Audit and verify customer payments</p>
                </div>
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'VERIFIED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div></div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Order / User</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Method</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Gateway Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Verification</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayments.map(payment => (
                                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-gray-400" />
                                            {new Date(payment.created_at).toLocaleDateString()}
                                            <span className="text-xs text-gray-400">{new Date(payment.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">#{payment.order_id.substring(0, 8)}...</div>
                                        <div className="text-xs text-gray-500">{payment.user_name}</div>
                                        <div className="text-xs text-gray-400 font-mono hidden md:block" title={payment.transaction_id}>
                                            {payment.transaction_id ? payment.transaction_id.substring(0, 12) + '...' : '-'}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">
                                        {currency}{payment.amount}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <span className="font-medium bg-gray-100 px-2 py-1 rounded text-xs">{payment.payment_method}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getVerifyColor(payment.verification_status)}`}>
                                            {payment.verification_status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {payment.verification_status === 'PENDING' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleVerify(payment.id, 'VERIFIED')}
                                                    className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-200"
                                                    title="Verify Payment"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(payment.id, 'REJECTED')}
                                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
                                                    title="Reject Payment"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Payments;
