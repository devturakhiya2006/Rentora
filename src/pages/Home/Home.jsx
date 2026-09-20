import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../../components/HeroSection/HeroSection';
import CategorySection from '../../components/CategorySection/CategorySection';
import FeaturedProducts from '../../components/FeaturedProducts/FeaturedProducts';
import HowItWorks from '../../components/HowItWorks/HowItWorks';
import Testimonials from '../../components/Testimonials/Testimonials';
import VendorCTA from '../../components/VendorCTA/VendorCTA';
import { supabase } from '../../supabaseClient';
import './Home.css';

// A clean wrapper that triggers a smooth slide-up reveal when the section scrolls into view
const FadeInSection = ({ children, bg = "bg-transparent" }) => {
  return (
    <div className={`w-full overflow-hidden ${bg}`}>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Supabase Database States for Homepage sections
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [howItWorksSteps, setHowItWorksSteps] = useState([]);

  // Fetch Homepage Data directly from Supabase tables
  useEffect(() => {
    async function fetchHomeData() {
      try {
        const [catRes, testRes, howRes] = await Promise.all([
          supabase.from('categories').select('*'),
          supabase.from('testimonials').select('*'),
          supabase.from('how_it_works').select('*')
        ]);

        if (catRes.data) setCategories(catRes.data);
        if (testRes.data) setTestimonials(testRes.data);
        if (howRes.data) setHowItWorksSteps(howRes.data);
      } catch (err) {
        console.error("Error fetching homepage database data:", err);
      }
    }

    fetchHomeData();
  }, []);

  const handleSelectCategory = (categorySlug) => {
    setSelectedCategory(categorySlug);
    const featuredEl = document.getElementById('featured');
    if (featuredEl) {
      featuredEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="home-page-container bg-white overflow-x-hidden">

      {/* 1. Hero Section - No animation on load so it's instantly visible */}
      <div className="w-full">
        <HeroSection />
      </div>

      {/* 2. Category Catalog Grid */}
      <FadeInSection bg="bg-white">
        <CategorySection
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </FadeInSection>

      {/* 3. Featured Rentals Showcase */}
      <FadeInSection bg="bg-gray-55">
        <FeaturedProducts
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </FadeInSection>

      {/* 4. How Rentora Works */}
      <FadeInSection bg="bg-white">
        <HowItWorks steps={howItWorksSteps} />
      </FadeInSection>

      {/* 5. Customer Stories & Social Proof */}
      <FadeInSection bg="bg-[#F5F4F0]">
        <Testimonials testimonials={testimonials} />
      </FadeInSection>

      {/* 6. Vendor Onboarding CTA */}
      <FadeInSection bg="bg-white">
        <VendorCTA />
      </FadeInSection>

    </main>
  );
}