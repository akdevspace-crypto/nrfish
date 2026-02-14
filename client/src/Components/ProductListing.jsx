import React from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../Context/AppContext';

function ProductListing({ selectedCategory }) {
    const { products } = useAppContext();

    // If selectedCategory is provided, filter by it. Otherwise, show all.
    const filteredProducts = selectedCategory
        ? products.filter(p => p.category === selectedCategory || (selectedCategory === 'Vegetarian' && p.category === 'ReadyToEat'))
        : products;

    // Fallback if no products found for category (just to show something)
    const displayProducts = filteredProducts.length > 0 ? filteredProducts : products.slice(0, 5);

    return (
        <div className='container-main py-10'>
            {/* Section Title */}
            <div className="mb-6">
                <h2 className='text-2xl md:text-3xl font-semibold text-gray-900 capitalize'>
                    {selectedCategory ? `${selectedCategory} Daily Deal` : "Daily Deals & Offers"}
                </h2>
                <div className="w-16 h-[3px] bg-[#417d44] mt-2 rounded-full"></div>
            </div>

            {/* Grid - Tighter spacing */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6'>
                {displayProducts.map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default ProductListing;
