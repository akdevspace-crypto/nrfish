import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader, ChevronDown, Tag, Grid } from 'lucide-react';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';

const CreateCouponModal = ({ onClose, onSuccess }) => {
    const { axios, currency } = useAppContext();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        type: 'USER_BASED',
        discount_percentage: '',
        valid_until: '',
        min_order_value: '',
        specific_product_ids: [],
        specific_category_ids: [],
        usage_limit: ''
    });

    // Data State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Data on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    axios.get('/api/product/list'),
                    axios.get('/api/category/list')
                ]);
                if (prodRes.data.success) setProducts(prodRes.data.products);
                if (catRes.data.success) setCategories(catRes.data.categories);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load data");
            }
        };
        fetchData();
    }, []);

    // Effect: Auto-set validity for USER_BASED
    useEffect(() => {
        if (formData.type === 'USER_BASED') {
            setFormData(prev => ({
                ...prev,
                valid_until: '2099-12-31T23:59' // Effectively infinite
            }));
        } else {
            // Reset if switching away (optional, or keep generic)
            if (formData.valid_until === '2099-12-31T23:59') {
                setFormData(prev => ({ ...prev, valid_until: '' }));
            }
        }
    }, [formData.type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSelect = (productId) => {
        setFormData(prev => {
            const current = prev.specific_product_ids;
            return current.includes(productId)
                ? { ...prev, specific_product_ids: current.filter(id => id !== productId) }
                : { ...prev, specific_product_ids: [...current, productId] };
        });
    };

    const handleCategorySelect = (categoryName) => {
        setFormData(prev => {
            const current = prev.specific_category_ids;
            return current.includes(categoryName)
                ? { ...prev, specific_category_ids: current.filter(cat => cat !== categoryName) }
                : { ...prev, specific_category_ids: [...current, categoryName] };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.code || !formData.discount_percentage || !formData.valid_until) {
                toast.error("Please fill required fields");
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                discount_percentage: Number(formData.discount_percentage),
                min_order_value: Number(formData.min_order_value) || 0,
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null
            };

            const { data } = await axios.post('/api/coupon/create', payload);

            if (data.success) {
                toast.success(data.message);
                onSuccess();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Creation failed");
        } finally {
            setLoading(false);
        }
    };

    // Helper: Calculate savings for preview
    const previewSavings = () => {
        const subtotal = 1200; // Example subtotal
        const discount = Number(formData.discount_percentage) || 0;
        return (subtotal * discount) / 100;
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create New Coupon</h2>
                        <p className="text-sm text-gray-500">Configure discount rules and validity</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-400 hover:text-gray-700" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-8 custom-scrollbar">

                    {/* 1. Code & Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Coupon Code</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={(e) => handleChange({ target: { name: 'code', value: e.target.value.toUpperCase() } })}
                                placeholder="SUMMER50"
                                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl font-mono uppercase font-bold text-lg tracking-wider focus:border-[#42cbf5] focus:outline-none bg-gray-50 focus:bg-white transition-all placeholder:text-gray-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Coupon Type</label>
                            <CustomDropdown
                                value={formData.type}
                                onChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                                options={[
                                    { value: "USER_BASED", label: "User Based (First Order)", desc: "Auto-applies for new users" },
                                    { value: "PRODUCT_BASED", label: "Specific Product/Category", desc: "Valid on selected items" },
                                    { value: "VALUE_BASED", label: "Product Value Based", desc: "Min order value required" },
                                    { value: "LIMITED_DEALS", label: "Limited Deals", desc: "Time & Usage limit" },
                                ]}
                            />
                        </div>
                    </div>

                    {/* 2. Conditional Logic Area */}
                    <AnimatePresence mode="wait">
                        {formData.type === 'PRODUCT_BASED' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                {/* Category Selector */}
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <Grid size={18} /> Select Categories
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat, index) => (
                                            <button
                                                key={cat._id || index}
                                                type="button"
                                                onClick={() => handleCategorySelect(cat.name)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                                                    ${formData.specific_category_ids.includes(cat.name)
                                                        ? 'bg-[#42cbf5] text-black border-[#42cbf5]'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Product Selector */}
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 max-h-[300px] flex flex-col">
                                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                        <Tag size={18} /> Select Specific Products
                                    </h3>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full p-2 mb-3 border border-blue-200 rounded-lg text-sm"
                                    />
                                    <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
                                        {filteredProducts.map(product => (
                                            <div
                                                key={product.id}
                                                onClick={() => handleProductSelect(product.id)}
                                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${formData.specific_product_ids.includes(product.id) ? 'bg-blue-100 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-blue-50'}`}
                                            >
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.specific_product_ids.includes(product.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                                                    {formData.specific_product_ids.includes(product.id) && <Check size={14} className="text-white" />}
                                                </div>
                                                <img src={product.image[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                <span className="text-sm font-medium text-gray-700 line-clamp-1">{product.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {formData.type === 'VALUE_BASED' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                                    <label className="text-green-900 font-bold text-sm block mb-2">Minimum Order Value ({currency})</label>
                                    <input
                                        type="number"
                                        name="min_order_value"
                                        value={formData.min_order_value}
                                        onChange={handleChange}
                                        placeholder="e.g. 500"
                                        className="w-full p-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-lg font-bold text-green-700"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {formData.type === 'LIMITED_DEALS' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100">
                                    <label className="text-orange-900 font-bold text-sm block mb-2">Max Usages (Optional)</label>
                                    <input
                                        type="number"
                                        name="usage_limit"
                                        value={formData.usage_limit}
                                        onChange={handleChange}
                                        placeholder="e.g. 100"
                                        className="w-full p-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 3. Discount & Validity */}
                    <div className="flex gap-6 flex-col md:flex-row">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-bold text-gray-700">Discount Percentage</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="discount_percentage"
                                    value={formData.discount_percentage}
                                    onChange={handleChange}
                                    min="1" max="100"
                                    placeholder="20"
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#42cbf5] text-lg font-bold pr-10"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                            </div>
                            {/* Live Preview */}
                            {formData.discount_percentage > 0 && (
                                <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <p>Example: On ₹1200 order</p>
                                    <p className="font-bold text-green-600">You save: ₹{previewSavings().toFixed(0)}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-bold text-gray-700">Valid Until</label>
                            {formData.type === 'USER_BASED' ? (
                                <div className="w-full p-4 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 font-medium cursor-not-allowed">
                                    Valid indefinitely (Admin control)
                                </div>
                            ) : (
                                <input
                                    type="datetime-local"
                                    name="valid_until"
                                    value={formData.valid_until}
                                    onChange={handleChange}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#42cbf5] text-sm font-medium"
                                />
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} type="button" className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-[#0b0b0b] text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader size={18} className="animate-spin" /> : 'Create Coupon'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};


// Custom Dropdown Component
function CustomDropdown({ options, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-4 bg-white border rounded-xl transition-all ${isOpen ? 'border-[#42cbf5] ring-2 ring-[#42cbf5]/10' : 'border-gray-200 hover:border-gray-300'}`}
            >
                <div>
                    <span className="block text-left font-bold text-gray-900">{selected?.label}</span>
                    {selected?.desc && <span className="block text-left text-xs text-gray-400 font-medium">{selected.desc}</span>}
                </div>
                <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => { onChange(option.value); setIsOpen(false); }}
                                className={`w-full text-left p-4 hover:bg-gray-50 flex flex-col transition-colors border-b last:border-0 border-gray-50
                                    ${value === option.value ? 'bg-[#42cbf5]/5' : ''}
                                `}
                            >
                                <span className={`font-bold text-sm ${value === option.value ? 'text-[#42cbf5]' : 'text-gray-900'}`}>{option.label}</span>
                                <span className="text-xs text-gray-400">{option.desc}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CreateCouponModal;
