import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Package, Calendar, Truck, ShieldCheck, FileText, Clock,
  CheckCircle2, X, Phone, MapPin, AlertCircle, Download, Printer, ChevronRight, ExternalLink
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';
// from '../../../supabaseClient'; // 🚀 SUPABASE IMPORT
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import RentalTimeline from '../../../components/CustomerLayout/RentalTimeline';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './MyRentals.css';

const TABS = ['All', 'Active', 'Late - Penalty Active', 'Completed', 'Cancelled'];

export default function MyRentals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('All');
  const [selectedRental, setSelectedRental] = useState(null);
  const [docModal, setDocModal] = useState(null);

  // 🚨 Dynamic Supabase State
  const [rentalsData, setRentalsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveRentals();
  }, []);

  const fetchLiveRentals = async () => {
    try {
      // Supabase mathi rentals ane eni saathe connected products fetch karo
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 🧠 KILLER FEATURE: Dynamic Penalty Calculation
      const today = new Date('2026-09-18'); // Current system date

      const mappedRentals = data.map(r => {
        const endDate = new Date(r.end_date);
        let lateDays = 0;
        let penalty = 0;
        let currentStatus = r.status === 'active' ? 'Active' : 'Completed';

        // Escrow Penalty Logic: Jo aje end date thi upar thai gaya hoy ane item active hoy
        if (r.status === 'active' && today > endDate) {
          lateDays = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));
          penalty = lateDays * 500; // ₹500 per day penalty 
          currentStatus = 'Late - Penalty Active';
        }

        return {
          id: r.id,
          orderId: 'REN-' + r.id.substring(0, 6).toUpperCase(),
          title: r.products?.title || 'Unknown Equipment',
          image: r.products?.images?.[0] || 'https://via.placeholder.com/150',
          category: r.products?.category || 'Gear',
          rentalStatus: currentStatus,
          paymentStatus: penalty > 0 ? 'Penalty Due' : 'Paid',
          vendor: r.products?.vendor || { name: 'Rentora Verified Hub', city: 'Ahmedabad' },
          startDate: r.start_date,
          endDate: r.end_date,
          durationDays: Math.floor((endDate - new Date(r.start_date)) / (1000 * 60 * 60 * 24)) || 1,
          handoverType: 'Doorstep Delivery',
          rentalAmount: r.total_price - r.security_deposit,
          securityDeposit: r.security_deposit,
          penaltyAmount: penalty,
          lateDays: lateDays,
          totalPaid: r.total_price,
          currentStep: penalty > 0 ? 5 : 3, // Change timeline step if late
          inspectionNote: 'Handover verified digitally.',
          discount: 0,
          deliveryFee: 199
        };
      });

      setRentalsData(mappedRentals);
    } catch (err) {
      console.error("Failed to fetch rentals:", err);
    } finally {
      setLoading(false);
    }
  };

  const vendors = ['All', ...new Set(rentalsData.map((r) => r.vendor.name))];

  const filteredRentals = rentalsData.filter((r) => {
    if (activeTab !== 'All' && r.rentalStatus !== activeTab) return false;
    if (selectedVendor !== 'All' && r.vendor.name !== selectedVendor) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.orderId.toLowerCase().includes(q) || r.vendor.name.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return <div className="p-8 text-center text-[#78716C] font-bold">Loading live escrow data...</div>;
  }

  return (
    <div className="my-rentals-page">
      {/* Header with Title & Stats */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">My Rentals</h1>
          <p className="page-sub-heading">
            Track active equipment custody, pickup milestones, and return timelines.
          </p>
        </div>
        <div className="rentals-stat-capsule">
          <div className="stat-capsule-item">
            <span className="stat-num">{rentalsData.length}</span>
            <span className="stat-lbl">Total Rentals</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-capsule-item">
            <span className="stat-num text-red-600 font-bold">
              {rentalsData.filter((r) => r.penaltyAmount > 0).length}
            </span>
            <span className="stat-lbl">Late Returns</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rentals-controls-bar">
        <div className="rentals-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'tab-btn-active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="search-filter-wrap">
          <div className="search-input-box">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search gear, order ID, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-select-box">
            <Filter size={15} className="text-slate-400" />
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="vendor-select"
            >
              {vendors.map((v) => (
                <option key={v} value={v}>
                  {v === 'All' ? 'All Vendors' : v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rentals List */}
      <div className="rentals-list-grid">
        {filteredRentals.length === 0 ? (
          <div className="empty-state-box">
            <Package size={48} className="text-slate-300 mb-3" />
            <h3 className="empty-title">No Rentals Found</h3>
            <p className="empty-sub">No rental records matched your filters.</p>
          </div>
        ) : (
          filteredRentals.map((rental) => (
            <div key={rental.id} className="rental-card-row">
              <div className="rental-card-img-wrap">
                <img src={rental.image} alt={rental.title} className="rental-card-img" />
                <span className="rental-category-badge">{rental.category}</span>
              </div>

              <div className="rental-card-info">
                <div className="rental-card-top">
                  <div className="rental-id-capsule">
                    <span className="font-mono">{rental.orderId}</span>
                  </div>
                  <RentalStatusBadge status={rental.rentalStatus} />
                  {rental.penaltyAmount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                      ₹{rental.penaltyAmount} Penalty
                    </span>
                  )}
                </div>

                <h3 className="rental-card-title">{rental.title}</h3>

                <div className="rental-vendor-info">
                  <span className="text-slate-500">Provided by:</span>
                  <span className="font-semibold text-charcoal ml-1">{rental.vendor.name}</span>
                </div>

                <div className="rental-metrics-row">
                  <div className="rental-meta-pill">
                    <Calendar size={14} className="text-primary-red" />
                    <span>{rental.startDate} &rarr; {rental.endDate} ({rental.durationDays} Days)</span>
                  </div>
                </div>
              </div>

              <div className="rental-card-financials">
                <div className="financial-row">
                  <span className="fin-lbl">Rental Fee:</span>
                  <span className="fin-val font-semibold">₹{rental.rentalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="financial-row">
                  <span className="fin-lbl">Escrow Deposit:</span>
                  <span className="fin-val text-emerald-600 font-semibold">₹{rental.securityDeposit.toLocaleString('en-IN')}</span>
                </div>

                {/* 🚨 DYNAMIC PENALTY UI */}
                {rental.penaltyAmount > 0 ? (
                  <div className="financial-row py-1 border-t border-red-100 mt-1">
                    <span className="fin-lbl text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle size={12} /> Late Penalty ({rental.lateDays}d):
                    </span>
                    <span className="fin-val text-red-600 font-extrabold">-₹{rental.penaltyAmount.toLocaleString('en-IN')}</span>
                  </div>
                ) : null}

                <div className="rental-cta-group pt-2">
                  <button onClick={() => setSelectedRental(rental)} className="btn-view-timeline w-full">
                    Manage Escrow & Timeline
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Rental Drawer / Modal */}
      {selectedRental && (
        <div className="rental-drawer-backdrop" onClick={() => setSelectedRental(null)}>
          <div className="rental-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <div className="drawer-order-id">{selectedRental.orderId}</div>
                <h2 className="drawer-title">{selectedRental.title}</h2>
              </div>
              <button onClick={() => setSelectedRental(null)} className="drawer-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-product-bar">
                <img src={selectedRental.image} alt={selectedRental.title} className="drawer-img" />
                <div className="drawer-prod-info">
                  <div className="flex items-center gap-2 mb-1">
                    <RentalStatusBadge status={selectedRental.rentalStatus} />
                  </div>
                  <p className="drawer-vendor-line">Vendor: <strong>{selectedRental.vendor.name}</strong></p>
                </div>
              </div>

              {/* Escrow Math Table */}
              <div className="drawer-section mt-4">
                <h4 className="drawer-section-title flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#4A5D23]" />
                  Automated Escrow Settlement
                </h4>
                <div className="breakdown-table border-2 border-emerald-50 rounded-xl overflow-hidden">
                  <div className="bd-row bg-slate-50">
                    <span>Base Rental ({selectedRental.durationDays} Days)</span>
                    <span>₹{selectedRental.rentalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bd-row bg-slate-50 border-b border-slate-100">
                    <span>Total Deposit Locked in Escrow</span>
                    <span className="text-emerald-600 font-semibold">₹{selectedRental.securityDeposit.toLocaleString('en-IN')}</span>
                  </div>

                  {selectedRental.penaltyAmount > 0 && (
                    <div className="bd-row bg-red-50 text-red-700">
                      <span className="font-bold">Late Return Penalty Deduction</span>
                      <span className="font-bold">-₹{selectedRental.penaltyAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="bd-row bd-total bg-emerald-50 pt-3 mt-0 border-none">
                    <span className="text-emerald-800">Final Escrow Refund to Wallet</span>
                    <span className="text-xl text-emerald-700 font-extrabold">
                      ₹{(selectedRental.securityDeposit - selectedRental.penaltyAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button onClick={() => setSelectedRental(null)} className="btn-drawer-close">
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}