import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing

dotenv.config();

// Setup the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.PG_URI,
});

// Function to create a new user
const createUser = async (name, email, password, cartItems = {}) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  const query = `
    INSERT INTO users (name, email, password, cart_items)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [name, email, hashedPassword, JSON.stringify(cartItems)];

  try {
    // Execute the query and return the created user
    const res = await pool.query(query, values);
    console.log('User created:', res.rows[0]);
    return res.rows[0];
  } catch (error) {
    // Handle any errors by throwing them so the caller can handle them
    console.error('Error creating user:', error.message);
    throw new Error('Error creating user');
  }
};

export default createUser;
