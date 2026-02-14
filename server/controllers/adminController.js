import { pool } from '../configs/db.js';
import bcrypt from 'bcryptjs';

// Add Delivery Partner
export async function addDeliveryPartner(req, res) {
    try {
        const { name, mobile, password, vehicle_no, license_no, proof_image, partner_photo } = req.body;

        // Check if exists
        const exists = await pool.query('SELECT id FROM delivery_partners WHERE mobile = $1', [mobile]);
        if (exists.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Partner with this mobile already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await pool.query(`
            INSERT INTO delivery_partners (name, mobile, password_hash, vehicle_no, license_no, proof_image, partner_photo, is_verified, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, TRUE)
        `, [name, mobile, passwordHash, vehicle_no, license_no, proof_image, partner_photo]);

        res.json({ success: true, message: "Delivery Partner added successfully. Pending Verification." });

    } catch (error) {
        console.error("Add Partner Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get All Delivery Partners (Admin)
export async function getDeliveryPartners(req, res) {
    try {
        const { rows } = await pool.query('SELECT id, name, mobile, vehicle_no, license_no, is_verified, is_active, created_at FROM delivery_partners ORDER BY created_at DESC');
        res.json({ success: true, partners: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Verify/Toggle Partner Status
export async function updatePartnerStatus(req, res) {
    try {
        const { partnerId, isVerified, isActive } = req.body;

        await pool.query(`
            UPDATE delivery_partners 
            SET is_verified = COALESCE($1, is_verified), 
                is_active = COALESCE($2, is_active),
                updated_at = NOW()
            WHERE id = $3
        `, [isVerified, isActive, partnerId]);

        res.json({ success: true, message: "Partner status updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Assign Order to Partner
export async function assignOrderToPartner(req, res) {
    try {
        const { orderId, partnerId } = req.body;

        // Verify Valid Partner
        const partnerCheck = await pool.query('SELECT id FROM delivery_partners WHERE id = $1 AND is_active = TRUE AND is_verified = TRUE', [partnerId]);
        if (partnerCheck.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid or inactive partner" });
        }

        await pool.query(`
            UPDATE orders 
            SET delivery_partner_id = $1, 
                delivery_status = 'ASSIGNED', 
                status = 'Processing',
                updated_at = NOW() 
            WHERE id = $2
        `, [partnerId, orderId]);

        res.json({ success: true, message: "Order assigned successfully" });

    } catch (error) {
        console.error("Assign Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}
