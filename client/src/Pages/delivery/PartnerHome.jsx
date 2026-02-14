import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Package, Clock, ShieldCheck, ChevronRight, Phone, IndianRupee, ArrowUpRight, Award } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

const PartnerHome = () => {
    const navigate = useNavigate();
    const { isOnline } = useOutletContext(); // Global state from Layout

    // --- MOCK DATA FOR UI DEV ---
    // In production, this comes from API based on isOnline and assigned orders
    const stats = {
        todayEarnings: '1,240',
        completedOrders: 12,
        activeTime: '4h 20m',
        acceptanceRate: '98%',
        bonusProgress: 75 // %
    };

    // ACTIVE ORDER STATE MOCK
    // Status Flow: 'Shipping' -> 'On The Way' -> 'Destination Reached' -> 'Delivered'
    const [activeOrder, setActiveOrder] = useState({
        id: 'OID-99283',
        customerName: 'Rahul Sharma',
        customerAddress: 'Block C, Tech Park, Anna Nagar',
        amount: '450',
        paymentType: 'COD', // 'COD' or 'Online'
        status: 'Destination Reached', // Current status for demo
        paymentCollected: false,
    });

    const handleCollectCash = () => {
        setActiveOrder(prev => ({ ...prev, paymentCollected: true }));
        toast.success('Cash collected successfully');
    };

    const handleGenerateOTP = () => {
        if (!activeOrder.paymentCollected && activeOrder.paymentType === 'COD') {
            toast.error('Please collect cash first!');
            return;
        }
        toast.success('OTP sent to customer');
        // Logic to show OTP input would go here (or admin side only as per requirements)
    };

    return (
        <div className="space-y-8 animate-fade-in font-sans text-[#0b0b0b]">

            {/* 1. CUSTOMER THEME KPI CARDS (Minimal White + Cyan Hover) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

                {/* Earnings */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(66,203,245,0.15)] transition-all group duration-300">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Today's Earnings</p>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-medium text-gray-400 group-hover:text-[#42cbf5] transition-colors">₹</span>
                        <h3 className="text-3xl font-black text-[#0b0b0b] tracking-tight">{stats.todayEarnings}</h3>
                    </div>
                </div>

                {/* Orders */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(66,203,245,0.15)] transition-all group duration-300">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Completed Orders</p>
                    <h3 className="text-3xl font-black text-[#0b0b0b] tracking-tight">{stats.completedOrders}</h3>
                    <p className="text-[10px] font-bold text-[#42cbf5] mt-2">+2 vs Avg.</p>
                </div>

                {/* Active Time */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(66,203,245,0.15)] transition-all duration-300">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Active Time</p>
                    <h3 className="text-3xl font-black text-[#0b0b0b] tracking-tight">{stats.activeTime}</h3>
                </div>

                {/* Acceptance Rate */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(66,203,245,0.15)] transition-all border-l-4 border-l-[#42cbf5]">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Acceptance Rate</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-black text-[#0b0b0b] tracking-tight">{stats.acceptanceRate}</h3>
                        <ShieldCheck className="text-[#42cbf5]" size={20} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* LEFT COLUMN (8 cols) */}
                <div className="col-span-1 md:col-span-8 space-y-8">

                    {/* 2. DAILY BONUS HERO CARD - CUSTOMER THEME GRADIENT (Black + Cyan/Green Glow) */}
                    <div className="relative overflow-hidden rounded-2xl bg-[#0b0b0b] group shadow-xl shadow-[#42cbf5]/10">
                        {/* Cinematic Gradient Overlay matching Hero Section */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-[#0e3b34]/40 opacity-100"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>

                        <div className="relative z-10 p-8 flex items-center justify-between">
                            <div className="space-y-4 max-w-lg">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 backdrop-blur-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7CFF6B] animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Daily Goal</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white leading-snug">
                                    Complete <span className="text-[#42cbf5]">4 more orders</span> to unlock <span className="text-white border-b-2 border-[#7CFF6B] pb-0.5">₹500 bonus</span>
                                </h3>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div className="bg-gradient-to-r from-[#42cbf5] to-[#7CFF6B] h-full rounded-full w-[75%] shadow-[0_0_10px_rgba(66,203,245,0.4)]"></div>
                                </div>
                                <p className="text-xs font-medium text-gray-400">Offer expires in 3h 15m</p>
                            </div>

                            {/* Decorative Element */}
                            <div className="hidden md:flex flex-col items-center justify-center w-20 h-20 rounded-full bg-[#42cbf5]/10 backdrop-blur-sm border border-[#42cbf5]/30 shadow-[0_0_20px_rgba(66,203,245,0.2)]">
                                <span className="text-xs font-bold text-[#42cbf5]">Target</span>
                                <span className="text-xl font-bold text-white">16</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. ACTIVE DELIVERY (Logic Driven) */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-[#0b0b0b] text-sm tracking-wide uppercase">Active Delivery</h3>
                            {activeOrder && (
                                <span className="px-2 py-1 rounded bg-[#42cbf5]/10 text-[#092a25] text-[10px] font-bold border border-[#42cbf5]/20 shadow-sm">
                                    {activeOrder.status}
                                </span>
                            )}
                        </div>

                        {!isOnline ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center opacity-60 grayscale">
                                <Truck size={40} className="text-gray-300 mb-4" strokeWidth={1.5} />
                                <h4 className="text-lg font-bold text-gray-700">You are Offline</h4>
                                <p className="text-sm text-gray-400 mt-1">Go Online to start receiving orders.</p>
                            </div>
                        ) : !activeOrder ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-[#42cbf5]/20 rounded-full animate-ping opacity-75"></div>
                                    <div className="relative bg-white p-4 rounded-full border border-[#42cbf5]/20 shadow-sm">
                                        <Truck size={32} className="text-[#42cbf5]" />
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-[#0b0b0b]">Waiting for Orders...</h4>
                                <p className="text-sm text-gray-500 mt-1 max-w-xs">We'll notify you when a delivery is assigned to you.</p>
                            </div>
                        ) : (
                            <div className="p-0">
                                {/* Order Details - Clean & Data Rich */}
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                                            <h4 className="text-lg font-bold text-[#0b0b0b]">{activeOrder.customerName}</h4>
                                            <div className="flex items-start gap-2 mt-2 text-gray-500 text-sm font-medium">
                                                <MapPin size={16} className="mt-0.5 shrink-0 text-[#42cbf5]" />
                                                <p className="leading-snug">{activeOrder.customerAddress}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order Details</p>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">{activeOrder.id}</span>
                                                <span className="text-sm font-bold text-[#0b0b0b]">₹{activeOrder.amount}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${activeOrder.paymentType === 'COD' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-green-100 text-green-700 border border-green-200'
                                                    }`}>
                                                    {activeOrder.paymentType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Column (Right) */}
                                    <div className="flex flex-col justify-center space-y-3 pl-0 md:pl-8 md:border-l border-gray-100">
                                        {/* COD SAFETY LOGIC - Primary Button is BLACK */}
                                        {activeOrder.paymentType === 'COD' && !activeOrder.paymentCollected && (
                                            <button
                                                onClick={handleCollectCash}
                                                className="w-full py-3 bg-[#0b0b0b] text-white font-bold rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10 transform hover:-translate-y-0.5"
                                            >
                                                <IndianRupee size={16} />
                                                Collect Cash (₹{activeOrder.amount})
                                            </button>
                                        )}

                                        {/* OTP Generation - Secondary Button */}
                                        <button
                                            onClick={handleGenerateOTP}
                                            disabled={activeOrder.paymentType === 'COD' && !activeOrder.paymentCollected}
                                            className={`w-full py-3 font-bold rounded-lg border flex items-center justify-center gap-2 transition-all ${activeOrder.paymentType === 'COD' && !activeOrder.paymentCollected
                                                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : 'bg-white text-[#092a25] border-[#42cbf5] hover:bg-[#42cbf5]/10'
                                                }`}
                                        >
                                            <ShieldCheck size={18} />
                                            {activeOrder.paymentCollected ? 'Generate Delivery OTP' : 'Complete Delivery'}
                                        </button>

                                        <button className="w-full py-3 text-gray-500 font-bold text-sm hover:text-[#0b0b0b] transition-colors flex items-center justify-center gap-2">
                                            <Phone size={16} />
                                            Call Customer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN (4 cols) - Recent Activity */}
                <div className="hidden md:block col-span-1 md:col-span-4">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full">
                        <h3 className="font-bold text-[#0b0b0b] text-sm tracking-wide uppercase mb-6">Timeline</h3>

                        <div className="relative space-y-8 pl-4 border-l-2 border-gray-100 ml-2">
                            {/* Activity 1 */}
                            <div className="relative">
                                <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-[#42cbf5] ring-4 ring-white shadow-md shadow-[#42cbf5]/20"></span>
                                <p className="text-xs font-semibold text-gray-400 mb-0.5">2 mins ago</p>
                                <h4 className="text-sm font-bold text-[#0b0b0b]">Order #8472 Delivered</h4>
                                <p className="text-xs font-medium text-[#092a25] mt-1">+ ₹85 Earned</p>
                            </div>

                            {/* Activity 2 */}
                            <div className="relative">
                                <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300 ring-4 ring-white"></span>
                                <p className="text-xs font-semibold text-gray-400 mb-0.5">15 mins ago</p>
                                <h4 className="text-sm font-bold text-[#0b0b0b]">Arrived at Pickup</h4>
                                <p className="text-xs font-medium text-gray-500 mt-1">KFC Anna Nagar</p>
                            </div>

                            {/* Activity 3 */}
                            <div className="relative">
                                <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-[#0b0b0b] ring-4 ring-white"></span>
                                <p className="text-xs font-semibold text-gray-400 mb-0.5">1 hour ago</p>
                                <h4 className="text-sm font-bold text-[#0b0b0b]">Shift Started</h4>
                                <p className="text-xs font-medium text-gray-500 mt-1">Chennai Central Zone</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PartnerHome;
