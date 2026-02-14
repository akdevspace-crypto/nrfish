
import { pool } from "../configs/db.js";

// Update User CartData : /api/cart/update
export async function updateCart(req, res) {
  try {
    const userId = req.userId; // ✅ Comes from authUser middleware
    const { cartItems } = req.body;

    if (!userId || !cartItems) {
      return res.json({ success: false, message: "Missing userId or cartItems" });
    }

    const result = await pool.query(
      `UPDATE users SET cart_items = $1 WHERE id = $2 RETURNING *`,
      [JSON.stringify(cartItems), userId]
    );

    if (result.rowCount === 0) {
      return res.json({ success: false, message: "User not found or cart not updated" });
    }

    res.json({ success: true, message: "Cart updated", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating cart:", error.message);
    res.json({ success: false, message: error.message });
  }
}

// --- VALIDATE & APPLY OFFERS ---
export const validateCartOffers = async (req, res) => {
  try {
    const { cartItems, cartTotal } = req.body;
    // cartItems should be an array of { id, quantity, price, category, ... }

    const now = new Date().toISOString();

    // 1. Fetch all active offers
    const { rows: offers } = await pool.query(`
            SELECT * FROM offers 
            WHERE is_active = TRUE 
            AND start_date <= $1 
            AND end_date >= $1
        `, [now]);

    let bestOffer = null;
    let appliedDiscount = 0;
    let freeItems = [];
    let message = "";

    // 2. Iterate and find applicable offers
    // Priority: Combo > B1G1/B3G1 > Custom

    // --- CHECK COMBO OFFERS ---
    const comboOffers = offers.filter(o => o.type === 'COMBO');
    for (const offer of comboOffers) {
      const requiredIds = offer.combo_product_ids || [];
      // Check if cart contains ALL required products
      const hasAll = requiredIds.every(reqId =>
        cartItems.some(item => item.id === reqId || item._id === reqId)
      );

      if (hasAll) {
        // Calculate Discount
        let discount = 0;
        if (offer.discount_type === 'FLAT') discount = parseFloat(offer.discount_value);
        else if (offer.discount_type === 'PERCENTAGE') {
          // Calculate total price of combo items
          const comboTotal = cartItems.reduce((sum, item) => {
            if (requiredIds.includes(item.id) || requiredIds.includes(item._id)) {
              return sum + (item.price * item.quantity); // simplified
            }
            return sum;
          }, 0);
          discount = (comboTotal * offer.discount_value) / 100;
        }

        if (discount > appliedDiscount) {
          appliedDiscount = discount;
          bestOffer = offer;
          message = "Combo Offer Applied!";
        }
      }
    }

    if (bestOffer) {
      return res.json({
        success: true,
        offer: bestOffer,
        discountAmount: appliedDiscount,
        freeItems: [],
        message
      });
    }

    // --- CHECK B1G1 / B3G1 ---
    const bogoOffers = offers.filter(o => o.type === 'B1G1' || o.type === 'B3G1');
    for (const offer of bogoOffers) {
      const validProductIds = offer.required_product_ids || [];
      const validCategoryIds = offer.required_category_ids || [];

      // Find eligible items in cart
      const eligibleItems = cartItems.filter(item =>
        validProductIds.includes(item.id) ||
        validProductIds.includes(item._id) ||
        validCategoryIds.includes(item.category)
      );

      const totalQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);
      const reqQty = offer.buy_x;

      if (totalQty >= reqQty) {
        // Determine free items count
        // Example: Buy 1 Get 1. If I have 1, I get 1 free. User needs to Add 2 to cart? 
        // USUALLY: User adds 1, system says "Add another for free" OR System auto-adds.
        // Requirement: "When 1 eligible product is added → 1 free added automatically"
        // Logic: 
        // If user has X items, they get Y free.
        // We return 'freeItems' array to frontend to auto-add.

        // Simplified: Verify if condition met, return offer details. Frontend handles the "Auto Add".

        bestOffer = offer;
        message = `${offer.title} Applied!`;
        break; // Apply first found for now
      }
    }

    // --- CUSTOM OFFERS ---
    if (!bestOffer) {
      const customOffers = offers.filter(o => o.type === 'CUSTOM');
      // Logic for custom offers...
    }

    res.json({
      success: true,
      offer: bestOffer,
      discountAmount: appliedDiscount,
      freeItems,
      message
    });

  } catch (error) {
    console.error("Offer Validation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};