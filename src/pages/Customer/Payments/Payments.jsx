import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Search,
  Download,
  Eye,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Lock
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';
// from '../../../supabaseClient'; // 🚀 SUPABASE IMPORT
import './Payments.css';

export default function Payments() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentsData, setPaymentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLivePayments();
  }, []);

  const fetchLivePayments = async () => {
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

      const mappedPayments = data.map((r, index) => {
        const orderIdShort = 'REN-' + r.id.substring(0, 6).toUpperCase();
        return {
          id: r.id,
          txnId: 'TXN-2026-' + (8801 + index),
          orderId: orderIdShort,
          product: r.products?.title || 'Rentora Equipment',
          date: new Date(r.created_at || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          method: 'UPI / Escrow Secured',
          type: 'Rental Charge',
          amount: r.total_price,
          deposit: r.security_deposit,
          status: 'Successful'
        };
      });

      setPaymentsData(mappedPayments);
    } catch (err) {
      console.error("Failed to fetch live payments:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🖨️ Printable Receipt / PDF Window
  const openReceiptPrintWindow = (p) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${p.txnId}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1c1917; background: #fff; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4A5D23; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #4A5D23; }
            .grid { background: #f5f5f4; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; }
            .total-box { background: #fafaf9; border: 1px solid #e7e5e4; padding: 15px; border-radius: 8px; width: 300px; margin-left: auto; font-size: 14px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .grand { font-weight: bold; border-top: 1px solid #d6d3d1; padding-top: 6px; margin-top: 6px; font-size: 16px; color: #4A5D23; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">RENTORA ESCROW</div>
              <p style="font-size: 12px; color: #78716c;">Official Electronic Payment Receipt</p>
            </div>
            <div style="text-align: right;">
              <h2>${p.txnId}</h2>
              <p style="font-size: 12px; color: #78716c;">Date: ${p.date}</p>
            </div>
          </div>

          <div class="grid">
            <div><strong>Order Ref:</strong> ${p.orderId}</div>
            <div><strong>Payment Mode:</strong> ${p.method}</div>
            <div><strong>Item Rented:</strong> ${p.product}</div>
            <div><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">${p.status}</span></div>
          </div>

          <div class="total-box">
            <div class="row"><span>Transaction Amount:</span><span>₹${p.amount.toLocaleString('en-IN')}</span></div>
            <div class="row"><span>Escrow Deposit Held:</span><span>₹${p.deposit.toLocaleString('en-IN')}</span></div>
            <div class="row grand"><span>Total Paid:</span><span>₹${p.amount.toLocaleString('en-IN')}</span></div>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredPayments = paymentsData.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.txnId.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      p.product.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  });

  // Calculate live metrics from Supabase data
  const totalSpending = paymentsData.reduce((acc, curr) => acc + curr.amount, 0);
  const activeEscrowDeposit = paymentsData.reduce((acc, curr) => acc + curr.deposit, 0);

  if (loading) {
    return <div className="p-8 text-center text-[#78716C] font-bold">Loading live payment ledger...</div>;
  }

  return (
    <div className="payments-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Payment History & Escrow Ledger</h1>
          <p className="page-sub-heading">
            Audit transparent records of upfront rentals, security deposits, and automatic escrow releases.
          </p>
        </div>
      </div>

      {/* Escrow Ledger Highlights */}
      <div className="payments-metrics-grid">
        <div className="pay-metric-box">
          <div className="pay-metric-hdr">
            <span className="pay-metric-lbl">Total Spending</span>
            <CreditCard size={18} className="text-charcoal" />
          </div>
          <div className="pay-metric-val">₹{totalSpending.toLocaleString('en-IN')}</div>
          <div className="pay-metric-sub">Across {paymentsData.length} live rentals</div>
        </div>

        <div className="pay-metric-box">
          <div className="pay-metric-hdr">
            <span className="pay-metric-lbl">Active Deposit in Escrow</span>
            <Lock size={18} className="text-emerald-600" />
          </div>
          <div className="pay-metric-val text-emerald-600">₹{activeEscrowDeposit.toLocaleString('en-IN')}</div>
          <div className="pay-metric-sub">100% Refundable upon item return</div>
        </div>

        <div className="pay-metric-box">
          <div className="pay-metric-hdr">
            <span className="pay-metric-lbl">September Debits</span>
            <ArrowUpRight size={18} className="text-primary-red" />
          </div>
          <div className="pay-metric-val text-primary-red">₹{totalSpending.toLocaleString('en-IN')}</div>
          <div className="pay-metric-sub">September 2026 transactions</div>
        </div>
      </div>

      {/* Transaction Filter */}
      <div className="payment-filter-bar">
        <div className="search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search transaction ID, order ref, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="payment-search-input"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="payments-table-card">
        <div className="table-responsive">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Linked Order</th>
                <th>Description / Gear</th>
                <th>Date & Time</th>
                <th>Payment Mode</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400">
                    No payment transactions found. Place an order to generate escrow receipts.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isRefund = p.type.includes('Refund');
                  return (
                    <tr key={p.id} className="payment-table-row">
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
                        <span className="pay-desc-title">{p.product}</span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-600">{p.date}</span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-700 font-medium">{p.method}</span>
                      </td>
                      <td>
                        <span className={`pay-type-badge ${isRefund ? 'pay-refund' : 'pay-charge'}`}>
                          {p.type}
                        </span>
                      </td>
                      <td>
                        <span className={`font-bold text-sm ${isRefund ? 'text-emerald-600' : 'text-charcoal'}`}>
                          {isRefund ? `+₹${p.amount.toLocaleString('en-IN')}` : `₹${p.amount.toLocaleString('en-IN')}`}
                        </span>
                      </td>
                      <td>
                        <span className="pay-status-pill">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          <span>{p.status}</span>
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => openReceiptPrintWindow(p)}
                          className="btn-pay-receipt"
                          title="View Digital Receipt"
                        >
                          <Receipt size={14} />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}