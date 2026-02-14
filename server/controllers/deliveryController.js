import { pool } from "../configs/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as DeliveryPartnerModel from "../models/DeliveryPartner.js";
import * as OTPModel from "../models/OTP.js";

// --- Admin Actions ---

// Add a new Delivery Partner
export const addPartner = async (req, res) => {
    try {
        const { name, mobile, password, vehicle_no, license_no, proof_doc_url, photo_url } = req.body;

        // Check if exists
        const existing = await DeliveryPartnerModel.getPartnerByMobile(mobile);
        if (existing) {
            return res.json({ success: false, message: "Partner with this mobile already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newPartner = await DeliveryPartnerModel.createPartner({
            name, mobile, password_hash, vehicle_no, license_no, proof_doc_url, photo_url
        });

        res.json({ success: true, message: "Partner added successfully", partner: newPartner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Partners
export const getPartners = async (req, res) => {
    try {
        const partners = await DeliveryPartnerModel.getAllPartners();
        res.json({ success: true, partners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle Active Status
export const togglePartnerStatus = async (req, res) => {
    try {
        const { id, is_active, is_verified } = req.body;
        const partner = await DeliveryPartnerModel.updatePartnerStatus(id, { is_active, is_verified });
        res.json({ success: true, message: "Status updated", partner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Partner
export const deletePartner = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPartner = await DeliveryPartnerModel.deletePartner(id);

        if (!deletedPartner) {
            return res.json({ success: false, message: "Partner not found" });
        }

        res.json({ success: true, message: "Partner deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Partner Details
export const updatePartnerDetails = async (req, res) => {
    try {
        const { id, name, mobile, vehicle_no, license_no, photo_url, proof_doc_url } = req.body;

        const updatedPartner = await DeliveryPartnerModel.updatePartner(id, {
            name, mobile, vehicle_no, license_no, photo_url, proof_doc_url
        });

        if (!updatedPartner) {
            return res.json({ success: false, message: "Partner not found" });
        }

        res.json({ success: true, message: "Partner updated successfully", partner: updatedPartner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Assign Order
export const assignOrder = async (req, res) => {
    try {
        const { orderId, deliveryPartnerId } = req.body;

        const partner = await DeliveryPartnerModel.getPartnerById(deliveryPartnerId);
        if (!partner) return res.json({ success: false, message: "Partner not found" });

        // Update Order
        const query = `
            UPDATE orders 
            SET delivery_partner_id = $1, status = 'Shipped', delivery_status = 'Assigned', updated_at = NOW()
            WHERE id = $2 RETURNING *
        `;
        const result = await pool.query(query, [deliveryPartnerId, orderId]);

        if (result.rowCount === 0) return res.json({ success: false, message: "Order not found" });

        // Increment stats
        await DeliveryPartnerModel.updatePartnerStats(deliveryPartnerId, { order_assigned: true });

        res.json({ success: true, message: "Order assigned successfully", order: result.rows[0] });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// --- Partner Auth ---

// Login (Step 1: Verify Creds -> Send OTP)
export const loginPartner = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        const partner = await DeliveryPartnerModel.getPartnerByMobile(mobile);
        if (!partner) return res.json({ success: false, message: "Partner not found" });

        if (!partner.is_active) return res.json({ success: false, message: "Account is inactive. Contact Admin." });

        const isMatch = await bcrypt.compare(password, partner.password_hash);
        if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

        // Generate OTP
        const otp = await OTPModel.createOTP({ mobile, purpose: 'LOGIN' });

        // In production, send SMS here. For now return directly or log it.
        console.log(`LOGIN OTP for ${mobile}: ${otp}`);

        res.json({ success: true, message: "OTP sent to mobile", logic_otp: otp });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Login OTP (Step 2: Verify OTP -> JWT)
export const verifyLogin = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        const isValid = await OTPModel.verifyOTP({ mobile, purpose: 'LOGIN', code: otp });
        if (!isValid) return res.json({ success: false, message: "Invalid or expired OTP" });

        const partner = await DeliveryPartnerModel.getPartnerByMobile(mobile);

        const token = jwt.sign(
            { id: partner.id, role: 'DELIVERY_PARTNER' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ success: true, token, partner });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// --- Partner Workflow ---

// Get Assigned Orders
export const getAssignedOrders = async (req, res) => {
    try {
        const { deliveryPartnerId } = req.body; // From middleware

        const query = `
            SELECT o.*, 
                   a.first_name, a.last_name, a.phone, a.address, a.city, a.pincode,
                   p.payment_method
            FROM orders o
            LEFT JOIN addresses a ON a.id::text = o.address
            LEFT JOIN payments p ON p.order_id = o.id
            WHERE o.delivery_partner_id = $1 AND o.status != 'Cancelled'
            ORDER BY o.created_at DESC
        `;
        const result = await pool.query(query, [deliveryPartnerId]);

        res.json({ success: true, orders: result.rows });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Order Status (Partner)
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryPartnerId, orderId, status } = req.body;
        // Valid statuses: 'ACCEPTED', 'ON_THE_WAY', 'REACHED_DESTINATION', 'PAYMENT_COLLECTED'

        const order = await pool.query(`SELECT * FROM orders WHERE id = $1 AND delivery_partner_id = $2`, [orderId, deliveryPartnerId]);

        if (order.rows.length === 0) return res.json({ success: false, message: "Order not found or not assigned to you" });

        let mainStatus = 'Shipped'; // Default matching 'ACCEPTED' or existing

        if (status === 'ACCEPTED') mainStatus = 'Shipped';
        if (status === 'ON_THE_WAY') mainStatus = 'Out for Delivery';
        if (status === 'REACHED_DESTINATION') mainStatus = 'Out for Delivery'; // Still out for delivery
        if (status === 'PAYMENT_COLLECTED') mainStatus = 'Out for Delivery';

        await pool.query(
            `UPDATE orders SET delivery_status = $1, status = $2, updated_at = NOW() WHERE id = $3`,
            [status, mainStatus, orderId]
        );

        res.json({ success: true, message: "Status updated" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send Delivery OTP (To Customer)
export const sendDeliveryOTP = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Get customer mobile from order -> address
        const orderRes = await pool.query(`
            SELECT a.phone FROM orders o
            JOIN addresses a ON a.id::text = o.address
            WHERE o.id = $1
        `, [orderId]);

        if (orderRes.rows.length === 0) return res.json({ success: false, message: "Order/Customer not found" });

        const customerMobile = orderRes.rows[0].phone;

        const otp = await OTPModel.createOTP({ mobile: customerMobile, purpose: 'DELIVERY', order_id: orderId });

        // Mock SMS
        console.log(`DELIVERY OTP for Order ${orderId} (${customerMobile}): ${otp}`);

        res.json({ success: true, message: "OTP sent to customer", delivery_otp: otp });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Delivery & Complete
export const completeDelivery = async (req, res) => {
    try {
        const { deliveryPartnerId, orderId, otp } = req.body;

        // Get customer mobile and payment info
        const orderRes = await pool.query(`
            SELECT a.phone, o.payment_type, o.is_paid, o.delivery_status FROM orders o
            JOIN addresses a ON a.id::text = o.address
            WHERE o.id = $1 AND o.delivery_partner_id = $2
        `, [orderId, deliveryPartnerId]);

        if (orderRes.rows.length === 0) return res.json({ success: false, message: "Order invalid" });

        const order = orderRes.rows[0];
        const customerMobile = order.phone;

        // Strict COD Check
        if (order.payment_type === 'COD' && !order.is_paid && order.delivery_status !== 'PAYMENT_COLLECTED') {
            return res.json({ success: false, message: "Payment must be collected before delivery." });
        }

        // Verify OTP
        const isValid = await OTPModel.verifyOTP({ mobile: customerMobile, purpose: 'DELIVERY', order_id: orderId, code: otp });

        if (!isValid) return res.json({ success: false, message: "Invalid OTP" });

        // Update Order to Delivered
        await pool.query(`
            UPDATE orders 
            SET status = 'Delivered', 
                delivery_status = 'DELIVERED', 
                is_delivered = TRUE, 
                delivered_at = NOW(), 
                delivery_otp_verified = TRUE,
                is_paid = TRUE 
            WHERE id = $1
        `, [orderId]);

        // Update Partner Stats
        await DeliveryPartnerModel.updatePartnerStats(deliveryPartnerId, { order_delivered: true });

        res.json({ success: true, message: "Order Delivered Successfully!" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
