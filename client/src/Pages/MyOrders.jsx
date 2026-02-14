import React, { useEffect, useState } from 'react';
import { useAppContext } from '../Context/AppContext';
import { assets } from '../assets/assets';

function MyOrders() {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user, navigate } = useAppContext();
  const [loading, setLoading] = useState(true);

  async function fetchMyOrders() {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/order/user');
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#42cbf5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="mt-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 font-sans">

      {/* PAGE TITLE (Matches Cart Page) */}
      <div className="mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400">
          Account Details
        </p>
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-semibold text-gray-900">
            My Orders
          </h1>
          <button onClick={() => navigate('/products')} className="hidden md:block text-primary font-medium text-sm hover:underline">
            ← Continue shopping
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {myOrders.length} orders placed
        </p>
      </div>

      <div className="space-y-8">
        {myOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 border border-dashed border-gray-300 rounded-3xl bg-gray-50">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl">📦</div>
            <h2 className="text-xl font-semibold text-gray-700">No orders yet</h2>
            <button onClick={() => navigate('/products')} className="px-8 py-3 bg-[#42cbf5] text-black rounded-full font-bold hover:bg-[#1dc1f2] transition shadow-lg active:scale-95">
              Start Shopping
            </button>
          </div>
        ) : (
          myOrders.map((order, index) => {
            return (
              // ORDER CARD (Matches Cart Item Style)
              <div key={index} className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">

                {/* ORDER HEADER */}
                <div className="flex flex-wrap gap-6 justify-between items-start border-b border-gray-100 pb-6">
                  <div className="flex gap-4 items-center">
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#42cbf5] text-black font-bold text-lg">
                      #{String(order.order_id).slice(-4)}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Order #{order.order_id}</h3>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()} • {order.products.length} Items</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                      {order.status || 'Processing'}
                    </div>
                  </div>
                </div>

                {/* ORDER ITEMS */}
                <div className="space-y-4">
                  {order.products.map((item, idx) => (
                    <div key={idx} className="flex gap-4 sm:gap-6 items-center">
                      <div
                        onClick={() => navigate(`/products/${item.category}/${item.product_id}`)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 cursor-pointer flex-shrink-0"
                      >
                        <img
                          src={item.image && item.image[0] ? item.image[0] : assets.upload_area}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-base sm:text-lg">{item.product_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>Qty: <span className="text-gray-900 font-bold">{item.quantity}</span></span>
                          <span>Price: <span className="text-gray-900 font-bold">{currency}{item.price}</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FOOTER ACTIONS & TOTAL */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-100 gap-6">
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-full border border-gray-300 font-bold text-sm hover:bg-black hover:text-[#42cbf5] hover:border-black transition-all">
                      View Details
                    </button>
                    <button onClick={() => navigate(`/track-order/${order.order_id}`)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[#42cbf5] text-black font-bold text-sm hover:bg-[#1dc1f2] shadow-lg active:scale-95 transition-all">
                      Track Order
                    </button>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{currency}{order.amount}</p>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MyOrders;
