import express from 'express'
import authUser from '../middleware/authUser.js';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrder, updateStatus, getOrderById } from '../controllers/orderController.js';
import { sendDeliveryOTP } from '../controllers/otpController.js';
import authSeller from '../middleware/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/place', authUser, placeOrder); // Generic Place Order (Online/COD)
orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.post('/single', authUser, getOrderById); // Get Single Order
orderRouter.post('/send-delivery-otp', authSeller, sendDeliveryOTP); // TRIGGER OTP
orderRouter.patch('/status', authSeller, updateStatus); // New Status Update Route

export default orderRouter;