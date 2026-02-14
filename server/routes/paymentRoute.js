
import express from 'express';
import { initializePayment, verifyPayment, adminVerifyPayment, getAllPayments } from '../controllers/paymentController.js';
import authUser from '../middleware/authUser.js';
import authSeller from '../middleware/authSeller.js'; // Assuming authSeller checks for admin/seller role

const router = express.Router();

// Customer Endpoints
router.post('/initialize', authUser, initializePayment);
router.post('/verify', authUser, verifyPayment);

// Admin Endpoints
router.put('/admin/verify', authSeller, adminVerifyPayment);
router.get('/list', authSeller, getAllPayments);

export default router;
