import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import {
  Search,
  Calendar,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Star,
  PlayCircle
} from 'lucide-react';
import './HeroSection.css';

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=2000",
    title: "Sony FX3 Cinema Kit",
    category: "Cameras & Photo",
    price: "₹1,899/day",
    vendor: "PixelCraft Studios"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=2000",
    title: "PlayStation 5 Pro",
    category: "Gaming & Tech",
    price: "₹450/day",
    vendor: "GameZone Hub"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&q=80&w=2000",
    title: "Canon RF 28-70mm f/2L",
    category: "Lenses",
    price: "₹1,200/day",
    vendor: "CineGear Rentals"
  }
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [searchItem, setSearchItem] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Supabase Trust Stats State
  const [trustStats, setTrustStats] = useState([]);

  useEffect(() => {
    async function fetchTrustStats() {
      const { data, error } = await supabase.from('trust_stats').select('*');
      if (data) {
        setTrustStats(data);
      }
    }
    fetchTrustStats();
  }, []);

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (searchItem.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchItem.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <section className="relative w-full min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden bg-[#2A2626]">

      {/* Absolute Background Slider */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={HERO_SLIDES[currentSlide].image}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1717] via-[#2A2626]/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1717] via-[#1a1717]/40 to-transparent z-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">

        {/* Left: Text & Search Content */}
        <div className="w-full lg:w-7/12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A5D23]/20 text-[#C1DB99] font-bold mb-6 border border-[#4A5D23]/30 backdrop-blur-md text-xs uppercase tracking-widest"
          >
            <Sparkles size={14} /> India's Premium Rental Hub
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold leading-[1.05] tracking-tight mb-6 font-['Sora'] drop-shadow-xl text-white"
          >
            Everything you need. <br />
            <span className="text-transparent [-webkit-text-stroke:2px_#C1DB99] lg:[-webkit-text-stroke:3px_#C1DB99]">
              Ready to rent.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-[#E7E5E4] mb-10 leading-relaxed font-sans max-w-xl"
          >
            Discover high-end cameras, gaming consoles, vehicles, and tools from 1,200+ verified local businesses instantly.
          </motion.p>

          {/* Glassmorphism Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 sm:p-3 rounded-[2rem] shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 flex items-center gap-3 w-full px-4 py-3 bg-white/5 rounded-2xl border border-white/10 focus-within:border-white/30 transition-colors">
                <Search size={20} className="text-[#C1DB99]" />
                <input
                  type="text"
                  placeholder="e.g. Cinema Camera, PS5..."
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  className="w-full bg-transparent border-none text-white placeholder-white/50 focus:outline-none text-sm font-semibold"
                />
              </div>
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#4A5D23] hover:bg-[#36451A] text-white font-extrabold text-sm transition-all shadow-xl hover:shadow-[#4A5D23]/20 flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>Find Gear</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-8 flex flex-wrap items-center gap-6"
          >
            {trustStats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="text-2xl font-extrabold text-white font-['Sora']">{stat.value}</div>
                <div className="text-xs font-semibold text-[#78716C] uppercase tracking-wider max-w-[80px] leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Dynamic Product Slide Overlay */}
        <div className="w-full lg:w-5/12 max-w-sm ml-auto hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50, rotateY: 15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -50, rotateY: -15 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
            >
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 relative">
                <img src={HERO_SLIDES[currentSlide].image} alt="Featured Gear" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <div className="bg-[#4A5D23] text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <ShieldCheck size={14} /> Available Now
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-[#C1DB99] font-bold text-xs uppercase tracking-widest mb-1">{HERO_SLIDES[currentSlide].category}</div>
                  <div className="text-white font-extrabold text-2xl leading-tight mb-2">{HERO_SLIDES[currentSlide].title}</div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                    <Star size={12} fill="currentColor" className="text-yellow-400" />
                    {HERO_SLIDES[currentSlide].vendor}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                <div>
                  <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Rental Rate</div>
                  <div className="text-white font-extrabold text-2xl font-['Sora']">{HERO_SLIDES[currentSlide].price}</div>
                </div>
                <button onClick={handleSearch} className="w-14 h-14 bg-[#F5F4F0] rounded-full flex items-center justify-center text-[#2A2626] hover:bg-white hover:scale-105 transition-all shadow-xl">
                  <ArrowRight size={24} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls */}
          <div className="flex justify-center gap-3 mt-8">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-12 bg-[#C1DB99]' : 'w-4 bg-white/20 hover:bg-white/40'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}