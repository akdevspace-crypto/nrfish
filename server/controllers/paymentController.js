
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { pool } from '../configs/db.js';
import fs from 'fs';
import path from 'path';

const logError = (context, error) => {
    const errorMsg = `[${new Date().toISOString()}] ${context}: ${error.message}\nStack: ${error.stack}\nFull Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}\n\n`;
    fs.appendFileSync(path.join(process.cwd(), 'server_error.log'), errorMsg);
};

// Initialize Cashfree
const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY
);

// --- 1. INITIALIZE PAYMENT (Create Cashfree Order) ---
export const initializePayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.userId;

        if (!orderId || !userId) {
            return res.status(400).json({ success: false, message: "Invalid request: Missing orderId or userId" });
        }

        // Fetch Order
        const orderResult = await pool.query(`
            SELECT o.*, u.name, u.email, u.mobile as phone 
            FROM orders o 
            JOIN public.users u ON o.user_id = u.id::text
            WHERE o.id::text = $1::text AND o.user_id = $2::text
        `, [orderId, userId]);

        if (orderResult.rows.length === 0) return res.status(404).json({ success: false, message: "Order not found" });

        const order = orderResult.rows[0];

        // Check if already paid
        if (order.is_paid) return res.status(400).json({ success: false, message: "Order is already paid" });

        // Prepare Cashfree Request
        const request = {
            order_amount: Number(order.amount),
            order_currency: "INR",
            order_id: `ORDER_${orderId}_${Date.now()}`, // Unique Order ID
            customer_details: {
                customer_id: `USER_${userId}`,
                customer_phone: order.phone || "9999999999",
                customer_name: order.name || "Guest",
                customer_email: order.email || "guest@example.com"
            },
            order_meta: {
                return_url: `http://localhost:5173/verify?order_id={order_id}` // Frontend will handle this separately via SDK usually, but return_url is required
            }
        };

        const response = await cashfree.PGCreateOrder(request);
        const data = response.data;

        // Record initialization in payments table
        // We use explicit INSERT, defaulting status to PENDING
        await pool.query(`
            INSERT INTO payments (order_id, user_id, amount, currency, payment_method, transaction_id, status)
            VALUES ($1, $2, $3, $4, 'CASHFREE', $5, 'PENDING')
        `, [orderId, userId, order.amount, "INR", data.order_id]);

        res.json({
            success: true,
            payment_session_id: data.payment_session_id,
            order_id: data.order_id
        });

    } catch (error) {
        logError("Initialize Payment Error", error);
        console.error("Initialize Payment Error:", error.response?.data?.message || error.message);
        res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
    }
};

// --- 2. VERIFY PAYMENT (Check Status) ---
export const verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.body; // This is the CASHFREE order_id (e.g. ORDER_123_...)

        const response = await cashfree.PGOrderFetchPayments(orderId);
        const payments = response.data;

        // Find successful payment
        const successPayment = payments.find(p => p.payment_status === "SUCCESS");

        if (successPayment) {
            // Extract internal Order ID from Custom Order ID (ORDER_123_TIMESTAMP) -> 123
            const parts = orderId.split('_');
            const internalOrderId = parts.length > 1 ? parts[1] : null;

            if (!internalOrderId) {
                throw new Error("Invalid Order ID format");
            }

            // Update Payment Record
            await pool.query(`
                UPDATE payments 
                SET status = 'SUCCESS', verification_status = 'PENDING', transaction_id = $1, updated_at = NOW()
                WHERE transaction_id = $2
            `, [successPayment.cf_payment_id, orderId]);

            // Update Order Status
            // Cast internalOrderId to text just in case, though it should handle it.
            // But internalOrderId is string from split. o.id is integer. cast param to integer or column to text.
            // Using logic: o.id::text = $1
            await pool.query(`
                UPDATE orders 
                SET is_paid = TRUE, payment_type = 'Online', payment_status = 'Success', status = 'Payment Verification' 
                WHERE id::text = $1
            `, [internalOrderId]);

            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            await pool.query(`
                UPDATE payments SET status = 'FAILED', updated_at = NOW() WHERE transaction_id = $1
            `, [orderId]);
            res.status(400).json({ success: false, message: "Payment failed or pending" });
        }

    } catch (error) {
        console.error("Verify Payment Error:", error.response?.data?.message || error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 3. ADMIN MANUALLY VERIFY PAYMENT ---
export const adminVerifyPayment = async (req, res) => {
    try {
        const { paymentId, status } = req.body; // status: 'VERIFIED' or 'REJECTED'
        const adminId = req.userId;

        if (!['VERIFIED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        // Update Payment Table
        const result = await pool.query(`
            UPDATE payments 
            SET verification_status = $1, verified_by = $2, verified_at = NOW(), updated_at = NOW()
            WHERE id = $3
            RETURNING order_id
        `, [status, adminId, paymentId]);

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Payment record not found" });

        const { order_id } = result.rows[0];

        // If Verified, Update Order Status to allow processing
        if (status === 'VERIFIED') {
            await pool.query(`
                UPDATE orders 
                SET status = 'Order Confirmed' 
                WHERE id = $1
            `, [order_id]);
        } else if (status === 'REJECTED') {
            await pool.query(`
                UPDATE orders 
                SET status = 'Payment Failed', is_paid = FALSE 
                WHERE id = $1
            `, [order_id]);
        }

        res.json({ success: true, message: `Payment marked as ${status}` });

    } catch (error) {
        console.error("Admin Verify Payment Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 4. GET ALL PAYMENTS (For Admin Dashboard) ---
export const getAllPayments = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*,
                u.name as user_name, u.email as user_email,
                o.amount as order_amount
            FROM payments p
            JOIN public.users u ON p.user_id = u.id
            JOIN orders o ON p.order_id = o.id
            ORDER BY p.created_at DESC
        `;
        const { rows } = await pool.query(query);
        res.json({ success: true, payments: rows });
    } catch (error) {
        console.error("Get Payments Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
