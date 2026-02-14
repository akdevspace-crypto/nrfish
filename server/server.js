import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import fs from "fs";
import https from "https";
// import dotenv from 'dotenv'; // Removed since we use 'dotenv/config'
import { connectDB } from './configs/db.js';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import orderRouter from './routes/orderRoute.js';
import offerRouter from './routes/offerRoute.js';
import couponRouter from './routes/couponRoute.js';
import enquiryRouter from './routes/enquiryRoute.js';
import paymentRouter from './routes/paymentRoute.js';
import deliveryRouter from './routes/deliveryRoute.js';
import uploadRouter from './routes/uploadRoute.js';



const app = express();
const port = process.env.PORT || 4000;
const host = process.env.HOST || 'localhost';

// Connect to Database
connectDB();
connectCloudinary();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// API Routes
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/category', categoryRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/offer', offerRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/enquiry', enquiryRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/upload', uploadRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR HANDLER:", err);
  res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
});

// Prevent crash on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('🔥 UNHANDLED REJECTION! Shutting down...', err);
  process.exit(1);
});

const startServer = async () => {
  try {
    const server = app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`);
    });

    server.on('error', (e) => {
      console.error("❌ Server Error:", e);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};
startServer();
