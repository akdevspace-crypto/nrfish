
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../Context/AppContext';
import { Tag, Clock, Gift, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

const OffersAndDeals = () => {
    const { axios, currency } = useAppContext();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                // Fetch only active offers for customers
                const { data } = await axios.get('/api/offer/list?activeOnly=true');
                if (data.success) {
                    setOffers(data.offers);
                }
            } catch (error) {
                console.error("Failed to load offers", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, [axios]);

    const getTypeColor = (type) => {
        switch (type) {
            case 'B1G1': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'B3G1': return 'bg-pink-100 text-pink-700 border-pink-200';
            case 'COMBO': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'CUSTOM': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-4 md:px-16 lg:px-24 pb-20 bg-gray-50/50">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-outfit">Exclusive Deals & Offers</h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                    Grab the best deals on premium seafood and meats. Limited time offers just for you!
                </p>
            </div>

            {offers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Tag size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No Active Offers</h3>
                    <p className="text-gray-500 mt-2">Check back later for exciting new deals!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {offers.map((offer) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={offer.id}
                            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                        >
                            {/* Decorative Top Pattern */}
                            <div className={`h-2 w-full ${offer.type === 'COMBO' ? 'bg-orange-500' : 'bg-[#42cbf5]'}`}></div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border tracking-wide uppercase ${getTypeColor(offer.type)}`}>
                                        {offer.type}
                                    </span>
                                    {offer.discount_type === 'PERCENTAGE' && (
                                        <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold text-sm border border-red-100 flex items-center gap-1">
                                            <Percent size={12} /> {offer.discount_value}% OFF
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#0b8bb0] transition-colors">
                                    {offer.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                    {offer.description}
                                </p>

                                {/* Deal Info */}
                                <div className="space-y-3 pt-6 border-t border-gray-100">
                                    {(offer.buy_x || offer.get_y) && (
                                        <div className="flex items-center gap-3 text-gray-700 font-medium">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                                <Gift size={16} />
                                            </div>
                                            <span>Buy {offer.buy_x || 0}, Get {offer.get_y || 0} Free</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                            <Clock size={16} />
                                        </div>
                                        <span>Valid until {new Date(offer.end_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="bg-gray-50 p-4 border-t border-gray-100">
                                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Auto-applied at Checkout
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OffersAndDeals;
