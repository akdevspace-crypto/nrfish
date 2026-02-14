
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';
import { Plus, User, Truck, Phone, ShieldCheck, XCircle, CheckCircle, Camera, Award, Activity, BarChart2, ToggleRight, ToggleLeft, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PartnerCard = ({ partner, toggleStatus, handleEdit, handleDelete }) => {
    const [activeTab, setActiveTab] = useState('status'); // 'status' or 'stats'

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col h-full relative group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                        <img src={partner.partner_photo || 'https://via.placeholder.com/150'} alt={partner.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{partner.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone size={14} /> {partner.mobile}
                        </div>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shrink-0 ${partner.is_verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                    {partner.is_verified ? 'Verified' : 'Pending'}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab('status')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'status' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Activity size={16} /> Status
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'stats' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <BarChart2 size={16} /> Stats
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                <AnimatePresence mode="wait">
                    {activeTab === 'status' ? (
                        <motion.div
                            key="status"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-4"
                        >
                            <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Account Status</span>
                                    <button
                                        onClick={() => toggleStatus(partner.id, 'active', partner.is_active)}
                                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${partner.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <motion.div
                                            layout
                                            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${partner.is_active ? 'left-7' : 'left-1'}`}
                                        />
                                    </button>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {partner.is_active ? 'Partner can login and receive orders.' : 'Partner cannot login.'}
                                </div>
                            </div>

                            <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Verification</span>
                                    <button
                                        onClick={() => toggleStatus(partner.id, 'verify', partner.is_verified)}
                                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${partner.is_verified ? 'bg-blue-500' : 'bg-gray-300'}`}
                                    >
                                        <motion.div
                                            layout
                                            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${partner.is_verified ? 'left-7' : 'left-1'}`}
                                        />
                                    </button>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {partner.is_verified ? 'Documents verified.' : 'Pending document verification.'}
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-xs text-gray-400 px-1">
                                <span>Vehicle: <span className="text-gray-700 font-semibold">{partner.vehicle_no}</span></span>
                                <span>License: <span className="text-gray-700 font-semibold">{partner.license_no}</span></span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center">
                                    <h4 className="text-2xl font-black text-blue-600">{partner.total_orders_delivered || 0}</h4>
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Delivered</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col items-center justify-center text-center">
                                    <h4 className="text-2xl font-black text-purple-600">{partner.total_orders_assigned || 0}</h4>
                                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wide">Assigned</p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-green-500 h-full rounded-full"
                                            style={{ width: `${partner.total_orders_assigned > 0 ? (partner.total_orders_delivered / partner.total_orders_assigned) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">
                                        {partner.total_orders_assigned > 0 ? Math.round((partner.total_orders_delivered / partner.total_orders_assigned) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action Buttons (Bottom) */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                    onClick={() => handleEdit(partner)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                    <Edit2 size={16} /> Edit
                </button>
                <button
                    onClick={() => handleDelete(partner.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                >
                    <Trash2 size={16} /> Delete
                </button>
            </div>
        </motion.div>
    );
};

const CameraModal = ({ onClose, onCapture }) => {
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const [stream, setStream] = React.useState(null);

    React.useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                toast.error("Camera access denied");
                onClose();
            }
        };
        startCamera();
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    const capture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            onCapture(blob);
            onClose();
        }, 'image/jpeg', 0.8);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-4 w-full max-w-lg flex flex-col gap-4">
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                    <button onClick={capture} className="px-6 py-2 rounded-lg font-bold bg-[#42cbf5] text-white hover:bg-[#1dc1f2] flex items-center gap-2">
                        <Camera size={20} /> Capture
                    </button>
                </div>
            </div>
        </div>
    );
};

function DeliveryPartners() {
    const { axios } = useAppContext();
    const [partners, setPartners] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Camera State
    const [showCamera, setShowCamera] = useState(false);
    const [activeCameraField, setActiveCameraField] = useState(null); // 'partner_photo' or 'proof_image'

    // Form State
    const [newPartner, setNewPartner] = useState({
        name: '',
        mobile: '',
        password: '',
        vehicle_no: '',
        license_no: '',
        proof_image: '',
        partner_photo: ''
    });

    const fetchPartners = async () => {
        try {
            const { data } = await axios.get('/api/delivery/admin/list');
            if (data.success) {
                setPartners(data.partners);
            }
        } catch (error) {
            toast.error("Failed to fetch partners");
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleCameraCapture = async (blob) => {
        const formData = new FormData();
        formData.append('image', blob);

        const toastId = toast.loading("Uploading image...");
        try {
            const { data } = await axios.post('/api/upload', formData);
            if (data.success) {
                setNewPartner(prev => ({ ...prev, [activeCameraField]: data.url }));
                toast.success("Image uploaded!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            toast.dismiss(toastId);
            setShowCamera(false);
        }
    };

    const openCamera = (field) => {
        setActiveCameraField(field);
        setShowCamera(true);
    };

    const handleAddPartner = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...newPartner,
                proof_doc_url: newPartner.proof_image || 'https://placehold.co/400x300?text=License+Proof',
                photo_url: newPartner.partner_photo || 'https://placehold.co/400x400?text=Partner+Photo'
            };

            let response;
            if (newPartner.id) {
                // Update
                response = await axios.put('/api/delivery/admin/update', payload);
            } else {
                // Create
                response = await axios.post('/api/delivery/admin/add', payload);
            }

            const { data } = response;

            if (data.success) {
                toast.success(data.message);
                setShowAddModal(false);
                resetForm();
                fetchPartners();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error adding/updating partner");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this partner? This action cannot be undone.")) return;

        try {
            const { data } = await axios.delete(`/api/delivery/admin/delete/${id}`);
            if (data.success) {
                toast.success("Partner deleted successfully");
                fetchPartners();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to delete partner");
        }
    };

    const handleEdit = (partner) => {
        setNewPartner({
            id: partner.id,
            name: partner.name,
            mobile: partner.mobile,
            password: '', // Password not filled for security, user can set new one if needed (logic to be handled in backend if provided)
            vehicle_no: partner.vehicle_no,
            license_no: partner.license_no,
            proof_image: partner.proof_doc_url,
            partner_photo: partner.photo_url
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setNewPartner({
            name: '', mobile: '', password: '', vehicle_no: '', license_no: '', proof_image: '', partner_photo: ''
        });
    };

    const toggleStatus = async (partnerId, type, currentValue) => {
        try {
            const payload = { id: partnerId };
            if (type === 'verify') payload.is_verified = !currentValue;
            if (type === 'active') payload.is_active = !currentValue;

            const { data } = await axios.post('/api/delivery/admin/status', payload);
            if (data.success) {
                toast.success("Status Updated");
                fetchPartners();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    return (
        <div className="p-6 md:p-10 font-sans text-gray-800 min-h-screen bg-gray-50/50">
            {showCamera && (
                <CameraModal onClose={() => setShowCamera(false)} onCapture={handleCameraCapture} />
            )}

            <div className="max-w-7xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Delivery Partners</h2>
                        <p className="text-gray-500 mt-1">Manage your delivery fleet, verification, and performance.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-[#42cbf5] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#1dc1f2] transition-colors shadow-lg active:scale-95"
                    >
                        <Plus size={20} /> Add Partner
                    </button>
                </div>

                {/* LIST */}
                {partners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Truck size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-500">No Delivery Partners Found</h3>
                        <p className="text-sm text-gray-400 mt-1">Add a new partner to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {partners.map(partner => (
                            <PartnerCard
                                key={partner.id}
                                partner={partner}
                                toggleStatus={toggleStatus}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {/* ADD MODAL */}
                <AnimatePresence>
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                            >
                                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                                    <h3 className="text-2xl font-bold text-gray-900">{newPartner.id ? 'Edit Partner' : 'Add New Partner'}</h3>
                                    <button onClick={() => { setShowAddModal(false); resetForm(); }} className="bg-white p-2 rounded-full shadow-sm text-gray-500 hover:text-red-500 transition-colors">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleAddPartner} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-600">Full Name</label>
                                            <input required value={newPartner.name} onChange={e => setNewPartner({ ...newPartner, name: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#42cbf5] outline-none font-bold" placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-600">Mobile Number</label>
                                            <input required value={newPartner.mobile} onChange={e => setNewPartner({ ...newPartner, mobile: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#42cbf5] outline-none font-bold" placeholder="9876543210" />
                                        </div>

                                        {!newPartner.id && (
                                            <div className="space-y-2 col-span-1 md:col-span-2">
                                                <label className="text-sm font-bold text-gray-600">Login Password</label>
                                                <div className="relative">
                                                    <input required type="text" value={newPartner.password} onChange={e => setNewPartner({ ...newPartner, password: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#42cbf5] outline-none font-bold" placeholder="Set a strong password" />
                                                    <p className="text-xs text-gray-400 mt-1 pl-1">
                                                        <span className="font-bold text-[#42cbf5]">Note:</span> Partner will need this password <b>AND</b> an OTP sent to their mobile to login.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-600">Vehicle Number</label>
                                            <input required value={newPartner.vehicle_no} onChange={e => setNewPartner({ ...newPartner, vehicle_no: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#42cbf5] outline-none font-bold" placeholder="TN-01-AB-1234" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-600">License Number</label>
                                            <input required value={newPartner.license_no} onChange={e => setNewPartner({ ...newPartner, license_no: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#42cbf5] outline-none font-bold" placeholder="DL-1234567890" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-600">Partner Photo</label>
                                            <div className="flex gap-2">
                                                <input value={newPartner.partner_photo} onChange={e => setNewPartner({ ...newPartner, partner_photo: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#42cbf5] outline-none font-bold text-sm" placeholder="URL or Capture" />
                                                <button type="button" onClick={() => openCamera('partner_photo')} className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200 transition-colors">
                                                    <Camera size={20} className="text-gray-600" />
                                                </button>
                                            </div>
                                            {newPartner.partner_photo && (
                                                <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                    <img src={newPartner.partner_photo} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-600">ID Proof</label>
                                            <div className="flex gap-2">
                                                <input value={newPartner.proof_image} onChange={e => setNewPartner({ ...newPartner, proof_image: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#42cbf5] outline-none font-bold text-sm" placeholder="URL or Capture" />
                                                <button type="button" onClick={() => openCamera('proof_image')} className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200 transition-colors">
                                                    <Camera size={20} className="text-gray-600" />
                                                </button>
                                            </div>
                                            {newPartner.proof_image && (
                                                <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                    <img src={newPartner.proof_image} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                                        <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                                        <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold bg-[#42cbf5] text-black hover:bg-[#1dc1f2] shadow-lg disabled:opacity-50">
                                            {loading ? 'Processing...' : (newPartner.id ? 'Save Changes' : 'Create Partner')}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

export default DeliveryPartners;
