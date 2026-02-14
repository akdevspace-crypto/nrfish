    import React, { useMemo } from 'react';
    import ProductCard from './ProductCard';
    import { useAppContext } from '../Context/AppContext';
    import { useNavigate } from 'react-router-dom';

    const TopProducts = () => {
        const { products } = useAppContext();
        const navigate = useNavigate();

        // Limit to 10-12 items to fill the dense grid
        const topProducts = useMemo(() => {
            if (!products) return [];
            return products.filter(p => p.inStock || true).slice(0, 10);
        }, [products]);

        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                    {/* Header - Compact */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 pb-4">
                        <div className="text-left">
                            <span className="text-[#42cbf5] font-bold tracking-widest uppercase text-[10px]">Best Sellers</span>
                            <h2 className="text-3xl font-extrabold text-[#0E3B34] mt-1">Top Selling Products</h2>
                            <div className="w-16 h-1 bg-[#7ED957] mt-3 rounded-full"></div>
                        </div>

                        <button
                            onClick={() => navigate('/products')}
                            className="hidden md:flex items-center gap-2 text-[#0E3B34] font-bold hover:text-[#7ED957] transition-colors group text-xs uppercase tracking-wide px-6 py-2 border border-[#0E3B34]/20 rounded-full hover:border-[#7ED957]"
                        >
                            View All
                            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>

                    {/* Grid - Dense 5-6 Columns */}
                    {/* Desktop: grid-cols-5 or 6. Tablet: 3. Mobile: 2. */}
                    {/* Gap reduced to 20px (gap-5) for density */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                        {topProducts.map((product) => (
                            <div key={product.id} className="w-full flex justify-center">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    {/* Mobile View All */}
                    <div className="mt-10 text-center md:hidden">
                        <button
                            onClick={() => navigate('/products')}
                            className="px-8 py-3 bg-white border border-gray-200 rounded-full text-gray-800 font-bold shadow-sm hover:bg-gray-50 transition-colors uppercase tracking-wider text-xs"
                        >
                            View All Products
                        </button>
                    </div>

                </div>
            </section>
        );
    };

    export default TopProducts;
