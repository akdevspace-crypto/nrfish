import { v2 as cloudinary } from "cloudinary"
import { pool } from "../configs/db.js";
import { Product } from "../models/product.js"

// Add product : /api/product/add
export async function addProduct(req, res) {
  try {
    let productData = JSON.parse(req.body.productData)

    const images = req.files

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
        return result.secure_url
      })
    )

    const newProduct = await Product({
      ...productData,
      image: imagesUrl, // array of image URLs
    });
    res.json({ success: true, message: "Product Added" })
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message })

  }
}


// Get product : /api/product/list
export async function productList(req, res) {
  try {
    console.log("Fetching all products...");
    const query = `SELECT * FROM products ORDER BY created_at DESC;`; // Optional: order by latest
    const result = await pool.query(query);

    console.log(`Fetched ${result.rows.length} products.`);
    res.json({ success: true, products: result.rows });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get products by category : /api/product/category/:category
export async function getProductsByCategory(req, res) {
  try {
    const { category } = req.params;
    console.log(`Fetching products for category: ${category}`);

    // Case-insensitive matching
    const query = `SELECT * FROM products WHERE LOWER(category) = LOWER($1) ORDER BY created_at DESC;`;
    const result = await pool.query(query, [category]);

    console.log(`Found ${result.rows.length} products for category ${category}`);
    res.json({ success: true, products: result.rows });
  } catch (error) {
    console.error(`Error fetching products for category ${req.params.category}:`, error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get single product : /api/product/id
export async function productById(req, res) {
  try {
    const { id } = req.params;

    const query = `SELECT * FROM products WHERE id = $1;`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product: result.rows[0] });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Change product imnStock : /api/product/stock
export async function changeStock(req, res) {
  try {
    const { id, inStock } = req.body;
    const query = `UPDATE products SET in_stock = $1 WHERE id = $2;`;
    const values = [inStock, id];

    await pool.query(query, values);

    res.json({ success: true, message: "Stock Updated" });
  } catch (error) {
    console.error("Error updating stock:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /api/product/:id
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(`DELETE FROM products WHERE id = $1 RETURNING *`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

// PATCH /api/product/:id/pricing
export async function updatePricing(req, res) {
  try {
    const { id } = req.params;
    const { price, offer_price } = req.body;

    if (isNaN(price) || price <= 0 || isNaN(offer_price) || offer_price <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price values" });
    }

    const result = await pool.query(
      `UPDATE products SET price = $1, offer_price = $2 WHERE id = $3 RETURNING *`,
      [price, offer_price, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Prices updated successfully" });
  } catch (error) {
    console.error("Error updating pricing:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}
