import { pool } from '../configs/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- Helper Functions ---
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const sendSMS = async (mobile, message) => {
    // Placeholder for actual SMS integration (e.g., Twilio, Fast2SMS)
    console.log(`[SMS MOCK] To: ${mobile} | Message: ${message}`);
};

// --- Login OTP Logic ---

// 1. Send Login OTP
export const sendLoginOTP = async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile || mobile.length !== 10) {
            return res.status(400).json({ success: false, message: "Invalid mobile number" });
        }

        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No account found with this mobile number." });
        }

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

        await pool.query(
            `INSERT INTO otps (mobile, otp_hash, purpose, expires_at) VALUES ($1, $2, 'LOGIN', $3)`,
            [mobile, otpHash, expiresAt]
        );

        // Send OTP via SMS (Simulated)
        await sendSMS(mobile, `Your Login OTP for NR Fish Market is ${otp}. Valid for 5 mins.`);

        res.json({ success: true, message: "OTP sent successfully" });

    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
};


// 2. Verify Login OTP
export const verifyLoginOTP = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
        }

        // Fetch valid OTP record
        const otpRecord = await pool.query(
            `SELECT * FROM otps WHERE mobile = $1 AND purpose = 'LOGIN' AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
            [mobile]
        );

        if (otpRecord.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        const validOTP = await bcrypt.compare(otp, otpRecord.rows[0].otp_hash);

        if (!validOTP) {
            return res.status(400).json({ success: false, message: "Incorrect OTP" });
        }

        // Mark OTP as used
        await pool.query('UPDATE otps SET is_used = TRUE WHERE id = $1', [otpRecord.rows[0].id]);

        // Login successful -> Generate Token
        // Get user details
        const userResult = await pool.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
        const user = userResult.rows[0];

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            message: "Login successful",
            user: { name: user.name, email: user.email, mobile: user.mobile }
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};


// --- Delivery OTP Logic ---

// 3. Send Delivery OTP (Triggered by Admin/System)
export const sendDeliveryOTP = async (req, res) => {
    try {
        const { orderId } = req.body; // Can be triggered manually or via status update hook

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        // Fetch Order details to get mobile number
        const orderResult = await pool.query(
            `SELECT o.id, u.mobile as user_mobile, a.phone as address_phone, o.status 
             FROM orders o 
             LEFT JOIN users u ON o.user_id = u.id 
             LEFT JOIN addresses a ON o.address = a.id::varchar
             WHERE o.id = $1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const order = orderResult.rows[0];
        // Prefer shipping address phone, fallback to user registered mobile
        const mobile = order.address_phone || order.user_mobile;

        if (!mobile) {
            return res.status(400).json({ success: false, message: "No mobile number found for this order" });
        }

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry for delivery

        await pool.query(
            `INSERT INTO otps (mobile, otp_hash, purpose, order_id, expires_at) VALUES ($1, $2, 'DELIVERY', $3, $4)`,
            [mobile, otpHash, orderId, expiresAt]
        );

        // Send OTP via SMS (Simulated)
        await sendSMS(mobile, `Your Delivery Confirmation OTP for Order #${orderId} is ${otp}. Please share this with the delivery agent.`);

        res.json({ success: true, message: "Delivery OTP sent to customer" });

    } catch (error) {
        console.error("Error sending Delivery OTP:", error);
        res.status(500).json({ success: false, message: "Failed to send Delivery OTP" });
    }
};
