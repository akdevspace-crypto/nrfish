import { pool } from '../configs/db.js';

// --- CREATE COUPON (Admin) ---
export const createCoupon = async (req, res) => {
    try {
        console.log("Create Coupon Body:", req.body);
        const {
            code,
            type,
            discount_percentage,
            valid_until,
            min_order_value,
            specific_product_ids,
            specific_category_ids,
            usage_limit
        } = req.body;

        // Validation
        if (!code || !type || !discount_percentage || !valid_until) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Check if code exists
        const existing = await pool.query("SELECT id FROM coupons WHERE code = $1", [code.toUpperCase()]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Coupon code already exists" });
        }

        const query = `
            INSERT INTO coupons 
            (code, type, discount_percentage, valid_until, min_order_value, specific_product_ids, specific_category_ids, usage_limit)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const values = [
            code.toUpperCase(),
            type,
            discount_percentage,
            valid_until,
            min_order_value || 0,
            JSON.stringify(specific_product_ids || []),
            JSON.stringify(specific_category_ids || []),
            usage_limit || null
        ];

        const { rows } = await pool.query(query, values);
        res.json({ success: true, message: "Coupon created successfully", coupon: rows[0] });

    } catch (error) {
        console.error("Create Coupon Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET ALL COUPONS (Admin) ---
export const getAllCoupons = async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM coupons ORDER BY created_at DESC");
        res.json({ success: true, coupons: rows });
    } catch (error) {
        console.error("Get All Coupons Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- DELETE COUPON (Admin) ---
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM coupons WHERE id = $1", [id]);
        res.json({ success: true, message: "Coupon deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- TOGGLE ACTIVE STATUS (Admin) ---
export const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        await pool.query("UPDATE coupons SET is_active = $1 WHERE id = $2", [is_active, id]);
        res.json({ success: true, message: "Coupon status updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// --- VALIDATE COUPON (Customer) ---
export const validateCoupon = async (req, res) => {
    try {
        const { code, cartItems, cartTotal, userId } = req.body;

        if (!code) return res.status(400).json({ success: false, message: "Coupon code required" });

        const { rows } = await pool.query("SELECT * FROM coupons WHERE code = $1", [code.toUpperCase()]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Invalid Coupon Code" });
        }

        const coupon = rows[0];
        const now = new Date();

        // 1. Check basic validity
        if (!coupon.is_active) {
            return res.status(400).json({ success: false, message: "This coupon is currently inactive" });
        }
        if (new Date(coupon.valid_until) < now) {
            return res.status(400).json({ success: false, message: "This coupon has expired" });
        }
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return res.status(400).json({ success: false, message: "This coupon usage limit has been reached" });
        }

        // 2. Check Min Order Value
        if (cartTotal < parseFloat(coupon.min_order_value)) {
            return res.status(400).json({
                success: false,
                message: `Minimum order value of ₹${coupon.min_order_value} required`
            });
        }

        // 3. Coupon Type Specific Logic
        if (coupon.type === 'USER_BASED') {
            const orderCheck = await pool.query("SELECT id FROM orders WHERE user_id = $1", [userId]);
            if (orderCheck.rows.length > 0) {
                return res.status(400).json({ success: false, message: "This coupon is valid for new users only" });
            }
        }
        else if (coupon.type === 'PRODUCT_BASED') {
            const allowedProductIds = coupon.specific_product_ids || [];
            const allowedCategoryIds = coupon.specific_category_ids || [];

            // Check if cart contains any matching product or category
            const hasProduct = cartItems.some(item =>
                allowedProductIds.includes(item.id) ||
                allowedProductIds.includes(item._id) ||
                allowedCategoryIds.includes(item.category) // Assuming item.category matches the stored category identifier
            );

            if (!hasProduct) {
                return res.status(400).json({ success: false, message: "This coupon is not valid for items in your cart" });
            }
        }

        // Coupon is Valid!
        const discountAmount = (cartTotal * coupon.discount_percentage) / 100;

        res.json({
            success: true,
            message: "Coupon Applied Successfully",
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            couponCode: coupon.code,
            type: coupon.type,
            discountPercentage: coupon.discount_percentage
        });

    } catch (error) {
        console.error("Validation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET AUTO-APPLICABLE COUPONS (Customer) ---
export const getApplicableCoupons = async (req, res) => {
    try {
        const { userId, cartTotal } = req.body;

        const now = new Date();

        // Find active USER_BASED coupons that satisfy criteria
        const { rows } = await pool.query(`
            SELECT * FROM coupons 
            WHERE type = 'USER_BASED' 
            AND is_active = TRUE 
            AND valid_until > $1
            AND min_order_value <= $2
        `, [now.toISOString(), cartTotal || 0]);

        if (rows.length === 0) return res.json({ success: true, coupon: null });

        // Check user eligibility (First Order)
        const orderCheck = await pool.query("SELECT id FROM orders WHERE user_id = $1", [userId]);

        if (orderCheck.rows.length === 0) {
            // User has 0 orders, apply the best coupon (highest discount)
            const bestCoupon = rows.sort((a, b) => b.discount_percentage - a.discount_percentage)[0];

            return res.json({
                success: true,
                coupon: {
                    code: bestCoupon.code,
                    type: bestCoupon.type,
                    discountPercentage: bestCoupon.discount_percentage,
                    message: "First Order Coupon Auto-Applied! 🎉"
                }
            });
        }

        res.json({ success: true, coupon: null });

    } catch (error) {
        console.error("Auto-Apply Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
