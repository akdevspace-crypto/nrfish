import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { AppContext } from '../Context/AppContext';

const ContactUs = () => {
    const { products } = useContext(AppContext); // Assuming products are available in AppContext
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        product_id: '',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:8080/api/enquiry/create', formData);
            if (data.success) {
                toast.success("Enquiry sent successfully! We will contact you shortly.");
                setFormData({ name: '', email: '', mobile: '', product_id: '', message: '' });
            } else {
                toast.error(data.message || "Failed to send enquiry");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-32 pb-16 px-4 md:px-12 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">Contact Us</h1>

            <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                {/* Contact Information */}
                <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
                    <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                    <p className="text-gray-500 mb-8">We'd love to hear from you. Our team is always here to chat.</p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-[#42cbf5]/20 p-3 rounded-full text-[#b38f2d]">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Our Location</h3>
                                <p className="text-gray-600">NR Fish Market, 123 Seafood Street, Chennai, India</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-[#42cbf5]/20 p-3 rounded-full text-[#b38f2d]">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Phone Number</h3>
                                <p className="text-gray-600">+91 98765 43210</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-[#42cbf5]/20 p-3 rounded-full text-[#b38f2d]">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Email Address</h3>
                                <p className="text-gray-600">support@nrfishmarket.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enquiry Form */}
                <div className="bg-white p-8 rounded-2xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                            <input required type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#42cbf5] outline-none transition"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                <input required type="email" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#42cbf5] outline-none transition"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                                <input required type="tel" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#42cbf5] outline-none transition"
                                    value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} placeholder="+91..." />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Interested Product (Optional)</label>
                            <select className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#42cbf5] outline-none transition"
                                value={formData.product_id} onChange={e => setFormData({ ...formData, product_id: e.target.value })}>
                                <option value="">Select a product...</option>
                                {products && products.map(product => (
                                    <option key={product.id} value={product.id}>{product.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                            <textarea required rows="4" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#42cbf5] outline-none transition"
                                value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="How can we help you?" />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
                        >
                            {loading ? 'Sending...' : <><Send size={18} /> Send Enquiry</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
