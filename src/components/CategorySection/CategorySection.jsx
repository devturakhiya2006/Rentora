import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import CategoryCard from './CategoryCard';
import { LayoutGrid, ArrowRight } from 'lucide-react';
import './CategorySection.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function CategorySection({ selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error("Error fetching categories:", error);
      } else if (data) {
        setCategories(data);
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  return (
    <section id="categories" className="py-20 bg-[#F5F4F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#2A2626] text-[10px] font-extrabold uppercase tracking-widest shadow-sm border border-[#E7E5E4]">
              <LayoutGrid size={12} className="text-[#4A5D23]" />
              <span>Rental Catalog</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#2A2626] font-['Sora'] tracking-tight">
              Explore by Category
            </h2>
            <p className="text-sm sm:text-base text-[#78716C] max-w-xl leading-relaxed">
              From heavy production cinema cameras to luxury weekend road trips, rent top-tier equipment without the burden of full ownership.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => onSelectCategory && onSelectCategory('all')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-300 ${!selectedCategory || selectedCategory === 'all'
                  ? 'bg-[#2A2626] text-white shadow-lg shadow-black/10 scale-105'
                  : 'bg-white text-[#78716C] border border-[#E7E5E4] hover:bg-[#E7E5E4]/40 hover:text-[#2A2626]'
                }`}
            >
              All Categories
            </button>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#4A5D23]/10 text-[#4A5D23] text-xs font-extrabold hover:bg-[#4A5D23] hover:text-white group transition-colors duration-300"
            >
              <span>Browse Catalog</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-12 text-[#78716C] font-semibold text-sm">Loading categories...</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isSelected={selectedCategory === cat.slug}
                onSelectCategory={onSelectCategory}
              />
            ))}
          </motion.div>
        )}

      </div>
    </section>
  );
}