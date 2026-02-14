import 'dotenv/config';
import { pool } from './configs/db.js';

async function checkSchema() {
    try {
        const usersSchema = await pool.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'id';
        `);
        console.log("Users ID Type:", usersSchema.rows[0].data_type);

        const ordersIdSchema = await pool.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'id';
        `);
        console.log("Orders ID Type:", ordersIdSchema.rows[0].data_type);

        const ordersUserIdSchema = await pool.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'user_id';
        `);
        console.log("Orders UserID Type:", ordersUserIdSchema.rows[0].data_type);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkSchema();
