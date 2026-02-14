import React from 'react';
import { useAppContext } from '../Context/AppContext';
import ProductCard from '../Components/ProductCard';

const AllProducts = () => {
  const { products } = useAppContext();

  return (
    <main className="relative z-20 min-h-screen pb-[350px] bg-white">
      <div className="container-main py-16">
        <h1 className="text-4xl font-extrabold text-center mb-12">
          All Products
        </h1>

        {/* Search/Filter section could be added here if needed, but starting with the grid as requested */}

        {(!products || products.length === 0) ? (
          <p className="text-center text-gray-500 text-lg">No products found. (Context check: {products ? 'Loaded' : 'Null'})</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AllProducts;;