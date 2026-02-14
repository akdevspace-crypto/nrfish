import React, { useContext } from 'react';
import { useAppContext } from '../Context/AppContext';
import ProductCard from './ProductCard';

const FeaturedSection = () => {
    const { products } = useAppContext();

    // Get top 8 products or "popular" ones
    const featuredProducts = products.slice(0, 8); // Simple slice for now

    return (
        <section className="py-20 bg-gray-50">
            <div className="container-main">
                <div className="text-center mb-16">
                    <span className="text-primary font-semibold text-sm uppercase tracking-wider">Top Rated</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Popular This Week</h2>
                    <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {featuredProducts.map((product) => (
                        <div key={product._id} className="transform hover:-translate-y-2 transition-transform duration-300">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <a href="/products" className="inline-block px-8 py-3 bg-white border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-100 transition-colors shadow-sm">
                        View All Products
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FeaturedSection;
