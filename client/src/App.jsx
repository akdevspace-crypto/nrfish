import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './Components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './Pages/Home';
import { Toaster } from 'react-hot-toast';
import Footer from './Components/Footer';
import { useAppContext } from './Context/AppContext';
import Login from './Components/Login';
import AllProducts from './Pages/AllProducts';
import ProductCategory from './Pages/ProductCategory';
import ProductDetails from './Pages/ProductDetails';
import Cart from './Pages/Cart';
import PlaceOrder from './Pages/PlaceOrder';
import AddAddress from './Pages/AddAddress';
import MyOrders from './Pages/MyOrders';
import Profile from './Pages/Profile'; // New Profile Page
import BestSellers from './Pages/BestSellers';
import OffersAndDeals from './Pages/OffersAndDeals';
import Terms from './Pages/Terms';
import FAQs from './Pages/FAQs';
import DeliveryInformation from './Pages/DeliveryInformation';
import TrackOrder from './Pages/TrackOrder';
import ContactUs from './Pages/ContactUs';
import Verify from './Pages/Verify';
import SellerLogIn from './Components/Seller/SellerLogIn';
import SellerLayout from './Pages/seller/SellerLayout';
import AddProduct from './Pages/seller/AddProduct';
import ProductList from './Pages/seller/ProductList';
import Orders from './Pages/seller/Orders';
import CategoryList from './Pages/seller/CategoryList';
import AddCategory from './Pages/seller/AddCategory';
import LoadingScreen from './Components/LoadingScreen';
import DeliveryZonePanel from './Pages/seller/DeliveryZonePanel';
import BillingLayout from './Pages/Billing/BillingLayout';
import BillingProtectedRoute from './Pages/Billing/BillingProtectedRoute';
import BillingDashboard from './Pages/Billing/BillingDashboard';
import BillGeneration from './Pages/Billing/BillGeneration';
import ManualBilling from './Pages/Billing/ManualBilling';
import ManualInvoicePreview from './Pages/Billing/ManualInvoicePreview';
import BillingOrders from './Pages/Billing/BillingOrders';
import OffersAdmin from './Pages/seller/Offers';
import CouponsAdmin from './Pages/seller/Coupons';
import Payments from './Pages/Admin/Payments';
import DeliveryPartners from './Pages/seller/DeliveryPartners';
// Pages are already imported above, ensuring no duplicates

import ScrollToTop from './Components/ScrollToTop';

// Delivery Pages
import PartnerLogin from './Pages/delivery/PartnerLogin';
import PartnerDashboard from './Pages/delivery/PartnerDashboard';

// New Partner App Components
import PartnerLayout from './Pages/delivery/PartnerLayout';
import PartnerHome from './Pages/delivery/PartnerHome';
import PartnerOrders from './Pages/delivery/PartnerOrders';
import PartnerMap from './Pages/delivery/PartnerMap';
import PartnerEarnings from './Pages/delivery/PartnerEarnings';
import PartnerProfile from './Pages/delivery/PartnerProfile';

function App() {
  const location = useLocation();
  const isSellerPath = location.pathname.includes("seller");
  const isBillingPath = location.pathname.includes("billing");
  const isDeliveryPath = location.pathname.includes("delivery");
  const isAdminPath = isSellerPath || isBillingPath || isDeliveryPath;

  const { showUserLogin, isSeller, sellerChecked, apiLoading } = useAppContext();

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className={`text-default min-h-screen text-gray-700 bg-white ${isAdminPath ? 'admin-font' : 'customer-font'}`}>
        {apiLoading && <LoadingScreen />}
        <ScrollToTop />
        {!isAdminPath && <Navbar />}
        {showUserLogin && <Login />}
        <Toaster />
        <div className={`${isAdminPath ? "" : ""}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/products/:category" element={<ProductCategory />} />
            <Route path="/products/:category/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/place-order" element={<PlaceOrder />} />
            <Route path="/add-address" element={<AddAddress />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/best-sellers" element={<BestSellers />} />
            <Route path="/offers" element={<OffersAndDeals />} />
            <Route path="/terms-and-conditions" element={<Terms />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/delivery-information" element={<DeliveryInformation />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/track-order/:orderId" element={<TrackOrder />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/verify" element={<Verify />} />

            <Route
              path="/seller"
              element={
                !sellerChecked
                  ? <LoadingScreen />
                  : isSeller
                    ? <SellerLayout />
                    : <SellerLogIn />
              }>
              <Route index element={isSeller ? <AddProduct /> : null} />
              <Route path="product-list" element={<ProductList />} />
              <Route path="orders" element={<Orders />} />
              <Route path="category-list" element={<CategoryList />} />
              <Route path="add-category" element={<AddCategory />} />
              <Route path="edit-category/:id" element={<AddCategory />} />
              <Route path="delivery-zones" element={<DeliveryZonePanel />} />
              <Route path="offers" element={<OffersAdmin />} />
              <Route path="coupons" element={<CouponsAdmin />} />
              <Route path="payments" element={<Payments />} />
              <Route path="delivery-partners" element={<DeliveryPartners />} />
            </Route>

            {/* Separate Billing Module Routes */}
            <Route path="/billing" element={
              <BillingProtectedRoute>
                <BillingLayout />
              </BillingProtectedRoute>
            }>
              <Route index element={<BillingDashboard />} />
              <Route path="orders" element={<BillingOrders />} />
              <Route path="orders/:orderId" element={<BillGeneration />} />
              <Route path="manual" element={<ManualBilling />} />
              <Route path="invoice/preview" element={<ManualInvoicePreview />} />
            </Route>


            {/* Delivery Partner App Routes */}
            <Route path="/delivery/login" element={<PartnerLogin />} />

            {/* New Partner App Layout & Routes */}
            <Route path="/delivery" element={<PartnerLayout />}>
              <Route index element={<PartnerHome />} />
              <Route path="dashboard" element={<PartnerHome />} />
              <Route path="orders" element={<PartnerOrders />} />
              <Route path="map" element={<PartnerMap />} />
              <Route path="earnings" element={<PartnerEarnings />} />
              <Route path="profile" element={<PartnerProfile />} />
            </Route>

          </Routes>
        </div>
        {!isAdminPath && <Footer />}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
