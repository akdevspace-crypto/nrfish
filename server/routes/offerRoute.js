import express from 'express';
import { createOffer, getAllOffers, updateOffer, deleteOffer, toggleOfferStatus } from '../controllers/offerController.js';

const router = express.Router();

// Get all offers (public handles filtering, admin gets all)
router.get('/list', getAllOffers);

// Create Offer (Admin)
router.post('/create', createOffer);

// Update Offer (Admin)
router.put('/update/:id', updateOffer);

// Toggle Offer Status
router.put('/toggle/:id', toggleOfferStatus);

// Delete Offer (Admin)
router.delete('/delete/:id', deleteOffer);

export default router;
