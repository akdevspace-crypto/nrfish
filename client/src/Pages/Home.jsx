import React from 'react';
import HeroSection from '../Components/HeroSection';
import CategorySection from '../Components/CategorySection';
import TopProducts from '../Components/TopProducts';

function Home() {
  return (
    <main className='w-full bg-white min-h-screen'>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Categories Section */}
      <CategorySection />

      {/* 3. Top Products Section */}
      <TopProducts />
    </main>
  );
}

export default Home;
