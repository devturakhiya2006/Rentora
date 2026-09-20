import React from 'react';
import { Star, Quote, CheckCircle2, HeartHandshake } from 'lucide-react';
import './Testimonials.css';

export default function Testimonials({ testimonials = [] }) {
  return (
    <section className="py-20 bg-[#F5F4F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E7E5E4]/30 text-[#2A2626] text-xs font-bold uppercase tracking-wider">
            <HeartHandshake size={14} className="text-[#4A5D23]" />
            <span>Customer Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2A2626] font-['Sora'] tracking-tight">
            Loved by 50,000+ Creators & Renters
          </h2>
          <p className="text-sm sm:text-base text-[#78716C]">
            Hear how filmmakers, event planners, and travelers save money and build great projects using Rentora.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="testimonial-card group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <Quote size={24} className="text-[#E7E5E4] group-hover:text-[#4A5D23] transition-colors" />
                </div>

                <p className="text-sm text-[#2A2626] leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center gap-3.5">
                <img
                  src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#E7E5E4]"
                />
                <div>
                  <div className="text-sm font-bold text-[#2A2626] flex items-center gap-1">
                    <span>{t.name}</span>
                    <CheckCircle2 size={14} className="text-emerald-500 inline" />
                  </div>
                  <div className="text-xs text-[#78716C]">{t.role} • {t.city}</div>
                  <div className="text-[10px] text-[#4A5D23] font-semibold mt-0.5">
                    Rented: {t.rented_item || t.rentedItem}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}