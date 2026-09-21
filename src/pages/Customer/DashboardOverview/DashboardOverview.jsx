import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageOpen, Sparkles, Clock, FileText, ArrowRight, ShieldCheck,
  Crown, Activity, CreditCard, MapPin, ChevronRight, BarChart3, TrendingUp, CalendarClock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCustomer } from '../../../context/CustomerContext';
import { useWishlist } from '../../../context/WishlistContext';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import { supabase } from '../../../supabaseClient';

export default function DashboardOverview() {
  const { user } = useAuth();
  const { profile, spendingData } = useCustomer();
  const { wishlist, wishlistCount } = useWishlist();
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [liveRentals, setLiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeRentals: 0, upcomingReturns: 0, totalBookings: 0, totalSpending: 0, escrowDeposit: 0
  });
  const [dynamicMonthlySpending, setDynamicMonthlySpending] = useState([
    { month: 'Jul', amount: 0 },
    { month: 'Aug', amount: 0 },
    { month: 'Sep', amount: 0 }
  ]);

  const customerName = profile?.name || user?.name || 'Customer';
  const firstName = customerName.split(' ')[0] || 'Customer';

  useEffect(() => {
    fetchLiveDashboardData();
  }, []);

  const fetchLiveDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`*, products (*)`)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        let activeCount = 0; let upcomingCount = 0; let spending = 0; let escrow = 0;

        const formatted = data.map(r => {
          const start = new Date(r.start_date);
          const end = new Date(r.end_date);
          const today = new Date();
          const diffTime = end - today;
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
          const daysPassed = Math.max(0, Math.ceil((today - start) / (1000 * 60 * 60 * 24)));
          const progressPct = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));

          spending += r.total_price || 0;

          // Case-insensitive status check ('active', 'return scheduled', etc.)
          const rawStatus = (r.status || 'Active').trim().toLowerCase();

          if (rawStatus === 'active' || rawStatus === 'return scheduled' || rawStatus === 'rented') {
            activeCount++;
            escrow += r.security_deposit || 0;
            if (daysRemaining <= 2) {
              upcomingCount++;
            }
          }

          return {
            id: r.id,
            orderId: 'REN-' + r.id.substring(0, 6).toUpperCase(),
            title: r.products?.title || 'Rental Equipment',
            category: r.products?.category || 'Premium Gear',
            image: r.products?.images?.[0] || 'https://via.placeholder.com/150',
            vendor: { name: r.products?.vendor_name || 'Rentora Vendor', city: r.products?.city || 'Ahmedabad' },
            startDate: start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            endDate: end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            durationDays: totalDays,
            progressPct: progressPct,
            totalPaid: r.total_price || 0,
            securityDeposit: r.security_deposit || 0,
            rentalStatus: r.status || 'Active',
            daysRemaining: daysRemaining,
            returnTime: '10:00 AM',
            rawDate: new Date(r.created_at)
          };
        });

        // Compute Dynamic Monthly Spending
        const monthsMap = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize last 3 months to 0
        const currentMonthIdx = new Date().getMonth();
        for (let i = 2; i >= 0; i--) {
          let m = currentMonthIdx - i;
          if (m < 0) m += 12;
          monthsMap[monthNames[m]] = 0;
        }

        formatted.forEach(r => {
          if (r.rawDate && !isNaN(r.rawDate)) {
             const mName = monthNames[r.rawDate.getMonth()];
             if (monthsMap[mName] !== undefined) {
                monthsMap[mName] += r.totalPaid;
             }
          }
        });

        const newMonthlySpending = Object.keys(monthsMap).map(key => ({
          month: key,
          amount: monthsMap[key]
        }));
        
        setDynamicMonthlySpending(newMonthlySpending);

        setLiveRentals(formatted);
        setMetrics({
          activeRentals: activeCount,
          upcomingReturns: upcomingCount,
          totalBookings: formatted.length,
          totalSpending: spending,
          escrowDeposit: escrow
        });
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeRentals = liveRentals.filter(r => {
    const st = (r.rentalStatus || '').trim().toLowerCase();
    return st === 'active' || st === 'return scheduled' || st === 'rented';
  });

  const upcomingReturns = liveRentals.filter(r => {
    const st = (r.rentalStatus || '').trim().toLowerCase();
    return r.daysRemaining <= 2 && (st === 'active' || st === 'return scheduled' || st === 'rented');
  });

  const completedRentals = liveRentals.filter(r => {
    const st = (r.rentalStatus || '').trim().toLowerCase();
    return st === 'completed' || st === 'returned';
  });

  const maxSpend = Math.max(...dynamicMonthlySpending.map(d => d.amount), 1);
  const avgMonthly = Math.round(metrics.totalSpending / Math.max(1, dynamicMonthlySpending.filter(d => d.amount > 0).length));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#4A5D23] rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-16 font-sans">

      {/* GLASMORPHISM HERO SECTION */}
      <div className="relative bg-slate-950 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#4A5D23]/40 to-emerald-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row gap-10 items-center justify-between">
          <div className="w-full xl:w-1/2 space-y-6 text-center xl:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-inner">
              <Crown size={14} className="text-amber-400" />
              <span>Rentora Prime Member</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight font-['Sora'] leading-[1.1]">
              Ready to create, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#b5d382]">
                {firstName}?
              </span>
            </h1>

            <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto xl:mx-0 font-medium">
              Manage your rentals, bookings, and returns all from one central dashboard.
            </p>

            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4 pt-4">
              <Link to="/products" className="group px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#4A5D23] to-[#5b722b] text-white text-sm font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(74,93,35,0.4)] hover:-translate-y-0.5 transition-all duration-300">
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform" /> Browse Ecosystem
              </Link>
              <Link to="/customer/bookings" className="px-6 py-3.5 rounded-2xl bg-white/5 text-white border border-white/10 text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all backdrop-blur-sm">
                <Activity size={16} /> View Activity
              </Link>
            </div>
          </div>

          <div className="w-full xl:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <ShieldCheck size={20} className="text-emerald-400" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Escrow Protected</p>
              <h3 className="text-3xl font-black text-white font-['Sora']">₹{metrics.escrowDeposit.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> 100% Refundable Guarantee
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                <CreditCard size={20} className="text-blue-400" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bookings</p>
              <h3 className="text-3xl font-black text-white font-['Sora']">{metrics.totalBookings} Orders</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
                Lifetime spend: ₹{metrics.totalSpending.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Active in Custody</p>
            <h4 className="text-2xl font-black text-emerald-900 font-['Sora'] mt-1">{activeRentals.length} Items</h4>
            <p className="text-xs text-emerald-600 mt-0.5">Currently with you</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <PackageOpen size={24} />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Returns Due Soon</p>
            <h4 className="text-2xl font-black text-amber-900 font-['Sora'] mt-1">{upcomingReturns.length} Items</h4>
            <p className="text-xs text-amber-600 mt-0.5">Due within 48 hours</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <CalendarClock size={24} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Completed / Returned</p>
            <h4 className="text-2xl font-black text-slate-900 font-['Sora'] mt-1">{completedRentals.length} Orders</h4>
            <p className="text-xs text-slate-500 mt-0.5">Successfully inspected & closed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* LEFT COLUMN: Active Gear */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-['Sora'] flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                  Currently Rented Gear
                </h2>
                <p className="text-sm text-slate-500 mt-1">Detailed view of items under your custody</p>
              </div>
            </div>

            <div className="space-y-4">
              {activeRentals.length > 0 ? activeRentals.map((rental) => (
                <div key={rental.id} className="group relative bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-[#4A5D23]/30 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <div className="w-full sm:w-24 h-24 rounded-xl bg-white border border-slate-100 overflow-hidden flex-shrink-0 relative">
                      <img src={rental.image} alt={rental.title} className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-white/95 backdrop-blur text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{rental.category}</div>
                    </div>

                    <div className="flex-1 w-full">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-slate-900 text-lg line-clamp-1 pr-4">{rental.title}</h3>
                        <span className="font-mono text-xs font-bold text-slate-400 bg-slate-200/50 px-2 py-1 rounded-md">{rental.orderId}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-500 mb-4 flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400" /> Rented from {rental.vendor.name} ({rental.vendor.city})
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>{rental.startDate}</span>
                          <span className={rental.progressPct > 80 ? 'text-amber-500' : 'text-slate-400'}>{rental.endDate}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${rental.progressPct > 80 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-[#4A5D23] to-emerald-400'}`}
                            style={{ width: `${rental.progressPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                      <button onClick={() => setSelectedDoc({ type: 'invoice', id: rental.orderId, details: rental })} className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-[#4A5D23] hover:text-white hover:border-[#4A5D23] transition-colors tooltip text-slate-600 text-xs font-bold" title="View Invoice">
                        <FileText size={16} /> <span className="sm:hidden">Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                  <PackageOpen size={48} className="text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-800">No active gear right now</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm">All your previous rentals are marked as completed. Ready for your next project?</p>
                  <Link to="/products" className="mt-5 px-5 py-2.5 bg-[#4A5D23] text-white text-sm font-bold rounded-xl hover:bg-[#3d4d1d] transition-colors">
                    Rent New Gear
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: History & Analytics */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Wishlist Preview */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 font-['Sora']">My Wishlist</h2>
              <Link to="/customer/wishlist" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#4A5D23] hover:text-white transition-colors" title="View Wishlist">
                <ChevronRight size={18} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {wishlist.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between group cursor-pointer border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src={item.images?.[0] || 'https://via.placeholder.com/150'} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#4A5D23] transition-colors">{item.title || item.name}</h4>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">₹{item.pricePerDay}/day</p>
                    </div>
                  </div>
                </div>
              ))}

              {wishlistCount === 0 && (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-sm font-medium mb-3">Your wishlist is empty.</p>
                  <Link to="/products" className="text-xs font-bold text-[#4A5D23] hover:underline">Explore Gear</Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 font-['Sora']">Recent History</h2>
              <Link to="/customer/bookings" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#4A5D23] hover:text-white transition-colors">
                <ChevronRight size={18} />
              </Link>
            </div>

            <div className="space-y-4">
              {liveRentals.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between group cursor-pointer border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <img src={b.image} alt="gear" className="w-8 h-8 object-cover rounded-md mix-blend-multiply" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#4A5D23] transition-colors">{b.title}</h4>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">{b.startDate} • {b.rentalStatus}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-slate-800">₹{b.totalPaid.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}

              {liveRentals.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm font-medium">No history found.</div>
              )}
            </div>
          </div>

          <div className="bg-[#FAF9F6] rounded-3xl border border-slate-100 shadow-inner p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 font-['Sora'] flex items-center gap-2 mb-6">
              <BarChart3 size={18} className="text-emerald-600" /> Spend Analytics
            </h2>

            <div className="flex h-32 items-end gap-2 mt-4 pb-2 border-b border-slate-100">
              {dynamicMonthlySpending.map((item, i) => {
                const height = `${(item.amount / maxSpend) * 100}%`;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </div>
                    {/* Bar */}
                    <div className="w-full bg-[#4A5D23]/20 rounded-t-md relative hover:bg-[#4A5D23]/30 transition-colors" style={{ height: item.amount === 0 ? '4px' : height }}>
                      <div className="absolute bottom-0 left-0 right-0 bg-[#4A5D23] rounded-t-md transition-all duration-500 group-hover:opacity-90" style={{ height: '100%' }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{item.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200/60 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Monthly</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">₹{avgMonthly.toLocaleString('en-IN')}</p>
              </div>
              {avgMonthly > 0 && (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                  <TrendingUp size={14} /> +12%
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {selectedDoc && (
        <DocumentModal
          isOpen={true}
          type={selectedDoc.type}
          docId={selectedDoc.id}
          data={{
            invoiceNumber: selectedDoc.details.orderId,
            invoiceDate: selectedDoc.details.startDate,
            vendor: selectedDoc.details.vendor.name,
            product: selectedDoc.details.title,
            duration: `${selectedDoc.details.durationDays} Days`,
            total: selectedDoc.details.totalPaid,
            deposit: selectedDoc.details.securityDeposit,
            subtotal: selectedDoc.details.totalPaid
          }}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}