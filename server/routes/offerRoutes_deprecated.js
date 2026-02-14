
import express from 'express';
import { createOffer, getAllOffers, toggleOfferStatus, deleteOffer } from '../controllers/offerController.js';

const offerRouter = express.Router();

offerRouter.post('/create', createOffer);
offerRouter.get('/all', getAllOffers);
offerRouter.post('/toggle', toggleOfferStatus);
offerRouter.post('/delete', deleteOffer);

export default offerRouter;
