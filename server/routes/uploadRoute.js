
import express from "express";
import { upload } from "../configs/multer.js";
import { uploadImage } from "../controllers/uploadController.js";
import authSeller from "../middleware/authSeller.js"; // Optional: restrict to sellers/admin

const uploadRouter = express.Router();

uploadRouter.post('/', authSeller, upload.single('image'), uploadImage);

export default uploadRouter;
