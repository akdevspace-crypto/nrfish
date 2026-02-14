import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { useAppContext } from '../Context/AppContext';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';

function Profile() {
    const { user, navigate, axios, setUser } = useAppContext();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '' });

    const handleUpdateProfile = async () => {
        try {
            const { data } = await axios.put('/api/user/update-profile', formData);
            if (data.success) {
                toast.success(data.message);
                setUser((prev) => ({ ...prev, ...data.user }));
                setIsEditing(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        }
    };

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user) return null;

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/user/logout');
            if (data.success) {
                toast.success(data.message);
                setUser(null);
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-[120px] pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">

                {/* SIDEBAR */}
                <div className="space-y-6">
                    {/* User Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full border-4 border-[#42cbf5]/20 mb-4 p-1">
                            <img src={assets.profile} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    {/* Navigation */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <nav className="flex flex-col">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`text-left px-6 py-4 font-medium flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-[#42cbf5]/10 text-black border-l-4 border-[#42cbf5]' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <User size={20} /> Personal Info
                            </button>
                            <button
                                onClick={() => navigate('/my-orders')}
                                className={`text-left px-6 py-4 font-medium flex items-center gap-3 transition-colors text-gray-600 hover:bg-gray-50`}
                            >
                                <Package size={20} /> My Orders
                            </button>
                            <button
                                onClick={() => navigate('/add-address')}
                                className={`text-left px-6 py-4 font-medium flex items-center gap-3 transition-colors text-gray-600 hover:bg-gray-50`}
                            >
                                <MapPin size={20} /> Addresses
                            </button>
                            <button
                                onClick={logout}
                                className={`text-left px-6 py-4 font-medium flex items-center gap-3 transition-colors text-red-500 hover:bg-red-50`}
                            >
                                <LogOut size={20} /> Logout
                            </button>
                        </nav>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-sm font-medium text-gray-500 hover:text-gray-700 underline"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium text-gray-900 focus:outline-none focus:border-[#42cbf5] focus:ring-1 focus:ring-[#42cbf5]"
                                />
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-medium text-gray-900">
                                    {user.name}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-medium text-gray-500 cursor-not-allowed select-none">
                                {user.email}
                                <span className="float-right text-xs text-gray-400 mt-1">(Cannot change)</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Add phone number"
                                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium text-gray-900 focus:outline-none focus:border-[#42cbf5] focus:ring-1 focus:ring-[#42cbf5]"
                                />
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-medium text-gray-900">
                                    {user.mobile || user.phone || "Not provided"}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Account Status</label>
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100 font-bold text-green-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Active Member
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-100">
                        {isEditing ? (
                            <button
                                onClick={handleUpdateProfile}
                                className="px-8 py-3 bg-[#42cbf5] hover:bg-[#1dc1f2] text-black font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                            >
                                <span>💾</span> Save Changes
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setFormData({ name: user.name, phone: user.mobile || user.phone || "" });
                                    setIsEditing(true);
                                }}
                                className="px-8 py-3 bg-[#42cbf5] hover:bg-[#1dc1f2] text-black font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Profile;
