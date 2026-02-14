import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';

const DeliveryZonePanel = () => {
    const { axios, token } = useAppContext();
    const [pincodes, setPincodes] = useState([]);
    const [newPincode, setNewPincode] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchZones = async () => {
        try {
            const { data } = await axios.get('/api/address/zones');
            if (data.success) {
                setPincodes(data.pincodes);
            }
        } catch (error) {
            console.error("Error fetching zones", error);
        }
    };

    useEffect(() => {
        fetchZones();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newPincode || newPincode.length < 4) {
            toast.error("Enter a valid pincode");
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.post('/api/address/zones/add', { pincode: newPincode }, { headers: { token } }); // Assuming token is sellerToken? 
            // Wait, AppContext 'token' is usually user token. Seller token is in cookies 'sellerToken'.
            // axios withCredentials=true should send cookies automatically.
            // But let's check if my 'authSeller' middleware checks header or cookie. 
            // It checks 'req.cookies.sellerToken'. So headers might not be needed if credentials are true.

            if (data.success) {
                toast.success(data.message);
                setNewPincode("");
                fetchZones();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (pincode) => {
        if (!window.confirm(`Remove ${pincode} from delivery zones?`)) return;
        try {
            // Again, relying on cookies for sellerAuth
            const { data } = await axios.post('/api/address/zones/delete', { pincode });
            if (data.success) {
                toast.success(data.message);
                fetchZones();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex-1 min-h-screen px-4 sm:px-8 py-8 bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Delivery Zones</h1>

            {/* Add Zone */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Add New Pincode</h3>
                <form onSubmit={handleAdd} className="flex gap-4">
                    <input
                        type="text"
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        placeholder="e.g. 560001"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Add Zone'}
                    </button>
                </form>
            </div>

            {/* List Zones */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Active Delivery Locations ({pincodes.length})</h3>

                {pincodes.length === 0 ? (
                    <p className="text-gray-400">No delivery zones added yet.</p>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {pincodes.map((pin) => (
                            <div key={pin} className="group relative bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-3 hover:border-red-200 transition-colors">
                                <span className="font-mono font-medium text-gray-800">{pin}</span>
                                <button
                                    onClick={() => handleDelete(pin)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryZonePanel;
