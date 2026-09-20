import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'vendor') return '/vendor/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#E7E5E4] p-8 text-center"
      >
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="text-rose-500 w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-[#2A2626] mb-3">Access Denied</h1>
        
        <p className="text-[#78716C] mb-8 leading-relaxed">
          You do not have the required permissions to view this page. This area is restricted to specific roles.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-[#2A2626] text-white py-3.5 rounded-xl font-bold hover:bg-black transition-colors"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          
          <Link 
            to={getDashboardLink()}
            className="w-full flex items-center justify-center gap-2 bg-[#F5F4F0] text-[#2A2626] py-3.5 rounded-xl font-bold hover:bg-[#E7E5E4] transition-colors"
          >
            <Home size={18} />
            Return to My Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
