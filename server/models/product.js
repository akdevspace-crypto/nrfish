import { pool } from "../configs/db.js";

// Create a new product
export async function Product({
  name,
  description,
  price,
  offerPrice,
  image,
  category,
  inStock = true,
  weight,
  tags
}) {
  const query = `
    INSERT INTO products (name, description, price, offer_price, image, category, in_stock, weight, tags)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;

  const values = [
    name,
    description, // array
    price,
    offerPrice,
    image,       // array
    category,
    inStock,
    weight,
    tags          // array
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating product:", error.message);
    throw error;
  }
}

