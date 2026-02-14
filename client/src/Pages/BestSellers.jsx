import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../Context/AppContext';
import ProductCard from '../Components/ProductCard';

const BestSellers = () => {
    const { products } = useContext(AppContext);
    const [bestSellers, setBestSellers] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0); // Always start at top
        if (products) {
            // Filter by is_bestseller flag
            const filtered = products.filter(item => item.is_bestseller);
            setBestSellers(filtered);
        }
    }, [products]);

    return (
        <div className="min-h-screen bg-white py-10 px-4 md:px-12">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Best Sellers</h1>
            <p className="text-center text-gray-500 mb-10">Our most popular products loved by customers</p>

            {bestSellers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {bestSellers.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 mt-20">
                    <p className="text-lg">No best sellers curated yet.</p>
                </div>
            )}
        </div>
    );
};

export default BestSellers;
