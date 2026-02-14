import { pool } from '../configs/db.js';

// Add address : /api/address/add
export async function addAddress(req, res) {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            country,
            pincode
        } = req.body;

        const userId = req.userId;

        const query = `
            INSERT INTO addresses (
                user_id,
                first_name,
                last_name,
                email,
                phone,
                address,
                city,
                state,
                country,
                pincode
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;

        const values = [
            userId,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            country,
            pincode
        ];

        const result = await pool.query(query, values);

        res.json({
            success: true,
            message: "Address added successfully",
            address: result.rows[0]
        });

    } catch (error) {
        console.error("Error adding address:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to add address",
            error: error.message
        });
    }
}

// Get Address : /api/address/get
export async function getAddress(req, res) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Missing userId in request"
            });
        }

        const query = `
            SELECT * FROM addresses
            WHERE user_id = $1
            ORDER BY created_at DESC;
        `;

        const result = await pool.query(query, [userId]);

        res.json({
            success: true,
            addresses: result.rows
        });

    } catch (error) {
        console.error("Error fetching addresses:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch addresses",
            error: error.message
        });
    }
}

// --- DELIVERY ZONES (DB BACKED) ---

// Get Delivery Zones (Public)
export async function getDeliveryZones(req, res) {
    try {
        const result = await pool.query('SELECT pincode FROM delivery_zones ORDER BY pincode ASC');
        const pincodes = result.rows.map(row => row.pincode);
        res.json({ success: true, pincodes });
    } catch (error) {
        console.error("Error fetching delivery zones:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch delivery zones" });
    }
}

// Add Delivery Zone (Admin)
export async function addDeliveryZone(req, res) {
    try {
        const { pincode } = req.body;
        if (!pincode) return res.json({ success: false, message: "Pincode is required" });

        // Check exists
        const check = await pool.query('SELECT * FROM delivery_zones WHERE pincode = $1', [pincode]);
        if (check.rows.length > 0) {
            return res.json({ success: false, message: "Pincode already exists" });
        }

        await pool.query('INSERT INTO delivery_zones (pincode) VALUES ($1)', [pincode]);
        res.json({ success: true, message: "Delivery Zone Added" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Delete Delivery Zone (Admin)
export async function deleteDeliveryZone(req, res) {
    try {
        const { pincode } = req.body;
        if (!pincode) return res.json({ success: false, message: "Pincode is required" });

        await pool.query('DELETE FROM delivery_zones WHERE pincode = $1', [pincode]);
        res.json({ success: true, message: "Delivery Zone Removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}
