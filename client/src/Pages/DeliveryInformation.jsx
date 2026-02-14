import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../Context/AppContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, CheckCircle, Truck, Package, Clock } from 'lucide-react';

const DeliveryInformation = () => {
    const { user } = useContext(AppContext);
    const navigate = useNavigate();

    // Removed forced login check


    const steps = [
        { title: "Order Placed", desc: "Customer places order through NR Fish Market website/app.", icon: CheckCircle },
        { title: "Order Sent to Admin", desc: "Order details instantly reach Admin dashboard.", icon: Clock },
        { title: "Waiting for Confirmation", desc: "Order status: Pending. Customer sees 'Waiting for confirmation'.", icon: Clock },
        { title: "Order Confirmed", desc: "Admin verifies availability and confirms. Notification sent.", icon: CheckCircle },
        { title: "Preparation Stage", desc: "Fish/meat is freshly cut or prepared as per order. Hygiene maintained.", icon: Package },
        { title: "Packing", desc: "Vacuum / ice-packed in food-grade packaging. Sealed and labeled.", icon: Package },
        { title: "Out for Delivery", desc: "Assigned to delivery partner. Live tracking enabled.", icon: Truck },
        { title: "Shipping in Progress", desc: "Order is en route to customer location.", icon: Truck },
        { title: "Destination Reached", desc: "Delivery agent arrives at delivery location.", icon: MapPin },
        { title: "Waiting for Customer", desc: "Delivery agent waits for handover.", icon: User },
        { title: "Payment Verification", desc: "OTP verification (COD only) before handover.", icon: CheckCircle },
        { title: "Order Delivered", desc: "Customer receives order.", icon: CheckCircle },
        { title: "Order Completed", desc: "Transaction closed successfully.", icon: CheckCircle }
    ];

    return (
        <div className="pt-32 pb-16 px-4 md:px-12 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">Delivery Information</h1>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* User Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm h-fit sticky top-32">
                    <h2 className="text-xl font-bold mb-6 border-b pb-2">Your Delivery Details</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Name</p>
                                <p className="font-semibold">{user?.name || "Guest User"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Mobile</p>
                                <p className="font-semibold">{user?.phone || "Not provided"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500">Address</p>
                                {/* Access address from user data if available, or just show a placeholder/fetch if needed */}
                                <p className="font-semibold text-gray-700">{user?.address || 'Your default delivery address'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold mb-6 border-b pb-2">Delivery Workflow</h2>
                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-8 py-2">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                <span className="absolute -left-[41px] bg-white border-2 border-gray-200 rounded-full p-1">
                                    <step.icon size={16} className="text-[#42cbf5]" />
                                </span>
                                <h3 className="font-bold text-gray-800">{step.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryInformation;
