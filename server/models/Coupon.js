import { pool } from "../configs/db.js";

// Create a new coupon
export async function createCoupon({ code, min_order_value, discount_value, discount_type, expiry_date, usage_limit, is_active }) {
    const query = `
    INSERT INTO coupons (code, min_order_value, discount_value, discount_type, expiry_date, usage_limit, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
    const values = [code, min_order_value, discount_value, discount_type, expiry_date, usage_limit, is_active];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

// Get all coupons
export async function getAllCoupons(activeOnly = false) {
    let query = `SELECT * FROM coupons`;
    if (activeOnly) {
        query += ` WHERE is_active = TRUE AND expiry_date >= NOW()`;
    }
    query += ` ORDER BY created_at DESC`;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

// Get coupon by code (for validation)
export async function getCouponByCode(code) {
    const query = `SELECT * FROM coupons WHERE code = $1`;
    try {
        const result = await pool.query(query, [code]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

// Update coupon usage
export async function incrementCouponUsage(id) {
    const query = `UPDATE coupons SET used_count = used_count + 1 WHERE id = $1 RETURNING *;`;
    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

// Delete coupon
export async function deleteCoupon(id) {
    const query = `DELETE FROM coupons WHERE id = $1 RETURNING *;`;
    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

// Update coupon details
export async function updateCoupon(id, { code, min_order_value, discount_value, discount_type, expiry_date, usage_limit, is_active }) {
    const query = `
    UPDATE coupons 
    SET code = $1, min_order_value = $2, discount_value = $3, discount_type = $4, expiry_date = $5, usage_limit = $6, is_active = $7
    WHERE id = $8
    RETURNING *;
  `;
    const values = [code, min_order_value, discount_value, discount_type, expiry_date, usage_limit, is_active, id];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}
