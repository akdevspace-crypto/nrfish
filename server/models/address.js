import { pool } from "../configs/db.js";

// Create Address
export async function createAddress({
  userId,
  firstName,
  lastName,
  email,
  phone,
  address,
  city,
  state,
  country,
  pincode
}) {
  const query = `
    INSERT INTO addresses (user_id, first_name, last_name, email, phone, address, city, state, country, pincode)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [
    userId,
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    country,
    pincode
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating address:", error.message);
    throw new Error("Error creating address");
  }
}
