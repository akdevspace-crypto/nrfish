
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader, ChevronDown, Tag, Grid, Gift, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';

const CreateOfferModal = ({ onClose, onSuccess, initialData }) => {
    const { axios, currency } = useAppContext();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'B1G1', // B1G1, B3G1, COMBO, CUSTOM
        discount_type: 'FLAT', // FLAT, PERCENTAGE
        discount_value: '',
        start_date: '',
        end_date: '',
        buy_x: 1,
        get_y: 1,
        required_product_ids: [],
        required_category_ids: [],
        combo_product_ids: [],
        usage_limit: ''
    });

    // Populate Data for Edit
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                required_product_ids: initialData.required_product_ids || [], // Ensure array
                required_category_ids: initialData.required_category_ids || [],
                combo_product_ids: initialData.combo_product_ids || [],
                // backend creates valid ISO strings, but input[type=datetime-local] needs YYYY-MM-DDTHH:mm
                start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : '',
                end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : ''
            });
        }
    }, [initialData]);

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

    // Effect: Set defaults based on type (Only if NOT editing to preserve values)
    useEffect(() => {
        if (!initialData) {
            if (formData.type === 'B1G1') {
                setFormData(prev => ({ ...prev, buy_x: 1, get_y: 1, discount_value: 0, discount_type: 'FLAT' }));
            } else if (formData.type === 'B3G1') {
                setFormData(prev => ({ ...prev, buy_x: 3, get_y: 1, discount_value: 0, discount_type: 'FLAT' }));
            }
        }
    }, [formData.type, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSelect = (productId, field = 'required_product_ids') => {
        setFormData(prev => {
            const current = prev[field] || [];
            return current.includes(productId)
                ? { ...prev, [field]: current.filter(id => id !== productId) }
                : { ...prev, [field]: [...current, productId] };
        });
    };

    const handleCategorySelect = (categoryId) => {
        setFormData(prev => {
            const current = prev.required_category_ids;
            return current.includes(categoryId)
                ? { ...prev, required_category_ids: current.filter(id => id !== categoryId) }
                : { ...prev, required_category_ids: [...current, categoryId] };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.title || !formData.start_date || !formData.end_date) {
                toast.error("Please fill required fields");
                setLoading(false);
                return;
            }

            if (formData.type === 'COMBO' && formData.combo_product_ids.length < 2) {
                toast.error("Combo offers require at least 2 products");
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                discount_value: Number(formData.discount_value),
                buy_x: Number(formData.buy_x),
                get_y: Number(formData.get_y),
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null
            };

            let response;
            if (initialData) {
                response = await axios.put(`/api/offer/update/${initialData.id}`, payload);
            } else {
                response = await axios.post('/api/offer/create', payload);
            }

            if (response.data.success) {
                toast.success(response.data.message);
                onSuccess();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
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
                        <h2 className="text-2xl font-bold text-gray-900">{initialData ? 'Edit Offer' : 'Create New Offer'}</h2>
                        <p className="text-sm text-gray-500">Configure deals and combos</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-400 hover:text-gray-700" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-8 custom-scrollbar">

                    {/* 1. Title & Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Offer Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Buy 1 Get 1 Free"
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#42cbf5] font-bold text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Offer Type</label>
                            <CustomDropdown
                                value={formData.type}
                                onChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                                options={[
                                    { value: "B1G1", label: "Buy 1 Get 1", desc: "Classic BOGO deal" },
                                    { value: "B3G1", label: "Buy 3 Get 1", desc: "Buy X get Y free" },
                                    { value: "COMBO", label: "Combo Deal", desc: "Bundle products together" },
                                    { value: "CUSTOM", label: "Custom Discount", desc: "Flat/Percentage off" },
                                ]}
                            />
                        </div>
                    </div>

                    {/* 2. Dynamic Rules based on Type */}
                    <AnimatePresence mode="wait">
                        {(formData.type === 'B1G1' || formData.type === 'B3G1') && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                                        <Gift size={18} /> Buy X Get Y Configuration
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-purple-700 uppercase">Buy Quantity</label>
                                            <input type="number" name="buy_x" value={formData.buy_x} onChange={handleChange} className="w-full p-3 rounded-lg border border-purple-200 mt-1" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-purple-700 uppercase">Get Free Quantity</label>
                                            <input type="number" name="get_y" value={formData.get_y} onChange={handleChange} className="w-full p-3 rounded-lg border border-purple-200 mt-1" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        Applies to selected products below. Lowest priced item will be free.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {formData.type === 'COMBO' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                                        <Grid size={18} /> Select Combo Products
                                    </h3>
                                    <p className="text-sm text-orange-700 mb-2">Select at least 2 products that make up this combo.</p>

                                    {/* Product Selector for Combo */}
                                    <ProductSelector
                                        products={products}
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        selectedIds={formData.combo_product_ids}
                                        onSelect={(id) => handleProductSelect(id, 'combo_product_ids')}
                                        colorTheme="orange"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 3. Product Targeting (For non-Combo types) */}
                    {formData.type !== 'COMBO' && (
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Tag size={18} /> Applicable Products
                                </h3>
                                <ProductSelector
                                    products={products}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    selectedIds={formData.required_product_ids}
                                    onSelect={(id) => handleProductSelect(id, 'required_product_ids')}
                                />
                            </div>
                        </div>
                    )}

                    {/* 4. Discount & Pricing */}
                    {(formData.type === 'COMBO' || formData.type === 'CUSTOM') && (
                        <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                            <h3 className="font-bold text-green-900 mb-3">Pricing & Discount</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-green-800">Discount Type</label>
                                    <select name="discount_type" value={formData.discount_type} onChange={handleChange} className="w-full p-3 rounded-xl border border-green-200 mt-1 focus:ring-2 focus:ring-green-500/20">
                                        <option value="FLAT">Flat Price / Off (₹)</option>
                                        <option value="PERCENTAGE">Percentage Off (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-green-800">Value</label>
                                    <input type="number" name="discount_value" value={formData.discount_value} onChange={handleChange} className="w-full p-3 rounded-xl border border-green-200 mt-1 font-bold text-lg" placeholder="0" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. Validity Dates */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Start Date</label>
                            <input
                                type="datetime-local"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#42cbf5] text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">End Date</label>
                            <input
                                type="datetime-local"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#42cbf5] text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="2"
                            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#42cbf5]"
                            placeholder="Optional description..."
                        ></textarea>
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
                        {loading ? <Loader size={18} className="animate-spin" /> : 'Create Offer'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Reusable Components

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
                    <span className="block text-left text-xs text-gray-400 font-medium">{selected?.desc}</span>
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

function ProductSelector({ products, searchTerm, setSearchTerm, selectedIds, onSelect, colorTheme = 'blue' }) {
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const bgMap = {
        'blue': 'bg-blue-50/50 border-blue-100',
        'orange': 'bg-orange-50/50 border-orange-100',
    };
    const textMap = {
        'blue': 'text-blue-900',
        'orange': 'text-orange-900',
    };

    // Map 'blue' to actual color classes for dynamic interpolation if needed, but strictly explicit here
    const activeBorder = colorTheme === 'orange' ? 'bg-orange-100 border-orange-200' : 'bg-blue-100 border-blue-200';
    const activeCheck = colorTheme === 'orange' ? 'bg-orange-500 border-orange-500' : 'bg-blue-500 border-blue-500';

    return (
        <div className={`p-4 rounded-2xl border flex flex-col max-h-[250px] ${bgMap[colorTheme] || bgMap['blue']}`}>
            <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-3 border border-gray-200 rounded-lg text-sm bg-white"
            />
            <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
                {filteredProducts.map(product => (
                    <div
                        key={product.id}
                        onClick={() => onSelect(product.id)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border 
                            ${selectedIds.includes(product.id)
                                ? activeBorder
                                : 'bg-white border-transparent hover:bg-white/80'}`}
                    >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors 
                            ${selectedIds.includes(product.id) ? activeCheck : 'border-gray-300 bg-white'}`}>
                            {selectedIds.includes(product.id) && <Check size={14} className="text-white" />}
                        </div>
                        <img src={product.image[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <span className="text-sm font-medium text-gray-700 line-clamp-1">{product.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CreateOfferModal;
