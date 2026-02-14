import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../Context/AppContext';
import { Truck, Lock, Phone, ArrowRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

function PartnerLogin() {
    const navigate = useNavigate();
    const { axios, setToken } = useAppContext();
    // NOTE: Depending on how AppContext handles tokens, we might need a separate state or 
    // ensure it doesn't conflict with User/Seller tokens if stored in same key.
    // For this implementation, I'll assume we store it in localStorage 'dToken' 
    // and maybe AppContext needs adjustment or we just manage it locally/cleanly.
    // Actually, standard practice here is likely using a different token key or redirecting to a different layout.

    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!otpSent) {
                // Step 1: Request OTP
                const { data } = await axios.post('/api/delivery/login', { mobile, password });
                if (data.success) {
                    toast.success(data.message);
                    setOtpSent(true);
                    if (data.logic_otp) console.log("OTP:", data.logic_otp); // For testing
                } else {
                    toast.error(data.message);
                }
            } else {
                // Step 2: Verify OTP
                const { data } = await axios.post('/api/delivery/login-verify', { mobile, otp });
                if (data.success) {
                    toast.success("Login Successful!");
                    localStorage.setItem('dToken', data.token); // Store Delivery Token
                    localStorage.setItem('partnerInfo', JSON.stringify(data.partner));
                    navigate('/delivery/dashboard');
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-[#42cbf5] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-200/50">
                        <Truck size={32} strokeWidth={2.5} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Delivery Partner App
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Login to view assigned orders and update status
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {!otpSent ? (
                            <>
                                <div>
                                    <label htmlFor="mobile" className="block text-sm font-bold text-gray-700 ml-1 mb-1">
                                        Mobile Number
                                    </label>
                                    <div className="mt-1 relative rounded-2xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="mobile"
                                            name="mobile"
                                            type="tel"
                                            required
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            className="focus:ring-[#42cbf5] focus:border-[#42cbf5] block w-full pl-11 pr-4 py-3 sm:text-sm border-gray-300 rounded-xl bg-gray-50 focus:bg-white transition-all outline-none border focus:ring-4 focus:ring-blue-500/10 placeholder-gray-400 font-medium"
                                            placeholder="Enter your mobile number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 ml-1 mb-1">
                                        Password
                                    </label>
                                    <div className="mt-1 relative rounded-2xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="focus:ring-[#42cbf5] focus:border-[#42cbf5] block w-full pl-11 pr-4 py-3 sm:text-sm border-gray-300 rounded-xl bg-gray-50 focus:bg-white transition-all outline-none border focus:ring-4 focus:ring-blue-500/10 placeholder-gray-400 font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="animate-in fade-in zoom-in duration-300">
                                <label htmlFor="otp" className="block text-sm font-bold text-gray-700 ml-1 mb-1 text-center">
                                    Enter OTP sent to {mobile}
                                </label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="block w-full text-center text-3xl font-black tracking-[0.5em] py-4 rounded-xl border-2 border-gray-300 focus:border-[#42cbf5] outline-none font-mono mb-4"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                />
                                <div className="text-center">
                                    <button type="button" onClick={() => setOtpSent(false)} className="text-sm text-[#42cbf5] font-bold hover:underline">Change Mobile Number</button>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-gradient-to-r from-[#42cbf5] to-[#0ea5e9] hover:from-[#38bdf8] hover:to-[#0284c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                {loading ? <Loader className="animate-spin h-5 w-5" /> : (
                                    <span className="flex items-center gap-2">
                                        {otpSent ? 'Verify & Login' : 'Send OTP'} <ArrowRight size={18} />
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className='text-center'>
                            <p className='text-xs text-gray-400 font-medium'>Contact Admin if you forgot your password or need an account.</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PartnerLogin;
