
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../Context/AppContext';
import toast from 'react-hot-toast';

function Verify() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { axios } = useAppContext();

    // URL: /verify?order_id=ORDER_123_456
    // Cashfree returns 'order_id' or 'cf_id' depending on config, but standard is order_id of their system if we passed it
    // In paymentController we set return_url: `http.../verify?order_id={order_id}`
    const orderId = searchParams.get("order_id");

    useEffect(() => {
        const verifyPayment = async () => {
            if (!orderId) {
                toast.error("Invalid Request");
                navigate('/my-orders');
                return;
            }

            try {
                const { data } = await axios.post('/api/payment/verify', { orderId });

                if (data.success) {
                    toast.success("Payment Verified Successfully!");
                    navigate('/my-orders');
                } else {
                    toast.error("Payment Verification Failed or Pending");
                    navigate('/my-orders');
                }
            } catch (error) {
                console.error("Verification Error:", error);
                toast.error(error.response?.data?.message || "Verification Failed");
                navigate('/my-orders');
            }
        };

        verifyPayment();
    }, [orderId, axios, navigate]);

    return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center gap-4'>
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#42cbf5] rounded-full animate-spin"></div>
            <h2 className='text-xl text-gray-700 font-semibold'>Verifying Payment...</h2>
            <p className='text-gray-500'>Please do not close this window.</p>
        </div>
    );
}

export default Verify;
