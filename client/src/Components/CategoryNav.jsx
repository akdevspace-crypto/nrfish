import React from 'react';
import { categories } from '../assets/assets';

function CategoryNav({ onCategorySelect, selectedCategory }) {

    // Mapping to match the screenshot specific labels if needed, otherwise use asset text
    const displayCategories = [
        { ...categories.find(c => c.path === 'Seafood'), label: 'Fish & Seafood' },
        { ...categories.find(c => c.path === 'Poultry'), label: 'Poultry' },
        { ...categories.find(c => c.path === 'Mutton'), label: 'Mutton' },
        { ...categories.find(c => c.path === 'FreshCuts'), label: 'Steaks & Fillet' },
        { ...categories.find(c => c.path === 'ReadyToCook'), label: 'Ready To Cook' },
        { ...categories.find(c => c.path === 'ReadyToEat'), label: 'Vegetarian' },
    ].filter(c => c.path);

    return (
        <div className="bg-white border-b border-gray-200 sticky top-[72px] md:top-[88px] z-40">
            <div className="container-main">
                <div className="flex items-center justify-start md:justify-center gap-10 md:gap-16 overflow-x-auto no-scrollbar py-6">
                    {displayCategories.map((cat, index) => {
                        const isSelected = selectedCategory === cat.label || (selectedCategory === 'Poultry' && cat.label === 'Poultry' && !selectedCategory);
                        // FreshToHome Style: White circles, border change on selection
                        const activeClass = isSelected ? "border-[#417d44] border-2" : "border-gray-200 border hover:border-gray-300";
                        const activeText = isSelected ? "text-[#417d44] font-bold" : "text-gray-600 font-medium";

                        return (
                            <div
                                key={index}
                                className="group flex flex-col items-center gap-3 cursor-pointer flex-shrink-0 min-w-[90px] md:min-w-[100px]"
                                onClick={() => onCategorySelect(cat.label)}
                            >
                                {/* Image Circle/Icon - White background, not gray */}
                                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center p-3 transition-all duration-300 bg-white ${activeClass} shadow-sm`}>
                                    <img src={cat.image} alt={cat.label} className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500" />
                                </div>

                                {/* Label */}
                                <span className={`text-sm md:text-base group-hover:text-[#417d44] transition-colors whitespace-nowrap ${activeText}`}>
                                    {cat.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export default CategoryNav;
