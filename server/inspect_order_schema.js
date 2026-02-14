
import { pool } from './configs/db.js';
import fs from 'fs';

async function inspectSchema() {
    try {
        const ordersRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders';
        `);
        let orderOutput = '';
        ordersRes.rows.forEach(row => {
            orderOutput += `[ORDER_SCHEMA] Column: ${row.column_name}, Type: ${row.data_type}\n`;
        });
        fs.writeFileSync('orders_schema.txt', orderOutput);
        console.log("Written orders_schema.txt");

        const usersRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        let userOutput = '';
        usersRes.rows.forEach(row => {
            userOutput += `[USER_SCHEMA] Column: ${row.column_name}, Type: ${row.data_type}\n`;
        });
        fs.writeFileSync('users_schema.txt', userOutput);
        console.log("Written users_schema.txt");

        const paymentsRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'payments';
        `);
        let paymentOutput = '';
        paymentsRes.rows.forEach(row => {
            paymentOutput += `[PAYMENT_SCHEMA] Column: ${row.column_name}, Type: ${row.data_type}\n`;
        });
        fs.writeFileSync('payments_schema.txt', paymentOutput);
        console.log("Written payments_schema.txt");

        const ordersData = await pool.query('SELECT id, user_id FROM orders LIMIT 5');
        console.log("Orders Sample:");
        console.log(JSON.stringify(ordersData.rows, null, 2));

    } catch (error) {
        console.error("Error inspecting schema:", error);
    } finally {
        pool.end();
    }
}

inspectSchema();
