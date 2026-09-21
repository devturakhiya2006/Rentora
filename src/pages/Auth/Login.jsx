import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  UserCheck,
  Store
} from 'lucide-react';
import Logo from '../../components/Logo/Logo';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'vendor' | 'admin'

  // If redirected from checkout/booking
  const redirectTo = location.state?.from || (role === 'admin' ? '/admin/dashboard' : role === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your registered email and password.');
      return;
    }
    setError('');
    
    try {
      const user = await login(email, password);
      
      const from = location.state?.from;

      if (user.role === 'admin') {
        // Admins should always go to admin dashboard unless they were on a public page?
        // Just send to admin dashboard to be safe.
        navigate('/admin/dashboard');
      } else if (user.role === 'vendor') {
        // If they were on a public page (not customer or admin), let them go back.
        // Otherwise send to vendor dashboard.
        if (from && !from.startsWith('/customer') && !from.startsWith('/admin')) {
          navigate(from);
        } else {
          navigate('/vendor/dashboard');
        }
      } else {
        // Customers go to where they came from (e.g. checkout, product) or customer dashboard
        if (from && !from.startsWith('/vendor') && !from.startsWith('/admin')) {
          navigate(from);
        } else {
          navigate('/customer/dashboard');
        }
      }
    } catch (err) {
      setError(err.message);
      // Clear fields on error for security
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex font-['Sora'] bg-[#F5F4F0]">
      
      {/* Left: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 relative z-10 overflow-y-auto">
        <div className="absolute top-8 left-8 lg:left-12">
          <Link to="/">
            <Logo size="md" />
          </Link>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6 }}
          className="max-w-md w-full mx-auto mt-16 lg:mt-0"
        >
          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#2A2626] tracking-tight mb-3">
              Welcome back.
            </h1>
            <p className="text-[#78716C] font-sans text-sm">
              Sign in to access your rental dashboard, contracts & operations.
            </p>
          </div>



          {/* Role Toggle Selector */}
          <div className="grid grid-cols-3 gap-2 bg-[#E7E5E4]/50 p-1.5 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                role === 'customer' ? 'bg-white text-[#2A2626] shadow-sm ring-1 ring-black/5' : 'text-[#78716C] hover:text-[#2A2626]'
              }`}
            >
              <UserCheck size={16} />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('vendor')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                role === 'vendor' ? 'bg-white text-[#2A2626] shadow-sm ring-1 ring-black/5' : 'text-[#78716C] hover:text-[#2A2626]'
              }`}
            >
              <Store size={16} />
              <span>Vendor</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                role === 'admin' ? 'bg-white text-[#2A2626] shadow-sm ring-1 ring-black/5' : 'text-[#78716C] hover:text-[#2A2626]'
              }`}
            >
              <ShieldCheck size={16} />
              <span>Admin</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm font-bold text-rose-700 mb-6 font-sans">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 font-sans">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#2A2626] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] block p-4 pl-12 transition-all outline-none font-medium"
                />
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#4A5D23] transition-colors" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#2A2626] uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#4A5D23] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#E7E5E4] text-[#2A2626] text-sm rounded-2xl focus:ring-4 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] block p-4 pl-12 pr-12 transition-all outline-none font-medium"
                />
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] group-focus-within:text-[#4A5D23] transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-sm text-[#78716C] pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer w-5 h-5 rounded-md border-2 border-[#E7E5E4] appearance-none checked:bg-[#4A5D23] checked:border-[#4A5D23] transition-colors cursor-pointer"
                  />
                  <ShieldCheck size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="font-medium text-[#2A2626]">Keep me signed in</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group w-full py-4 mt-6 rounded-2xl bg-[#2A2626] hover:bg-[#1a1717] text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-xl shadow-black/10 transform hover:-translate-y-0.5"
            >
              <span>Log In to Rentora</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-8 mt-8 border-t border-[#E7E5E4] text-sm text-[#78716C] font-sans font-medium">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-[#4A5D23] hover:underline">
              Create an Account
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right: Cinematic Image Container */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#2A2626] overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&q=80&w=1400" 
          alt="Clean Camera Gear"
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
              <ShieldCheck size={16} className="text-[#4A5D23]" /> Secure Login
            </div>
            <h2 className="text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Manage your rentals.<br/>
              <span className="text-[#E7E5E4]">Grow your business.</span>
            </h2>
            <p className="text-lg text-white/80 max-w-lg font-sans leading-relaxed">
              Rentora provides industry-leading tools to manage your inventory, track bookings, and scale your rental operations.
            </p>
          </motion.div>
        </div>
      </div>
      
    </div>
  );
}
