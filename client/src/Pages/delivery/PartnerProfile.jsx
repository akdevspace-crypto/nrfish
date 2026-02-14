import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, FileText, Bike, Shield, ChevronRight, Star, Bell, CreditCard, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PartnerProfile = () => {
    const navigate = useNavigate();
    const [partnerInfo, setPartnerInfo] = useState({
        name: 'Partner Name',
        email: 'partner@example.com',
        phone: '9876543210',
        joinedDate: 'Jan 2024'
    });

    useEffect(() => {
        const info = JSON.parse(localStorage.getItem('partnerInfo') || '{}');
        if (info && info.name) {
            setPartnerInfo(info);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('dToken');
        localStorage.removeItem('partnerInfo');
        navigate('/delivery/login');
    };

    const menuItems = [
        { icon: Bike, label: 'Vehicle Information', sub: 'TN-01-AB-1234 • Honda Activa', status: 'verified' },
        { icon: FileText, label: 'Documents', sub: 'License, Insurance', status: 'verified' },
        { icon: CreditCard, label: 'Bank Details', sub: 'HDFC Bank • **** 1234', status: 'verified' },
        { icon: Shield, label: 'Privacy & Security', sub: '2FA Enabled', status: null },
        { icon: Bell, label: 'Notifications', sub: 'On (Push, Email)', status: null },
        { icon: Settings, label: 'App Settings', sub: 'Dark Mode, Language', status: null },
    ];

    return (
        <div className="font-sans min-h-screen bg-gray-50/50">
            {/* Desktop Header Container */}
            <div className="md:max-w-6xl md:mx-auto">

                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Profile</h1>
                    <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors">
                        <Edit size={16} /> Edit Profile
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-6 md:mb-8 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-2xl md:text-4xl shadow-lg shadow-gray-200 shrink-0">
                            {partnerInfo.name.charAt(0)}
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{partnerInfo.name}</h2>
                                <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200">
                                    Active Partner
                                </span>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm text-gray-500 font-medium">
                                <p>{partnerInfo.email}</p>
                                <span className="hidden md:inline w-1 h-1 rounded-full bg-gray-300"></span>
                                <p>+91 {partnerInfo.phone}</p>
                                <span className="hidden md:inline w-1 h-1 rounded-full bg-gray-300"></span>
                                <p>Joined {partnerInfo.joinedDate}</p>
                            </div>

                            <div className="flex items-center gap-2 mt-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-xl w-fit border border-yellow-100">
                                <Star size={14} className="fill-current" />
                                <span className="text-sm font-bold">4.8 Rating</span>
                                <span className="text-yellow-400 text-xs">•</span>
                                <span className="text-xs opacity-80 decoration-dotted underline">See Reviews</span>
                            </div>
                        </div>

                        {/* Desktop Quick Stats (Right Side) */}
                        <div className="hidden md:flex items-center gap-6 pl-6 border-l border-gray-100">
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-gray-900">1,248</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Deliveries</p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-gray-900">98%</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Accept Rate</p>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Edit Button (Absolute) */}
                    <button className="md:hidden absolute top-4 right-4 p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-black transition-colors">
                        <Settings size={16} />
                    </button>
                </div>

                {/* Mobile Stats (Visible on Mobile Only) */}
                <div className="grid grid-cols-2 gap-4 mb-6 md:hidden">
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 text-center">
                        <h3 className="text-2xl font-black text-gray-900">1.2k</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Deliveries</p>
                    </div>
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 text-center">
                        <h3 className="text-2xl font-black text-gray-900">Jan '24</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Joined</p>
                    </div>
                </div>

                {/* Information Grid (Cards on Desktop, List on Mobile) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-5 bg-white md:bg-transparent rounded-[2rem] md:rounded-none shadow-sm md:shadow-none border md:border-none border-gray-100 overflow-hidden md:overflow-visible">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            className="flex md:flex-col items-center md:items-start gap-4 p-4 md:p-6 md:bg-white md:rounded-3xl md:border md:border-gray-100 md:shadow-sm md:hover:shadow-md md:hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-b border-gray-50 md:border-b-gray-100 last:border-b-0 md:last:border-b"
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-50 text-gray-500 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                                <item.icon size={20} className="md:w-6 md:h-6" />
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-sm md:text-base">{item.label}</h4>
                                {item.sub && <p className="text-xs md:text-sm font-medium text-gray-400 mt-0.5">{item.sub}</p>}
                            </div>

                            {item.status === 'verified' && (
                                <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-600 border border-green-100">
                                    Verified
                                </span>
                            )}

                            <div className="md:hidden">
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                            </div>

                            {/* Desktop Arrow (Bottom Right) */}
                            <div className="hidden md:flex absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                <ChevronRight size={20} className="text-gray-300" />
                            </div>
                        </div>
                    ))}

                    {/* Logout Button (Appears as Card in Grid) */}
                    <button
                        onClick={logout}
                        className="md:col-span-1 flex md:flex-col items-center md:items-start gap-4 p-4 md:p-6 hover:bg-red-50 md:bg-white md:rounded-3xl md:border md:border-red-100 md:hover:border-red-300 md:shadow-sm transition-all duration-300 group text-left w-full md:hover:shadow-red-50"
                    >
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                            <LogOut size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-500 text-sm md:text-lg">Logout</h4>
                            <p className="text-xs md:text-sm font-medium text-red-300 mt-0.5">Sign out of your account</p>
                        </div>
                    </button>
                </div>

                <p className="text-center text-[10px] font-bold text-gray-300 mt-8 mb-4 uppercase tracking-widest md:text-left">
                    Partner App v2.4.0 • Build 8472
                </p>
            </div>
        </div>
    );
};

export default PartnerProfile;
