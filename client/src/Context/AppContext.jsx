import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const currency = import.meta.env.VITE_CURRENCY;
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerChecked, setSellerChecked] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [allowedPincodes, setAllowedPincodes] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [apiLoading, setApiLoading] = useState(false);

  const startLoading = () => setApiLoading(true);
  const stopLoading = () => setApiLoading(false);

  // Fetch seller status
  async function fetchSeller() {
    startLoading();
    try {
      const { data } = await axios.get('/api/seller/is-auth');
      setIsSeller(data.success);
    } catch {
      setIsSeller(false);
    } finally {
      setSellerChecked(true);
      stopLoading();
    }
  }

  // Fetch user auth and cart
  async function fetchUser() {
    startLoading();
    try {
      const { data } = await axios.get('api/user/is-auth');
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cart_items || {});
      }
    } catch {
      setUser(null);
    } finally {
      stopLoading();
    }
  }

  // Fetch all products
  const fetchProducts = async () => {
    startLoading();
    try {
      console.log("AppContext: Fetching all products...");
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        console.log(`AppContext: Fetched ${data.products.length} products.`);
        setProducts(data.products);
      } else {
        console.error("AppContext: Failed to fetch products:", data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("AppContext: Error fetching products:", error.message);
      toast.error(error.message);
    } finally {
      stopLoading();
    }
  };

  // Add product to cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems || {});
    cartData[itemId] = cartData[itemId] ? cartData[itemId] + 1 : 1;
    setCartItems(cartData);
    toast.success("Item added to cart");
  };

  // Update item quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart updated");
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    toast.success("Item removed from cart");
    setCartItems(cartData);
  };

  function getCartCount() {
    return Object.values(cartItems).reduce((a, b) => a + b, 0);
  }

  function getCartAmount() {
    let total = 0;
    for (const item in cartItems) {
      const info = products.find((p) => p.id === item);
      if (info) total += info.offer_price * cartItems[item];
    }
    return Math.floor(total * 100) / 100;
  }

  const fetchAllowedPincodes = async () => {
    startLoading();
    try {
      const { data } = await axios.get('/api/address/zones');
      if (data.success) setAllowedPincodes(data.pincodes);
    } catch {
      toast.error("Failed to fetch delivery zones");
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
    fetchAllowedPincodes();
  }, []);

  useEffect(() => {
    async function updateCart() {
      try {
        const { data } = await axios.post('/api/cart/update', { cartItems });
        if (!data.success) toast.error(data.message);
      } catch (error) {
        toast.error(error.message);
      }
    }

    if (user) updateCart();
  }, [cartItems]);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    fetchProducts,
    fetchUser,
    setCartItems,
    allowedPincodes,
    setAllowedPincodes,
    deliveryPincode,
    setDeliveryPincode,
    sellerChecked,
    apiLoading,
    startLoading,
    stopLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
