import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Receipt,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './VendorOrders.css';

const TABS = ['All', 'Confirmed', 'Processing', 'Active', 'Completed'];

export default function VendorOrders() {
  const { orders, loadingOrders, updateOrderStatus, showToast, vendorProfile } = useVendor();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [docModal, setDocModal] = useState(null);

  const filteredOrders = orders.filter((o) => {
    if (activeTab !== 'All' && o.orderStatus !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const customerName = o.customer?.name || '';
      const productName = o.product?.name || '';
      const orderIdRef = o.orderId || '';
      return (
        orderIdRef.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q) ||
        productName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
    }
  };

  if (loadingOrders) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#E7E5E4] border-t-[#4A5D23] rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Loading Live Orders...</p>
      </div>
    );
  }

  return (
    <div className="vendor-orders-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Orders & Rental Reservations</h1>
          <p className="page-sub-heading">
            Review customer bookings, manage equipment dispatch schedules, and inspect returns.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/vendor/quotations" className="btn-v-secondary">
            <FileText size={16} />
            <span>Commercial Quotes</span>
          </Link>
          <Link to="/vendor/pickups-returns" className="btn-v-primary">
            <Truck size={16} />
            <span>Pickup & Return Hub</span>
          </Link>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="v-filter-toolbar">
        <div className="v-status-filter-pills">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`v-filter-pill-btn ${activeTab === tab ? 'v-pill-active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search order ID, customer, equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="v-card-box p-0 overflow-hidden">
        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer Name</th>
                <th>Reserved Gear</th>
                <th>Rental Schedule</th>
                <th>Total Billed</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id || o.orderId} className="v-table-row">
                    <td>
                      <span className="font-mono font-bold text-charcoal text-xs bg-slate-100 px-2 py-1 rounded">
                        {o.orderId}
                      </span>
                    </td>
                    <td>
                      <div className="v-cust-cell">
                        <img src={o.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt="Customer" className="v-cust-thumb" />
                        <div>
                          <span className="font-bold text-charcoal text-xs block">{o.customer?.name}</span>
                          <span className="text-[11px] text-slate-400">{o.customer?.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="v-prod-cell">
                        <img src={o.product?.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80'} alt="Product" className="v-prod-thumb" />
                        <div>
                          <h4 className="text-xs font-semibold text-charcoal max-w-xs">{o.product?.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {o.product?.sku || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-charcoal">
                        {o.startDate} &rarr; {o.endDate}
                      </span>
                      <div className="text-[10px] text-slate-400">{o.durationDays} Days ({o.handoverType || 'Standard'})</div>
                    </td>
                    <td>
                      <div className="font-bold text-charcoal text-xs">
                        ₹{(o.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        (₹{o.securityDeposit || 0} Escrow)
                      </div>
                    </td>
                    <td>
                      <span
                        className={`v-status-badge ${o.orderStatus === 'Active'
                          ? 'status-active'
                          : o.orderStatus === 'Confirmed'
                            ? 'status-confirmed'
                            : o.orderStatus === 'Processing'
                              ? 'status-processing'
                              : 'status-completed'
                          }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td>
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                        className="v-status-select"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Active">Active (Handed Over)</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="btn-v-action-view"
                          title="View Order Details"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => setDocModal({ type: 'invoice', id: o.orderId })}
                          className="btn-v-action-view"
                          title="Tax Invoice"
                        >
                          <Receipt size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer Modal */}
      {selectedOrder && (
        <div className="v-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="v-modal-card max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <div>
                <span className="font-mono text-xs font-bold text-primary-red">{selectedOrder.orderId}</span>
                <h3 className="font-bold text-charcoal text-base">Rental Order Specifications</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="v-modal-close">✕</button>
            </div>

            <div className="v-modal-body space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <img src={selectedOrder.product?.image} alt="Product" className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-charcoal text-sm">{selectedOrder.product?.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">SKU: {selectedOrder.product?.sku}</p>
                  <p className="text-xs font-bold text-primary-red mt-0.5">{selectedOrder.rentalPeriod || `${selectedOrder.startDate} - ${selectedOrder.endDate}`}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <div>
                  <span className="text-slate-400 block">Customer Name:</span>
                  <span className="font-bold text-charcoal">{selectedOrder.customer?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Phone:</span>
                  <span className="font-bold text-charcoal">{selectedOrder.customer?.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Delivery / Handover Address:</span>
                  <span className="font-medium text-charcoal">{selectedOrder.customer?.address}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Rental Fee</span>
                  <span className="font-semibold text-charcoal">₹{(selectedOrder.rentalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Deposit (Escrow Protected)</span>
                  <span className="font-semibold text-emerald-600">₹{(selectedOrder.securityDeposit || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-charcoal">
                  <span>Total Amount Paid</span>
                  <span>₹{(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="v-modal-footer flex items-center justify-between">
              <button
                onClick={() => setDocModal({ type: 'invoice', id: selectedOrder.orderId })}
                className="btn-v-secondary"
              >
                <Receipt size={15} />
                <span>View Tax Invoice</span>
              </button>
              <button onClick={() => setSelectedOrder(null)} className="btn-v-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {docModal && (
        <DocumentModal
          isOpen={true}
          type={docModal.type}
          docId={docModal.id}
          data={(() => {
            const targetOrder = orders.find(o => o.orderId === docModal.id);
            if (!targetOrder) return {};
            return {
              invoiceNumber: `INV-${targetOrder.rawId.slice(0, 5).toUpperCase()}`,
              invoiceDate: new Date(targetOrder.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              vendor: vendorProfile?.businessName || 'Rentora Partner',
              product: targetOrder.product?.name || 'Rental Equipment',
              duration: `${targetOrder.durationDays} Days`,
              subtotal: targetOrder.totalAmount,
              deposit: targetOrder.securityDeposit,
              total: targetOrder.totalAmount + targetOrder.securityDeposit
            };
          })()}
          onClose={() => setDocModal(null)}
        />
      )}
    </div>
  );
}