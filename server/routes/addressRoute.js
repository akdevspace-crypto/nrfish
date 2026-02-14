import express from 'express'
import authUser from '../middleware/authUser.js';
import authSeller from '../middleware/authSeller.js';
import { addAddress, getAddress, getDeliveryZones, addDeliveryZone, deleteDeliveryZone } from '../controllers/addressController.js';

const addressRouter = express.Router();

// User Address Routes
addressRouter.post('/add', authUser, addAddress);
addressRouter.get('/get', authUser, getAddress);

// Debugging Middleware
addressRouter.use((req, res, next) => {
    console.log(`Address Router Hit: ${req.method} ${req.originalUrl}`);
    next();
});

// Delivery Zone Routes
addressRouter.get('/zones', (req, res, next) => {
    console.log("GET /zones hit");
    next();
}, getDeliveryZones); // Public

addressRouter.post('/zones/add', (req, res, next) => {
    console.log("POST /zones/add hit");
    next();
}, authSeller, addDeliveryZone); // Admin Only

addressRouter.post('/zones/delete', (req, res, next) => {
    console.log("POST /zones/delete hit");
    next();
}, authSeller, deleteDeliveryZone); // Admin Only

export default addressRouter;