import { pool } from '../configs/db.js';

// Add Order : /api/order/add
export async function Order(req, res) {
    try {
        const {
            userId,
            items, // expects an array of {product, quantity}
            amount,
            address,
            paymentType,
            isPaid
        } = req.body;

        const query = `
            INSERT INTO orders (
                user_id,
                items,
                amount,
                address,
                payment_type,
                is_paid
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [
            userId,
            JSON.stringify(items),
            amount,
            address,
            paymentType,
            isPaid
        ];

        const result = await pool.query(query, values);

        res.json({
            success: true,
            message: "Order placed successfully",
            order: result.rows[0]
        });

    } catch (error) {
        console.error("Error placing order:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to place order",
            error: error.message
        });
    }
}
