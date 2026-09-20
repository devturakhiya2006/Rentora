import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserRound, 
  Store, 
  ShoppingBag, 
  Building2, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Check,
  Camera
} from 'lucide-react';
import Logo from '../../components/Logo/Logo';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [role, setRole] = useState('customer'); // 'customer' | 'vendor'
  const [step, setStep] = useState(1); // 1: Choose Role, 2: Fill Details

  // Customer Form
  const [customerData, setCustomerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: true
  });

  // Vendor Form
  const [vendorData, setVendorData] = useState({
    ownerName: '',
    shopName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    category: 'Cameras & Photography',
    city: 'Ahmedabad',
    acceptTerms: true
  });

  const [error, setError] = useState('');

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (customerData.password !== customerData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await signup({ ...customerData, role: 'customer' });
      navigate('/products');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    if (vendorData.password !== vendorData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await signup({ ...vendorData, role: 'vendor' });
      navigate('/products');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex font-['Sora'] bg-[#F5F4F0] flex-col-reverse lg:flex-row">
      
      {/* Left: Cinematic Image Container (Inverse Layout) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#4A5D23] overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&q=80&w=1400" 
          alt="Professional Camera Gear"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark Gradient Overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A2626] via-[#2A2626]/40 to-transparent opacity-90"></div>
        
        {/* Overlay Text */}
        <div className="absolute bottom-24 left-16 right-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs uppercase tracking-widest mb-6">
              <Camera size={16} className="text-[#4A5D23]" /> Join the Community
            </div>
            <h2 className="text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Rent world-class gear.<br/>
              <span className="text-[#E7E5E4]">List your inventory.</span>
            </h2>
            <p className="text-lg text-white/80 max-w-lg font-sans leading-relaxed">
              Join 50,000+ creators and 1,200+ rental businesses across Gujarat. Rentora is the ultimate platform for production equipment.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 relative z-10 overflow-y-auto">
        <div className="absolute top-8 right-8 lg:right-12">
          <Link to="/">
            <Logo size="md" />
          </Link>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6 }}
          className="max-w-md w-full mx-auto mt-16 lg:mt-0"
        >
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#2A2626] tracking-tight mb-3">
              Create Account.
            </h1>
            <p className="text-[#78716C] font-sans text-sm">
              {step === 1 ? 'Choose how you want to use Rentora.' : 'Fill out your details to get started.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Customer Role Card */}
                <div
                  onClick={() => setRole('customer')}
                  className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 ${
                    role === 'customer' 
                      ? 'border-[#2A2626] bg-white shadow-xl shadow-black/5 transform -translate-y-1' 
                      : 'border-[#E7E5E4] bg-[#F5F4F0] hover:border-[#2A2626]/30 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      role === 'customer' ? 'bg-[#4A5D23] text-white' : 'bg-white border border-[#E7E5E4] text-[#78716C]'
                    }`}>
                      <ShoppingBag size={28} />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-extrabold text-lg text-[#2A2626] tracking-tight">Customer</h4>
                        {role === 'customer' && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#4A5D23]">
                            <CheckCircle2 weight="fill" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[#4A5D23] mb-2 font-sans">“I want to rent products”</p>
                      <p className="text-xs text-[#78716C] font-sans leading-relaxed">
                        Discover gear, compare rates, reserve dates, and manage your active rentals.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vendor Role Card */}
                <div
                  onClick={() => setRole('vendor')}
                  className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 ${
                    role === 'vendor' 
                      ? 'border-[#2A2626] bg-white shadow-xl shadow-black/5 transform -translate-y-1' 
                      : 'border-[#E7E5E4] bg-[#F5F4F0] hover:border-[#2A2626]/30 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      role === 'vendor' ? 'bg-[#2A2626] text-white' : 'bg-white border border-[#E7E5E4] text-[#78716C]'
                    }`}>
                      <Store size={28} />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-extrabold text-lg text-[#2A2626] tracking-tight">Vendor</h4>
                        {role === 'vendor' && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#2A2626]">
                            <CheckCircle2 weight="fill" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[#2A2626] mb-2 font-sans">“I want to rent out my gear”</p>
                      <p className="text-xs text-[#78716C] font-sans leading-relaxed">
                        List inventory, set prices, receive booking orders & automate deposit verification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E7E5E4] text-xs text-[#78716C] flex items-start gap-3 font-sans shadow-sm">
                  <Sparkles size={18} className="text-[#4A5D23] flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed"><strong>Unified Account:</strong> You can enable vendor or customer tools anytime from your profile settings after signup.</span>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="group w-full py-4 rounded-2xl bg-[#2A2626] hover:bg-[#1a1717] text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-xl shadow-black/10 transform hover:-translate-y-0.5"
                >
                  <span>Continue as {role === 'customer' ? 'Customer' : 'Vendor'}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ) : (
              /* Step 2: Details Form */
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 font-sans"
              >
                <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]">
                  <span className="text-sm font-bold text-[#2A2626] flex items-center gap-2 font-['Sora'] uppercase tracking-wider">
                    {role === 'customer' ? <ShoppingBag size={18} className="text-[#4A5D23]" /> : <Store size={18} className="text-[#2A2626]" />}
                    {role === 'customer' ? 'Customer Signup' : 'Vendor Signup'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#78716C] hover:text-[#2A2626] hover:bg-[#E7E5E4]/50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ← Back
                  </button>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm font-bold text-rose-700">
                    {error}
                  </div>
                )}

                {role === 'customer' ? (
                  /* Customer Form */
                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aarav Patel"
                          value={customerData.fullName}
                          onChange={(e) => setCustomerData({ ...customerData, fullName: e.target.value })}
                          className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] block p-3.5 pl-11 transition-all outline-none font-medium"
                        />
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#4A5D23] transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <div className="relative group">
                          <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={customerData.email}
                            onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                            className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] block p-3.5 pl-11 transition-all outline-none font-medium"
                          />
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#4A5D23] transition-colors" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          Mobile Number
                        </label>
                        <div className="relative group">
                          <input
                            type="tel"
                            required
                            placeholder="+91 98250 12345"
                            value={customerData.phone}
                            onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                            className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] block p-3.5 pl-11 transition-all outline-none font-medium"
                          />
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#4A5D23] transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          Password
                        </label>
                        <div className="relative group">
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={customerData.password}
                            onChange={(e) => setCustomerData({ ...customerData, password: e.target.value })}
                            className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] block p-3.5 pl-11 transition-all outline-none font-medium"
                          />
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#4A5D23] transition-colors" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          Confirm Password
                        </label>
                        <div className="relative group">
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={customerData.confirmPassword}
                            onChange={(e) => setCustomerData({ ...customerData, confirmPassword: e.target.value })}
                            className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] block p-3.5 pl-11 transition-all outline-none font-medium"
                          />
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#4A5D23] transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 pb-2">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={customerData.acceptTerms}
                            onChange={(e) => setCustomerData({ ...customerData, acceptTerms: e.target.checked })}
                            className="peer w-5 h-5 rounded-md border-2 border-[#E7E5E4] appearance-none checked:bg-[#4A5D23] checked:border-[#4A5D23] transition-colors cursor-pointer"
                          />
                          <Check size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                        </div>
                        <span className="font-medium text-xs text-[#78716C]">I agree to Rentora's <span className="text-[#2A2626] font-bold underline">Terms of Rental</span> & <span className="text-[#2A2626] font-bold underline">Privacy Policy</span></span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="group w-full py-4 rounded-2xl bg-[#4A5D23] hover:bg-[#36451A] text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#4A5D23]/20 transform hover:-translate-y-0.5"
                    >
                      <span>Complete Signup</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                ) : (
                  /* Vendor Form */
                  <form onSubmit={handleVendorSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          Owner Full Name
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Shah"
                            value={vendorData.ownerName}
                            onChange={(e) => setVendorData({ ...vendorData, ownerName: e.target.value })}
                            className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#2A2626]/10 focus:border-[#2A2626] block p-3.5 pl-11 transition-all outline-none font-medium"
                          />
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#2A2626] transition-colors" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          Shop Name
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            required
                            placeholder="e.g. PixelGear"
                            value={vendorData.shopName}
                            onChange={(e) => setVendorData({ ...vendorData, shopName: e.target.value })}
                            className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#2A2626]/10 focus:border-[#2A2626] block p-3.5 pl-11 transition-all outline-none font-medium"
                          />
                          <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#2A2626] transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          Business Email
                        </label>
                        <div className="relative group">
                          <input
                            type="email"
                            required
                            placeholder="contact@store.in"
                            value={vendorData.email}
                            onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
                            className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#2A2626]/10 focus:border-[#2A2626] block p-3.5 pl-11 transition-all outline-none font-medium"
                          />
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#2A2626] transition-colors" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          Mobile Number
                        </label>
                        <div className="relative group">
                          <input
                            type="tel"
                            required
                            placeholder="+91 99090 12345"
                            value={vendorData.phone}
                            onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
                            className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#2A2626]/10 focus:border-[#2A2626] block p-3.5 pl-11 transition-all outline-none font-medium"
                          />
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#2A2626] transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          Primary Category
                        </label>
                        <select
                          value={vendorData.category}
                          onChange={(e) => setVendorData({ ...vendorData, category: e.target.value })}
                          className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#2A2626]/10 focus:border-[#2A2626] block p-3.5 transition-all outline-none font-medium appearance-none"
                        >
                          <option value="Cameras & Photography">Cameras & Video</option>
                          <option value="Electronics & Gaming">Electronics</option>
                          <option value="Vehicles & Superbikes">Vehicles</option>
                          <option value="Event & Sound Gear">Event Sound</option>
                          <option value="Tools & Construction">Tools</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          City
                        </label>
                        <select
                          value={vendorData.city}
                          onChange={(e) => setVendorData({ ...vendorData, city: e.target.value })}
                          className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#2A2626]/10 focus:border-[#2A2626] block p-3.5 transition-all outline-none font-medium appearance-none"
                        >
                          <option value="Ahmedabad">Ahmedabad</option>
                          <option value="Surat">Surat</option>
                          <option value="Vadodara">Vadodara</option>
                          <option value="Rajkot">Rajkot</option>
                          <option value="Gandhinagar">Gandhinagar</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          Password
                        </label>
                        <div className="relative group">
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={vendorData.password}
                            onChange={(e) => setVendorData({ ...vendorData, password: e.target.value })}
                            className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#2A2626]/10 focus:border-[#2A2626] block p-3.5 pl-11 transition-all outline-none font-medium"
                          />
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#2A2626] transition-colors" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                          Confirm
                        </label>
                        <div className="relative group">
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={vendorData.confirmPassword}
                            onChange={(e) => setVendorData({ ...vendorData, confirmPassword: e.target.value })}
                            className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#2A2626]/10 focus:border-[#2A2626] block p-3.5 pl-11 transition-all outline-none font-medium"
                          />
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#2A2626] transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 pb-2">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={vendorData.acceptTerms}
                            onChange={(e) => setVendorData({ ...vendorData, acceptTerms: e.target.checked })}
                            className="peer w-5 h-5 rounded-md border-2 border-[#E7E5E4] appearance-none checked:bg-[#2A2626] checked:border-[#2A2626] transition-colors cursor-pointer"
                          />
                          <Check size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                        </div>
                        <span className="font-medium text-xs text-[#78716C]">I agree to <span className="text-[#2A2626] font-bold underline">Vendor Agreement</span> & <span className="text-[#2A2626] font-bold underline">0% Fee Terms</span></span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="group w-full py-4 rounded-2xl bg-[#2A2626] hover:bg-[#1a1717] text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-xl shadow-black/10 transform hover:-translate-y-0.5"
                    >
                      <span>Launch Store</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="text-center pt-8 mt-8 border-t border-[#E7E5E4] text-sm text-[#78716C] font-sans font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#4A5D23] hover:underline">
              Log In here
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
