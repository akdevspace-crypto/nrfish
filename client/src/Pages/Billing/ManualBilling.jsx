import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';

const ManualBilling = () => {
    const { axios, currency, products: contextProducts } = useAppContext();
    const navigate = useNavigate();

    // -- State --
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);

    // Customer Details
    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        address: '',
        paymentMethod: 'Cash'
    });

    // -- Effects --
    useEffect(() => {
        if (contextProducts && contextProducts.length > 0) {
            setProducts(contextProducts);
        } else {
            const fetchProducts = async () => {
                try {
                    const { data } = await axios.get('/api/product/list');
                    if (data.success) setProducts(data.products);
                } catch (e) { console.error(e); }
            }
            fetchProducts();
        }
    }, [contextProducts]);


    // -- Computed --
    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const cartTotals = useMemo(() => {
        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const taxRate = 0.05;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [cart]);


    // -- Handlers --
    const addToCart = (product) => {
        setCart(prev => {
            const newItem = {
                ...product,
                cartId: Date.now() + Math.random(),
                quantity: 1
            };
            return [...prev, newItem];
        });
        toast.success(`Added ${product.name}`);
    };

    const removeFromCart = (cartId) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.cartId === cartId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleGenerateBill = () => {
        if (cart.length === 0) return toast.error("Cart is empty");
        if (!customer.name || !customer.phone) return toast.error("Customer details required");

        const mockOrder = {
            order_id: `MAN-${Date.now().toString().slice(-6)}`,
            created_at: new Date().toISOString(),
            amount: cartTotals.total,
            address: {
                first_name: customer.name,
                last_name: '',
                phone: customer.phone,
                address: customer.address || 'Counter Sale',
                city: 'Chennai',
                state: 'TN',
                pincode: '000000'
            },
            products: cart.map(item => ({
                product_name: item.name,
                quantity: item.quantity,
                price: item.price * item.quantity,
                unit_price: item.price,
                image: item.image ? item.image[0] : null
            })),
            payment_type: customer.paymentMethod,
            is_paid: true
        };

        toast.success("Bill Generated!");
        navigate('/billing/invoice/preview', { state: { order: mockOrder } });
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-gray-50 overflow-hidden font-sans">

            {/* LEFT PANEL: PRODUCT SELECTION */}
            <div className="w-3/5 flex flex-col p-6 pr-3">

                {/* Search Bar */}
                <div className="mb-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for products..."
                        className="flex-1 bg-transparent outline-none text-gray-700 font-medium placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 pb-20">
                        {filteredProducts.map(product => (
                            <div
                                key={product._id}
                                onClick={() => addToCart(product)}
                                className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-[#42cbf5] transition-all duration-200 group relative overflow-hidden"
                            >
                                <div className="aspect-square rounded-xl bg-gray-100 mb-3 overflow-hidden">
                                    <img
                                        src={product.image && product.image[0] ? product.image[0] : assets.upload_area}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-gray-800 text-sm truncate">{product.name}</h4>
                                    <p className="text-gray-500 text-xs">{product.category}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="font-extrabold text-gray-900">{currency}{product.price}</p>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#42cbf5] group-hover:text-black transition-colors">
                                            <span className="text-xl leading-none mb-0.5">+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: CART & BILLING */}
            <div className="w-2/5 p-6 pl-3">
                <div className="h-full bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span>🛒</span> New Bill
                        </h2>
                    </div>

                    {/* Customer Details Form */}
                    <div className="p-6 bg-gray-50/50 border-b border-gray-100 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-[#42cbf5] focus:ring-1 focus:ring-[#42cbf5] outline-none transition-all text-sm font-medium"
                                    value={customer.name}
                                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                    placeholder="Enter Name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-[#42cbf5] focus:ring-1 focus:ring-[#42cbf5] outline-none transition-all text-sm font-medium"
                                    value={customer.phone}
                                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                    placeholder="Enter Phone"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Mode</label>
                            <div className="flex p-1 bg-gray-200/50 rounded-xl">
                                {['Cash', 'UPI', 'Card'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setCustomer({ ...customer, paymentMethod: mode })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${customer.paymentMethod === mode ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                <p className="font-medium">No items added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.cartId} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm group">
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">{currency}{item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                            <button onClick={() => updateQuantity(item.cartId, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:text-red-500 transition-colors font-bold text-gray-600">-</button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.cartId, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:text-green-500 transition-colors font-bold text-gray-600">+</button>
                                        </div>
                                        <div className="text-right w-16">
                                            <p className="font-bold text-gray-900 text-sm">{currency}{item.price * item.quantity}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.cartId)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>{currency}{cartTotals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tax (5%)</span>
                                <span>{currency}{cartTotals.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-2 border-t border-gray-200 border-dashed">
                                <span>Total</span>
                                <span>{currency}{cartTotals.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-[1fr_2fr] gap-4">
                            <button
                                onClick={() => setCart([])}
                                className="px-4 py-3.5 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-white transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleGenerateBill}
                                className="px-4 py-3.5 rounded-xl bg-[#42cbf5] hover:bg-[#1dc1f2] text-black font-bold shadow-lg shadow-orange-500/10 transition-transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>⚡</span> Generate Bill
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ManualBilling;
