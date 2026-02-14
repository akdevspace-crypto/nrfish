import React from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard, Gift, ChevronRight } from 'lucide-react';

const PartnerEarnings = () => {
    // Mock Data
    const earnings = {
        today: 1250,
        week: 8500,
        month: 24000,
        trips: 45,
        tips: 350,
        bonus: 500
    };

    const recentPayouts = [
        { id: 1, date: '12 Feb', amount: 4200, status: 'Processed' },
        { id: 2, date: '05 Feb', amount: 3800, status: 'Paid' },
    ];

    return (
        <div className="p-5 font-sans min-h-screen bg-gray-50/50 pb-24 space-y-6">
            <h1 className="text-2xl font-black text-gray-900">Earnings</h1>

            {/* Total Earnings Card */}
            <div className="bg-black text-white p-6 rounded-[2rem] shadow-2xl shadow-gray-200 relative overflow-hidden">
                <div className="relative z-10">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Available Balance</span>
                    <h2 className="text-4xl font-black mt-2">₹{earnings.week + earnings.tips}</h2>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                            <p className="text-[10px] font-bold text-white/60 uppercase">Trips</p>
                            <p className="text-sm font-bold">{earnings.trips}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                            <p className="text-[10px] font-bold text-white/60 uppercase">Tips</p>
                            <p className="text-sm font-bold">₹{earnings.tips}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                            <p className="text-[10px] font-bold text-white/60 uppercase">Bonus</p>
                            <p className="text-sm font-bold">₹{earnings.bonus}</p>
                        </div>
                    </div>
                </div>
                {/* Decorative */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-gray-800 to-black rounded-full opacity-50 blur-2xl"></div>
                <div className="absolute bottom-0 right-0 p-6 opacity-10">
                    <DollarSign size={100} />
                </div>
            </div>

            {/* Weekly Chart (Simulated) */}
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <TrendingUp size={18} className="text-green-500" /> Weekly Report
                    </h3>
                    <select className="bg-gray-50 border-none text-xs font-bold rounded-lg py-1 px-2 text-gray-500 focus:ring-0 cursor-pointer">
                        <option>This Week</option>
                        <option>Last Week</option>
                    </select>
                </div>

                <div className="flex items-end justify-between gap-2 h-32 px-2">
                    {[40, 65, 30, 85, 50, 90, 60].map((h, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className="w-full bg-gray-100 rounded-lg h-full relative overflow-hidden">
                                <div
                                    className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500 group-hover:opacity-80 ${h > 80 ? 'bg-green-500' : 'bg-black'}`}
                                    style={{ height: `${h}%` }}
                                ></div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Payouts */}
            <div>
                <h3 className="font-bold text-gray-900 text-lg mb-4 ml-1">Recent Payouts</h3>
                <div className="space-y-3">
                    {recentPayouts.map((payout) => (
                        <div key={payout.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Weekly Payout</h4>
                                    <p className="text-xs font-medium text-gray-500">{payout.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h4 className="font-bold text-gray-900">₹{payout.amount}</h4>
                                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                                    {payout.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-gray-200 hover:bg-black transition-all">
                <Gift size={18} /> View Incentive Details
            </button>
        </div>
    );
};

export default PartnerEarnings;
