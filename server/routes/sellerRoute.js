import express from 'express'
import { isSellerAuth, sellerLogin, sellerLogout } from '../controllers/sellerController.js';
import authSeller from '../middleware/authSeller.js';

import { addDeliveryPartner, getDeliveryPartners, updatePartnerStatus, assignOrderToPartner } from '../controllers/adminController.js';

const sellerRouter = express.Router();

sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', sellerLogout);

// Delivery Partner Management Routes (Admin Protected)
sellerRouter.post('/add-delivery-partner', authSeller, addDeliveryPartner);
sellerRouter.get('/delivery-partners', authSeller, getDeliveryPartners);
sellerRouter.post('/partner-status', authSeller, updatePartnerStatus);
sellerRouter.post('/assign-order', authSeller, assignOrderToPartner);


export default sellerRouter;