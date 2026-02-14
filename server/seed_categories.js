import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

// CRITICAL FIX: Unset conflicting PG env vars
delete process.env.PG_HOST;
delete process.env.PG_PORT;
delete process.env.PG_USER;
delete process.env.PG_PASSWORD;
delete process.env.PG_DATABASE;

import { pool } from './configs/db.js';

const categories = [
    {
        name: "Fish & Seafood",
        image: "http://localhost:5173/categories/fish.png", // Pointing to frontend public folder
        overlay_color: "#0E3B34",
        cta_text: "Fresh Catch",
        sort_order: 1
    },
    {
        name: "Poultry",
        image: "http://localhost:5173/categories/poultry.png",
        overlay_color: "#3D2B1F",
        cta_text: "Farm Fresh",
        sort_order: 2
    },
    {
        name: "Mutton",
        image: "http://localhost:5173/categories/mutton.png",
        overlay_color: "#4A0404",
        cta_text: "Premium Cuts",
        sort_order: 3
    },
    {
        name: "Fresh Cuts",
        image: "http://localhost:5173/categories/steak.png",
        overlay_color: "#2C0E0E",
        cta_text: "Steaks & Fillets",
        sort_order: 4
    },
    {
        name: "Ready to Cook",
        image: "http://localhost:5173/categories/ready.png",
        overlay_color: "#D95F0D",
        cta_text: "Easy Cook",
        sort_order: 5
    }
];

// Strip local URL for relative path storage
const categoriesRelative = categories.map(c => ({
    ...c,
    image: c.image.replace("http://localhost:5173", "")
}));


async function seedCategories() {
    console.log('🌱 Seeding Categories...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Optional: Clear existing categories to avoid duplicates or keep appending?
        // Let's truncate to ensure a clean slate matching "assets.js" exactly.
        await client.query('TRUNCATE TABLE categories RESTART IDENTITY');
        console.log('🧹 Cleared existing categories');

        for (const cat of categoriesRelative) {
            await client.query(`
                INSERT INTO categories (name, image, overlay_color, cta_text, sort_order, status)
                VALUES ($1, $2, $3, $4, $5, 'active')
            `, [cat.name, cat.image, cat.overlay_color, cat.cta_text, cat.sort_order]);
        }

        await client.query('COMMIT');
        console.log('✅ Categories seeded successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

seedCategories();
