import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const FAQs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqData = [
        {
            category: "Quality & Safety",
            questions: [
                { q: "Is your seafood fresh or frozen?", a: "We supply strictly fresh seafood. We only use ice for packing to maintain temperature during transit." },
                { q: "Do you use chemical preservatives?", a: "Absolutely not. Our products are 100% free from chemicals like formalin or ammonia." },
                { q: "How are prawns and crabs packed?", a: "Prawns and crabs are cleaned (if requested) and packed in high-quality, food-grade verified packaging with adequate icing to ensure freshness." }
            ]
        },
        {
            category: "Sourcing",
            questions: [
                { q: "Where do you source your fish from?", a: "We source directly from local fishermen and trusted harbours in Kerala to ensure the daily catch reaches you." }
            ]
        },
        {
            category: "Delivery",
            questions: [
                { q: "Can I choose delivery time slots?", a: "Yes, you can select your preferred delivery slot during checkout based on availability in your area." },
                { q: "Is same-day delivery available?", a: "Yes, for orders placed before our cut-off time, we offer same-day delivery." },
                { q: "How do I track my order in real-time?", a: "You can track your order status live from the 'My Orders' section in your account." },
                { q: "Do you deliver during monsoon or fishing bans?", a: "We strive to maintain supply through our network, but availability of certain sea fish might be limited during trawling bans. We offer freshwater alternatives during these times." }
            ]
        },
        {
            category: "Orders & Services",
            questions: [
                { q: "Do you clean and cut fish as per customer preference?", a: "Yes! We offer free cleaning and cutting services. You can select your cut preference (sliced, fillet, whole cleaned, etc.) on the product page." },
                { q: "Do you supply bulk orders for restaurants?", a: "Yes, we do handle bulk orders for restaurants and events. Please contact our support team for specialized B2B rates." }
            ]
        }
    ];

    // Filtering logic
    const filteredFAQs = faqData.map(section => ({
        ...section,
        questions: section.questions.filter(item =>
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(section => section.questions.length > 0);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h1>

                {/* Search Bar */}
                <div className="relative mb-10">
                    <input
                        type="text"
                        placeholder="Search for questions..."
                        className="w-full p-4 pl-12 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                </div>

                <div className="space-y-8">
                    {filteredFAQs.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 ml-1">{section.category}</h2>
                            <div className="space-y-3">
                                {section.questions.map((faq, index) => {
                                    const globalIndex = `${sectionIndex}-${index}`;
                                    return (
                                        <div key={globalIndex} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <button
                                                className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
                                                onClick={() => toggleFAQ(globalIndex)}
                                            >
                                                <span className="font-medium text-gray-900">{faq.q}</span>
                                                {openIndex === globalIndex ? (
                                                    <ChevronUp className="text-primary flex-shrink-0 ml-4" size={20} />
                                                ) : (
                                                    <ChevronDown className="text-gray-400 flex-shrink-0 ml-4" size={20} />
                                                )}
                                            </button>

                                            {openIndex === globalIndex && (
                                                <div className="px-6 pb-5 pt-0 text-gray-600 border-t border-gray-50 bg-gray-50/50">
                                                    <p className="pt-3">{faq.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredFAQs.length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            No FAQs found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FAQs;
