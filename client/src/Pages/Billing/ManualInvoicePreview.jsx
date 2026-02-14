import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../Context/AppContext';
import { useReactToPrint } from 'react-to-print';
import Invoice from './Invoice';
import toast from 'react-hot-toast';

const ManualInvoicePreview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currency } = useAppContext();
    const componentRef = useRef();

    const order = location.state?.order;

    useEffect(() => {
        if (!order) {
            toast.error("No invoice data found");
            navigate('/billing/manual');
        }
    }, [order, navigate]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Invoice_${order?.order_id || 'Manual'}`,
    });

    if (!order) return null;

    return (
        <div className="flex flex-col h-[95vh] overflow-hidden bg-gray-50/50">
            {/* Header / Toolbar */}
            <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
                <button
                    onClick={() => navigate('/billing/manual')}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <span className="mr-2">&larr;</span> Back to POS
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2 bg-primary text-white font-medium rounded-lg shadow-sm hover:bg-primary-dull transition-all flex items-center gap-2"
                    >
                        <span>Print Invoice</span>
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-gray-100">
                <div className="bg-white shadow-xl rounded-sm w-full max-w-[210mm] min-h-[297mm] p-0 overflow-hidden">
                    <div ref={componentRef}>
                        <Invoice order={order} currency={currency} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualInvoicePreview;
