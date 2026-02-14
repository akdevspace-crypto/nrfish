import React, { useEffect, useState } from 'react';
import { useAppContext } from '../Context/AppContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function ProductDetails() {
  const { products, currency, addToCart, removeFromCart, cartItems, getCartAmount } = useAppContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH PRODUCT DETAILS ---
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/product/${id}`);
        if (data.success) {
          setProduct(data.product);
          setThumbnail(data.product.image[0]);
        } else {
          toast.error(data.message);
          navigate('/products');
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Failed to load product");
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  // --- RELATED PRODUCTS LOGIC ---
  useEffect(() => {
    if (products.length > 0 && product) {
      // Ensure strict type comparison handling (id might be string vs number)
      let productsCopy = products.filter(
        (item) => item.category === product.category && String(item.id) !== String(product.id)
      );
      setRelatedProducts(productsCopy.slice(0, 5));
    }
  }, [products, product]);

  if (loading) {
    return <div className="text-center py-20 text-lg">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-lg">Product not found.</div>;
  }

  // --- CART CALCULATIONS ---
  const cartSubtotal = getCartAmount();
  const gstAmount = cartSubtotal * 0.05; // 5% GST
  const totalAmount = cartSubtotal + gstAmount;
  const isCartEmpty = Object.keys(cartItems).length === 0;

  return (
    <div className="relative z-20 min-h-screen bg-gray-50 py-8 pb-[350px]">
      {/* PDP CONTAINER - Grid Layout */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-8">

        {/* ================= LEFT COLUMN (Product + Related) ================= */}
        <div className="flex flex-col gap-8">

          {/* PRODUCT DETAILS CARD */}
          <div className="bg-white rounded-[18px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">

            {/* BREADCRUMB */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link to="/" className="hover:text-primary">Home</Link> <span>›</span>
              <Link to="/products" className="hover:text-primary">Products</Link> <span>›</span>
              <span className="text-gray-800 font-medium">{product.name}</span>
            </div>

            {/* PRODUCT LAYOUT (Image + Info) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* IMAGES */}
              <div className="flex flex-col gap-4">
                <div className="w-full h-[320px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <img src={thumbnail} alt={product.name} className="w-full h-full object-cover" />
                </div>
                {/* Thumbnails */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.image.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setThumbnail(img)}
                      className={`min-w-[70px] h-[70px] rounded-xl overflow-hidden border-2 transition-all ${thumbnail === img ? 'border-green-600' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* INFO */}
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{product.description}</p>

                {/* META */}
                <div className="flex items-center gap-4 text-sm font-medium text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg w-max">
                  {product.weight && <span>Net Weight: {product.weight}</span>}
                  <span className="w-px h-4 bg-gray-300"></span>
                  <div className="flex items-center gap-1">
                    <span>⭐ 4.5</span>
                    <span className="text-gray-400 font-normal">(128 reviews)</span>
                  </div>
                </div>

                {/* PRICE */}
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">{currency}{product.offer_price}</span>
                  <span className="text-gray-400 text-lg line-through ml-3">{currency}{product.price}</span>
                </div>

                {/* ACTIONS - Quantity & Add */}
                <div className="mt-auto">
                  {!cartItems[product.id] ? (
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-[#ffffff] text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-gray-200 hover:bg-[#42cbf5] hover:text-black hover:shadow-yellow-200 active:scale-95"
                    >
                      Add to Cart · {currency}{product.offer_price}
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex-1 flex items-center justify-between bg-gray-100 rounded-xl p-1">
                        <button onClick={() => removeFromCart(product.id)} className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-lg font-bold hover:bg-gray-50">-</button>
                        <span className="font-bold text-lg">{cartItems[product.id]}</span>
                        <button onClick={() => addToCart(product.id)} className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-lg font-bold hover:bg-gray-50">+</button>
                      </div>
                      <div className="text-sm text-green-600 font-bold bg-green-50 px-4 py-3 rounded-xl">
                        In Cart
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RELATED PRODUCTS */}
          <div className="bg-white rounded-[18px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Related Products</h3>
              <Link to="/products" className="text-sm font-semibold text-green-600 hover:underline">View all</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <div key={p.id} onClick={() => { navigate(`/products/${p.category}/${p.id}`); scrollTo(0, 0) }} className="group cursor-pointer">
                  <div className="bg-gray-100 rounded-xl overflow-hidden mb-2 h-[140px]">
                    <img src={p.image[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm truncate">{p.name}</h4>
                  <p className="text-gray-500 text-xs">{currency}{p.offer_price}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN (Sticky Cart) ================= */}
        <div className="hidden lg:block">
          <div className="sticky top-[100px] bg-white rounded-[18px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3">My Order</h3>

            {/* Cart Items List */}
            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4 mb-6 custom-scrollbar">
              {itemsInCart(cartItems, products).map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                    <img src={item.image[0]} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{item.qty} x {currency}{item.offer_price}</span>
                      <span className="text-sm font-bold text-gray-900">{currency}{item.qty * item.offer_price}</span>
                    </div>
                  </div>
                </div>
              ))}
              {isCartEmpty && <p className="text-center text-gray-400 py-4 text-sm">Your cart is empty.</p>}
            </div>

            {/* Bill Details */}
            {!isCartEmpty && (
              <div className="space-y-3 pt-4 border-t border-dashed border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{currency}{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST (5%)</span>
                  <span>{currency}{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{currency}{totalAmount.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => navigate('/place-order')}
                  className="w-full mt-4 bg-[#42cbf5] hover:bg-[#42cbf5] text-black font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-red-100"
                >
                  Confirm Order
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper to map cartItems to product objects
function itemsInCart(cartItems, products) {
  const items = [];
  for (const id in cartItems) {
    if (cartItems[id] > 0) {
      const product = products.find(p => p.id === id);
      if (product) {
        items.push({ ...product, qty: cartItems[id] });
      }
    }
  }
  return items;
}

export default ProductDetails;
