
async function test() {
    const categories = ["Seafood", "Fish & Seafood", "Poultry"];

    console.log("Testing backend API...");

    for (const cat of categories) {
        try {
            const url = `http://localhost:4000/api/product/category/${encodeURIComponent(cat)}`;
            console.log(`Testing: ${url}`);
            const res = await fetch(url);

            if (res.status === 404) {
                console.log(`❌ Route not found (404). Server might verify need restart.`);
                continue;
            }

            const data = await res.json();

            if (data.success) {
                console.log(`✅ Success for '${cat}': Found ${data.products.length} products`);
            } else {
                console.log(`❌ Failed for '${cat}': ${data.message}`);
            }
        } catch (err) {
            console.log(`❌ Error testing '${cat}': ${err.message}`);
            if (err.cause) console.log(err.cause);
        }
        console.log("---");
    }
}

test();
