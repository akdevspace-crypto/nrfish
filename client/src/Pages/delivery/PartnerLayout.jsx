import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Truck, Package, Map, IndianRupee, User, LogOut, Bell, ChevronDown, LayoutDashboard, Settings, HelpCircle, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../Context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

// --- NEW ORDER MODAL COMPONENT ---
const NewOrderModal = ({ isOpen, onClose, onAccept }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    <div className="bg-[#0b0b0b] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#42cbf5] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#42cbf5]"></span>
                            </span>
                            <h3 className="text-white font-bold text-lg tracking-wide">New Order Request</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                <img src={assets.Logo || "https://cdn-icons-png.flaticon.com/512/732/732200.png"} alt="Restaurant" className="w-8 h-8 object-contain" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-[#0b0b0b]">KFC - Anna Nagar</h4>
                                <p className="text-sm text-gray-500">2 items • ₹450 • COD</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">2.5 km</span>
                                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Est. ₹45</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Map size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Pickup</p>
                                        <p className="text-sm font-bold text-[#0b0b0b]">KFC Restaurant</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <User size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Dropoff</p>
                                        <p className="text-sm font-bold text-[#0b0b0b]">Rahul Sharma</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                                Decline
                            </button>
                            <button onClick={onAccept} className="flex-1 py-3 rounded-xl bg-[#0b0b0b] text-white font-bold hover:bg-black transition-colors shadow-lg shadow-[#42cbf5]/20 flex items-center justify-center gap-2">
                                <CheckCircle size={18} className="text-[#42cbf5]" />
                                Accept Order
                            </button>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-gray-100">
                        <div className="h-full bg-[#42cbf5] w-[60%] animate-[progress_15s_linear]"></div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};


// --- MAIN LAYOUT COMPONENT ---
const PartnerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOnline, setIsOnline] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showNewOrder, setShowNewOrder] = useState(false);
    const profileRef = useRef(null);

    // Context User vs Specific Partner Info
    const { user, logout: contextLogout } = useAppContext();

    // Get Partner Info from Local Storage (Prioritized)
    const [partnerName, setPartnerName] = useState('Partner');
    const [partnerId, setPartnerId] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('dToken');
        if (!token) {
            navigate('/delivery/login');
        }

        // Logic to get correct partner name
        const storedPartnerInfo = localStorage.getItem('partnerInfo');
        if (storedPartnerInfo) {
            try {
                const parsed = JSON.parse(storedPartnerInfo);
                if (parsed.name) setPartnerName(parsed.name);
                if (parsed._id) setPartnerId(parsed._id.substring(0, 6)); // Short ID
            } catch (e) {
                console.error("Error parsing partner info", e);
            }
        } else if (user?.name) {
            setPartnerName(user.name); // Fallback to context user
        }
    }, [navigate, user]);

    // Close profile dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const logout = () => {
        localStorage.removeItem('dToken');
        localStorage.removeItem('partnerInfo');
        if (contextLogout) contextLogout();
        navigate('/delivery/login');
    };

    const toggleOnline = () => {
        const newState = !isOnline;
        setIsOnline(newState);
        if (newState) {
            toast.success('You are now Online', {
                style: { background: '#10B981', color: '#fff' },
                iconTheme: { primary: '#fff', secondary: '#10B981' }
            });
            // SIMULATE NEW ORDER AFTER 3 SECONDS
            setTimeout(() => {
                setShowNewOrder(true);
                // Simple beep logic or rely on browser
            }, 3000);

        } else {
            toast('You are now Offline', {
                icon: '😴',
                style: { background: '#334155', color: '#fff' }
            });
        }
    };

    // Navigation Items
    const navItems = [
        { path: '/delivery/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/delivery/orders', icon: Package, label: 'Orders' },
        { path: '/delivery/map', icon: Map, label: 'Map' },
        { path: '/delivery/earnings', icon: IndianRupee, label: 'Earnings' },
        { path: '/delivery/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="flex min-h-screen font-sans text-[#0b0b0b] bg-[#F3F4F6]">

            {/* DESKTOP SIDEBAR - CUSTOMER THEME (Black & Cyan) */}
            <aside className="hidden md:flex flex-col w-64 bg-[#0b0b0b] fixed h-full z-50 text-white shadow-2xl">
                {/* Brand Logo Area */}
                <div className="p-8 pb-0">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-[#42cbf5] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(66,203,245,0.4)]">
                            {/* Use Truck icon if Logo asset fails or distinct partner branding */}
                            <Truck className="text-white" size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-white leading-none">NR FOOD</h1>
                            <span className="text-[10px] font-bold text-[#42cbf5] tracking-[0.2em] uppercase">Partner</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '/delivery/dashboard' && location.pathname === '/delivery');
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                                        ? 'bg-white/10 text-[#42cbf5] shadow-inner font-bold'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#42cbf5] rounded-r-full shadow-[0_0_10px_#42cbf5]"></div>
                                )}
                                <Icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`transition-colors ${isActive ? 'text-[#42cbf5]' : 'text-gray-500 group-hover:text-white'}`}
                                />
                                <span className="tracking-wide">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom Profile Section */}
                <div className="p-4 mt-auto">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium mb-4"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>

                    {/* User Profile Snippet */}
                    <div className="px-4 py-4 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#42cbf5] to-blue-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-[#0b0b0b] flex items-center justify-center text-[#42cbf5] font-bold text-sm overflow-hidden">
                                {partnerName.charAt(0)}
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate max-w-[100px]">{partnerName}</p>
                            <p className="text-[10px] text-gray-500 truncate">ID: #{partnerId || '88392'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 w-full md:pl-64 flex flex-col min-h-screen transition-all duration-300">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-black text-[#0b0b0b] capitalize tracking-tight">
                            {location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard'}
                        </h2>
                        {/* Breadcrumb-ish text */}
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Overview for today</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Status Toggle (Global) */}
                        <div
                            onClick={toggleOnline}
                            className={`flex items-center gap-3 px-1.5 py-1.5 pr-4 rounded-full border cursor-pointer transition-all duration-300 select-none group ${isOnline
                                ? 'bg-[#42cbf5]/10 border-[#42cbf5]/30 shadow-[0_2px_10px_rgba(66,203,245,0.15)]'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 ease-out border border-black/5 ${isOnline ? 'bg-[#42cbf5]' : 'bg-gray-300'
                                }`}>
                                <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-300 cubic-bezier(0.4, 0.0, 0.2, 1) ${isOnline ? 'left-[calc(100%-16px)]' : 'left-0.5'
                                    }`}></div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold tracking-wide transition-colors ${isOnline ? 'text-[#092a25]' : 'text-gray-400'
                                    }`}>
                                    {isOnline ? 'On Duty' : 'Offline'}
                                </span>
                                {isOnline && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#42cbf5] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#42cbf5]"></span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="h-6 w-px bg-gray-200"></div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button className="relative p-2.5 rounded-full bg-white hover:bg-gray-50 border border-gray-100 text-[#0b0b0b] transition-all hover:text-[#42cbf5] shadow-sm">
                                <Bell size={20} strokeWidth={2} />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#42cbf5] to-blue-500 p-[2px] shadow-sm group-hover:shadow-[#42cbf5]/20">
                                        <div className="w-full h-full rounded-full bg-white border-2 border-transparent overflow-hidden">
                                            {/* Avatar Fallback */}
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {partnerName.charAt(0)}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 text-[#0b0b0b]"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-sm font-bold truncate">{partnerName}</p>
                                                <p className="text-xs text-gray-500 font-medium">Verified Partner</p>
                                            </div>
                                            <div className="py-2">
                                                <button onClick={() => navigate('/delivery/profile')} className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 hover:text-[#42cbf5] transition-colors flex items-center gap-2">
                                                    <User size={16} /> My Profile
                                                </button>
                                                <button className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 hover:text-[#42cbf5] transition-colors flex items-center gap-2">
                                                    <Settings size={16} /> Settings
                                                </button>
                                                <button className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 hover:text-[#42cbf5] transition-colors flex items-center gap-2">
                                                    <HelpCircle size={16} /> Help & Support
                                                </button>
                                                <div className="h-px bg-gray-100 my-1"></div>
                                                <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
                                                    <LogOut size={16} /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Container - Premium Grid Wrapper */}
                <div className="flex-1 overflow-y-auto w-full mx-auto md:max-w-[1400px] md:px-8 md:py-8 p-0 pb-24 md:pb-8">
                    <Outlet context={{ isOnline, setIsOnline }} />
                </div>
            </div>

            {/* Bottom Navigation Bar (Mobile Only) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-3 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 transition-all duration-200 group ${isActive ? 'text-[#0b0b0b] scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-[#42cbf5]/10 shadow-sm' : ''}`}>
                                <Icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`transition-colors duration-300 ${isActive ? 'text-[#42cbf5] -translate-y-0.5' : ''}`}
                                />
                            </div>
                            <span className={`text-[10px] font-bold tracking-wide transition-colors ${isActive ? 'text-[#0b0b0b]' : 'text-gray-400'}`}>
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </div>

            {/* NEW ORDER MODAL NOTIFICATION */}
            {showNewOrder && (
                <NewOrderModal
                    isOpen={showNewOrder}
                    onClose={() => setShowNewOrder(false)}
                    onAccept={() => {
                        setShowNewOrder(false);
                        toast.success("Order Accepted!");
                        navigate('/delivery/map');
                    }}
                />
            )}
        </div>
    );
};

export default PartnerLayout;
