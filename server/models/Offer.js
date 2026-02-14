import { pool } from "../configs/db.js";

// Create a new offer
export async function createOffer({ title, description, discount_type, discount_value, start_date, end_date, image, product_ids, is_active }) {
    const query = `
    INSERT INTO offers (title, description, discount_type, discount_value, start_date, end_date, image, product_ids, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
    const values = [title, description, discount_type, discount_value, start_date, end_date, image, product_ids, is_active];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

// Get all offers (admin or public filtering can be done in controller)
export async function getAllOffers(activeOnly = false) {
    let query = `SELECT * FROM offers`;
    if (activeOnly) {
        query += ` WHERE is_active = TRUE AND start_date <= NOW() AND end_date >= NOW()`;
    }
    query += ` ORDER BY created_at DESC`;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

// Update offer
export async function updateOffer(id, { title, description, discount_type, discount_value, start_date, end_date, image, product_ids, is_active }) {
    const query = `
    UPDATE offers 
    SET title = $1, description = $2, discount_type = $3, discount_value = $4, start_date = $5, end_date = $6, image = $7, product_ids = $8, is_active = $9
    WHERE id = $10
    RETURNING *;
  `;
    const values = [title, description, discount_type, discount_value, start_date, end_date, image, product_ids, is_active, id];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

// Delete offer
export async function deleteOffer(id) {
    const query = `DELETE FROM offers WHERE id = $1 RETURNING *;`;
    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

// Toggle offer status
export async function toggleOffer(id) {
    const query = `
    UPDATE offers 
    SET is_active = NOT is_active
    WHERE id = $1
    RETURNING *;
  `;
    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}
