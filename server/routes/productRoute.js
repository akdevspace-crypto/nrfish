import express from "express"
import { upload } from "../configs/multer.js";
import authSeller from "../middleware/authSeller.js";
import { addProduct, changeStock, deleteProduct, productById, productList, updatePricing, getProductsByCategory } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post('/add', upload.array(['images']), authSeller, addProduct);
productRouter.get('/list', productList);
productRouter.get('/category/:category', getProductsByCategory); // New Route
productRouter.get('/:id', productById);
productRouter.post('/stock', authSeller, changeStock);
productRouter.delete('/:id', authSeller, deleteProduct);
productRouter.patch('/:id/pricing', authSeller, updatePricing);

export default productRouter;