import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';
import {
    LayoutDashboard, FileText, Calculator, LogOut, Menu, X, Bell, ChevronDown, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BillingLayout = () => {
    const { axios, navigate } = useAppContext();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sidebarLinks = [
        { name: "Dashboard", path: "/billing", icon: LayoutDashboard },
        { name: "Orders Billing", path: "/billing/orders", icon: FileText },
        { name: "Manual POS", path: "/billing/manual", icon: Calculator },
    ];

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/seller/logout');
            if (data.success) {
                toast.success(data.message);
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans text-[#0b0b0b]">

            {/* MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR - CUSTOMER THEME (Black & Cyan) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#0b0b0b] text-white shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* BRAND HEADER */}
                <div className="flex items-center justify-between p-8 pb-0">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-[#42cbf5] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(66,203,245,0.4)]">
                            <Receipt className="text-white" size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-white leading-none">NR FOOD</h1>
                            <span className="text-[10px] font-bold text-[#42cbf5] tracking-[0.2em] uppercase">Billing</span>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* NAVIGATION LINKS */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {sidebarLinks.map((item) => (
                        <NavLink
                            to={item.path}
                            key={item.name}
                            end={item.path === "/billing"}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => `group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden
                            ${isActive
                                    ? "bg-white/10 text-[#42cbf5] shadow-inner font-bold"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#42cbf5] rounded-r-full shadow-[0_0_10px_#42cbf5]"></div>
                                    )}
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`transition-colors ${isActive ? 'text-[#42cbf5]' : 'text-gray-500 group-hover:text-white'}`}
                                    />
                                    <span className="tracking-wide text-sm">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* BOTTOM SECTION */}
                <div className="p-4 mt-auto border-t border-white/5 bg-[#0b0b0b]">
                    <div className="px-4 py-3 mb-4 bg-[#42cbf5]/10 rounded-xl border border-[#42cbf5]/20">
                        <p className="text-xs font-bold text-[#42cbf5] uppercase tracking-wider mb-1">Terminal Status</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm font-bold text-white">Online</span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">

                {/* HEADER */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between md:justify-end sticky top-0 z-40">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-[#0b0b0b]">
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase">Current Session</p>
                            <p className="text-sm font-black text-[#0b0b0b]">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                        <div className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full border border-gray-100 bg-white shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-[#42cbf5] flex items-center justify-center text-xs font-bold text-white">
                                POS
                            </div>
                            <span className="text-sm font-bold text-[#0b0b0b] hidden sm:block">Billing Desk</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default BillingLayout;
