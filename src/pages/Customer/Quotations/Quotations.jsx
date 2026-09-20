import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 🚀 Added useNavigate
import {
  FileCheck2,
  Calendar,
  Clock,
  Check,
  X,
  CreditCard,
  Eye,
  Building,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useBooking } from '../../../context/BookingContext';
import { useAuth } from '../../../context/AuthContext'; // 🚀 Added useBooking
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import './Quotations.css';

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState(null);

  const navigate = useNavigate();
  const { updateBookingDraft } = useBooking();
  const { user } = useAuth();

  useEffect(() => {
    fetchLiveQuotations();
  }, []);

  const fetchLiveQuotations = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedQuotations = data.map((q) => {
        let discountAmt = 0;
        let productDetails = q.product_details || '';
        let parsedNotes = 'Includes vendor verified inspection & escrow protection.';
        
        if (productDetails.includes('| NOTE:')) {
          const parts = productDetails.split('| NOTE:');
          productDetails = parts[0].trim();
          parsedNotes = parts[1].trim();
        } else if (q.notes) {
          parsedNotes = q.notes;
        }

        if (parsedNotes.includes('[DISCOUNT:₹')) {
          const match = parsedNotes.match(/\[DISCOUNT:₹(\d+)\]/);
          if (match) {
            discountAmt = parseInt(match[1]);
            parsedNotes = parsedNotes.replace(match[0], '').trim();
          }
        }

        return {
          id: q.id,
          quotationNumber: q.quotation_number,
          validUntil: q.valid_until,
          status: q.status,
          product: productDetails,
          image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80', // Fallback
          vendor: 'Rentora Verified Hub',
          dates: `Flexible`,
          duration: `TBD`,
          notes: parsedNotes,
          subtotal: q.total_amount + discountAmt,
          deposit: 0,
          discount: discountAmt,
          totalAmount: q.total_amount,
          rawQuotation: q
        };
      });

      setQuotations(mappedQuotations);
    } catch (err) {
      console.error("Failed to fetch quotations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (quotId) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotId ? { ...q, status: 'Accepted' } : q))
    );
    setActionNotice({
      type: 'success',
      msg: 'Quotation accepted! You can now proceed to rental booking & contract execution.'
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDecline = (quotId) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotId ? { ...q, status: 'Declined' } : q))
    );
    setActionNotice({
      type: 'info',
      msg: 'Quotation declined. The vendor has been notified.'
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // 🚀 Handle Proceeds to Booking: Populates state and goes straight to checkout
  const handleProceedToBooking = async (quot) => {
    try {
      // 1. Extract base title to find the actual product ID
      let baseTitle = quot.product.split(' (Qty')[0];
      baseTitle = baseTitle.split(' (')[0].trim();
      
      const { data: realProd } = await supabase
        .from('products')
        .select('id, images')
        .ilike('title', `${baseTitle}%`)
        .limit(1)
        .single();
        
      if (!realProd) {
        alert("Sorry, we could not link this quote to the original product in the database.");
        return;
      }

      updateBookingDraft({
        product: {
          id: realProd.id,
          title: baseTitle,
          images: realProd.images || [quot.image],
          pricePerDay: quot.subtotal,
          deposit: quot.deposit,
          vendor: { name: quot.vendor }
        },
        durationMode: 'day',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
        durationCount: 1,
        quantity: 1,
        deliveryType: 'doorstep',
        finalTotal: quot.totalAmount,
        discount: quot.discount
      });

      navigate('/booking');
    } catch(err) {
      console.error("Booking error:", err);
      alert("Failed to proceed to booking. Check console.");
    }
  };

  // 🖨️ Printable Quotation Window
  const openQuotationPrintWindow = (quot) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quotation - ${quot.quotationNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1c1917; background: #fff; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4A5D23; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #4A5D23; }
            .title h2 { margin: 0; color: #292524; }
            .grid { background: #f5f5f4; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; }
            .total-box { background: #fafaf9; border: 1px solid #e7e5e4; padding: 15px; border-radius: 8px; width: 300px; margin-left: auto; font-size: 14px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .grand { font-weight: bold; border-top: 1px solid #d6d3d1; padding-top: 6px; margin-top: 6px; font-size: 16px; color: #4A5D23; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">RENTORA PLATFORM</div>
              <p style="font-size: 12px; color: #78716c;">Custom Commercial Rental Quotation</p>
            </div>
            <div class="title">
              <h2>${quot.quotationNumber}</h2>
              <p style="font-size: 12px; color: #78716c;">Valid Until: ${quot.validUntil}</p>
            </div>
          </div>

          <div class="grid">
            <div><strong>Equipment:</strong> ${quot.product}</div>
            <div><strong>Vendor Partner:</strong> ${quot.vendor}</div>
            <div><strong>Rental Dates:</strong> ${quot.dates}</div>
            <div><strong>Status:</strong> ${quot.status}</div>
          </div>

          <p><strong>Vendor Note:</strong> ${quot.notes}</p>

          <div class="total-box">
            <div class="row"><span>Rental Subtotal:</span><span>₹${quot.subtotal}</span></div>
            <div class="row"><span>Security Deposit:</span><span>₹${quot.deposit}</span></div>
            <div class="row"><span>Negotiation Discount:</span><span>-₹${quot.discount}</span></div>
            <div class="row grand"><span>Total Estimate:</span><span>₹${quot.totalAmount}</span></div>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return <div className="p-8 text-center text-[#78716C] font-bold">Loading live quotations...</div>;
  }

  return (
    <div className="quotations-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Quotations & Inquiries</h1>
          <p className="page-sub-heading">
            Review custom commercial rental estimates, vendor negotiated rates, and project quotes.
          </p>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className={`action-notice-box ${actionNotice.type === 'success' ? 'notice-success' : 'notice-info'}`}>
          <Sparkles size={18} />
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* Quotations List */}
      <div className="quotations-grid">
        {quotations.length === 0 ? (
          <div className="text-center py-12 text-slate-400 col-span-2">
            No quotations found.
          </div>
        ) : (
          quotations.map((quot) => (
            <div key={quot.id} className="quotation-card">
              <div className="quotation-card-header">
                <div className="quot-ref-block">
                  <span className="quot-ref">{quot.quotationNumber}</span>
                  <span className="quot-valid-badge">
                    <Clock size={12} />
                    <span>Valid until {quot.validUntil}</span>
                  </span>
                </div>
                <RentalStatusBadge status={quot.status} />
              </div>

              <div className="quotation-card-body">
                <div className="quot-item-row">
                  <img src={quot.image} alt={quot.product} className="quot-img" />
                  <div className="quot-meta">
                    <h3 className="quot-title">{quot.product}</h3>
                    <div className="quot-vendor">
                      <Building size={14} className="text-slate-400" />
                      <span>{quot.vendor}</span>
                    </div>
                    <div className="quot-dates">
                      <Calendar size={14} className="text-primary-red" />
                      <span>{quot.dates} ({quot.duration})</span>
                    </div>
                  </div>
                </div>

                {quot.notes && (
                  <div className="quot-notes-box">
                    <span className="font-semibold text-charcoal">Special Vendor Note:</span> {quot.notes}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="quot-pricing-box">
                  <div className="quot-price-row">
                    <span>Custom Rental Rate</span>
                    <span>₹{quot.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="quot-price-row">
                    <span>Security Escrow Deposit</span>
                    <span className="text-emerald-600 font-semibold">₹{quot.deposit.toLocaleString('en-IN')}</span>
                  </div>
                  {quot.discount > 0 && (
                    <div className="quot-price-row text-emerald-600">
                      <span>Vendor Negotiation Discount</span>
                      <span>-₹{quot.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="quot-price-row quot-total-row">
                    <span>Estimated Total</span>
                    <span className="text-primary-red font-extrabold text-lg">
                      ₹{quot.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="quotation-card-footer">
                <button
                  onClick={() => openQuotationPrintWindow(quot)}
                  className="btn-view-doc"
                >
                  <Eye size={15} />
                  <span>View & Print Quotation</span>
                </button>

                {quot.status === 'Pending Acceptance' && (
                  <div className="quot-actions-row">
                    <button
                      onClick={() => handleDecline(quot.id)}
                      className="btn-decline"
                    >
                      <X size={15} />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => handleAccept(quot.id)}
                      className="btn-accept"
                    >
                      <Check size={15} />
                      <span>Accept Quotation</span>
                    </button>
                  </div>
                )}

                {quot.status === 'Accepted' && (
                  <button
                    onClick={() => handleProceedToBooking(quot)}
                    className="btn-proceed-pay"
                  >
                    <CreditCard size={15} />
                    <span>Proceed to Booking</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}