import React, { useState } from 'react';
import { assets, categories } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../Context/AppContext';

const HeroSection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { setSearchQuery } = useAppContext();

    const handleSearch = (e) => {
        e.preventDefault();
        const term = searchTerm.trim().toLowerCase();

        if (term) {
            // Check if search term matches any category (partial match on text or path)
            // e.g. "fish" matches "Fish & Seafood", "seafood" matches "Seafood" path
            const matchedCategory = categories.find(cat =>
                cat.text.toLowerCase().includes(term) ||
                cat.path.toLowerCase().includes(term)
            );

            if (matchedCategory) {
                // Redirect to specific category page
                setSearchQuery(""); // Clear global search query since we are going to a category page
                navigate(`/products/${encodeURIComponent(matchedCategory.text)}`);
            } else {
                // Standard global search
                setSearchQuery(searchTerm);
                navigate('/products');
            }
        }
    };

    return (
        <section id="hero-section" className="relative min-h-[85vh] w-full overflow-hidden flex items-center">

            {/* MANDATORY BACKGROUND IMAGE */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/background_6.png')",
                    backgroundPosition: "center right",
                }}
            />

            {/* MANDATORY DARK CINEMATIC OVERLAY - Updated Gradient for Text Visibility */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: 'linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.30) 60%, rgba(0,0,0,0.10) 100%)'
                }}
            />

            {/* HERO CONTENT - Aligned to Left */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center pb-16 pl-[5%] md:pl-[10%]" >

                {/* Max Content Width 520px */}
                <div className="w-full max-w-[520px] flex flex-col space-y-5 pt-16">


                    {/* Headline - Typography Fix */}
                    <h1 className="flex flex-col font-semibold tracking-tight drop-shadow-lg" style={{ fontSize: '52px', lineHeight: '1.15', letterSpacing: '2px' }}>
                        <span style={{ color: '#E5E7EB' }}>Order Healthy And</span>
                        <span style={{ color: '#7CFF6B' }} className="filter drop-shadow-[0_4px_15px_rgba(124,255,107,0.3)] text-[60px]">
                            Fresh Food
                        </span>
                        <span style={{ color: '#D1D5DB' }} className="text-4xl font-medium mt-1">Any Time</span>
                    </h1>

                    {/* Search Bar - Global Search */}
                    <form onSubmit={handleSearch} className="relative w-full group mt-4">
                        <div className="relative overflow-hidden rounded-full bg-white shadow-[0_8px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ring-4 ring-transparent focus-within:ring-[#7ed957]/30 transform hover:scale-[1.01]">
                            <input
                                type="text"
                                className="w-full bg-transparent text-[#0b0b0b] h-[64px] pl-6 pr-20 focus:outline-none text-lg placeholder-gray-400 font-medium"
                                placeholder="Search 'Seafood'..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#42cbf5] hover:bg-[#1dc1f2] text-[#0b0b0b] w-[52px] h-[52px] rounded-full flex items-center justify-center transition-transform hover:rotate-12 shadow-md"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    {/* Popular Chips */}
                    <div className="pt-2 pl-1">
                        <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest mb-2">Popular Search:</p>
                        <div className="flex flex-wrap gap-2">
                            {['Seafood', 'Chicken', 'Prawns', 'Crab'].map((item, index) => (
                                <div key={index}
                                    className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white leading-none text-xs font-semibold hover:bg-[#42cbf5] hover:text-[#0b0b0b] hover:border-[#42cbf5] transition-all cursor-pointer backdrop-blur-sm"
                                    onClick={() => { setSearchQuery(item); navigate('/products') }}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM ORGANIC CURVE - Clean Separation */}
            <div className="absolute bottom-[-1px] left-0 w-full z-20 pointer-events-none">
                <svg
                    className="w-[110%] h-[100px] -ml-[2%]"
                    viewBox="0 0 1440 100"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="#ffffff"
                        d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,101 L0,101 Z"
                    />
                </svg>
            </div>

        </section>
    );
};

export default HeroSection;
