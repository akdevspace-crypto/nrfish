import React, { useState } from 'react';
import { useAppContext } from '../Context/AppContext';

function ProductCard({ product }) {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();
  const [isHovered, setIsHovered] = useState(false);

  return product && (
    <div
      onClick={() => {
        navigate(`/products/${product.category.toLowerCase()}/${product.id}`);
        scrollTo(0, 0);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Compact Dimensions: max-w-[240px], h-[320px], Radius 18-22px
      className="group relative w-full h-[320px] rounded-[22px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)] cursor-pointer transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 border border-gray-100/10"
    >
      {/* 2️⃣ BACKGROUND IMAGE - Full Cover */}
      <img
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        src={product.image && Array.isArray(product.image) && product.image.length > 0 ? product.image[0] : (product.image || 'https://placehold.co/600x800?text=No+Image')}
        alt={product.name}
        onError={(e) => { e.target.src = 'https://placehold.co/600x800?text=No+Image' }}
      />

      {/* 3️⃣ BOTTOM BLUR + GRADIENT OVERLAY */}
      {/* Reduced height to 35-40% for compact card */}
      <div
        className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-[6px] flex flex-col justify-end p-4 transition-all duration-300"
      >
        {/* 4️⃣ PRODUCT TEXT (INSIDE BLUR AREA) */}
        <div className="flex flex-col gap-0.5 mb-12"> {/* Spacing for CTA */}
          {/* FORCE WHITE COLOR */}
          <h3 className="!text-white font-bold text-[18px] leading-tight drop-shadow-md line-clamp-1" style={{ color: '#FFFFFF' }}>
            {product.name}
          </h3>
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              {/* FORCE WHITE COLOR */}
              <span className="!text-white font-bold text-lg" style={{ color: '#FFFFFF' }}>{currency}{product.offerPrice || product.price}</span>
              {product.offerPrice && <span className="text-gray-400 text-[10px] line-through">{currency}{product.price}</span>}
            </div>
            {/* Rating Badge */}
            <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
              <span className="text-[#facc15] text-[10px]">★</span>
              <span className="!text-white text-[10px] font-bold" style={{ color: '#FFFFFF' }}>{product.rating || 4.5}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5️⃣ TOP-LEFT BADGE - Smaller Pill */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        {/* Category Tag - Glassmorphism */}
        <div className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-white/20 uppercase tracking-wider">
          {product.category}
        </div>

        {(product.rating >= 4.5 || product.reviews > 20) && (
          <div className="bg-black/50 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1 w-fit">
            Top Pick
          </div>
        )}
      </div>

      {/* 6️⃣ TOP-RIGHT ICON (Wishlist) */}
      <div className="absolute top-3 right-3">
        <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#42cbf5] hover:text-black transition-all border border-white/10 shadow-sm group-hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* 7️⃣ ADD TO CART BUTTON (BOTTOM) - Compact */}
      <div
        className="absolute bottom-3 left-3 right-3 z-20 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => addToCart(product.id)}
          className="w-full bg-white text-black font-bold text-xs py-2.5 rounded-full hover:bg-[#42cbf5] hover:text-black hover:scale-[1.02] hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 border-none"
        >
          {cartItems?.[product.id] ? "Add Another" : "Add to Cart"}
        </button>
      </div>

    </div>
  );
}

export default ProductCard;
