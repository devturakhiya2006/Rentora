import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  CalendarCheck2,
  ShieldCheck,
  RotateCcw,
  HelpCircle,
  FileCheck2,
  Lock,
  Headphones
} from 'lucide-react';
import './HowItWorks.css';

const iconComponents = {
  Search,
  CalendarCheck2,
  ShieldCheck,
  RotateCcw
};

export default function HowItWorks({ steps = [] }) {
  return (
    <section id="how-it-works" className="relative w-full bg-[#2A2626] overflow-hidden">

      <div className="flex flex-col lg:flex-row min-h-[90vh]">

        {/* Left: Massive Cinematic Image */}
        <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-full">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200"
              alt="Filmmaker in action"
              className="w-full h-full object-cover"
            />
            {/* Gradient to blend with the dark section */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#2A2626] via-[#2A2626]/60 to-transparent"></div>
          </motion.div>

          <div className="absolute bottom-12 left-8 lg:left-16 right-8 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-extrabold text-[10px] uppercase tracking-widest mb-4">
                <HelpCircle size={14} className="text-[#C1DB99]" />
                Simple 4-Step Process
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-['Sora'] tracking-tight leading-tight">
                Renting made <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9ebf66] to-[#4A5D23]">effortless.</span>
              </h2>
            </motion.div>
          </div>
        </div>

        {/* Right: Steps Scroller */}
        <div className="w-full lg:w-1/2 bg-[#2A2626] px-8 sm:px-12 py-16 lg:py-24 flex flex-col justify-center">

          <div className="max-w-md mx-auto w-full space-y-6 relative">
            {/* Vertical connector line */}
            <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-[#4A5D23] via-[#C1DB99]/30 to-transparent hidden sm:block"></div>

            {steps.map((item, index) => {
              const iconKey = item.icon_name || item.iconName;
              const IconComp = iconComponents[iconKey] || Search;
              return (
                <motion.div
                  key={item.id || item.step}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#4A5D23]/50 rounded-[2rem] p-6 sm:p-8 flex items-start gap-6 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#4A5D23]/20 z-10"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#4A5D23] text-white flex flex-shrink-0 items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <IconComp size={28} />
                  </div>

                  <div>
                    <div className="text-[10px] font-extrabold text-[#C1DB99] uppercase tracking-widest mb-1">
                      Step {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-white font-['Sora'] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Full width Guarantee Banner below */}
      <div className="w-full bg-[#1a1717] border-y border-white/10 py-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row items-center gap-4 justify-center sm:justify-start">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C1DB99] flex-shrink-0">
                <ShieldCheck size={26} />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white">100% Genuine Items</div>
                <div className="text-xs text-white/50 mt-0.5">Inspected & Sanitized</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row items-center gap-4 justify-center sm:justify-start">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C1DB99] flex-shrink-0">
                <FileCheck2 size={26} />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white">Digital Contract</div>
                <div className="text-xs text-white/50 mt-0.5">Instant E-Agreement</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center gap-4 justify-center sm:justify-start">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C1DB99] flex-shrink-0">
                <Lock size={26} />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white">Safe Escrow</div>
                <div className="text-xs text-white/50 mt-0.5">Deposit Released in 2h</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row items-center gap-4 justify-center sm:justify-start">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C1DB99] flex-shrink-0">
                <Headphones size={26} />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white">24/7 Concierge</div>
                <div className="text-xs text-white/50 mt-0.5">Always here to help</div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

    </section>
  );
}