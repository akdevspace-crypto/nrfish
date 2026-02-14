import { pool } from './configs/db.js';
import { Product } from './models/product.js';

const products = [
    // Fish & Seafood
    {
        name: "Premium Seer Fish (Vanjaram) Steaks",
        category: "Fish & Seafood",
        weight: "500g",
        price: 650,
        offerPrice: 580,
        inStock: true,
        description: [
            "Freshly caught standard size slices",
            "Perfect for Fry & Curry",
            "Single bone, easy to eat",
            "Rich in Omega-3"
        ],
        image: [
            "/products/seer_fish.jpg",
            "/products/neimeen.jpeg",
            "/products/seer_fish.jpg"
        ],
        tags: ["Fresh", "Sea Fish", "Slices", "Premium"]
    },
    {
        name: "Atlantic Salmon Fillet",
        category: "Fish & Seafood",
        weight: "250g",
        price: 800,
        offerPrice: 720,
        inStock: true,
        description: [
            "Imported fresh Atlantic Salmon",
            "Boneless fillet cut",
            "Sushi grade quality",
            "Vacuum packed"
        ],
        image: [
            "/products/rohu.jpg", // Substitute
            "/products/tuna.jpg",
            "/products/rohu.jpg"
        ],
        tags: ["Imported", "Boneless", "Healthy"]
    },
    {
        name: "Fresh Tiger Prawns (Cleaned)",
        category: "Fish & Seafood",
        weight: "250g",
        price: 350,
        offerPrice: 299,
        inStock: true,
        description: [
            "Medium sized fresh prawns",
            "Deveined and deshelled",
            "Ready to cook",
            "Sweet succulent taste"
        ],
        image: [
            "/products/prawns.avif",
            "/products/farm_prawn.jpeg",
            "/products/prawns.avif"
        ],
        tags: ["Shellfish", "Cleaned", "Curry Ready"]
    },
    {
        name: "Indian Mackerel (Ayala)",
        category: "Fish & Seafood",
        weight: "500g",
        price: 280,
        offerPrice: 240,
        inStock: true,
        description: [
            "Whole cleaned fish",
            "Small to Medium size",
            "Great for spicy fry",
            "Daily fresh catch"
        ],
        image: [
            "/products/paarai.jpg",
            "/products/paarai.jpg",
            "/products/paarai.jpg"
        ],
        tags: ["Whole Fish", "Daily Catch", "Affordable"]
    },
    {
        name: "White Pomfret (Medium)",
        category: "Fish & Seafood",
        weight: "500g",
        price: 600,
        offerPrice: 550,
        inStock: true,
        description: [
            "Delicate white meat",
            "Whole cleaned",
            "Low bony structure",
            "Premium sea fish"
        ],
        image: [
            "/products/rohu.jpg",
            "/products/paarai.jpg",
            "/products/rohu.jpg"
        ],
        tags: ["Premium", "Whole Fish", "Mild Flavor"]
    },

    // Poultry
    {
        name: "Chicken Curry Cut (Skinless)",
        category: "Poultry",
        weight: "500g",
        price: 180,
        offerPrice: 149,
        inStock: true,
        description: [
            "Antibiotic residue free",
            "Mix of dark and white meat",
            "Perfect for Indian curries",
            "Hygienically packed"
        ],
        image: [
            "/products/chicken_default.png",
            "/products/chicken_default.png",
            "/products/chicken_default.png"
        ],
        tags: ["Everyday", "Curry Cut", "Skinless"]
    },
    {
        name: "Chicken Breast Boneless",
        category: "Poultry",
        weight: "500g",
        price: 280,
        offerPrice: 249,
        inStock: true,
        description: [
            "Tender fillet cuts",
            "High protein, low fat",
            "Best for grilling and salads",
            "Vacuum sealed"
        ],
        image: [
            "/products/chicken_default.png",
            "/products/chicken_default.png",
            "/products/chicken_default.png"
        ],
        tags: ["Lean Protein", "Boneless", "Gym Diet"]
    },
    {
        name: "Chicken Lollipop (Cleaned)",
        category: "Poultry",
        weight: "10 Pcs",
        price: 250,
        offerPrice: 210,
        inStock: true,
        description: [
            "Frenched winglets",
            "Restaurant style cut",
            "Ready for batter & fry",
            "Party favorite"
        ],
        image: [
            "/products/chicken_default.png",
            "/products/chicken_default.png",
            "/products/chicken_default.png"
        ],
        tags: ["Party Snack", "Kids Favorite", "Special Cut"]
    },
    {
        name: "Country Chicken / Nattu Kozhi",
        category: "Poultry",
        weight: "1kg",
        price: 650,
        offerPrice: 599,
        inStock: true,
        description: [
            "Free range bird",
            "Harder meat with intense flavor",
            "Traditional curry cut with skin",
            "Healthier organic choice"
        ],
        image: [
            "/products/chicken_default.png",
            "/products/chicken_default.png",
            "/products/chicken_default.png"
        ],
        tags: ["Organic", "Free Range", "Traditional"]
    },
    {
        name: "Chicken Drumsticks",
        category: "Poultry",
        weight: "500g",
        price: 240,
        offerPrice: 200,
        inStock: true,
        description: [
            "Juicy leg pieces",
            "Skinless and cleaned",
            "Great for tandoor",
            "Succulent meat"
        ],
        image: [
            "/products/chicken_default.png",
            "/products/chicken_default.png",
            "/products/chicken_default.png"
        ],
        tags: ["Leg Piece", "BBQ Ready", "Juicy"]
    },

    // Mutton
    {
        name: "Fresh Mutton Curry Cut",
        category: "Mutton",
        weight: "500g",
        price: 550,
        offerPrice: 480,
        inStock: true,
        description: [
            "Tender goat meat",
            "Mix of bone-in pieces",
            "Strong flavor",
            "Sourced from young goats"
        ],
        image: [
            "/products/mutton_default.png",
            "/products/mutton_default.png",
            "/products/mutton_default.png"
        ],
        tags: ["Goat Meat", "Bone-in", "Curry Special"]
    },
    {
        name: "Mutton Keema (Minced)",
        category: "Mutton",
        weight: "250g",
        price: 380,
        offerPrice: 340,
        inStock: true,
        description: [
            "Finely minced goat meat",
            "Fat trimmed",
            "No boneless cartilage",
            "Ideal for Keema Matar"
        ],
        image: [
            "/products/mutton_default.png",
            "/products/mutton_default.png",
            "/products/mutton_default.png"
        ],
        tags: ["Minced", "Boneless", "Quick Cook"]
    },
    {
        name: "Premium Lamb Chops",
        category: "Mutton",
        weight: "500g",
        price: 750,
        offerPrice: 690,
        inStock: true,
        description: [
            "Exquisite rib chops",
            "Perfect for grilling/pan sear",
            "Soft succulent texture",
            "Gourmet cut"
        ],
        image: [
            "/products/mutton_default.png",
            "/products/mutton_default.png",
            "/products/mutton_default.png"
        ],
        tags: ["Premium", "Ribs", "Grill Ready"]
    },

    // Steaks & Fillet
    {
        name: "Basa Fish Fillet (Platinum)",
        category: "Steaks & Fillet",
        weight: "1kg",
        price: 550,
        offerPrice: 399,
        inStock: true,
        description: [
            "Soft white meat",
            "Boneless frozen fillet",
            "Mild flavor, no smell",
            "Value pack"
        ],
        image: [
            "/products/rohu.jpg",
            "/products/paarai.jpg",
            "/products/rohu.jpg"
        ],
        tags: ["Boneless", "Frozen", "Value"]
    },
    {
        name: "Tuna Loin Steaks",
        category: "Steaks & Fillet",
        weight: "250g",
        price: 300,
        offerPrice: 280,
        inStock: true,
        description: [
            "Red meat tuna",
            "Firm texture like steak",
            "Sashimi grade",
            "High protein"
        ],
        image: [
            "/products/tuna.jpg",
            "/products/tuna.jpg",
            "/products/tuna.jpg"
        ],
        tags: ["Red Meat", "Steak", "Healthy"]
    },

    // Ready To Cook
    {
        name: "Spicy Peri-Peri Wings",
        category: "Ready To Cook",
        weight: "10 Pcs",
        price: 280,
        offerPrice: 240,
        inStock: true,
        description: [
            "Marinated in spicy sauce",
            "Ready to bake or pan fry",
            "Juicy wings",
            "No prep needed"
        ],
        image: [
            "/products/chicken_default.png",
            "/products/chicken_default.png",
            "/products/chicken_default.png"
        ],
        tags: ["Marinated", "Spicy", "Quick"]
    },
    {
        name: "Prawn Ghee Roast Mix",
        category: "Ready To Cook",
        weight: "250g",
        price: 390,
        offerPrice: 350,
        inStock: true,
        description: [
            "Prawns marinated in ghee roast masala",
            "Authentic Mangalorean taste",
            "Pan fry in 10 mins",
            "Aromatic spices"
        ],
        image: [
            "/products/prawns.avif",
            "/products/farm_prawn.jpeg",
            "/products/prawns.avif"
        ],
        tags: ["Marinated", "Regional Special", "Gourmet"]
    },

    // Vegetarian
    {
        name: "Fresh Paneer Malai Cubes",
        category: "Vegetarian",
        weight: "200g",
        price: 120,
        offerPrice: 95,
        inStock: true,
        description: [
            "Super soft cottage cheese",
            "Freshly made daily",
            "Creamy texture",
            "Rich calcium source"
        ],
        image: [
            "/products/paneer.png",
            "/products/paneer.png",
            "/products/paneer.png"
        ],
        tags: ["Dairy", "Fresh", "Vegetarian"]
    },
    {
        name: "Soya Chaap Sticks",
        category: "Vegetarian",
        weight: "500g",
        price: 150,
        offerPrice: 120,
        inStock: true,
        description: [
            "Plant based meat alternative",
            "High protein content",
            "Chewy texture like meat",
            "Great for tandoor"
        ],
        image: [
            "/products/paneer.png",
            "/products/paneer.png",
            "/products/paneer.png"
        ],
        tags: ["Vegan Friendly", "High Protein", "Meat Alternative"]
    }

];

async function seed() {
    const client = await pool.connect();
    try {
        console.log('🌱 Starting seed...');
        await client.query('TRUNCATE TABLE products RESTART IDENTITY;');
        console.log('🧹 Cleared existing products');

        for (const p of products) {
            await Product(p);
            console.log(`✅ Added: ${p.name}`);
        }

        console.log('✨ Seed completed successfully!');
    } catch (e) {
        console.error('❌ Seed failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
