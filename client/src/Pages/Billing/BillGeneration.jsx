import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import Invoice from './Invoice';

const BillGeneration = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { axios, currency } = useAppContext();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef();

    const fetchOrderDetails = async () => {
        try {
            const { data } = await axios.get('/api/order/seller'); // Fetch all and filter
            if (data.success) {
                const foundOrder = data.orders.find(o => o.order_id === orderId);
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    toast.error("Order not found");
                    navigate('/seller/billing');
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Invoice_${orderId}`,
    });

    if (loading) return <div className="p-10 text-center">Loading Bill Details...</div>;
    if (!order) return <div className="p-10 text-center">Order Not Found</div>;

    // Calculate Totals
    const subtotal = order.amount; // Assuming amount is total for now, can be recalculated from items
    const taxRate = 0.05; // 5% GST example
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount; // Just an example calculation

    return (
        <div className="flex flex-col h-[95vh] overflow-hidden bg-gray-50/50">
            {/* Header Actions */}
            <div className="flex justify-between items-center p-6 bg-white border-b border-gray-200">
                <button onClick={() => navigate('/seller/billing')} className="text-gray-500 hover:text-gray-800">
                    &larr; Back to Dashboard
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark shadow-sm transition-all"
                    >
                        Print Invoice
                    </button>
                    {/* Add download PDF logic later */}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex justify-center">
                {/* Invoice Preview Container */}
                <div className="bg-white shadow-lg rounded-sm w-full max-w-[210mm] min-h-[297mm] p-10 print:shadow-none" ref={componentRef}>
                    <Invoice order={order} currency={currency} />
                </div>
            </div>
        </div>
    );
};

export default BillGeneration;
