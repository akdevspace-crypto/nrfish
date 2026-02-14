import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Offers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0); // Always start at top
        const fetchOffers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/offer/list?activeOnly=true');
                if (response.data.success) {
                    setOffers(response.data.offers);
                }
            } catch (error) {
                console.error("Error fetching offers", error);

            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    if (loading) return <div className="min-h-screen flex justify-center items-center">Loading Offers...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-12">
            <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">Exclusive Offers & Deals</h1>

            {offers.length === 0 ? (
                <div className="text-center text-gray-500 text-lg">No active offers at the moment. Stay tuned!</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {offers.map((offer) => (
                        <div key={offer.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                            {/* Image Placeholder or Actual Image */}
                            <div className="h-48 bg-gray-200 w-full object-cover flex items-center justify-center text-gray-400">
                                {offer.image ? (
                                    <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                                ) : (
                                    <span>No Image</span>
                                )}
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold text-gray-800">{offer.title}</h2>
                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded inline-block">
                                        {offer.discount_type === 'PERCENTAGE' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 flex-grow">{offer.description}</p>

                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 mb-3">
                                        Valid until: {new Date(offer.end_date).toLocaleDateString()}
                                    </p>
                                    <button className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-opacity-90 transition">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Offers;
