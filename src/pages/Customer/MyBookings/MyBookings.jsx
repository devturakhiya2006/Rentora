import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CalendarCheck,
  RotateCcw,
  Eye,
  FileText,
  Filter,
  CheckCircle2,
  Calendar,
  X,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';
// from '../../../supabaseClient';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './MyBookings.css';

export default function MyBookings() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Supabase State
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map Supabase data to match table structure
      const formattedBookings = data.map(r => ({
        id: r.id,
        orderId: 'REN-' + r.id.substring(0, 6).toUpperCase(),
        title: r.products?.title || 'Rental Equipment',
        category: r.products?.category || 'General',
        image: r.products?.images?.[0] || 'https://via.placeholder.com/60',
        durationDays: Math.max(1, Math.ceil((new Date(r.end_date) - new Date(r.start_date)) / (1000 * 60 * 60 * 24))),
        vendor: { name: r.products?.vendor_name || 'Rentora Vendor', city: r.products?.city || 'Ahmedabad' },
        startDate: new Date(r.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        endDate: new Date(r.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        pickupTime: '10:00 AM',
        totalPaid: r.total_price,
        securityDeposit: r.security_deposit,
        rentalStatus: r.status === 'Active' ? 'Active' : r.status === 'Completed' ? 'Completed' : 'Return Scheduled',
        paymentStatus: 'Paid'
      }));

      setBookings(formattedBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'All' && b.rentalStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.orderId.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.vendor.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A5D23]"></div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      {/* Header */}
      <div className="bookings-header-row flex justify-between items-center mb-6">
        <div>
          <h1 className="page-main-heading text-2xl font-bold text-gray-900">Booking History</h1>
          <p className="page-sub-heading text-sm text-gray-500">
            View all confirmed rental reservations, past orders, and instant re-booking.
          </p>
        </div>
        <Link to="/products" className="px-4 py-2 bg-[#4A5D23] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#36451A]">
          + Make New Booking
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bookings-filters-bar flex flex-col sm:flex-row justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="search-box relative w-full sm:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, gear, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#4A5D23]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="status-filter-group flex gap-2 overflow-x-auto pb-1">
          {['All', 'Active', 'Return Scheduled', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === st ? 'bg-[#2A2626] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / Cards */}
      <div className="bookings-table-container bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {bookings.length === 0 ? (
          // Professional Empty State
          <div className="bookings-empty-state flex flex-col items-center justify-center p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <CalendarCheck size={40} className="text-[#4A5D23]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              You haven't rented any equipment yet. Explore our catalog to find premium gear for your next project or trip.
            </p>
            <Link to="/products" className="px-6 py-2.5 bg-[#4A5D23] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#36451A]">
              Explore Rentals
            </Link>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bookings-empty-state p-12 text-center text-gray-500">
            <p>No booking records matched your search criteria.</p>
          </div>
        ) : (
          <div className="table-responsive overflow-x-auto">
            <table className="bookings-full-table w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-4">Order Reference</th>
                  <th className="p-4">Rental Item</th>
                  <th className="p-4">Vendor & City</th>
                  <th className="p-4">Rental Dates</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-gray-900 block">{booking.orderId}</span>
                      <span className="text-xs text-gray-500">{booking.durationDays} Days Rental</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={booking.image} alt={booking.title} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                        <div>
                          <div className="font-semibold text-gray-900 line-clamp-1">{booking.title}</div>
                          <div className="text-xs text-gray-500">{booking.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-gray-900 block">{booking.vendor.name}</span>
                      <span className="text-xs text-gray-500">{booking.vendor.city}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-gray-900 block">
                        {booking.startDate} &rarr; {booking.endDate}
                      </span>
                      <span className="text-xs text-gray-500">{booking.pickupTime}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-900 block">₹{booking.totalPaid.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">(₹{booking.securityDeposit} Escrow)</span>
                    </td>
                    <td className="p-4 space-y-1">
                      <RentalStatusBadge status={booking.rentalStatus} size="small" />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          // Bouns: Passing specific booking data to the modal!
                          onClick={() => setSelectedDoc({ type: 'invoice', id: booking.orderId, details: booking })}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          title="View Invoice"
                        >
                          <Receipt size={16} />
                        </button>
                        <Link
                          to="/products"
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#4A5D23] bg-[#4A5D23]/10 hover:bg-[#4A5D23]/20 rounded-lg transition-colors"
                        >
                          <RotateCcw size={12} /> Rebook
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Universal Document Modal - Now with isOpen={true} and dynamic data */}
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
            subtotal: selectedDoc.details.totalPaid - (selectedDoc.details.delivery || 0)
          }}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}