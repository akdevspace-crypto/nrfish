import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, Power, Tag, Calendar, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateCouponModal from '../../Components/seller/CreateCouponModal';

const Coupons = () => {
    const { axios, currency } = useAppContext();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchCoupons = async () => {
        try {
            const { data } = await axios.get('/api/coupon/all');
            if (data.success) {
                setCoupons(data.coupons);
            }
        } catch (error) {
            toast.error("Failed to fetch coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        try {
            const { data } = await axios.patch(`/api/coupon/${id}/status`, { is_active: !currentStatus });
            if (data.success) {
                toast.success(data.message);
                fetchCoupons();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const deleteCoupon = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const { data } = await axios.delete(`/api/coupon/${id}`);
            if (data.success) {
                toast.success(data.message);
                fetchCoupons();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Helper for Coupon Type Badge
    const getTypeBadge = (type) => {
        const styles = {
            'USER_BASED': 'bg-purple-100 text-purple-700 border-purple-200',
            'PRODUCT_BASED': 'bg-blue-100 text-blue-700 border-blue-200',
            'VALUE_BASED': 'bg-green-100 text-green-700 border-green-200',
            'LIMITED_DEALS': 'bg-orange-100 text-orange-700 border-orange-200'
        };
        const typeStr = type || 'UNKNOWN_TYPE';
        return (
            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${styles[type] || 'bg-gray-100 text-gray-700'}`}>
                {typeStr.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="p-8 bg-gray-50/50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Tag className="text-[#42cbf5]" /> Coupon Management
                    </h1>
                    <p className="text-gray-500 mt-1">Create and manage discount codes</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowModal(true)}
                    className="bg-[#42cbf5] text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-[#1dc1f2] transition-colors"
                >
                    <Plus size={20} /> Create Coupon
                </motion.button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[#42cbf5] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {coupons.map((coupon) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={coupon.id}
                                className={`bg-white rounded-2xl shadow-sm border p-6 relative overflow-hidden transition-all hover:shadow-md
                                    ${coupon.is_active ? 'border-gray-200' : 'border-gray-100 opacity-75 grayscale'}`
                                }
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-wider font-mono">{coupon.code}</h3>
                                        <div className="mt-2 flex gap-2">{getTypeBadge(coupon.type)}</div>
                                    </div>
                                    <div className="bg-[#42cbf5]/10 text-[#0b8bb0] px-3 py-1 rounded-lg font-bold text-lg">
                                        {coupon.discount_percentage}% OFF
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-6">
                                    <p className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        Expires: <span className="font-medium text-gray-900">{new Date(coupon.valid_until).toLocaleDateString()}</span>
                                    </p>
                                    {parseFloat(coupon.min_order_value) > 0 && (
                                        <p className="flex items-center gap-2">
                                            <ShoppingBag size={14} className="text-gray-400" />
                                            Min Order: <span className="font-medium text-gray-900">{currency}{coupon.min_order_value}</span>
                                        </p>
                                    )}
                                    {coupon.usage_limit && (
                                        <p className="flex items-center gap-2">
                                            <Tag size={14} className="text-gray-400" />
                                            Usage: <span className="font-medium text-gray-900">{coupon.usage_count} / {coupon.usage_limit}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 border-t pt-4">
                                    <button
                                        onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                                        className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors
                                            ${coupon.is_active
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                            }`}
                                    >
                                        <Power size={16} /> {coupon.is_active ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                        onClick={() => deleteCoupon(coupon.id)}
                                        className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {showModal && (
                <CreateCouponModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); fetchCoupons(); }}
                />
            )}
        </div>
    );
};

export default Coupons;
