
import React, { useState } from 'react';
import { useAppContext } from '../Context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { load } from '@cashfreepayments/cashfree-js';

function PlaceOrder() {
    const {
        products, currency, cartItems, getCartAmount,
        navigate: appNavigate, axios, user, allowedPincodes, setCartItems, token, backendUrl
    } = useAppContext();

    const navigate = useNavigate();

    const [method, setMethod] = useState('cod');

    const cartAmount = getCartAmount();
    const taxAmount = cartAmount * 0.05; // 5%
    const finalAmount = cartAmount + taxAmount;

    // Load Cashfree SDK
    let cashfree;
    const initializeSDK = async () => {
        cashfree = await load({
            mode: "sandbox" // Change to "production" when live
        });
    }
    initializeSDK();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        phone: ''
    });

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setFormData(data => ({ ...data, [name]: value }));
    };

    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async () => {
        try {
            if (!allowedPincodes.includes(formData.pincode)) {
                toast.error("Sorry, we do not deliver to this pincode.");
                return;
            }

            if (!formData.street || !formData.city || !formData.state || !formData.pincode || !formData.phone) {
                toast.error("Please fill all delivery details.");
                return;
            }

            setLoading(true);

            let orderItems = [];
            for (const itemId in cartItems) {
                if (cartItems[itemId] > 0) {
                    const itemInfo = products.find(product => product.id === itemId);
                    if (itemInfo) {
                        orderItems.push({
                            product: itemInfo.id,
                            quantity: cartItems[itemId]
                        });
                    }
                }
            }

            const addressData = {
                ...formData,
                address: formData.street,
                first_name: formData.firstName,
                last_name: formData.lastName
            };

            // Step 1: Place Order in DB
            const { data } = await axios.post('/api/order/place', {
                items: orderItems,
                address: JSON.stringify(addressData),
                paymentMethod: method // 'cashfree' or 'cod'
            });

            if (data.success) {
                const { order } = data;

                if (method === 'cod') {
                    setCartItems({});
                    toast.success("Order Placed Successfully");
                    navigate('/my-orders');
                } else if (method === 'cashfree') {
                    // Step 2: Initialize Cashfree Payment
                    const { data: payData } = await axios.post('/api/payment/initialize', { orderId: order.id });

                    if (payData.success) {
                        const checkoutOptions = {
                            paymentSessionId: payData.payment_session_id,
                            redirectTarget: "_modal",
                        };

                        if (!cashfree) {
                            toast.error("Cashfree SDK not loaded");
                            setLoading(false);
                            return;
                        }

                        cashfree.checkout(checkoutOptions).then(async (result) => {
                            if (result.error) {
                                toast.error("Payment Failed or Cancelled");
                                console.log("Cashfree Error:", result.error);
                                setLoading(false);
                            }
                            if (result.redirect) {
                                console.log("Redirecting");
                            }
                            if (result.paymentDetails) {
                                try {
                                    const { data: verifyData } = await axios.post('/api/payment/verify', {
                                        orderId: payData.order_id
                                    });

                                    if (verifyData.success) {
                                        setCartItems({});
                                        toast.success("Payment Successful!");
                                        navigate('/my-orders');
                                    } else {
                                        toast.error("Verification Pending/Failed");
                                        navigate('/my-orders');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    toast.error("Verification Error");
                                    navigate('/my-orders');
                                } finally {
                                    setLoading(false);
                                }
                            }
                        });

                    } else {
                        toast.error("Payment Initialization Failed");
                        setLoading(false);
                    }
                }
            } else {
                toast.error(data.message);
                setLoading(false);
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>

            {/* ---------------- LEFT SIDE: DELIVERY FORM ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3'>
                    <h2 className='text-gray-500 uppercase tracking-widest'>Delivery Information</h2>
                </div>
                <div className='flex gap-3'>
                    <input required name='firstName' onChange={onChangeHandler} value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                    <input required name='lastName' onChange={onChangeHandler} value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                </div>
                <input required name='email' onChange={onChangeHandler} value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                <input required name='street' onChange={onChangeHandler} value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
                <div className='flex gap-3'>
                    <input required name='city' onChange={onChangeHandler} value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
                    <input required name='state' onChange={onChangeHandler} value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
                </div>
                <div className='flex gap-3'>
                    <input required name='pincode' onChange={onChangeHandler} value={formData.pincode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Pincode' />
                    <input required name='country' onChange={onChangeHandler} value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
                </div>
                <input required name='phone' onChange={onChangeHandler} value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
            </div>

            {/* ---------------- RIGHT SIDE: CART TOTALS ---------------- */}
            <div className='mt-8'>
                <div className='min-w-80'>
                    <div className='text-2xl'>
                        <h2 className='text-gray-500 uppercase tracking-widest'>Cart Totals</h2>
                    </div>
                    <div className='flex flex-col gap-2 mt-2 text-sm'>
                        <div className='flex justify-between'>
                            <p>Subtotal</p>
                            <p>{currency} {cartAmount}.00</p>
                        </div>
                        <hr />
                        <div className='flex justify-between'>
                            <p>Shipping Fee</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className='flex justify-between font-bold'>
                            <p>Total</p>
                            <p>{currency} {finalAmount}.00</p>
                        </div>
                    </div>
                </div>

                <div className='mt-12'>
                    <div className='text-2xl'>
                        <h2 className='text-gray-500 uppercase tracking-widest'>Payment Method</h2>
                    </div>

                    {/* PAYMENT METHODS SELECTION */}
                    <div className='flex gap-3 flex-col lg:flex-row mt-4'>
                        <div onClick={() => setMethod('cashfree')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${method === 'cashfree' ? 'border-green-400 bg-green-50' : ''}`}>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cashfree' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>Cashfree (UPI, Cards)</p>
                        </div>
                        <div onClick={() => setMethod('cod')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${method === 'cod' ? 'border-green-400 bg-green-50' : ''}`}>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-black' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>Cash on Delivery</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button disabled={loading} onClick={onSubmitHandler} className='bg-black text-white font-bold px-16 py-3 text-sm rounded-md hover:bg-gray-800 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed'>
                            {loading ? 'PROCESSING...' : (method === 'cod' ? 'PLACE ORDER' : 'PROCEED TO PAY')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlaceOrder
