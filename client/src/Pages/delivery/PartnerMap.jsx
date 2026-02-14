import React, { useState } from 'react';

import { MapPin, Navigation, Compass, Layers, AlertCircle } from 'lucide-react';

const PartnerMap = () => {
    // Mock location
    const center = { lat: 13.0827, lng: 80.2707 };
    const [isNavigating, setIsNavigating] = useState(false);

    return (
        <div className="relative w-full h-screen bg-gray-200">
            {/* Map Placeholder */}
            <div className="absolute inset-0 bg-slate-200 flex items-center justify-center opacity-50 overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1 opacity-20">
                    {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="border border-white/50"></div>
                    ))}
                </div>
                {/* Decorative Map Elements */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-green-200 rounded-full blur-3xl opacity-30"></div>

                <div className="z-10 text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl">
                    <MapPin size={48} className="mx-auto text-red-500 mb-4 animate-bounce" />
                    <h2 className="text-xl font-black text-gray-900">Map View</h2>
                    <p className="text-sm text-gray-500 font-medium max-w-xs mt-2">
                        Real-time navigation will be integrated here using Google Maps API.
                    </p>
                </div>
            </div>

            {/* Simulated Route Line (Visual Only) */}
            <svg className="absolute inset-0 pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
                <path d="M100,600 C200,500 150,300 300,200" stroke="#42cbf5" strokeWidth="4" fill="none" strokeDasharray="10 5" />
            </svg>

            {/* Overlays */}
            <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-700">GPS Active</span>
                    </div>
                </div>
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20">
                    <Layers size={20} className="text-gray-600" />
                </div>
            </div>

            {/* Bottom Sheet Navigation Card (If navigating) */}
            <div className="absolute bottom-24 left-4 right-4 bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 z-20">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                        <Navigation size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Heading to</p>
                        <h3 className="text-lg font-black text-gray-900">123, Anna Nagar</h3>
                    </div>
                    <div className="ml-auto text-right">
                        <h3 className="text-lg font-black text-gray-900">12 min</h3>
                        <p className="text-xs font-bold text-green-500">3.5 km</p>
                    </div>
                </div>

                <button className="w-full py-4 bg-black text-white text-sm font-bold rounded-2xl shadow-lg shadow-gray-300 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95">
                    <Navigation size={18} /> Start Navigation
                </button>
            </div>
        </div>
    );
};

export default PartnerMap;
