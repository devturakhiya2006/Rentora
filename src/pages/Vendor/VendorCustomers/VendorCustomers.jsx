import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  Building,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import './VendorCustomers.css';

export default function VendorCustomers() {
  const { orders, showToast, sendMessageToCustomer } = useVendor();
  const [messageText, setMessageText] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCust, setSelectedCust] = useState(null);
  const [contactModalCust, setContactModalCust] = useState(null);

  const generateCustomersList = () => {
    const custMap = {};
    orders.forEach(o => {
      if (!o.customer || !o.customer.name) return;
      
      const id = o.customer.name; // Use name as unique ID for now
      if (!custMap[id]) {
        custMap[id] = {
          id: id.toLowerCase().replace(/\s+/g, '-'),
          rawUserId: o.customer.id,
          name: o.customer.name,
          company: o.customer.name + ' Studio',
          email: o.customer.email || 'client@example.com',
          phone: o.customer.phone || 'N/A',
          city: o.customer.address || 'Local',
          avatar: o.customer.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
          totalOrders: 0,
          totalSpendingNum: 0,
          lastOrderDate: o.startDate,
          trustScore: 98,
          status: 'Active'
        };
      }
      custMap[id].totalOrders += 1;
      custMap[id].totalSpendingNum += (o.totalAmount || 0);
      
      if (new Date(o.startDate) > new Date(custMap[id].lastOrderDate)) {
        custMap[id].lastOrderDate = o.startDate;
      }
    });

    return Object.values(custMap).map(c => ({
      ...c,
      totalSpending: `₹${c.totalSpendingNum.toLocaleString('en-IN')}`
    })).sort((a, b) => b.totalSpendingNum - a.totalSpendingNum);
  };

  const computedCustomers = generateCustomersList();

  const filteredCustomers = computedCustomers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!contactModalCust.rawUserId) {
      showToast('Cannot send message: Customer ID is missing.', 'error');
      return;
    }
    
    await sendMessageToCustomer(contactModalCust.rawUserId, messageText);
    setContactModalCust(null);
    setMessageText('');
  };

  const openMessageModal = (c) => {
    setContactModalCust(c);
    setMessageText(`Hello ${c.name}, your reserved equipment is ready.`);
  };

  return (
    <div className="vendor-customers-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Customer Directory & Client Accounts</h1>
          <p className="page-sub-heading">
            Audit recurring corporate film crews, freelance creators, and verified rental clients.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="v-filter-toolbar">
        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, company, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="v-card-box p-0 overflow-hidden">
        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Customer & Studio</th>
                <th>Contact Info</th>
                <th>Location</th>
                <th>Rental Frequency</th>
                <th>Total Spend</th>
                <th>Trust Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-6 text-slate-500">No customers found.</td></tr>
              ) : filteredCustomers.map((c) => (
                <tr key={c.id} className="v-table-row">
                  <td>
                    <div className="v-cust-cell">
                      <img src={c.avatar} alt={c.name} className="v-cust-thumb" />
                      <div>
                        <span className="font-bold text-charcoal text-xs block">{c.name}</span>
                        <span className="text-[11px] text-slate-400 font-semibold">{c.company}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs text-slate-600">
                      <div>{c.phone}</div>
                      <div className="text-[11px] text-slate-400">{c.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-charcoal font-semibold">{c.city}</span>
                  </td>
                  <td>
                    <span className="font-bold text-charcoal text-xs">{c.totalOrders} Bookings</span>
                    <span className="text-[10px] text-slate-400 block">Last: {c.lastOrderDate}</span>
                  </td>
                  <td>
                    <span className="font-extrabold text-charcoal text-xs">{c.totalSpending}</span>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {c.trustScore}/100 ★
                    </span>
                  </td>
                  <td>
                    <span className="v-status-badge status-active">{c.status}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedCust(c)}
                        className="btn-v-action-view"
                        title="View Rental History"
                      >
                        <Eye size={13} />
                        <span>History</span>
                      </button>
                      <button
                        onClick={() => openMessageModal(c)}
                        className="btn-v-action-view"
                        title="Message Customer"
                      >
                        <MessageSquare size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer History Modal */}
      {selectedCust && (
        <div className="v-modal-backdrop" onClick={() => setSelectedCust(null)}>
          <div className="v-modal-card max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <div>
                <span className="font-mono text-xs font-bold text-primary-red">{selectedCust.id}</span>
                <h3 className="font-bold text-charcoal text-base">Client Rental Ledger & History</h3>
              </div>
              <button onClick={() => setSelectedCust(null)} className="v-modal-close">✕</button>
            </div>

            <div className="v-modal-body space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img src={selectedCust.avatar} alt={selectedCust.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
                <div>
                  <h4 className="font-bold text-charcoal text-sm">{selectedCust.name}</h4>
                  <p className="text-xs text-slate-500">{selectedCust.company} &bull; {selectedCust.city}</p>
                  <p className="text-xs font-semibold text-emerald-600 mt-0.5">Trust Rating: {selectedCust.trustScore}/100</p>
                </div>
              </div>

              <h4 className="font-bold text-charcoal text-xs uppercase tracking-wider">Lifetime Rental Record:</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block">Total Orders</span>
                  <span className="font-bold text-charcoal text-sm">{selectedCust.totalOrders} Bookings</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block">Gross Spend</span>
                  <span className="font-bold text-primary-red text-sm">{selectedCust.totalSpending}</span>
                </div>
              </div>
            </div>

            <div className="v-modal-footer">
              <button onClick={() => setSelectedCust(null)} className="btn-v-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {contactModalCust && (
        <div className="v-modal-backdrop" onClick={() => setContactModalCust(null)}>
          <div className="v-modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <h3 className="font-bold text-charcoal text-base">Message {contactModalCust.name}</h3>
              <button onClick={() => setContactModalCust(null)} className="v-modal-close">✕</button>
            </div>

            <form onSubmit={handleSendMessage} className="v-modal-body">
              <div className="v-form-field">
                <label className="v-form-lbl">Message Body</label>
                <textarea
                  rows={3}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="v-form-textarea"
                  required
                />
              </div>

              <div className="v-modal-footer p-0 pt-3 border-t">
                <button type="submit" className="btn-v-primary w-full justify-center">
                  Send Direct Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
