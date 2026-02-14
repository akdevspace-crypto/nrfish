import express from "express";
import {
  addPartner,
  getPartners,
  togglePartnerStatus,
  assignOrder,
  loginPartner,
  verifyLogin,
  getAssignedOrders,
  updateDeliveryStatus,
  sendDeliveryOTP,
  completeDelivery,
  deletePartner,
  updatePartnerDetails
} from "../controllers/deliveryController.js";
import authDelivery from "../middleware/authDelivery.js";
import authSeller from "../middleware/authSeller.js";

const deliveryRouter = express.Router();

// --- Admin Routes (Protected by Seller Auth) ---
deliveryRouter.post('/admin/add', authSeller, addPartner);
deliveryRouter.get('/admin/list', authSeller, getPartners);
deliveryRouter.post('/admin/status', authSeller, togglePartnerStatus);
deliveryRouter.post('/admin/assign', authSeller, assignOrder);
deliveryRouter.delete('/admin/delete/:id', authSeller, deletePartner);
deliveryRouter.put('/admin/update', authSeller, updatePartnerDetails);


// --- Partner Auth ---
deliveryRouter.post('/login', loginPartner);
deliveryRouter.post('/login-verify', verifyLogin);

// --- Partner Workflow (Protected) ---
deliveryRouter.get('/orders', authDelivery, getAssignedOrders);
deliveryRouter.post('/order/status', authDelivery, updateDeliveryStatus);
deliveryRouter.post('/order/init-otp', authDelivery, sendDeliveryOTP);
deliveryRouter.post('/order/complete', authDelivery, completeDelivery);

export default deliveryRouter;
