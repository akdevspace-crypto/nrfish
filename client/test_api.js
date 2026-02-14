const axios = require('axios');

async function checkProducts() {
    try {
        const response = await axios.get('http://localhost:4000/api/product/list');
        if (response.data.success) {
            const products = response.data.products;
            console.log(`Total Products: ${products.length}`);

            const categories = {};
            products.forEach(p => {
                const cat = p.category;
                categories[cat] = (categories[cat] || 0) + 1;
            });

            console.log("Categories found in DB:", categories);

            const poultry = products.filter(p => p.category.toLowerCase() === 'poultry');
            console.log("Poultry products count:", poultry.length);
        } else {
            console.log("API Success false:", response.data.message);
        }
    } catch (error) {
        console.error("API Call failed:", error.message);
    }
}

checkProducts();
