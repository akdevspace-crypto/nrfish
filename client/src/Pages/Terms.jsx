import React, { useEffect } from 'react';

const Terms = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b">Terms & Conditions</h1>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Introduction</h2>
                        <p>
                            Welcome to <strong>NR FISH MARKET</strong> (www.nrfishmarket.com). By accessing or using our website and services,
                            you agree to comply with and be bound by these Terms and Conditions. Please read them carefully.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. User Account</h2>
                        <p>
                            To access certain features of our platform, you may be required to create an account. You are responsible for maintaining
                            the confidentiality of your account information and for all activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Products and Pricing</h2>
                        <p>
                            We strive to provide accurate product descriptions and pricing. However, prices and availability are subject to change
                            without notice. In the event of a pricing error, we reserve the right to cancel any orders placed at the incorrect price.
                            All seafood and meat products are subject to seasonal availability.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Orders and Payments</h2>
                        <p>
                            By placing an order, you agree to provide accurate and complete information. We accept various payment methods as indicated
                            on our checkout page. Payment must be received before your order is processed for delivery.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Delivery</h2>
                        <p>
                            We currently deliver to select locations. Delivery times are estimates and may vary due to unforeseen circumstances or
                            weather conditions. We are not liable for delays beyond our reasonable control.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Returns and Refunds</h2>
                        <p>
                            Due to the perishable nature of our products, we have a strict return policy. If you receive a damaged or incorrect item,
                            please contact us immediately at support@nrfishmarket.com with photographic evidence within 2 hours of delivery for a
                            resolution.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Limitation of Liability</h2>
                        <p>
                            NR Fish Market shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in
                            connection with the use of our services or products.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Contact Information</h2>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <p className="font-medium text-gray-900 mb-2">NR Fish Market Foods Private Limited</p>
                            <p>No. 24, 1st Floor, Fish Market Road,</p>
                            <p>Harbour Area, Kochi – 682001, Kerala, India</p>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p><strong>Grievance Officer:</strong> Customer Support Manager</p>
                                <p><strong>Email:</strong> support@nrfishmarket.com</p>
                                <p><strong>Phone:</strong> +91 9XXXXXXXXX</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
