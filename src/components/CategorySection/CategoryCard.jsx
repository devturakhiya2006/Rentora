import React from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Laptop, 
  Car, 
  Armchair, 
  PartyPopper, 
  Wrench, 
  Tent, 
  Sparkles,
  ArrowUpRight 
} from 'lucide-react';
import './CategorySection.css';

const iconMap = {
  Camera,
  Laptop,
  Car,
  Armchair,
  PartyPopper,
  Wrench,
  Tent,
  Sparkles
};

// Item animation variant for staggered cascade
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function CategoryCard({ category, onSelectCategory, isSelected }) {
  const IconComponent = iconMap[category.iconName] || Sparkles;

  return (
    <motion.div 
      variants={itemVariants}
      onClick={() => onSelectCategory && onSelectCategory(category.slug)}
      className={`group relative overflow-hidden rounded-[2rem] p-6 cursor-pointer transition-all duration-500 transform hover:-translate-y-2 ${
        isSelected 
          ? 'bg-[#2A2626] shadow-2xl shadow-black/20 ring-4 ring-[#4A5D23]/30' 
          : 'bg-white shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-[#4A5D23]/10 border border-[#E7E5E4]'
      }`}
    >
      {/* Background Decor */}
      <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${
        isSelected ? 'bg-[#C1DB99]' : 'bg-[#4A5D23] group-hover:bg-[#C1DB99]'
      }`}></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 ${
            isSelected 
              ? 'bg-[#4A5D23] text-white shadow-lg shadow-[#4A5D23]/30' 
              : 'bg-[#F5F4F0] text-[#4A5D23] group-hover:bg-[#4A5D23] group-hover:text-white'
          }`}>
            <IconComponent size={28} strokeWidth={1.5} />
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              isSelected 
                ? 'bg-white/10 text-white border border-white/20' 
                : 'bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4]'
            }`}>
              {category.count}
            </span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${
              isSelected ? 'text-[#C1DB99] bg-white/5' : 'text-gray-400 group-hover:text-[#2A2626] group-hover:bg-[#F5F4F0]'
            }`}>
              <ArrowUpRight size={18} />
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <h3 className={`text-xl font-extrabold font-['Sora'] tracking-tight mb-2 transition-colors duration-300 ${
            isSelected ? 'text-white' : 'text-[#2A2626]'
          }`}>
            {category.name}
          </h3>
          <p className={`text-sm leading-relaxed line-clamp-2 transition-colors duration-300 ${
            isSelected ? 'text-[#E7E5E4]' : 'text-[#78716C]'
          }`}>
            {category.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
