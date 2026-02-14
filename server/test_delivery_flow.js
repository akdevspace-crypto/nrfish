import 'dotenv/config';
import { pool } from './configs/db.js';

const BASE_URL = 'http://localhost:8080/api/delivery';
const ADMIN_URL = 'http://localhost:8080/api/delivery/admin';

async function createDummyOrder() {
    // Check if address exists or create one
    // Simple mock address
    const addrQuery = `
        INSERT INTO addresses (first_name, last_name, phone, address, city, pincode, user_id)
        VALUES ('Test', 'User', '9988776655', '123 Test St', 'Test City', '600000', 'uuid-placeholder')
        RETURNING id;
    `;
    // We might need a real user_id or valid UUID if FK constraint exists.
    // orders.address is text or UUID?
    // setup_delivery_schema.js: "JOIN addresses a ON a.id::text = o.address"
    // So o.address matches a.id.

    // User ID FK?
    // orders.userId references users(id)?
    // Inspect orders table schema?

    // Let's assume we can insert with dummy UUIDs if no FK checks or if we create dummy user.
    // Safest: Insert dummy user, address, then order.

    try {
        // 1. User
        const userRes = await pool.query(`INSERT INTO users (name, email, password, mobile) VALUES ('Test User', 'test@test.com', 'pass', '1234567890') ON CONFLICT DO NOTHING RETURNING id`);
        let userId = userRes.rows[0]?.id;
        if (!userId) {
            const u = await pool.query(`SELECT id FROM users WHERE email='test@test.com'`);
            userId = u.rows[0].id;
        }

        // 2. Address
        const addrRes = await pool.query(`INSERT INTO addresses (first_name, last_name, email, phone, address, city, state, pincode, user_id) VALUES ('Test', 'User', 'test@test.com', '9988776655', '123 Test St', 'Test City', 'Test State', '600000', $1) RETURNING id`, [userId]);
        const addressId = addrRes.rows[0].id;

        // 3. Order
        const orderRes = await pool.query(`
            INSERT INTO orders (user_id, address, amount, payment_type, status, delivery_status, items, date) 
            VALUES ($1, $2, 500, 'COD', 'Order Placed', 'ASSIGNED', '[]', NOW())
            RETURNING id;
        `, [userId, addressId]);

        return orderRes.rows[0].id;
    } catch (e) {
        console.error("Dummy Order Creation Failed:", e);
        return null;
    }
}

async function runTest() {
    try {
        console.log("🚀 Starting Delivery System Test (Fetch)...");

        // Create Dummy Order
        console.log("📦 Creating Dummy Order in DB...");
        const dummyOrderId = await createDummyOrder();
        if (!dummyOrderId) throw new Error("Could not create dummy order");
        console.log("✅ Dummy Order Created ID:", dummyOrderId);

        console.log("0️⃣ Logging in as Admin...");
        const adminLoginRes = await fetch(`http://localhost:8080/api/seller/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "admin@gmail.com", password: "12345678" })
        });
        const adminLoginData = await adminLoginRes.json();
        console.log("✅ Admin Login:", adminLoginData.success ? "Success" : adminLoginData.message);

        // Extract Cookie
        const cookies = adminLoginRes.headers.get('set-cookie');
        let sellerToken = "";
        if (cookies) {
            const match = cookies.match(/sellerToken=([^;]+)/);
            if (match) sellerToken = match[1];
        }

        if (!sellerToken) {
            console.log("⚠️ Failed to get Admin Cookie");
            return;
        }

        // 1. Add Partner
        const randomNum = Math.floor(Math.random() * 9000000000) + 1000000000;
        const mobile = randomNum.toString();
        const password = "password123";

        console.log(`\n1️⃣ Adding Partner (Mobile: ${mobile})...`);
        const addRes = await fetch(`${ADMIN_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `sellerToken=${sellerToken}`
            },
            body: JSON.stringify({
                name: "Test Partner",
                mobile,
                password,
                vehicle_no: "TN-00-TEST",
                license_no: "LIC-TEST",
                proof_doc_url: "http://example.com/doc.jpg",
                photo_url: "http://example.com/photo.jpg"
            })
        });
        const addData = await addRes.json();
        console.log("✅ Partner Add Result:", addData);

        const partnerId = addData.partner.id;

        // 1.5 Activate Partner (Admin)
        console.log(`\n1️⃣.5️⃣ Activating Partner...`);
        const activateRes = await fetch(`${ADMIN_URL}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `sellerToken=${sellerToken}`
            },
            body: JSON.stringify({ id: partnerId, is_active: true, is_verified: true })
        });
        const activateData = await activateRes.json();
        console.log("✅ Activation Result:", activateData.success ? "Success" : activateData.message);

        // 2. Login
        console.log("\n2️⃣ logging In...");
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, password })
        });
        const loginData = await loginRes.json();
        console.log("✅ Login Init Result:", loginData);

        const otp = loginData.logic_otp;
        if (!otp) {
            console.log("⚠️ No OTP returned. Response:", JSON.stringify(loginData));
            return;
        }

        // 3. Verify Login
        console.log(`\n3️⃣ Verifying OTP: ${otp}...`);
        const verifyRes = await fetch(`${BASE_URL}/login-verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, otp })
        });
        const verifyData = await verifyRes.json();
        console.log("✅ Login Verify Result:", verifyData.success ? "Success" : verifyData.message);

        const token = verifyData.token;
        if (token) console.log("🔑 Token received");

        // 3.5 Assign an Order (Admin)
        console.log("\n3️⃣.5️⃣ Assigning Order...");
        // Fetch all orders (using admin endpoint or just public if unprotected? Seller uses authSeller)
        // Seller endpoint: /api/seller/orders creates orders? No, get orders.
        // I'll use the existing /api/delivery/admin/list endpoint? No that's for partners.
        // I need to fetch orders. I'll assume an order exists in DB.
        // I'll fetch orders via seller endpoint?
        // sellerRoute: router.post('/orders', sellerAuth, getAllOrders) ? 
        // sellerController usually has getOrders.
        // BUT strict constraint: use what's available.
        // deliveryRoute doesn't have "get all orders for admin".
        // Wait, `getAssignedOrders` is for partner.

        // I will use a direct query or assume order ID 1 exists?
        // Or create a dummy order?
        // Creating order is complex (needs address, user).

        // Let's assume order ID "1" exists or fetch from `orders` table if I can?
        // I can't query DB directly from this script easily without pg client.
        // But `server.js` has `orderRouter`. `/api/order/admin/all`?
        // `orderRoute.js` usually has `adminAllOrders`.

        // Let's try to fetch all orders using Admin Seller Token if possible.
        // sellerRoute doesn't show order specific routes?
        // `orderRoute.js` likely has protected route.
        // I'll use `http://localhost:8080/api/order/list` (usually admin protected).

        // Let's try to use Hardcoded Order ID "1" if I can't fetch. 
        // Or if I read `test_delivery_flow.js`, I already fetch orders?
        // "4. Get Assigned Orders" -> returns empty.

        // Use `POST /api/delivery/admin/assign`.
        // Payload: { orderId, deliveryPartnerId }
        // I need a valid orderId.
        // I'll try to fetch all orders from `/api/order/list` matching admin token?
        // If not, I'll hardcode orderId = 1?

        // Fetching orders via Seller API:
        // Fetching orders via Seller API:
        console.log("Fetching all orders from seller endpoint...");
        const ordersListRes = await fetch(`http://localhost:8080/api/order/seller`, {
            method: 'GET',
            headers: { 'Cookie': `sellerToken=${sellerToken}` }
        });
        const ordersList = await ordersListRes.json();

        if (!ordersList.success || !ordersList.orders || ordersList.orders.length === 0) {
            console.log("⚠️ No orders found in system to assign.");
            // I'll try to insert one via `POST /api/order/place`?
            // Too complex.
            // I'll use a hardcoded fallback if list fails.
            // But if list fails, hardcode likely fails too.
            return;
        }

        const orderToAssign = ordersList.orders[0].id;
        console.log(`Assigning Order ID: ${orderToAssign} to Partner...`);

        const assignRes = await fetch(`${ADMIN_URL}/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `sellerToken=${sellerToken}`
            },
            body: JSON.stringify({ orderId: orderToAssign, deliveryPartnerId: verifyData.partner.id })
        });
        const assignData = await assignRes.json();
        console.log("✅ Order Asssigned:", assignData.success ? "Success" : assignData.message);


        // 4. Get Assigned Orders
        console.log("\n4️⃣ Fetching Assigned Orders...");
        const ordersRes = await fetch(`${BASE_URL}/orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            }
        });
        const ordersData = await ordersRes.json();
        console.log("✅ Orders Fetched:", ordersData.orders ? ordersData.orders.length : ordersData.message);

        if (!ordersData.orders || ordersData.orders.length === 0) {
            console.log("⚠️ Order not assigned correctly.");
            return;
        }

        // 5. Simulate Strict Workflow
        console.log("\n5️⃣ Simulating Workflow...");
        const orderId = ordersData.orders[0].id;
        const isCOD = ordersData.orders[0].payment_type === 'COD';

        const statuses = ['ACCEPTED', 'ON_THE_WAY', 'REACHED_DESTINATION'];
        if (isCOD) statuses.push('PAYMENT_COLLECTED');

        for (const status of statuses) {
            console.log(`\n👉 Updating Status to: ${status}...`);
            const statusRes = await fetch(`${BASE_URL}/order/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token
                },
                body: JSON.stringify({ deliveryPartnerId: verifyData.partner.id, orderId, status })
            });
            const statusData = await statusRes.json();
            console.log(`✅ ${status} Updated:`, statusData.success ? "Success" : statusData.message);
            if (!statusData.success) return; // Stop if failed
        }

        // 6. Init OTP
        console.log("\n6️⃣ Requesting Delivery OTP...");
        const otpRes = await fetch(`${BASE_URL}/order/init-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({ deliveryPartnerId: verifyData.partner.id, orderId })
        });
        const otpData = await otpRes.json();
        console.log("✅ OTP Init:", otpData.success ? "Success" : otpData.message);
        const deliveryOtp = otpData.delivery_otp;

        if (!deliveryOtp) {
            console.log("⚠️ No Delivery OTP returned");
            return;
        }

        // 7. Complete Delivery
        console.log(`\n7️⃣ Completing Delivery with OTP: ${deliveryOtp}...`);
        const completeRes = await fetch(`${BASE_URL}/order/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({ deliveryPartnerId: verifyData.partner.id, orderId, otp: deliveryOtp })
        });
        const completeData = await completeRes.json();
        console.log("✅ Delivery Completed:", completeData.success ? "Success" : completeData.message);

    } catch (error) {
        console.error("❌ Test Failed:", error.message);
    }
}

runTest();
