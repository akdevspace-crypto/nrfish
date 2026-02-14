
import express from 'express';
import { updateCart, validateCartOffers } from '../controllers/cartController.js';
import authUser from '../middleware/authUser.js';

const cartRouter = express.Router();

cartRouter.post('/update', authUser, updateCart);
cartRouter.post('/validate-offers', validateCartOffers); // Public or Auth? Public for cart viewing

export default cartRouter;
