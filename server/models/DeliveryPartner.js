import { pool } from "../configs/db.js";

// Create a new delivery partner
export async function createPartner({ name, mobile, password_hash, vehicle_no, license_no, proof_doc_url, photo_url }) {
    const query = `
        INSERT INTO delivery_partners (name, mobile, password_hash, vehicle_no, license_no, proof_doc_url, photo_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [name, mobile, password_hash, vehicle_no, license_no, proof_doc_url, photo_url];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Get partner by mobile
export async function getPartnerByMobile(mobile) {
    const query = `SELECT * FROM delivery_partners WHERE mobile = $1`;
    const result = await pool.query(query, [mobile]);
    return result.rows[0];
}

// Get partner by ID
export async function getPartnerById(id) {
    const query = `SELECT * FROM delivery_partners WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

// Get all partners (Admin)
export async function getAllPartners() {
    const query = `SELECT * FROM delivery_partners ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
}

// Update partner status (Active/Inactive, Verified)
export async function updatePartnerStatus(id, { is_active, is_verified }) {
    // Build dynamic query
    let query = `UPDATE delivery_partners SET updated_at = NOW()`;
    const values = [id];
    let paramIndex = 2;

    if (is_active !== undefined) {
        query += `, is_active = $${paramIndex++}`;
        values.push(is_active);
    }
    if (is_verified !== undefined) {
        query += `, is_verified = $${paramIndex++}`;
        values.push(is_verified);
    }

    query += ` WHERE id = $1 RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
}

// Update partner stats
export async function updatePartnerStats(id, { order_assigned, order_delivered }) {
    let query = `UPDATE delivery_partners SET updated_at = NOW()`;
    if (order_assigned) query += `, total_orders_assigned = total_orders_assigned + 1`;
    if (order_delivered) query += `, total_orders_delivered = total_orders_delivered + 1`;

    query += ` WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

// Update location
export async function updatePartnerLocation(id, latitude, longitude) {
    const query = `
        UPDATE delivery_partners 
        SET current_latitude = $2, current_longitude = $3, updated_at = NOW()
        WHERE id = $1 
        RETURNING *
    `;
    const result = await pool.query(query, [id, latitude, longitude]);
    return result.rows[0];
}

// Delete Partner
export async function deletePartner(id) {
    const query = `DELETE FROM delivery_partners WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

// Update Partner Details
export async function updatePartner(id, { name, mobile, vehicle_no, license_no, photo_url, proof_doc_url, password_hash }) {
    let query = `UPDATE delivery_partners SET updated_at = NOW()`;
    const values = [id];
    let paramIndex = 2;

    if (name) { query += `, name = $${paramIndex++}`; values.push(name); }
    if (mobile) { query += `, mobile = $${paramIndex++}`; values.push(mobile); }
    if (vehicle_no) { query += `, vehicle_no = $${paramIndex++}`; values.push(vehicle_no); }
    if (license_no) { query += `, license_no = $${paramIndex++}`; values.push(license_no); }
    if (photo_url) { query += `, photo_url = $${paramIndex++}`; values.push(photo_url); }
    if (proof_doc_url) { query += `, proof_doc_url = $${paramIndex++}`; values.push(proof_doc_url); }
    if (password_hash) { query += `, password_hash = $${paramIndex++}`; values.push(password_hash); }

    query += ` WHERE id = $1 RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
}
