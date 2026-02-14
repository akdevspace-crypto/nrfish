import React, { useState, useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../Context/AppContext';
import toast from 'react-hot-toast';
import { MapPin, ShoppingCart, User, Menu, X, LogOut, Package, FileText, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar() {
  const [popupVisible, setPopupVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // New state for profile
  const [pincode, setPincode] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const popupRef = useRef(null);
  const profileRef = useRef(null); // New ref for profile

  const {
    user, setUser, setShowUserLogin, getCartCount, axios,
    allowedPincodes, setDeliveryPincode, deliveryPincode
  } = useAppContext();

  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  // SCROLL DETECTION
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validatePincode = () => {
    if (!pincode || pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    // Check if pincode is in allowed list
    if (allowedPincodes.includes(pincode)) {
      setDeliveryPincode(pincode);
      setPopupVisible(false);
      toast.success(`Delivery available in ${pincode}`);
      localStorage.setItem("deliveryPincode", pincode); // Persist
    } else {
      toast.error("Sorry, we do not deliver to this location yet.");
    }
  };

  const logout = async () => {
    try {
      const { data } = await axios.get('/api/user/logout');
      if (data.success) {
        toast.success(data.message);
        setUser(null);
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopupVisible(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    // Refresh zones if empty and popup is visible (legacy logic preserved)
    if (popupVisible && allowedPincodes.length === 0) {
      axios.get('/api/address/zones')
        .then(({ data }) => {
          if (data.success) setAllowedPincodes(data.pincodes);
        })
        .catch(err => console.error("Failed to refresh zones", err));
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupVisible, allowedPincodes, isProfileOpen]);

  // STYLING LOGIC
  const isTransparent = isHome && !scrolled;

  const navClasses = `fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${isTransparent
    ? "bg-transparent py-4"
    : "bg-white/95 backdrop-blur-md shadow-md py-2 border-b border-gray-100"
    }`;

  const textClasses = isTransparent
    ? "text-white hover:text-[#42cbf5]"
    : "text-[#0b0b0b] hover:text-[#42cbf5]";

  const iconClasses = isTransparent
    ? "text-white"
    : "text-[#0b0b0b]";

  // NO BACKGROUND CONTAINER FOR LOGO - Clean Look

  return (
    <>
      <header className={navClasses}>
        <div className="w-full px-6 md:px-12 flex items-center justify-between h-[100px] relative">

          {/* LEFT SECTION - Logo Image */}
          <div className="relative z-[60] flex items-center">
            <NavLink to="/" onClick={() => setOpen(false)}>
              <motion.img
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                src={assets.Logo}
                alt="NR Seafood"
                className={`h-[85px] md:h-[110px] w-auto object-contain transition-all`}
              />
            </NavLink>
          </div>

          {/* CENTER SECTION - Brand Text (Absolute Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[50]">
            <span className={`text-2xl md:text-4xl font-extrabold uppercase tracking-widest whitespace-nowrap drop-shadow-md transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-[#0b0b0b]'}`}>
              NR Fish Market
            </span>
          </div>

          {/* RIGHT SECTION - Navigation & Actions */}
          <div className="flex items-center gap-4 md:gap-8 z-[60]">

            {/* Desktop Navigation Items */}
            <div className={`hidden md:flex items-center gap-8 ${textClasses}`}>
              {/* Products Link */}
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `text-lg font-bold tracking-wide transition-colors drop-shadow-sm ${isActive ? 'text-[#42cbf5]' : ''} hover:text-[#42cbf5]`
                }
              >
                Products
              </NavLink>

              {/* Location Selector */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPopupVisible(!popupVisible)}
                className={`flex items-center gap-3 group text-left px-3 py-2 rounded-xl transition-all ${isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <MapPin className={`w-6 h-6 drop-shadow-md transition-all ${iconClasses}`} strokeWidth={2.5} />
                </motion.div>

                <div className="flex flex-col leading-none">
                  <span className="text-[10px] uppercase text-[#42cbf5] font-extrabold tracking-wider drop-shadow-sm">Delivering to</span>
                  <span className={`text-sm font-bold transition-colors drop-shadow-md ${isTransparent ? 'text-white' : 'text-[#0b0b0b]'}`}>
                    {deliveryPincode || 'Select Location'}
                  </span>
                </div>
              </motion.button>

              {/* User Profile */}
              <div className="relative" ref={profileRef}>
                {user ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 cursor-pointer opacity-90 hover:opacity-100 transition-opacity select-none"
                  >
                    <div className={`w-10 h-10 rounded-full border-2 p-0.5 transition-colors shadow-lg flex items-center justify-center overflow-hidden bg-white ${isTransparent ? 'border-white/20' : 'border-gray-200'}`}>
                      {/* If user has image use it, else utilize Lucide User icon */}
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className={`text-sm font-bold transition-colors drop-shadow-md ${isTransparent ? 'text-white' : 'text-[#0b0b0b]'}`}>
                      {user.name}
                    </span>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 mt-4 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
                        >
                          <div className="bg-[#42cbf5]/10 p-4 border-b border-gray-100">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <div className="py-2">
                            <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0e3b34] font-medium transition-colors flex items-center gap-2 group">
                              <User className="w-4 h-4 group-hover:text-[#42cbf5] transition-colors" />
                              My Profile
                            </button>
                            <button onClick={() => { navigate('/my-orders'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0e3b34] font-medium transition-colors flex items-center gap-2 group">
                              <Package className="w-4 h-4 group-hover:text-[#42cbf5] transition-colors" />
                              My Orders
                            </button>
                            {/* Add Admin Dashboard Link if needed */}


                            <div className="h-px bg-gray-100 my-1"></div>
                            <button onClick={logout} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors flex items-center gap-2 group">
                              <LogOut className="w-4 h-4 group-hover:text-red-600 transition-colors" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserLogin(true)}
                    className={`flex items-center gap-2 text-sm font-bold transition-all border px-5 py-2 rounded-full backdrop-blur-sm shadow-sm ${isTransparent
                      ? 'text-white border-white/30 hover:bg-white/10 hover:text-[#42cbf5]'
                      : 'text-[#0e3b34] border-[#0e3b34] hover:bg-[#0e3b34] hover:text-white'
                      }`}
                  >
                    <User size={16} />
                    <span className="uppercase tracking-wide">Login</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Cart Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/cart')}
              className={`relative w-12 h-12 flex items-center justify-center rounded-full transition-transform group ${isTransparent
                ? 'bg-white/10 text-white hover:bg-[#42cbf5] hover:text-black'
                : 'bg-gray-100 text-[#0b0b0b] hover:bg-[#42cbf5] hover:text-black'
                }`}
            >
              <ShoppingCart className={`w-6 h-6 transition-colors`} strokeWidth={2.5} />
              <AnimatePresence>
                {getCartCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-[#42cbf5] text-[#0b0b0b] text-[11px] font-extrabold min-w-[22px] h-[22px] flex items-center justify-center rounded-full shadow-md border-2 border-white"
                  >
                    {getCartCount()}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* MOBILE MENU TOGGLE */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className={`md:hidden p-2 transition-colors ${textClasses}`}
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-9 h-9 drop-shadow-md" /> : <Menu className="w-9 h-9 drop-shadow-md" />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* SPACER for non-home pages */}
      {!isHome && <div className="h-[90px] w-full bg-white"></div>}

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 bg-white/95 backdrop-blur-xl z-[90] pt-[100px] px-6 h-screen"
          >
            <div className="flex flex-col gap-6 text-[#0b0b0b]">
              <NavLink to="/products" className="text-2xl font-bold hover:text-[#0e3b34] flex items-center gap-3" onClick={() => setOpen(false)}>
                <Package className="text-[#42cbf5]" /> Shop Products
              </NavLink>
              <button onClick={() => { setPopupVisible(true); setOpen(false); }} className="text-left text-xl font-bold text-gray-600 flex items-center gap-3">
                <MapPin className="text-[#42cbf5]" /> Change Location
              </button>
              <button onClick={() => { navigate('/cart'); setOpen(false); }} className="text-left text-xl font-bold text-gray-600 flex items-center gap-3">
                <ShoppingCart className="text-[#42cbf5]" /> Cart ({getCartCount()})
              </button>
              <div className="h-px bg-gray-200 my-2"></div>
              {user ? (
                <>
                  <button onClick={() => { navigate('/my-orders'); setOpen(false); }} className="text-left text-xl font-medium text-gray-800 flex items-center gap-3">
                    <Package className="text-[#42cbf5]" /> My Orders
                  </button>
                  <button onClick={() => { navigate('/seller'); setOpen(false); }} className="text-left text-xl font-medium text-gray-800 flex items-center gap-3">
                    <LayoutDashboard className="text-[#42cbf5]" /> Seller Dashboard
                  </button>
                  <button onClick={logout} className="text-left text-xl font-medium text-red-600 flex items-center gap-3">
                    <LogOut className="text-red-500" /> Logout
                  </button>
                </>
              ) : (
                <button onClick={() => { setShowUserLogin(true); setOpen(false); }} className="w-full bg-[#0e3b34] text-white py-4 rounded-xl text-center font-bold text-lg shadow-lg flex items-center justify-center gap-2">
                  <User /> Login / Sign Up
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Popup */}
      <AnimatePresence>
        {popupVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              ref={popupRef}
              className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-2 text-[#0e3b34] flex items-center gap-2">
                <MapPin className="text-[#42cbf5]" /> Enter Pincode
              </h3>
              <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full border-2 border-gray-200 p-3 mb-4 rounded-xl focus:border-[#0e3b34] outline-none font-semibold text-lg text-center tracking-widest" placeholder="560001" maxLength={6} />
              <button onClick={validatePincode} className="w-full bg-[#0e3b34] hover:bg-[#092a25] text-white py-3.5 rounded-xl font-bold tracking-wide transition-colors shadow-lg">CHECK DELIVERY</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
