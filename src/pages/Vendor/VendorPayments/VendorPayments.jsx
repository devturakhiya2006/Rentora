import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Download,
  Building,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Receipt,
  Eye,
  Sparkles
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './VendorPayments.css';

export default function VendorPayments() {
  const { payments, vendorProfile, showToast } = useVendor();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.txnId.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      p.customer.toLowerCase().includes(q)
    );
  });

  return (
    <div className="vendor-payments-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Payouts & Escrow Ledger</h1>
          <p className="page-sub-heading">
            Track bank settlement transactions, platform fee deductions, and released escrow disbursements.
          </p>
        </div>

        <div className="v-bank-capsule">
          <Building size={16} className="text-charcoal-light" />
          <span>Settling to: <strong>{vendorProfile.bankAccount || 'Linked Bank Account'}</strong></span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="payout-stats-grid">
        <div className="v-stat-card">
          <span className="v-stat-title">Lifetime Settled Payouts</span>
          <div className="v-stat-val text-charcoal">
            ₹{payments.filter(p => p.payoutStatus.includes('Settled')).reduce((sum, p) => sum + (p.rentalEarning || 0), 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Direct Bank NEFT / IMPS</span>
        </div>

        <div className="v-stat-card">
          <span className="v-stat-title">This Month Net Earnings</span>
          <div className="v-stat-val text-primary-red">
            ₹{payments.filter(p => new Date(p.date).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + (p.rentalEarning || 0), 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Live Tracked</span>
        </div>

        <div className="v-stat-card">
          <span className="v-stat-title">Escrow Held Pending Return</span>
          <div className="v-stat-val text-charcoal-light">
            ₹{payments.filter(p => p.payoutStatus.includes('Escrow')).reduce((sum, p) => sum + (p.rentalEarning || 0), 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">Auto-transfers upon return inspection</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="v-filter-toolbar">
        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search payout transaction ID, order ref, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>
      </div>

      {/* Payout Table */}
      <div className="v-card-box p-0 overflow-hidden">
        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Transaction Ref</th>
                <th>Order Ref</th>
                <th>Customer Name</th>
                <th>Settlement Date</th>
                <th>Gross Rental</th>
                <th>Platform Commission</th>
                <th>Net Vendor Payout</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id} className="v-table-row">
                  <td>
                    <span className="font-mono font-bold text-charcoal text-xs">
                      {p.txnId}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-slate-500 font-semibold">
                      {p.orderId}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-charcoal">{p.customer}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600">{p.date}</span>
                  </td>
                  <td>
                    <span className="font-bold text-charcoal text-xs">₹{p.amount.toLocaleString('en-IN')}</span>
                  </td>
                  <td>
                    <span className="text-xs text-rose-600 font-medium">-₹{p.platformFee}</span>
                  </td>
                  <td>
                    <span className="font-extrabold text-emerald-600 text-sm">
                      ₹{p.rentalEarning.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`v-status-badge ${
                        p.payoutStatus.includes('Settled')
                          ? 'status-active'
                          : 'status-processing'
                      }`}
                    >
                      {p.payoutStatus}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedReceipt({ type: 'invoice', id: p.orderId })}
                      className="btn-v-action-view"
                      title="View Settlement Receipt"
                    >
                      <Receipt size={13} />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Universal Document Modal */}
      {selectedReceipt && (
        <DocumentModal
          isOpen={true}
          type={selectedReceipt.type}
          docId={selectedReceipt.id}
          data={(() => {
            const targetPayment = payments.find(p => p.orderId === selectedReceipt.id);
            if (!targetPayment) return {};
            return {
              invoiceNumber: targetPayment.txnId,
              invoiceDate: targetPayment.date,
              vendor: vendorProfile?.businessName || 'Rentora Partner',
              product: 'Rental Earnings Settlement',
              duration: 'N/A', 
              subtotal: targetPayment.amount,
              platformFee: targetPayment.platformFee,
              deposit: 0,
              total: targetPayment.rentalEarning
            };
          })()}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
