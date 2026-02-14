
import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Trash2, Edit, Plus, Calendar, Tag, Gift, Percent } from 'lucide-react';
import CreateOfferModal from '../../Components/Seller/CreateOfferModal';
import { useAppContext } from '../../Context/AppContext';

const Offers = () => {
    const { axios: api, currency } = useAppContext();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, EXPIRED

    const [editOffer, setEditOffer] = useState(null);

    const fetchOffers = async () => {
        try {
            const response = await api.get('/api/offer/list');
            if (response.data.success) {
                setOffers(response.data.offers);
            }
        } catch (error) {
            toast.error("Failed to load offers");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const toggleStatus = async (id) => {
        try {
            console.log("Toggling Offer ID:", id);
            const { data } = await api.put(`/api/offer/toggle/${id}`);
            if (data.success) {
                toast.success(data.message);
                fetchOffers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this offer?")) return;
        try {
            const { data } = await api.delete(`/api/offer/delete/${id}`);
            if (data.success) {
                toast.success("Offer deleted");
                fetchOffers();
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleEdit = (offer) => {
        setEditOffer(offer);
        setShowModal(true);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'B1G1': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'B3G1': return 'bg-pink-100 text-pink-700 border-pink-200';
            case 'COMBO': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'CUSTOM': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredOffers = offers.filter(offer => {
        if (filter === 'ALL') return true;
        if (filter === 'ACTIVE') return offer.is_active;
        if (filter === 'EXPIRED') return !offer.is_active; // Or check date
        return true;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col bg-gray-50/50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Offers & Deals</h1>
                    <p className="text-gray-500 mt-1">Manage promotional campaigns and combos</p>
                </div>
                <button
                    onClick={() => { setEditOffer(null); setShowModal(true); }}
                    className="flex items-center gap-2 bg-[#42cbf5] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#1dc1f2] transition-all shadow-md hover:shadow-lg transform active:scale-95"
                >
                    <Plus size={20} /> Create New Offer
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                {['ALL', 'ACTIVE', 'EXPIRED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-[#42cbf5] text-black' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 overflow-y-auto">
                    {filteredOffers.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed col-span-full">
                            <Gift size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No offers found</p>
                        </div>
                    ) : (
                        filteredOffers.map(offer => (
                            <div key={offer.id} className={`bg-white rounded-2xl shadow-sm border p-6 relative overflow-hidden transition-all hover:shadow-md flex flex-col
                                ${offer.is_active ? 'border-gray-200' : 'border-gray-100 opacity-75 grayscale'}`}>

                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 mr-2">
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{offer.title}</h3>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-md border ${getTypeColor(offer.type)}`}>
                                            {offer.type}
                                        </span>
                                    </div>
                                    <div className="bg-[#42cbf5]/10 text-[#0b8bb0] px-3 py-1 rounded-lg font-bold text-lg whitespace-nowrap">
                                        {offer.discount_type === 'PERCENTAGE' ? `${offer.discount_value}%` :
                                            (offer.type || '').includes('G1') ? 'FREE' :
                                                `${currency}${offer.discount_value}`}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-3 text-sm text-gray-600 mb-6 flex-1">
                                    <p className="line-clamp-2 text-gray-500">{offer.description || 'No description provided'}</p>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                                            <span className="truncate">
                                                {new Date(offer.start_date).toLocaleDateString()} - {new Date(offer.end_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {offer.type === 'COMBO' && (
                                            <div className="flex items-center gap-2">
                                                <Tag size={14} className="text-gray-400 flex-shrink-0" />
                                                <span>{offer.combo_product_ids?.length || 0} Items Bundled</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 border-t pt-4 mt-auto">
                                    <button
                                        onClick={() => toggleStatus(offer.id)}
                                        className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all border shadow-sm
                                            ${offer.is_active
                                                ? 'bg-white text-red-500 border-red-200 hover:bg-red-50'
                                                : 'bg-green-500 text-white border-green-600 hover:bg-green-600'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${offer.is_active ? 'bg-red-500' : 'bg-white'}`}></div>
                                        {offer.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    {/* Fix: Toggle logic was showing 'Deactivate' for active, but here I can use a simpler power icon or text */}

                                    <button
                                        onClick={() => handleEdit(offer)}
                                        className="p-2 rounded-lg bg-gray-50 text-gray-400 border border-gray-100 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-100 transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(offer.id)}
                                        className="p-2 rounded-lg bg-gray-50 text-gray-400 border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Overlay Fix for Button Text */}
                                <div className="hidden">
                                    {/* Just to ensure I didn't break the toggle text logic in the button above */}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <CreateOfferModal
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            setShowModal(false);
                            fetchOffers();
                        }}
                        initialData={editOffer}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Offers;
