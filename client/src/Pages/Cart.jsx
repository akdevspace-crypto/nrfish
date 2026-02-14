import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../Context/AppContext';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';
import { Tag, X, CheckCircle, Percent, Gift, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { load } from '@cashfreepayments/cashfree-js';

function Cart() {
  const { products, currency, cartItems, removeFromCart, updateCartItem, getCartCount,
    navigate, getCartAmount, axios, user, setCartItems, allowedPincodes } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");
  const [loading, setLoading] = useState(false);

  // Coupon & Offer State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [activeOffer, setActiveOffer] = useState(null); // New Offer State
  const [activeOfferDiscount, setActiveOfferDiscount] = useState(0);

  const [discountAmount, setDiscountAmount] = useState(0); // Total Discount (Coupon OR Offer)
  const [isSlotBased, setIsSlotBased] = useState(false);
  const [deliverySlot, setDeliverySlot] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Cashfree SDK Initialization
  const cashfreeRef = useRef(null);
  useEffect(() => {
    const initializeSDK = async () => {
      cashfreeRef.current = await load({
        mode: "sandbox" // Change to "production" when live
      });
    }
    initializeSDK();
  }, []);

  function getCart() {
    let tempArray = [];
    for (const key in cartItems) {
      if (cartItems[key] > 0) {
        const product = products.find((item) => item.id === key);
        if (product) {
          tempArray.push({
            ...product,
            quantity: cartItems[key]
          });
        }
      }
    }
    setCartArray(tempArray);
  }

  async function getUserAddress() {
    try {
      const { data } = await axios.get('/api/address/get');
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  // --- NEW: VALIDATE OFFERS (AUTO-APPLY) ---
  const checkOffers = async () => {
    if (getCartAmount() === 0) {
      setActiveOffer(null);
      setActiveOfferDiscount(0);
      return;
    };

    try {
      const { data } = await axios.post('/api/cart/validate-offers', {
        cartItems: cartArray,
        cartTotal: getCartAmount()
      });

      if (data.success && data.offer) {
        // Priority Rule: If Combo Offer, remove any Coupon
        if (data.offer.type === 'COMBO') {
          if (appliedCoupon) {
            setAppliedCoupon(null);
            setCouponCode("");
            toast("Coupon removed as Combo Offer is better!", { icon: '⚠️' });
          }
        }

        setActiveOffer(data.offer);
        setActiveOfferDiscount(data.discountAmount);
        // toast.success(data.message, { id: 'offer-toast' }); // Avoid spamming
      } else {
        setActiveOffer(null);
        setActiveOfferDiscount(0);
      }
    } catch (error) {
      console.error("Offer check failed", error);
    }
  };

  async function applyCoupon() {
    if (!couponCode.trim()) return toast.error("Enter a coupon code");
    if (!user) return toast.error("Please login to apply coupons");

    // Check exclusion
    if (activeOffer && activeOffer.type === 'COMBO') {
      return toast.error("Coupons cannot be combined with Combo Offers");
    }

    setCouponLoading(true);
    try {
      const { data } = await axios.post("/api/coupon/validate", {
        code: couponCode,
        cartItems: cartArray,
        cartTotal: getCartAmount(),
        userId: user.id
      });

      if (data.success) {
        setAppliedCoupon({
          code: data.couponCode,
          type: data.type,
          percentage: data.discountPercentage
        });
        // Recalculate based on total (minus offer discount if allowed? typically no stacking)
        // Implementation: We use ONE discount source for simplicity in calculation below
        toast.success(data.message);
        triggerConfetti();
        setCouponCode("");
      }
    } catch (err) {
      setAppliedCoupon(null);
      toast.error(err.response?.data?.message || "Invalid Coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#42cbf5', '#ffffff', '#000000']
    });
  };

  async function placeOrder() {
    try {
      if (Object.keys(cartItems).length === 0) {
        return toast.error("Your cart is empty.");
      }
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }
      if (isSlotBased && !deliverySlot) {
        return toast.error("Please select a delivery time slot");
      }

      setLoading(true);

      const orderPayload = {
        userId: user.id,
        items: cartArray.map(item => ({
          product: item.id,
          quantity: item.quantity
        })),
        address: selectedAddress.id,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        // Send offer details if needed by backend, or backend re-calculates
        offersApplied: activeOffer ? [activeOffer.id] : []
      };

      if (isSlotBased) {
        orderPayload.deliverySlot = deliverySlot;
      }

      if (paymentOption === "COD") {
        if (!allowedPincodes.includes(selectedAddress.pincode.trim())) {
          toast.error("Sorry, we don't deliver to this pincode.");
          setLoading(false);
          return;
        }

        const { data } = await axios.post('/api/order/cod', orderPayload);

        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate('/my-orders');
          scrollTo(0, 0);
        } else {
          toast.error(data.message);
        }
        setLoading(false);
      } else if (paymentOption === "Online") {
        // Cashfree Payment Logic
        // 1. Create Order in Backend
        const { data } = await axios.post('/api/order/place', {
          ...orderPayload,
          paymentMethod: 'cashfree' // Trigger 'Online' payment type in backend
        });

        if (data.success) {
          const { order } = data;

          // 2. Initialize Payment Gateway Session
          const { data: payData } = await axios.post('/api/payment/initialize', { orderId: order.id });

          if (payData.success) {
            const checkoutOptions = {
              paymentSessionId: payData.payment_session_id,
              redirectTarget: "_self",
            };

            if (!cashfreeRef.current) {
              toast.error("Payment SDK not loaded. Please refresh.");
              setLoading(false);
              return;
            }

            cashfreeRef.current.checkout(checkoutOptions).then(async (result) => {
              if (result.error) {
                toast.error("Payment Failed or Cancelled");
                console.log("Cashfree Error:", result.error);
                setLoading(false);
              }
              if (result.paymentDetails) {
                // 3. Verify Payment
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
        } else {
          toast.error(data.message);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  useEffect(() => {
    if (cartArray.length > 0) {
      checkOffers();
    } else {
      setActiveOffer(null);
      setActiveOfferDiscount(0);
    }
  }, [cartArray]); // Re-check when cart structure changes

  // Update Total Discount Effect
  useEffect(() => {
    let totalDiscount = 0;
    const cartTotal = getCartAmount();

    // 1. Offer Discount
    if (activeOffer) {
      totalDiscount += activeOfferDiscount;
    }

    // 2. Coupon Discount (Only if NO Combo offer)
    if (appliedCoupon && (!activeOffer || activeOffer.type !== 'COMBO')) {
      const couponVal = (cartTotal * appliedCoupon.percentage) / 100;
      totalDiscount += couponVal;
    }

    setDiscountAmount(totalDiscount);

    // Auto remove coupon if combo appears (Strict rule)
    if (activeOffer && activeOffer.type === 'COMBO' && appliedCoupon) {
      setAppliedCoupon(null);
    }

  }, [activeOffer, activeOfferDiscount, appliedCoupon, cartItems, products]);


  useEffect(() => {
    if (user) {
      getUserAddress();
    }
  }, [user]);

  // Auto-Apply Coupon for New Users (Only if no Offer blocks it)
  useEffect(() => {
    const checkAutoCoupon = async () => {
      // Only check if logged in, has items, no coupon, AND no conflicting offer
      if (user && !appliedCoupon && getCartAmount() > 0 && (!activeOffer || activeOffer.type !== 'COMBO')) {
        try {
          const { data } = await axios.post('/api/coupon/user-applicable', {
            userId: user.id,
            cartTotal: getCartAmount()
          });

          if (data.success && data.coupon) {
            setAppliedCoupon({
              code: data.coupon.code,
              type: data.coupon.type,
              percentage: data.coupon.discountPercentage
            });
            toast.success(data.coupon.message, { icon: '🎉' });
            triggerConfetti();
          }
        } catch (error) {
          console.error("Auto-apply error:", error);
        }
      }
    };

    const timer = setTimeout(() => {
      checkAutoCoupon();
    }, 1500); // Slight delay

    return () => clearTimeout(timer);

  }, [user, cartItems, activeOffer]); // simplified deps

  if (!cartItems || Object.keys(cartItems).length === 0 || getCartCount() === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl">🛒</div>
        <h1 className='text-2xl font-semibold text-gray-800'>Your cart is empty</h1>
        <p className="text-gray-500">Looks like you haven't added anything yet.</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 px-8 py-3 bg-[#42cbf5] text-black rounded-full font-bold hover:bg-[#34a8cc] transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 font-sans">

      {/* PAGE TITLE */}
      <div className="mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400">
          Secure Checkout
        </p>
        <h1 className="text-4xl font-semibold text-gray-900">
          Review & Place Order
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {getCartCount()} items ready for checkout
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-20">

        {/* LEFT FLOW */}
        <div className="space-y-16">

          {/* STEP 1 — ITEMS */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#42cbf5] text-black font-medium">
                1
              </span>
              <h2 className="text-2xl font-semibold">Your Items</h2>
            </div>

            {/* OFFER BADGE in Cart List Header */}
            <AnimatePresence>
              {activeOffer && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl flex items-center gap-3 border ${activeOffer.type === 'COMBO' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-purple-50 border-purple-200 text-purple-800'}`}
                >
                  {activeOffer.type === 'COMBO' ? <Gift size={20} /> : <Zap size={20} />}
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{activeOffer.title} Applied!</h3>
                    <p className="text-xs opacity-90">{activeOffer.type === 'COMBO' ? 'Combo savings unlocked!' : 'Offer discount applied.'}</p>
                  </div>
                  <span className="font-bold text-lg">
                    -{currency}{activeOfferDiscount.toFixed(0)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              {cartArray.map((product, index) => (
                <div
                  key={index}
                  className="flex gap-6 p-6 rounded-2xl bg-white border border-gray-200"
                >
                  {/* IMAGE */}
                  <div
                    onClick={() => {
                      navigate(`/products/${product.category.toLowerCase()}/${product.id}`);
                      scrollTo(0, 0);
                    }}
                    className="w-24 h-24 rounded-xl overflow-hidden cursor-pointer border"
                  >
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 space-y-1">
                    <p className="text-lg font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Weight: {product.weight || "N/A"}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-500">Qty</span>
                      <select
                        value={cartItems[product.id]}
                        onChange={(e) =>
                          updateCartItem(product.id, Number(e.target.value))
                        }
                        className="px-3 py-1 border rounded-full outline-none"
                      >
                        {Array(
                          cartItems[product.id] > 9 ? cartItems[product.id] : 9
                        )
                          .fill("")
                          .map((_, i) => (
                            <option key={i} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* PRICE + REMOVE */}
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-lg font-semibold">
                      {currency}{product.offer_price * product.quantity}
                    </p>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                navigate("/products");
                scrollTo(0, 0);
              }}
              className="text-[#42cbf5] font-bold text-sm hover:underline"
            >
              ← Continue shopping
            </button>
          </section>

          {/* STEP 2 — DELIVERY */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#42cbf5] text-black font-medium">
                2
              </span>
              <h2 className="text-2xl font-semibold">Delivery Details</h2>
            </div>

            <div className="bg-gray-50 border rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-600 max-w-md">
                  {selectedAddress
                    ? `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}, ${selectedAddress.phone}, ${selectedAddress.pincode}`
                    : "No address selected"}
                </p>

                <button
                  onClick={() => setShowAddress(!showAddress)}
                  className="text-[#42cbf5] text-sm font-bold"
                >
                  Change
                </button>
              </div>

              {showAddress && (
                <div className="border rounded-xl bg-white overflow-hidden">
                  {addresses.map((address, index) => (
                    <p
                      key={index}
                      onClick={() => {
                        setSelectedAddress(address);
                        setShowAddress(false);
                      }}
                      className="p-3 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {address.address}, {address.city}, {address.state},{" "}
                      {address.country}, {address.phone}, {address.pincode}
                    </p>
                  ))}
                  <p
                    onClick={() => navigate("/add-address")}
                    className="p-3 text-center text-[#42cbf5] hover:bg-blue-50 cursor-pointer font-medium"
                  >
                    + Add new address
                  </p>
                </div>
              )}

              <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSlotBased}
                  onChange={() => setIsSlotBased(!isSlotBased)}
                  className="rounded border-gray-300 text-[#42cbf5] focus:ring-[#42cbf5]"
                />
                Choose delivery time slot
              </label>

              {isSlotBased && (
                <CustomDropdown
                  value={deliverySlot}
                  onChange={setDeliverySlot}
                  placeholder="Select time slot"
                  options={[
                    { value: "5-6 PM", label: "5-6 PM" },
                    { value: "6-7 PM", label: "6-7 PM" },
                    { value: "7-8 PM", label: "7-8 PM" },
                    { value: "8-9 PM", label: "8-9 PM" },
                  ]}
                />
              )}
            </div>
          </section>
        </div>

        {/* RIGHT SUMMARY */}
        <aside className="h-fit sticky top-24 border border-gray-200 rounded-3xl p-8 bg-white space-y-8 shadow-sm">

          <h3 className="text-2xl font-semibold">Payment Summary</h3>

          <CustomDropdown
            value={paymentOption}
            onChange={setPaymentOption}
            options={[
              { value: "COD", label: "Cash On Delivery" },
              { value: "Online", label: "Online Payment" }
            ]}
          />

          {/* COUPON SECTION */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Tag size={16} /> Have a coupon?
              </label>
              {activeOffer && activeOffer.type === 'COMBO' && (
                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">
                  Disabled (Combo Active)
                </span>
              )}
            </div>
            <AnimatePresence mode="wait">
              {!appliedCoupon ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2"
                >
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder={activeOffer && activeOffer.type === 'COMBO' ? "Offer applied" : "Enter code"}
                    className={`flex-1 px-4 py-3 border rounded-xl outline-none font-mono uppercase transition-colors
                        ${activeOffer && activeOffer.type === 'COMBO'
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-200 focus:border-[#42cbf5]'}`}
                    disabled={couponLoading || (activeOffer && activeOffer.type === 'COMBO')}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode || (activeOffer && activeOffer.type === 'COMBO')}
                    className="px-6 py-3 rounded-xl bg-black text-white font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-green-800 font-bold flex items-center gap-2">
                      <CheckCircle size={16} className="fill-green-600 text-white" />
                      {appliedCoupon.code} Applied
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {appliedCoupon.percentage}% Savings
                    </p>
                  </div>
                  <button onClick={removeCoupon} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <X size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>{currency}{getCartAmount()}</span>
            </p>
            <p className="flex justify-between">
              <span>Tax (2%)</span>
              <span>{currency}{(getCartAmount() * 0.02).toFixed(2)}</span>
            </p>

            <AnimatePresence>
              {discountAmount > 0 && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between text-green-600 font-bold text-base bg-green-50 p-2 rounded-lg"
                >
                  <span className="flex items-center gap-1"><Percent size={14} /> Total Savings</span>
                  <span>-{currency}{discountAmount.toFixed(2)}</span>
                </motion.p>
              )}
            </AnimatePresence>

            <div className="h-px bg-gray-200 my-2"></div>
            <p className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>
                {currency}
                {Math.max(0, (getCartAmount() + getCartAmount() * 0.02 - discountAmount)).toFixed(2)}
              </span>
            </p>
          </div>

          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[#42cbf5] text-black text-lg font-bold hover:bg-[#34a8cc] shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </div>
            ) : (
              paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"
            )}
          </button>

        </aside>
      </div>
    </div>
  );
}

// Custom Dropdown Component matching Navbar Profile style
function CustomDropdown({ options, value, onChange, placeholder = "Select option", icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button" // Prevent form submission
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 outline-none
          ${isOpen ? 'border-[#42cbf5] ring-2 ring-[#42cbf5]/20 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'}
        `}
      >
        <span className={`font-medium ${value ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedLabel}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Navbar Profile Style */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[50] animate-in fade-in slide-in-from-top-2">
          <div className="py-1 max-h-[240px] overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors
                  ${value === option.value
                    ? 'bg-[#42cbf5]/10 text-black'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#42cbf5]'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
