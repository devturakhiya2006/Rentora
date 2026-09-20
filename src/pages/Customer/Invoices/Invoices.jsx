import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Download,
  Eye,
  FileText,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';
// from '../../../supabaseClient';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import './Invoices.css';

export default function Invoices() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [invoicesData, setInvoicesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveInvoices();
  }, []);

  const fetchLiveInvoices = async () => {
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

      const mappedInvoices = data.map((r, index) => {
        const orderIdShort = 'REN-' + r.id.substring(0, 6).toUpperCase();
        return {
          id: r.id,
          invoiceNumber: `INV-2026-${101 + index}`,
          orderId: orderIdShort,
          product: r.products?.title || 'Rentora Equipment',
          vendor: r.products?.vendor?.name || 'Rentora Verified Hub',
          invoiceDate: new Date(r.created_at || Date.now()).toISOString().split('T')[0],
          paymentMethod: 'UPI / Escrow Secured',
          total: r.total_price,
          deposit: r.security_deposit,
          status: 'Paid'
        };
      });

      setInvoicesData(mappedInvoices);
    } catch (err) {
      console.error('Failed to fetch live invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🖨️ PDF Printable Window Generator
  const openInvoicePrintWindow = (inv, autoPrint = false) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice - ${inv.invoiceNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #2A2626; background: #fff; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4A5D23; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 26px; font-weight: 900; color: #4A5D23; letter-spacing: -0.5px; }
            .tagline { font-size: 12px; color: #78716C; margin-top: 4px; }
            .invoice-title { text-align: right; }
            .invoice-title h2 { margin: 0 0 6px 0; font-size: 22px; color: #2A2626; }
            .invoice-title p { margin: 2px 0; font-size: 13px; color: #57534E; }
            .details-card { background: #FAF9F6; border: 1px solid #E7E5E4; border-radius: 8px; padding: 16px; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
            .details-card strong { color: #1C1917; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
            .table th, .table td { border: 1px solid #E7E5E4; padding: 12px 14px; text-align: left; }
            .table th { background: #F5F5F4; font-weight: 700; color: #44403C; }
            .total-container { display: flex; justify-content: flex-end; margin-bottom: 40px; }
            .total-box { width: 320px; background: #F5F5F4; border: 1px solid #E7E5E4; padding: 16px; border-radius: 8px; font-size: 14px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .grand-total { border-top: 2px solid #D6D3D1; padding-top: 8px; margin-top: 8px; font-weight: 800; font-size: 16px; color: #1C1917; }
            .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #A8A29E; border-top: 1px solid #E7E5E4; padding-top: 16px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">RENTORA</div>
              <div class="tagline">Decentralized Equipment Escrow Marketplace</div>
            </div>
            <div class="invoice-title">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice No:</strong> ${inv.invoiceNumber}</p>
              <p><strong>Date:</strong> ${inv.invoiceDate}</p>
            </div>
          </div>

          <div class="details-card">
            <div><strong>Order Reference:</strong> ${inv.orderId}</div>
            <div><strong>Payment Mode:</strong> ${inv.paymentMethod}</div>
            <div><strong>Vendor Partner:</strong> ${inv.vendor}</div>
            <div><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Verified & Paid</span></div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th style="text-align: right;">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${inv.product} (Base Rental Period)</td>
                <td>Gear Rental</td>
                <td style="text-align: right;">₹${(inv.total - inv.deposit).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Refundable Security Deposit (Held in Escrow)</td>
                <td>Escrow Custody</td>
                <td style="text-align: right;">₹${inv.deposit.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-container">
            <div class="total-box">
              <div class="total-row">
                <span>Rental Subtotal:</span>
                <span>₹${(inv.total - inv.deposit).toLocaleString('en-IN')}</span>
              </div>
              <div class="total-row" style="color: #059669;">
                <span>Escrow Deposit:</span>
                <span>₹${inv.deposit.toLocaleString('en-IN')}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total Amount Paid:</span>
                <span>₹${inv.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This is an authentic computer-generated digital tax invoice issued by Rentora Platform.</p>
            <p>Ahmedabad, Gujarat &bull; support@rentora.in</p>
          </div>

          ${autoPrint ? '<script>window.onload = function() { window.print(); };</script>' : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredInvoices = invoicesData.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.orderId.toLowerCase().includes(q) ||
      inv.product.toLowerCase().includes(q) ||
      inv.vendor.toLowerCase().includes(q)
    );
  });

  const totalInvoiced = invoicesData.reduce((acc, curr) => acc + curr.total, 0);

  if (loading) {
    return <div className="p-8 text-center text-[#78716C] font-bold">Loading live tax invoices...</div>;
  }

  return (
    <div className="invoices-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Invoices & Billing</h1>
          <p className="page-sub-heading">
            Official GST-compliant tax invoices, billing receipts, and itemized fee breakdown.
          </p>
        </div>

        <div className="invoice-summary-capsule">
          <span className="inv-cap-lbl">Total Billed to Date:</span>
          <span className="inv-cap-val">₹{totalInvoiced.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="invoice-search-bar">
        <div className="search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, order, equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="invoice-search-input"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="invoices-table-card">
        <div className="table-responsive">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Order Ref</th>
                <th>Rental Item & Vendor</th>
                <th>Invoice Date</th>
                <th>Payment Mode</th>
                <th>Total Billed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">
                    No tax invoices found. Place a rental order to generate invoices.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="invoice-table-row">
                    <td>
                      <span className="font-mono font-bold text-charcoal text-sm">
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-500 font-semibold">
                        {inv.orderId}
                      </span>
                    </td>
                    <td>
                      <div className="inv-product-cell">
                        <span className="inv-prod-title">{inv.product}</span>
                        <span className="inv-vendor-sub">{inv.vendor}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600 font-medium">
                        {inv.invoiceDate}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <div className="inv-amount-cell">
                        <span className="font-bold text-charcoal text-sm">
                          ₹{inv.total.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-emerald-600 font-medium">
                          (₹{inv.deposit} Deposit)
                        </span>
                      </div>
                    </td>
                    <td>
                      <RentalStatusBadge status={inv.status} size="small" />
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openInvoicePrintWindow(inv, false)}
                          className="btn-inv-action"
                          title="View Official Tax Invoice"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => openInvoicePrintWindow(inv, true)}
                          className="btn-inv-download"
                          title="Print / Save as PDF"
                        >
                          <Download size={14} />
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
    </div>
  );
}