import { pool } from "../configs/db.js";
import bcrypt from 'bcryptjs';

// Create generic OTP
export async function createOTP({ mobile, purpose, order_id = null }) {
    // 1. Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Hash it
    const salt = await bcrypt.genSalt(10);
    const otp_hash = await bcrypt.hash(code, salt);

    // 3. Set expiry (5 minutes)
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);

    const query = `
        INSERT INTO otps (mobile, otp_hash, purpose, order_id, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
    `;

    await pool.query(query, [mobile, otp_hash, purpose, order_id, expires_at]);

    return code; // Return plain code to send via SMS (mocked)
}

// Verify OTP
export async function verifyOTP({ mobile, purpose, order_id, code }) {
    let query = `
        SELECT * FROM otps 
        WHERE mobile = $1 AND purpose = $2 AND is_used = FALSE AND expires_at > NOW()
    `;
    const values = [mobile, purpose];

    if (order_id) {
        query += ` AND order_id = $3`;
        values.push(order_id);
    }

    query += ` ORDER BY created_at DESC LIMIT 1`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) return false;

    const otpRecord = result.rows[0];
    const isValid = await bcrypt.compare(code, otpRecord.otp_hash);

    if (isValid) {
        // Mark as used
        await pool.query(`UPDATE otps SET is_used = TRUE WHERE id = $1`, [otpRecord.id]);
        return true;
    }

    return false;
}
