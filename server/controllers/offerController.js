
import { pool } from '../configs/db.js';

// --- CREATE OFFER ---
export const createOffer = async (req, res) => {
    try {
        console.log("Create Offer Body:", req.body);
        const {
            title, description, type, discount_type, discount_value,
            buy_x, get_y, required_product_ids, required_category_ids,
            combo_product_ids, start_date, end_date, usage_limit
        } = req.body;

        // Validation (Basic)
        if (!title || !type || !start_date || !end_date) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const query = `
            INSERT INTO offers 
            (title, description, type, discount_type, discount_value, 
            buy_x, get_y, required_product_ids, required_category_ids, combo_product_ids, 
            start_date, end_date, usage_limit)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const values = [
            title,
            description || '',
            type,
            discount_type || 'FLAT',
            discount_value || 0,
            buy_x || null,
            get_y || null,
            JSON.stringify(required_product_ids || []),
            JSON.stringify(required_category_ids || []),
            JSON.stringify(combo_product_ids || []),
            start_date,
            end_date,
            usage_limit || null
        ];

        const { rows } = await pool.query(query, values);
        res.json({ success: true, message: "Offer created successfully", offer: rows[0] });

    } catch (error) {
        console.error("Create Offer Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET ALL OFFERS ---
export const getAllOffers = async (req, res) => {
    try {
        // Auto-expire offers
        await pool.query("UPDATE offers SET is_active = false WHERE end_date < NOW() AND is_active = true");

        const { rows } = await pool.query("SELECT * FROM offers ORDER BY created_at DESC");
        res.json({ success: true, offers: rows });
    } catch (error) {
        console.error("Get All Offers Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- TOGGLE OFFER STATUS ---
export const toggleOfferStatus = async (req, res) => {
    try {
        const { id } = req.params;
        // First get current status
        const current = await pool.query("SELECT is_active FROM offers WHERE id = $1", [id]);
        if (current.rows.length === 0) return res.status(404).json({ success: false, message: "Offer not found" });

        const newStatus = !current.rows[0].is_active;
        await pool.query("UPDATE offers SET is_active = $1 WHERE id = $2", [newStatus, id]);

        res.json({ success: true, message: `Offer ${newStatus ? 'activated' : 'deactivated'}` });
    } catch (error) {
        console.error("Toggle Status Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- UPDATE OFFER ---
export const updateOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, description, type, discount_type, discount_value,
            buy_x, get_y, required_product_ids, required_category_ids,
            combo_product_ids, start_date, end_date, usage_limit
        } = req.body;

        const query = `
            UPDATE offers 
            SET title = $1, description = $2, type = $3, discount_type = $4, discount_value = $5, 
            buy_x = $6, get_y = $7, required_product_ids = $8, required_category_ids = $9, combo_product_ids = $10, 
            start_date = $11, end_date = $12, usage_limit = $13
            WHERE id = $14
            RETURNING *
        `;

        const values = [
            title, description, type, discount_type, discount_value,
            buy_x, get_y, JSON.stringify(required_product_ids), JSON.stringify(required_category_ids),
            JSON.stringify(combo_product_ids), start_date, end_date, usage_limit, id
        ];

        const { rows } = await pool.query(query, values);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "Offer not found" });

        res.json({ success: true, message: "Offer updated successfully", offer: rows[0] });
    } catch (error) {
        console.error("Update Offer Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- DELETE OFFER ---
export const deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM offers WHERE id = $1", [id]);
        res.json({ success: true, message: "Offer deleted successfully" });
    } catch (error) {
        console.error("Delete Offer Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
