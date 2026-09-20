import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Send,
  Building,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import './VendorQuotations.css';

export default function VendorQuotations() {
  const { products, showToast } = useVendor();
  const { user } = useAuth();
  const [quotationsList, setQuotationsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [formData, setFormData] = useState({
    customerName: 'SkyLine Media Productions',
    contactPerson: 'Karan Sharma',
    email: 'karan@skylinemedia.com',
    phone: '+91 98251 99220',
    selectedProductId: products[0]?.id || '',
    durationDays: 7,
    unitPrice: products[0]?.daily_rate || products[0]?.pricePerDay || 1899,
    discount: 1000,
    deposit: products[0]?.deposit || 5000,
    notes: 'Includes on-set technical standby and spare battery set.',
    validUntil: '25 Sep 2026'
  });

  useEffect(() => {
    if (user) {
      fetchLiveQuotations();
    }
  }, [user]);

  const fetchLiveQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedData = data.map(q => {
        if (q.product_details && q.product_details.includes('| NOTE:')) {
          const parts = q.product_details.split('| NOTE:');
          return { ...q, product_details: parts[0].trim(), notes: parts[1].trim() };
        }
        return q;
      });
      
      setQuotationsList(formattedData);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuotationStatusLive = async (quote, newStatus) => {
    try {
      let localNotes = quote.notes;
      let updatePayload = { status: newStatus };
      
      if (newStatus === 'Declined') {
        const reason = window.prompt("Please provide a reason for declining this quotation:");
        if (reason === null) return; // User cancelled
        localNotes = reason || "Vendor declined without providing a reason.";
      }
      
      if (newStatus === 'Accepted') {
        const discountStr = window.prompt("Offer a negotiation discount (₹) for this customer? (Enter 0 for no discount):", "0");
        if (discountStr === null) return; // User cancelled
        
        const discountAmt = parseInt(discountStr) || 0;
        if (discountAmt > 0) {
          localNotes = `[DISCOUNT:₹${discountAmt}] ` + (localNotes || 'Discount applied by vendor.');
          updatePayload.total_amount = Math.max(0, quote.total_amount - discountAmt);
        }
      }
      
      if (localNotes) {
        updatePayload.product_details = `${quote.product_details} | NOTE: ${localNotes}`;
      }

      const { error } = await supabase
        .from('quotations')
        .update(updatePayload)
        .eq('id', quote.id);

      if (error) throw error;
      
      // Send notification to customer
      const targetUserId = quote.user_id || quote.customer_id;
      if (targetUserId) {
         await supabase.from('notifications').insert([{
           user_id: targetUserId,
           title: `Quotation ${newStatus}`,
           message: `Your quotation ${quote.quotation_number} was ${newStatus.toLowerCase()} by the vendor. ${newStatus === 'Declined' ? `Reason: ${localNotes}` : 'You can now proceed to checkout or finalize details.'}`,
           type: 'system',
           read: false
         }]);
      }

      setQuotationsList((prev) => 
        prev.map(q => q.id === quote.id ? { ...q, ...updatePayload, notes: localNotes } : q)
      );
      showToast(`Quotation marked as ${newStatus}`, 'success');
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Failed to update status', 'error');
    }
  };

  const filteredQuotes = quotationsList.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const qNum = q.quotation_number || '';
    const custName = q.customer_name || '';
    const prodName = q.product_details || '';
    return (
      qNum.toLowerCase().includes(query) ||
      custName.toLowerCase().includes(query) ||
      prodName.toLowerCase().includes(query)
    );
  });

  const handleProductChange = (e) => {
    const prodId = e.target.value;
    const prod = products.find((p) => p.id === prodId);
    setFormData((prev) => ({
      ...prev,
      selectedProductId: prodId,
      unitPrice: prod ? (prod.daily_rate || prod.pricePerDay || 1000) : 1000,
      deposit: prod ? (prod.deposit || 3000) : 3000
    }));
  };

  const handleCreateQuotation = (e, isDraft = false) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === formData.selectedProductId) || products[0];

    const subtotal = Number(formData.unitPrice) * Number(formData.durationDays);
    const totalAmount = subtotal - Number(formData.discount) + Number(formData.deposit);

    const newQuo = {
      customer: {
        name: formData.customerName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone
      },
      product: `${prod?.title || prod?.name || 'Equipment'} (${formData.durationDays}-Day Package)`,
      quantity: 1,
      unitPrice: Number(formData.unitPrice),
      durationDays: Number(formData.durationDays),
      subtotal,
      discount: Number(formData.discount),
      tax: 0,
      securityDeposit: Number(formData.deposit),
      totalAmount,
      validUntil: formData.validUntil,
      notes: formData.notes,
      status: isDraft ? 'Draft' : 'Sent'
    };

    addQuotation(newQuo);
    setCreateModalOpen(false);
  };

  return (
    <div className="vendor-quotations-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Commercial Quotations & Estimates</h1>
          <p className="page-sub-heading">
            Issue custom commercial rental quotes, multi-week project packages, and production estimates.
          </p>
        </div>

        <button onClick={() => setCreateModalOpen(true)} className="btn-v-primary">
          <Plus size={16} />
          <span>Create New Quotation</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="v-filter-toolbar">
        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search quote number, client, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>
      </div>

      {/* Quotations Grid */}
      <div className="v-quotes-grid">
        {loading ? (
          <div className="p-8 text-center text-slate-500 w-full col-span-2">Loading quotations...</div>
        ) : filteredQuotes.map((q) => (
          <div key={q.id || q.quotation_number} className="v-quote-card">
            <div className="v-quote-card-hdr">
              <div>
                <span className="font-mono text-xs font-bold text-charcoal">{q.quotation_number}</span>
                <div className="text-[11px] text-slate-400">Created: {new Date(q.created_at).toLocaleDateString()}</div>
              </div>
              <span
                className={`v-status-badge ${q.status === 'Accepted'
                  ? 'status-active'
                  : q.status === 'Pending Acceptance'
                    ? 'status-confirmed'
                    : 'status-completed'
                  }`}
              >
                {q.status}
              </span>
            </div>

            <div className="v-quote-card-body">
              <h3 className="font-bold text-charcoal text-sm mb-1">{q.product_details}</h3>

              <div className="text-xs text-slate-600 space-y-1 my-2">
                <div className="flex items-center gap-1.5">
                  <Building size={13} className="text-slate-400" />
                  <span><strong>{q.customer_name}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary-red" />
                  <span>Valid until: <strong>{q.valid_until}</strong></span>
                </div>
              </div>

              {q.notes && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 mt-2">
                  {q.notes}
                </div>
              )}

              <div className="v-quote-price-strip mt-3">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal: ₹{(q.total_amount || 0).toLocaleString('en-IN')}</span>
                  <span>Deposit: ₹0</span>
                </div>
                <div className="flex justify-between items-baseline mt-1 pt-1 border-t border-slate-100">
                  <span className="text-xs font-bold text-charcoal">Total Value:</span>
                  <span className="text-base font-extrabold text-primary-red">₹{(q.total_amount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="v-quote-card-footer gap-2">
              <button
                onClick={() => setSelectedDoc({ type: 'quotation', id: q.quotation_number })}
                className="btn-v-secondary text-xs flex-1 justify-center"
              >
                <Eye size={13} />
                <span>View</span>
              </button>
              {q.status === 'Pending Acceptance' && (
                <>
                  <button
                    onClick={() => updateQuotationStatusLive(q, 'Accepted')}
                    className="btn-v-primary text-xs flex-1 justify-center bg-emerald-600 hover:bg-emerald-700"
                  >
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => updateQuotationStatusLive(q, 'Declined')}
                    className="btn-v-secondary text-xs flex-1 justify-center text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <span>Decline</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Quotation Modal */}
      {createModalOpen && (
        <div className="v-modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <div className="v-modal-card max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <h3 className="font-bold text-charcoal text-base">Generate Custom Rental Quotation</h3>
              <button onClick={() => setCreateModalOpen(false)} className="v-modal-close">✕</button>
            </div>

            <form onSubmit={(e) => handleCreateQuotation(e, false)} className="v-modal-body">
              <div className="grid grid-cols-2 gap-3">
                <div className="v-form-field">
                  <label className="v-form-lbl">Client / Production Studio *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                    className="v-form-input"
                  />
                </div>
                <div className="v-form-field">
                  <label className="v-form-lbl">Contact Person *</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                    className="v-form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="v-form-field">
                  <label className="v-form-lbl">Client Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="v-form-input"
                  />
                </div>
                <div className="v-form-field">
                  <label className="v-form-lbl">Client Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="v-form-input"
                  />
                </div>
              </div>

              <div className="v-form-field mt-3">
                <label className="v-form-lbl">Select Primary Equipment Kit *</label>
                <select
                  value={formData.selectedProductId}
                  onChange={handleProductChange}
                  className="v-form-select"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title || p.name} (Base: ₹{p.daily_rate || p.pricePerDay}/day)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="v-form-field">
                  <label className="v-form-lbl">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    className="v-form-input font-bold"
                  />
                </div>
                <div className="v-form-field">
                  <label className="v-form-lbl">Daily Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="v-form-input font-bold"
                  />
                </div>
                <div className="v-form-field">
                  <label className="v-form-lbl">Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="v-form-input"
                  />
                </div>
              </div>

              <div className="v-form-field mt-3">
                <label className="v-form-lbl">Special Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="v-form-textarea"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between mt-3">
                <div>
                  <span className="text-xs text-slate-500">Estimated Total Quote Value:</span>
                  <div className="text-lg font-extrabold text-charcoal">
                    ₹{(formData.unitPrice * formData.durationDays - formData.discount + Number(formData.deposit)).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="v-modal-footer p-0 pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={(e) => handleCreateQuotation(e, true)}
                  className="btn-v-secondary"
                >
                  Save as Draft
                </button>
                <button type="submit" className="btn-v-primary">
                  <Send size={15} />
                  <span>Send Quotation to Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDoc && (
        <DocumentModal
          type={selectedDoc.type}
          docId={selectedDoc.id}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}