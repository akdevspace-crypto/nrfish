import { pool } from '../configs/db.js';

// Create New Enquiry
export const createEnquiry = async (req, res) => {
    try {
        const { name, email, mobile, product_id, message } = req.body;

        const query = `
            INSERT INTO enquiries (name, email, mobile, product_id, message)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [name, email, mobile, product_id || null, message];

        const result = await pool.query(query, values);

        // Simulation of Email Sending
        console.log(`[EMAIL SENT] To: Admin, Subject: New Enquiry from ${name}, Content: ${message}`);

        res.status(201).json({ success: true, message: "Enquiry submitted successfully", enquiry: result.rows[0] });

    } catch (error) {
        console.error("Error creating enquiry:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Initialize Table (Temporary helper)
export const initTable = async (req, res) => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS enquiries (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) NOT NULL,
                product_id VARCHAR(255),
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(query);
        res.status(200).json({ success: true, message: "Enquiries table created" });
    } catch (error) {
        console.error("Error creating table:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// List Enquiries (Optional/Admin)
export const getEnquiries = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM enquiries ORDER BY created_at DESC");
        res.status(200).json({ success: true, enquiries: result.rows });
    } catch (error) {
        console.error("Error fetching enquiries:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
