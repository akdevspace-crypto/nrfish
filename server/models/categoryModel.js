import { pool } from "../configs/db.js";

// Create a new category
export async function createCategory({ name, image, overlayColor, ctaText, sortOrder }) {
    const query = `
    INSERT INTO categories (name, image, overlay_color, cta_text, sort_order)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
    const values = [name, image, overlayColor, ctaText, sortOrder];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Get all categories (optionally filter by status)
export async function getAllCategories(includeInactive = false) {
    const query = includeInactive
        ? `SELECT * FROM categories ORDER BY sort_order ASC, created_at DESC`
        : `SELECT * FROM categories WHERE status = 'active' ORDER BY sort_order ASC, created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
}

// Get category by ID
export async function getCategoryById(id) {
    const query = `SELECT * FROM categories WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

// Update category
export async function updateCategory(id, { name, image, overlayColor, ctaText, sortOrder, status }) {
    const query = `
    UPDATE categories 
    SET name = COALESCE($1, name), 
        image = COALESCE($2, image), 
        overlay_color = COALESCE($3, overlay_color), 
        cta_text = COALESCE($4, cta_text), 
        sort_order = COALESCE($5, sort_order),
        status = COALESCE($6, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *;
  `;
    const values = [name, image, overlayColor, ctaText, sortOrder, status, id];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Delete category (Soft delete can be implemented by setting status to 'deleted', but for now hard delete)
export async function deleteCategory(id) {
    const query = `DELETE FROM categories WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}
