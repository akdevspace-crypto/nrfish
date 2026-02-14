import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../Context/AppContext';
import ProductCard from '../Components/ProductCard';

const normalize = (str) =>
  str?.toLowerCase().replace(/[^a-z0-9]/g, '');

const ProductCategory = () => {
  const { category } = useParams();
  const { products } = useAppContext();

  const filtered = products.filter(
    p => normalize(p.category) === normalize(category)
  );

  return (
    <main className="relative z-20 min-h-screen pb-[350px] bg-white">
      <div className="container-main py-16">
        <h1 className="text-4xl font-extrabold mb-10 capitalize text-center">
          {decodeURIComponent(category)}
        </h1>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No products available in this category.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ProductCategory;