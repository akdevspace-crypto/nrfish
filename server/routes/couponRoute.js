import express from 'express';
import { createCoupon, getAllCoupons, deleteCoupon, toggleCouponStatus, validateCoupon, getApplicableCoupons } from '../controllers/couponController.js';
// import { adminAuth, userAuth } from '../middleware/auth.js'; // Assuming auth middleware exists

const couponRouter = express.Router();

// Admin Routes (Adding auth middleware later if needed, kept open for now based on context)
couponRouter.post('/create', createCoupon);
couponRouter.get('/all', getAllCoupons);
couponRouter.delete('/:id', deleteCoupon);
couponRouter.patch('/:id/status', toggleCouponStatus);

// Customer Routes
couponRouter.post('/validate', validateCoupon);
couponRouter.post('/user-applicable', getApplicableCoupons);

export default couponRouter;
