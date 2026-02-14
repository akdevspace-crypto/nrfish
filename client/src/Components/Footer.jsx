import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import AssurancesContent from './overlay content/Assurance';
import WhyUsContent from './overlay content/Whyus';
import PartnerContent from './overlay content/Partner';
import {
  Search,
  Menu,
  ChevronRight,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Home,
  Building,
  Zap,
  Shield,
  Factory,
  Lightbulb,
  Volume2,
  VolumeX
} from 'lucide-react';

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 text-left">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl animate-fade-in-up">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

function Footer() {

  const navigate = useNavigate();
  const [overlayContent, setOverlayContent] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'refund', 'payment'
  const overlayRef = useRef(null);



  useEffect(() => {
    function handleClickOutsideOverlay(e) {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setOverlayContent(null);
      }
    }

    if (overlayContent) {
      document.addEventListener("mousedown", handleClickOutsideOverlay);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideOverlay);
    };
  }, [overlayContent]);

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 relative bg-[#0f3d2e] font-sans">
      {/* Wave SVG - Colored to match page bg */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 z-10 pointer-events-none">
        <svg className="relative block w-[calc(110%+1.3px)] h-[80px]" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#ffffff" d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,101 L0,101 Z"></path>
        </svg>
      </div>

      <div className="flex flex-col md:flex-row items-start justify-between gap-12 py-16 pt-32 border-b border-white/10 text-white relative z-20">

        {/* Logo and Description */}
        <div className="md:w-1/3">
          <img className="w-48 mb-6 brightness-110" src={assets.Logo} alt="NR Seafoods Logo" />
          <p className="leading-relaxed text-[15px] text-white">
            At NR Seafoods, we deliver the ocean's finest catch and premium cuts straight to your kitchen.
            Sourced daily for unmatched freshness and handled with care.
            <span className="block mt-2 text-[#42cbf5] font-medium">Taste the quality in every bite.</span>
          </p>
        </div>

        {/* Footer Links Section */}
        <div className="flex flex-wrap justify-between w-full md:w-[60%] gap-8 md:gap-0">

          {/* Quick Links */}
          <div className="w-1/2 md:w-auto">
            <h3 className="font-bold text-lg text-[#42cbf5] mb-6 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              {[{ name: 'Home', path: '/' }, { name: 'Best Sellers', path: '/best-sellers' }, { name: 'Offers & Deals', path: '/offers' }, { name: 'Terms & Conditions', path: '/terms-and-conditions' }, { name: 'FAQs', path: '/faqs' }].map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => { navigate(link.path); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-[#42cbf5] hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1 group w-full text-left font-medium text-white"
                  >
                    <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300 text-[#42cbf5]">•</span>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Need help? */}
          <div className="w-1/2 md:w-auto">
            <h3 className="font-bold text-lg text-[#42cbf5] mb-6 uppercase tracking-wider">Support</h3>
            <ul className="space-y-3">
              <li><button onClick={() => navigate('/delivery-information')} className="hover:text-[#42cbf5] hover:translate-x-1.5 transition-all duration-300 w-full text-left font-medium text-white">Delivery Information</button></li>
              <li><button onClick={() => setActiveModal('refund')} className="hover:text-[#42cbf5] hover:translate-x-1.5 transition-all duration-300 w-full text-left font-medium text-white">Return & Refund</button></li>
              <li><button onClick={() => setActiveModal('payment')} className="hover:text-[#42cbf5] hover:translate-x-1.5 transition-all duration-300 w-full text-left font-medium text-white">Payment Methods</button></li>
              <li><button onClick={() => navigate('/track-order')} className="hover:text-[#42cbf5] hover:translate-x-1.5 transition-all duration-300 w-full text-left font-medium text-white">Track Order</button></li>
              <li><button onClick={() => navigate('/contact-us')} className="hover:text-[#42cbf5] hover:translate-x-1.5 transition-all duration-300 w-full text-left font-medium text-white">Contact Us</button></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="w-full md:w-auto mt-6 md:mt-0">
            <h3 className="font-bold text-lg text-[#42cbf5] mb-6 uppercase tracking-wider">Connect</h3>
            <div className='flex gap-4'>
              {[Facebook, Twitter, Linkedin, Youtube].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0f3d2e] hover:bg-[#42cbf5] hover:text-[#0b0b0b] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                  <Icon size={18} />
                </a>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Footer Bottom */}
      <div className="py-6 flex flex-col md:flex-row items-center justify-between text-xs md:text-sm text-gray-500">
        <p>Copyright {new Date().getFullYear()} © <span className="text-gray-300 font-bold">NR SEAFOODS</span>. All Rights Reserved.</p>
        <div className="flex gap-6 mt-2 md:mt-0">
          <button className="hover:text-[#42cbf5] transition-colors">Privacy Policy</button>
          <button className="hover:text-[#42cbf5] transition-colors">Terms of Service</button>
        </div>
      </div>




      {overlayContent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex justify-center items-center px-4">
          <div ref={overlayRef} className="bg-white max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg relative">
            <h2 className="text-xl font-bold mb-3">
              {overlayContent === 't&c' && 'Our Assurances'}
              {overlayContent === 'FAQ' && 'Why NR Sea Foods'}
              {overlayContent === 'D&I' && 'Partner With Us'}
            </h2>
            <div className="text-gray-600">
              {overlayContent === 't&c' && <AssurancesContent />}
              {overlayContent === 'FAQ' && <WhyUsContent />}
              {overlayContent === 'D&I' && <PartnerContent />}
            </div>
            <button
              onClick={() => setOverlayContent(null)}
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-black"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* --- NEW MODALS --- */}

      <Modal isOpen={activeModal === 'refund'} onClose={() => setActiveModal(null)} title="Return & Refund Policy">
        <div className="space-y-6 text-gray-700">
          <div>
            <h3 className="font-bold text-lg mb-2 text-black">Refund Policy</h3>
            <p>We strive to deliver the freshest seafood. However, if you are unsatisfied with the quality, you may request a return at the time of delivery.</p>
          </div>
          <div>
            <h4 className="font-bold mb-1">Online Payment Refunds</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Refunds are processed within 48 hours of approval.</li>
              <li>Amount will be credited to your original payment method within 5–7 working days, depending on your bank's processing time.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-1">Cash on Delivery (COD) Refunds</h4>
            <p>For COD orders, refunds will be credited as <strong>Store Credit</strong> to your NR Fish Market wallet, which can be used for future orders instantly.</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'payment'} onClose={() => setActiveModal(null)} title="Payment Methods">
        <div className="space-y-6 text-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-xl text-center hover:bg-gray-50">
              <span className="text-2xl block mb-2">💳</span>
              <h3 className="font-bold">Online Payment</h3>
              <p className="text-xs text-gray-500 mt-1">Credit/Debit Cards, Netbanking</p>
            </div>
            <div className="p-4 border rounded-xl text-center hover:bg-gray-50">
              <span className="text-2xl block mb-2">💵</span>
              <h3 className="font-bold">Cash on Delivery</h3>
              <p className="text-xs text-gray-500 mt-1">Pay at your doorstep</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-2">Secure Transactions</h4>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Online Payments:</strong> Processed through secure, encrypted gateways. We do not store your card details. Instant order confirmation.</li>
              <li><strong>UPI Payments:</strong> We support GPay, PhonePe, Paytm, and other BHIM UPI apps for instant transfers.</li>
              <li><strong>Cash on Delivery:</strong> Pay cash when the order arrives. An OTP verification may be required at the time of delivery for high-value orders.</li>
            </ul>
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default Footer;
