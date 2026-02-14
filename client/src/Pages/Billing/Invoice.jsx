import React from 'react';
import { assets } from '../../assets/assets';

const Invoice = ({ order, currency }) => {

    // Safety check
    if (!order) return <p>No Order Data</p>;

    const invoiceDate = new Date().toLocaleDateString('en-GB'); // Current date for invoice generation
    const orderDate = new Date(order.created_at).toLocaleDateString('en-GB');

    // Calculations
    const subtotal = order.amount; // Use total as base for now
    // Assume delivery fee is included or extra? Let's assume inclusive for simplicity or separate if available.
    // For this UI, let's create a breakdown.
    const deliveryFee = order.delivery_val || 50;
    const itemTotal = subtotal - deliveryFee;
    const taxRate = 0.05;
    const tax = (subtotal * taxRate).toFixed(2);
    const total = (parseFloat(subtotal) + parseFloat(tax)).toFixed(2);


    return (
        <div className="bg-white p-8 md:p-12 text-gray-800 font-sans leading-relaxed max-w-[800px] mx-auto border border-gray-100 shadow-sm print:shadow-none print:border-none">

            {/* Header */}
            <header className="flex justify-between items-start mb-10 pb-6 border-b border-gray-100">
                <div className="flex flex-col">
                    <img src={assets.Logo} alt="NR Seafood" className="h-16 mb-2 object-contain w-32" />
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">INVOICE</h1>
                    <p className="text-sm text-gray-500 mt-1">Invoice #: INV-{String(order.order_id).slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">NR Seafood</h3>
                    <p>123 Seafood Market, Coastal Road</p>
                    <p>Chennai, Tamil Nadu, 600001</p>
                    <p>GSTIN: 33ABCDE1234F1Z5</p>
                    <p>Phone: +91 98765 43210</p>
                </div>
            </header>

            {/* Bill To / Details */}
            <div className="flex justify-between mb-10 text-sm">
                <div className="w-1/2">
                    <h4 className="text-gray-500 uppercase text-xs font-semibold mb-2 tracking-wide">Bill To:</h4>
                    <p className="font-semibold text-gray-900 text-base">{order.address?.first_name} {order.address?.last_name}</p>
                    <p className="text-gray-600 mt-1">{order.address?.address}</p>
                    <p className="text-gray-600">{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                    <p className="text-gray-600 mt-1">Phone: {order.address?.phone}</p>
                </div>
                <div className="text-right">
                    <div className="mb-2">
                        <span className="text-gray-500 block text-xs font-semibold tracking-wide">Date:</span>
                        <span className="font-medium">{invoiceDate}</span>
                    </div>
                    <div className="mb-2">
                        <span className="text-gray-500 block text-xs font-semibold tracking-wide">Order Date:</span>
                        <span className="font-medium">{orderDate}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs font-semibold tracking-wide">Payment Method:</span>
                        <span className="font-medium uppercase">{order.payment_type}</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="mb-8">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
                        <tr>
                            <th className="py-3 px-4">Item Description</th>
                            <th className="py-3 px-4 text-center">Qty</th>
                            <th className="py-3 px-4 text-right">Price</th>
                            <th className="py-3 px-4 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order.products.map((item, index) => (
                            <tr key={index}>
                                <td className="py-3 px-4">
                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                    <p className="text-xs text-gray-500">{item.weight || '500g'}</p>
                                </td>
                                <td className="py-3 px-4 text-center">{item.quantity}</td>
                                <td className="py-3 px-4 text-right">{currency}{item.unit_price || (item.price / item.quantity) || 0}</td>
                                <td className="py-3 px-4 text-right font-medium">{currency}{item.price || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end border-t border-gray-100 pt-6">
                <div className="w-1/2 md:w-1/3">
                    <div className="flex justify-between py-2 text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">{currency}{itemTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm text-gray-600">
                        <span>Delivery Charges</span>
                        <span className="font-medium">{currency}{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm text-gray-600">
                        <span>Tax (5%)</span>
                        <span className="font-medium">{currency}{tax}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t border-gray-200 mt-2 text-base font-bold text-gray-900">
                        <span>Total Amount</span>
                        <span>{currency}{total}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-100 text-center text-xs text-gray-500">
                <p className="mb-2">Thank you for shopping with NR Seafood!</p>
                <p>For any queries, contact support@nrseafood.com</p>
            </footer>
        </div>
    );
};

export default Invoice;
