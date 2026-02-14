import express from 'express';
import { addCategory, listCategories, listPublicCategories, editCategory, removeCategory } from '../controllers/categoryController.js';
import upload from '../middleware/multer.js';
import authSeller from '../middleware/authSeller.js'; // Corrected import path

const categoryRouter = express.Router();

// Admin Routes
categoryRouter.post('/add', authSeller, upload.single('image'), addCategory);
categoryRouter.post('/update/:id', authSeller, upload.single('image'), editCategory); // Using URL param for ID is cleaner for updates
categoryRouter.post('/delete', authSeller, removeCategory);
categoryRouter.get('/list', listCategories); // For Admin (can show all)

// Public Routes
categoryRouter.get('/public-list', listPublicCategories); // For User Frontend

export default categoryRouter;
