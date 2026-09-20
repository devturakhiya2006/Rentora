import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import ProductCard from './ProductCard';
import { Sparkles, SlidersHorizontal, ArrowRight, ShieldAlert } from 'lucide-react';
import './FeaturedProducts.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function FeaturedProducts({ selectedCategory, onSelectCategory }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Supabase Data State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error("Error fetching products:", error);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchFeaturedProducts();
  }, []);

  const filters = [
    { id: 'all', label: 'All Rentals' },
    { id: 'cameras', label: 'Cameras & Lenses' },
    { id: 'electronics', label: 'Electronics & PS5' },
    { id: 'vehicles', label: 'Vehicles & SUVs' },
    { id: 'event-party', label: 'Event & Sound' },
    { id: 'sports-outdoor', label: 'Outdoor & Camping' },
  ];

  const filteredProducts = products.filter(p => {
    const currentCategory = selectedCategory && selectedCategory !== 'all' ? selectedCategory : activeFilter;
    if (currentCategory === 'all') return true;
    const pCat = p.categorySlug || p.category || '';
    return pCat.toLowerCase().includes(currentCategory.toLowerCase());
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const rateA = a.daily_rate || a.pricePerDay || a.price || 0;
    const rateB = b.daily_rate || b.pricePerDay || b.price || 0;
    if (sortBy === 'price-low') return rateA - rateB;
    if (sortBy === 'price-high') return rateB - rateA;
    if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
    return 0;
  });

  return (
    <section id="featured" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A5D23]/10 text-[#4A5D23] text-[10px] font-extrabold uppercase tracking-widest border border-[#4A5D23]/20">
              <Sparkles size={12} />
              <span>Verified Local Inventory</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#2A2626] font-['Sora'] tracking-tight">
              Featured Rentals
            </h2>
            <p className="text-sm sm:text-base text-[#78716C] max-w-xl leading-relaxed">
              Handpicked premium items with 100% genuine equipment verification, sanitized condition & insurance cover.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3 self-start md:self-auto bg-[#F5F4F0] p-2 rounded-2xl border border-[#E7E5E4]"
          >
            <SlidersHorizontal size={18} className="text-[#78716C] ml-2" />
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort rentals"
              className="bg-white border border-[#E7E5E4] text-xs font-extrabold text-[#2A2626] rounded-xl px-4 py-2.5 focus:outline-none cursor-pointer shadow-sm hover:border-[#4A5D23]/30 transition-colors"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated (4.9+)</option>
            </select>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-3 overflow-x-auto pb-4 mb-10 scrollbar-none"
        >
          {filters.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id);
                if (onSelectCategory) onSelectCategory(tab.id);
              }}
              className={`px-5 py-3 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-300 ${(selectedCategory === tab.id || (activeFilter === tab.id && (!selectedCategory || selectedCategory === 'all')))
                  ? 'bg-[#2A2626] text-white shadow-lg shadow-black/10 scale-105'
                  : 'bg-[#F5F4F0] text-[#78716C] hover:bg-[#E7E5E4]/60 hover:text-[#2A2626]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="text-center py-12 text-[#78716C] font-semibold text-sm">Loading inventory from database...</div>
          ) : sortedProducts.length > 0 ? (
            <motion.div
              key={activeFilter + selectedCategory + sortBy}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onRentClick={(item) => setSelectedProduct(item)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#F5F4F0] rounded-[3rem] p-16 text-center border border-[#E7E5E4] space-y-5"
            >
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl shadow-black/5 text-[#78716C] flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#2A2626] font-['Sora'] tracking-tight">No items found</h3>
              <p className="text-sm text-[#78716C] max-w-sm mx-auto leading-relaxed">
                Try selecting another category or clear your filters to view our full collection of rental items.
              </p>
              <button
                onClick={() => {
                  setActiveFilter('all');
                  if (onSelectCategory) onSelectCategory('all');
                }}
                className="mt-4 px-8 py-4 rounded-2xl bg-[#4A5D23] text-white text-sm font-extrabold shadow-xl hover:bg-[#36451A] transition-all"
              >
                View All Rentals
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explore All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-[#2A2626] hover:bg-[#1a1717] text-white font-extrabold text-sm transition-all shadow-2xl shadow-black/20 hover:-translate-y-1 group cursor-pointer"
          >
            <span>Explore All Products</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}