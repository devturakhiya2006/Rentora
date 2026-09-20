import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Save,
  Sparkles,
  Calendar,
  Package
} from 'lucide-react';
import { useCustomer } from '../../../context/CustomerContext';
import { useAuth } from '../../../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const { profile } = useCustomer();
  const [formData, setFormData] = useState({
    name: profile?.name || user?.name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    address: 'N/A',
    city: profile?.location || user?.city || '',
    state: 'Gujarat',
    pincode: '380001'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-['Sora']">Customer Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal credentials, contact coordinates, and KYC trust level.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${isEditing
              ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
              : 'bg-[#2A2626] text-white hover:bg-black'
            }`}
        >
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-bold shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={profile?.avatar || user?.avatar}
            alt={formData.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md"
          />
          {isEditing && (
            <button className="absolute bottom-0 right-0 p-2 bg-[#4A5D23] text-white rounded-full shadow-md hover:bg-[#3d4d1d]" title="Change Avatar Photo">
              <Camera size={14} />
            </button>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Sora']">{formData.name}</h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <ShieldCheck size={14} />
              <span>{profile?.kycStatus || 'KYC Verified'}</span>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-600 flex items-center justify-center md:justify-start gap-1">
            <Sparkles size={14} className="text-amber-500" />
            {profile?.kycBadge || 'Verified Customer'}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
              <Calendar size={13} className="text-slate-400" />
              Member since {profile?.joinedDate || '2023'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
              <Package size={13} className="text-slate-400" />
              {profile?.totalRentalsCompleted || 0} Rentals Completed
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 font-['Sora'] mb-6">Personal & Contact Coordinates</h3>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${isEditing ? 'bg-white border-slate-300 focus-within:border-[#4A5D23] shadow-xs' : 'bg-slate-50 border-slate-200'}`}>
                <User size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none disabled:text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${isEditing ? 'bg-white border-slate-300 focus-within:border-[#4A5D23] shadow-xs' : 'bg-slate-50 border-slate-200'}`}>
                <Mail size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none disabled:text-slate-700"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mobile Number</label>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${isEditing ? 'bg-white border-slate-300 focus-within:border-[#4A5D23] shadow-xs' : 'bg-slate-50 border-slate-200'}`}>
                <Phone size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none disabled:text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">City</label>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${isEditing ? 'bg-white border-slate-300 focus-within:border-[#4A5D23] shadow-xs' : 'bg-slate-50 border-slate-200'}`}>
                <MapPin size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none disabled:text-slate-700"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Primary Delivery & Handover Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className={`w-full p-4 rounded-2xl border transition-all text-sm font-semibold text-slate-900 focus:outline-none ${isEditing ? 'bg-white border-slate-300 focus:border-[#4A5D23] shadow-xs' : 'bg-slate-50 border-slate-200 disabled:text-slate-700'}`}
              required
            />
          </div>

          {isEditing && (
            <div className="flex justify-end pt-4">
              <button type="submit" className="px-6 py-3 rounded-xl bg-[#4A5D23] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#3d4d1d] shadow-md transition-all">
                <Save size={16} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}