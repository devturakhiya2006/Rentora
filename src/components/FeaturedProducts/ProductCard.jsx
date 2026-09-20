import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Star,
  MapPin,
  ShieldCheck,
  Zap,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import './FeaturedProducts.css';

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { updateBookingDraft } = useBooking();
  const [isFavorite, setIsFavorite] = useState(false);
  const [priceMode, setPriceMode] = useState('day');

  if (!product) return null;

  // Safe pricing with fallbacks (supports both Supabase daily_rate & mock pricePerDay)
  const baseDayRate = product.daily_rate || product.pricePerDay || product.price || 500;
  const weekRate = product.pricePerWeek || (baseDayRate * 5);
  const monthRate = product.pricePerMonth || (baseDayRate * 18);

  const currentPrice = priceMode === 'day'
    ? baseDayRate
    : priceMode === 'week'
      ? weekRate
      : monthRate;

  const currentUnit = priceMode === 'day' ? '/ day' : priceMode === 'week' ? '/ wk' : '/ mo';

  // Safe Image fallback
  let imageUrl = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
  if (Array.isArray(product.images) && product.images.length > 0) {
    imageUrl = product.images[0];
  } else if (typeof product.images === 'string') {
    imageUrl = product.images;
  } else if (product.image) {
    imageUrl = product.image;
  }

  // Safe Vendor fallback
  const vendorName = typeof product.vendor === 'object' && product.vendor !== null
    ? (product.vendor.name || 'Rentora Verified Hub')
    : (product.vendor || 'Verified Hub');

  const vendorCity = typeof product.vendor === 'object' && product.vendor !== null
    ? (product.vendor.city || product.city || 'Ahmedabad')
    : (product.city || 'Ahmedabad');

  // Safe Features fallback
  const featuresList = Array.isArray(product.features) && product.features.length > 0
    ? product.features
    : ['Verified Genuine', 'Escrow Protected'];

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleRentClick = (e) => {
    e.stopPropagation();
    updateBookingDraft({
      product,
      durationMode: priceMode,
      durationCount: priceMode === 'day' ? 2 : 1
    });
    navigate('/booking');
  };

  return (
    <motion.div
      variants={itemVariants}
      onClick={handleCardClick}
      className="group bg-white rounded-[2rem] overflow-hidden cursor-pointer border border-[#E7E5E4] hover:border-[#4A5D23]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#4A5D23]/10 flex flex-col h-full"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={product.title || product.name || 'Rental Item'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 pointer-events-none opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-extrabold shadow-lg uppercase tracking-wider">
            {product.category || 'Rentals'}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            aria-label="Save to Wishlist"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${isFavorite
                ? 'bg-[#4A5D23] text-white scale-110'
                : 'bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-[#4A5D23] hover:border-transparent'
              }`}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={isFavorite ? 0 : 2} />
          </button>
        </div>

        {/* Bottom Badges on Image */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white z-10">
          {product.instantBooking ? (
            <span className="px-2.5 py-1 rounded-lg bg-[#4A5D23] text-white text-[10px] font-bold flex items-center gap-1.5 shadow-lg border border-[#4A5D23]/50">
              <Zap size={12} fill="currentColor" /> Instant Booking
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 border border-white/20">
              <Calendar size={12} /> Verified Stock
            </span>
          )}

          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-yellow-400 border border-white/20">
            <Star size={12} fill="currentColor" />
            <span>{product.rating || 4.9}</span>
            <span className="text-white/60 font-medium">({product.reviews || 12})</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5 bg-white">

        <div>
          <div className="flex items-center justify-between text-xs text-[#78716C] mb-2">
            <span className="font-bold text-[#4A5D23] flex items-center gap-1.5 truncate max-w-[170px] bg-[#4A5D23]/10 px-2 py-0.5 rounded-md">
              <ShieldCheck size={12} />
              {vendorName}
            </span>
            <span className="flex items-center gap-1 text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">
              <MapPin size={10} className="text-[#2A2626]" />
              {vendorCity}
            </span>
          </div>

          <h3 className="text-lg font-extrabold font-['Sora'] text-[#2A2626] group-hover:text-[#4A5D23] transition-colors line-clamp-2 leading-tight">
            {product.title || product.name}
          </h3>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {featuresList.slice(0, 2).map((feat, i) => (
            <span key={i} className="text-[10px] font-extrabold px-2.5 py-1 bg-[#F5F4F0] text-[#78716C] rounded-lg uppercase tracking-wider">
              {feat}
            </span>
          ))}
        </div>

        {/* Duration Switcher */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-[#F5F4F0] p-1.5 rounded-xl flex items-center justify-between text-[11px] font-extrabold text-[#78716C] uppercase tracking-wider"
        >
          <button
            onClick={() => setPriceMode('day')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${priceMode === 'day' ? 'bg-white text-[#2A2626] shadow-md' : 'hover:text-[#2A2626]'
              }`}
          >
            Day
          </button>
          <button
            onClick={() => setPriceMode('week')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${priceMode === 'week' ? 'bg-white text-[#2A2626] shadow-md' : 'hover:text-[#2A2626]'
              }`}
          >
            Week
          </button>
          <button
            onClick={() => setPriceMode('month')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${priceMode === 'month' ? 'bg-white text-[#2A2626] shadow-md' : 'hover:text-[#2A2626]'
              }`}
          >
            Month
          </button>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-[#E7E5E4] flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-[#78716C] font-extrabold uppercase tracking-widest mb-0.5">
              Rental Rate
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#2A2626] font-['Sora']">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#78716C] font-extrabold">
                {currentUnit}
              </span>
            </div>
          </div>

          <button
            onClick={handleRentClick}
            className="w-12 h-12 rounded-2xl bg-[#4A5D23] text-white flex items-center justify-center transition-all shadow-lg shadow-[#4A5D23]/20 group-hover:bg-[#36451A] group-hover:scale-110"
          >
            <ArrowRight size={20} />
          </button>
        </div>

      </div>

    </motion.div>
  );
}