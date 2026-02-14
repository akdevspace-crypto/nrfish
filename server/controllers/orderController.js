import { pool } from '../configs/db.js';
import bcrypt from 'bcryptjs';

// Place Order (Generic: COD or Online)
export async function placeOrder(req, res) {
    try {
        const { items, address, couponCode, deliverySlot, paymentMethod } = req.body;
        const userId = req.userId;

        if (!address || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid Data" });
        }

        let amount = 0;
        let discountAmount = 0;

        for (const item of items) {
            const result = await pool.query('SELECT offer_price FROM products WHERE id = $1', [item.product]);
            const product = result.rows[0];
            if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
            amount += product.offer_price * item.quantity;
        }

        // Add 2% tax
        amount += Math.floor(amount * 0.02);

        // Handle coupon
        if (couponCode) {
            const couponResult = await pool.query('SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE', [couponCode.trim().toUpperCase()]);
            if (couponResult.rows.length > 0) {
                const coupon = couponResult.rows[0];
                if (coupon.expiry && new Date(coupon.expiry) < new Date()) return res.status(400).json({ success: false, message: "Coupon has expired." });
                if (amount < coupon.min_amount) return res.status(400).json({ success: false, message: `Minimum cart amount must be ₹${coupon.min_amount}.` });

                discountAmount = (amount * coupon.discount) / 100;
                amount -= discountAmount;
            } else {
                return res.status(400).json({ success: false, message: "Invalid or inactive coupon code." });
            }
        }

        // Determine Payment Type
        // We strongly prefer 'cashfree' but support 'Online' as a generic type if needed by frontend
        const isOnline = paymentMethod === 'cashfree' || paymentMethod === 'Online';
        const paymentType = isOnline ? 'Online' : 'COD';

        const orderStatus = paymentType === 'COD' ? 'Order Placed' : 'Payment Pending';
        const paymentStatus = paymentType === 'COD' ? 'Pending' : 'Pending'; // Online is pending until verified

        const query = `
            INSERT INTO orders (
                user_id, items, amount, address, payment_type, is_paid, status, 
                coupon_code, discount_amount, delivery_slot, payment_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;

        const values = [
            userId, JSON.stringify(items), amount, address, paymentType, false, orderStatus,
            couponCode || null, discountAmount, deliverySlot || null, paymentStatus
        ];

        const result = await pool.query(query, values);
        const newOrder = result.rows[0];

        // Create Payment Record for COD (for Admin Verification)
        if (paymentType === 'COD') {
            await pool.query(`
                INSERT INTO payments (order_id, user_id, amount, currency, payment_method, transaction_id, status)
                VALUES ($1, $2, $3, 'INR', 'COD', $4, 'PENDING')
            `, [newOrder.id, userId, amount, `COD_${newOrder.id}_${Date.now()}`]);
        }

        res.json({
            success: true,
            message: "Order created successfully",
            order: newOrder
        });

    } catch (error) {
        console.error("Error placing order:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Place Order COD : /api/order/cod
export async function placeOrderCOD(req, res) {
    // Legacy support or specific COD only route if needed, 
    // but placeOrder above can handle it.
    // We can redirect to placeOrder or keep specific logic.
    // For now, I will modify it to define paymentMethod='cod' and call logic if I were refactoring,
    // but to avoid breaking changes, I will leave it or deprecate it.
    // Implementation Plan: Use `placeOrder` for new flow.
    return placeOrder({ ...req, body: { ...req.body, paymentMethod: 'cod' } }, res);
}

export async function getUserOrders(req, res) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const query = `
            SELECT 
                o.id AS order_id,
                o.user_id,
                o.amount,
                o.payment_type,
                o.is_paid,
                o.created_at,
                o.updated_at,
                o.coupon_code,
                o.discount_amount,
                o.delivery_slot,  -- ✅ Include delivery slot
                jsonb_agg(
                    jsonb_build_object(
                        'product_id', p.id,
                        'product_name', p.name,
                        'price', p.offer_price,
                        'image', p.image,
                        'quantity', (item.value->>'quantity')::int
                    )
                ) AS products,
                jsonb_build_object(
                    'id', a.id,
                    'first_name', a.first_name,
                    'last_name', a.last_name,
                    'email', a.email,
                    'phone', a.phone,
                    'address', a.address,
                    'city', a.city,
                    'state', a.state,
                    'country', a.country,
                    'pincode', a.pincode
                ) AS address
            FROM orders o
            LEFT JOIN LATERAL jsonb_array_elements(o.items) AS item ON true
            LEFT JOIN products p ON p.id::text = item.value->>'product'
            LEFT JOIN addresses a ON a.id::text = o.address
            WHERE o.user_id = $1
              AND (o.payment_type = 'COD' OR o.is_paid = TRUE)
            GROUP BY o.id, a.id
            ORDER BY o.created_at DESC;
        `;

        const result = await pool.query(query, [userId]);

        const orders = result.rows.map(order => ({
            ...order,
            discount_amount: Number(order.discount_amount) || 0,
        }));

        res.json({
            success: true,
            orders: orders,
        });

    } catch (error) {
        console.error("Error fetching user orders:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user orders",
            error: error.message,
        });
    }
}

// Get Single Order by ID : /api/order/user/:id
export async function getOrderById(req, res) {
    try {
        const { orderId } = req.body; // Expecting orderId in body for security or param if GET
        const userId = req.userId;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        const query = `
            SELECT 
                o.id AS order_id,
                o.user_id,
                o.amount,
                o.payment_type,
                o.is_paid,
                o.created_at,
                o.updated_at,
                o.coupon_code,
                o.discount_amount,
                o.delivery_slot,
                o.delivery_slot,
                o.status,
                o.delivery_agent_name,
                o.delivery_agent_phone,
                o.delivery_vehicle_no,
                o.delivery_live_status,
                jsonb_agg(
                    jsonb_build_object(
                        'product_id', p.id,
                        'product_name', p.name,
                        'price', p.offer_price,
                        'image', p.image,
                        'quantity', (item.value->>'quantity')::int
                    )
                ) AS products,
                jsonb_build_object(
                    'id', a.id,
                    'first_name', a.first_name,
                    'last_name', a.last_name,
                    'email', a.email,
                    'phone', a.phone,
                    'address', a.address,
                    'city', a.city,
                    'state', a.state,
                    'country', a.country,
                    'pincode', a.pincode
                ) AS address
            FROM orders o
            LEFT JOIN LATERAL jsonb_array_elements(o.items) AS item ON true
            LEFT JOIN products p ON p.id::text = item.value->>'product'
            LEFT JOIN addresses a ON a.id::text = o.address
            WHERE o.id = $1 AND o.user_id = $2
            GROUP BY o.id, a.id;
        `;

        const result = await pool.query(query, [orderId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const order = {
            ...result.rows[0],
            discount_amount: Number(result.rows[0].discount_amount) || 0,
        };

        res.json({
            success: true,
            order: order,
        });

    } catch (error) {
        console.error("Error fetching order details:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order details",
            error: error.message,
        });
    }
}

// Get All Orders (for seller/ admin) : /api/order/seller
export async function getAllOrders(req, res) {
    try {
        const query = `
            SELECT 
                o.id AS order_id,
                o.user_id,
                o.amount,
                o.payment_type,
                o.is_paid,
                o.is_delivered, 
                o.delivered_at,
                o.created_at,
                o.updated_at,
                o.delivery_slot, 
                o.status,
                o.payment_status,
                o.delivery_agent_name,
                o.delivery_agent_phone,
                o.delivery_vehicle_no,
                o.delivery_live_status,
                pay.transaction_id,
                pay.payment_method AS payment_mode,
                pay.created_at AS payment_date,
                o.delivery_status,
                o.delivery_partner_id,
                dp.name AS delivery_partner_name,
                dp.mobile AS delivery_partner_phone,
                jsonb_agg(
                    jsonb_build_object(
                        'product_id', p.id,
                        'product_name', p.name,
                        'price', p.offer_price,
                        'image', p.image,
                        'quantity', (item.value->>'quantity')::int
                    )
                ) AS products,
                jsonb_build_object(
                    'id', a.id,
                    'first_name', a.first_name,
                    'last_name', a.last_name,
                    'email', a.email,
                    'phone', a.phone,
                    'address', a.address,
                    'city', a.city,
                    'state', a.state,
                    'country', a.country,
                    'pincode', a.pincode
                ) AS address
            FROM orders o
            LEFT JOIN LATERAL jsonb_array_elements(o.items) AS item ON true
            LEFT JOIN products p ON p.id::text = item.value->>'product'
            LEFT JOIN addresses a ON a.id::text = o.address
            LEFT JOIN payments pay ON pay.order_id = o.id
            LEFT JOIN delivery_partners dp ON dp.id = o.delivery_partner_id
            WHERE o.payment_type = 'COD' OR o.is_paid = TRUE
            GROUP BY o.id, a.id, pay.id, dp.id
            ORDER BY o.created_at DESC;
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            orders: result.rows
        });

    } catch (error) {
        console.error("Error fetching all orders:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
}

// Update Order Status (Admin)
export async function updateStatus(req, res) {
    try {
        const {
            orderId,
            status,
            deliveryAgentName,
            deliveryAgentPhone,
            deliveryVehicleNo,
            deliveryLiveStatus
        } = req.body;

        const validStatuses = [
            'Order Placed',
            'Order Confirmed',
            'Processing',
            'Preparing',
            'Packing',
            'Out for Delivery',
            'Shipping',
            'Destination Reached',
            'Waiting for Customer',
            'Payment Verification',
            'Delivered',
            'Completed',
            'Cancelled'
        ];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const query = `
      UPDATE orders
      SET status = COALESCE($1, status), 
          is_delivered = $2, 
          delivered_at = $3,
          delivery_agent_name = COALESCE($5, delivery_agent_name),
          delivery_agent_phone = COALESCE($6, delivery_agent_phone),
          delivery_vehicle_no = COALESCE($7, delivery_vehicle_no),
          delivery_live_status = COALESCE($8, delivery_live_status),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;

        if (status === 'Delivered') {
            const { otp } = req.body;
            if (!otp) {
                return res.status(400).json({ success: false, message: "OTP is required for delivery confirmation" });
            }

            // Verify Delivery OTP using a direct query (avoiding circular dependency or extra imports if possible, or just raw query)
            const otpRecord = await pool.query(
                `SELECT * FROM otps WHERE order_id = $1 AND purpose = 'DELIVERY' AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
                [orderId]
            );

            if (otpRecord.rows.length === 0) {
                return res.status(400).json({ success: false, message: "Invalid or expired Delivery OTP" });
            }

            const validOTP = await bcrypt.compare(otp, otpRecord.rows[0].otp_hash);
            if (!validOTP) {
                return res.status(400).json({ success: false, message: "Incorrect Delivery OTP" });
            }

            // Mark OTP as used
            await pool.query('UPDATE otps SET is_used = TRUE WHERE id = $1', [otpRecord.rows[0].id]);
        }

        const isDelivered = status === 'Delivered';
        const deliveredAt = isDelivered ? new Date() : null;

        const result = await pool.query(query, [
            status,
            isDelivered,
            deliveredAt,
            orderId,
            deliveryAgentName,
            deliveryAgentPhone,
            deliveryVehicleNo,
            deliveryLiveStatus
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            order: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating order status:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}
