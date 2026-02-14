import React, { useEffect, useState } from 'react';
import { useAppContext } from '../Context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategorySection = () => {
    const { navigate, axios } = useAppContext();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('/api/category/public-list');
                if (data.success) {
                    setCategories(data.categories);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [axios]);

    if (loading) return <div className="py-20 text-center text-gray-400 font-medium animate-pulse">Loading Categories...</div>;
    if (categories.length === 0) return null;

    // Gradient definitions for the blobs (cycling through them)
    // Gradients: Teal→Aqua, Coral→Orange, Red→Soft Pink, Olive→Lime, Purple→Violet
    const gradients = [
        "from-teal-400 to-cyan-300",
        "from-coral-400 to-orange-300",
        "from-red-400 to-rose-300",
        "from-lime-500 to-green-400",
        "from-purple-400 to-violet-300",
        "from-blue-400 to-sky-300"
    ];

    return (
        <section className="py-16 bg-gray-50/50" id="category-section">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                {/* Design Request: "Category name only (as you requested earlier)" means simple header? 
                   I'll keep the section header minimal but present. */}
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Explore Categories</h2>
                    <div className="w-16 h-1.5 bg-[#42cbf5] rounded-full mx-auto mt-3"></div>
                </div>

                {/* 
                    Grid Layout (Responsive)
                    Mobile: 2 cols, Tablet: 3-4 cols, Desktop: 5-6 cols
                */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                    {categories.map((cat, index) => {
                        const gradient = gradients[index % gradients.length];

                        return (
                            <motion.div
                                key={cat.id}
                                onClick={() => {
                                    navigate(`/products/${cat.name}`);
                                    window.scrollTo(0, 0);
                                }}
                                whileHover={{ y: -8 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative bg-white rounded-[24px] w-[160px] sm:w-[190px] md:w-[220px] h-[220px] sm:h-[240px] md:h-[260px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] cursor-pointer overflow-hidden group transition-all duration-300 flex flex-col items-center justify-center gap-4 sm:gap-6 shrink-0"
                            >
                                {/* 
                                    1. Soft Gradient Blob 
                                    - Abstract organic rounded shape
                                    - Opacity: 12-18%
                                    - Intensifies on hover
                                */}
                                <div className={`absolute top-[-20%] left-[-10%] w-[150%] h-[100%] bg-gradient-to-br ${gradient} opacity-15 blur-3xl rounded-[100%] transition-opacity duration-500 group-hover:opacity-25 pointer-events-none`}></div>

                                {/* 
                                    2. Food Image (Floating) 
                                    - Circular, centered, floating effect
                                    - Size: 120px
                                */}
                                <div className="relative w-[120px] h-[120px] z-10">
                                    <motion.div
                                        className="w-full h-full rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.12)] overflow-hidden bg-white relative"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <img
                                            src={cat.image || 'https://via.placeholder.com/150'}
                                            alt={cat.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                </div>

                                {/* 
                                    3. Category Name 
                                    - Bold, minimal, centered
                                */}
                                <h4 className="relative z-10 text-[16px] font-bold text-gray-800 tracking-wide group-hover:text-black transition-colors capitalize text-center">
                                    {cat.name}
                                </h4>

                                {/* Optional: Subtle shine/ripple effect on click could be added via Framer Motion's variants if needed, but keeping it clean for now. */}
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

export default CategorySection;
