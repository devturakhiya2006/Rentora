import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Boxes,
  ClipboardList,
  Wallet,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Plus,
  Compass,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import './VendorOverview.css';

export default function VendorOverview() {
  const { products, orders, vendorProfile } = useVendor();
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Compute live stats
  const activeProducts = products.filter((p) => p.status === 'Active').length;
  const lowStockProducts = products.filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock').length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing').length;

  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'All' && o.orderStatus !== orderFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.product.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Dynamic calculations
  const totalRevenueNum = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingPaymentsNum = orders.reduce((sum, order) => sum + (order.securityDeposit || 0), 0);
  
  const generateMonthlyRevenue = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString('en-US', { month: 'short' }),
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        revenue: 0,
        orders: 0
      });
    }

    orders.forEach(order => {
      const orderDate = new Date(order.startDate);
      const match = months.find(m => m.monthIndex === orderDate.getMonth() && m.year === orderDate.getFullYear());
      if (match) {
        match.revenue += (order.totalAmount || 0);
        match.orders += 1;
      }
    });
    return months;
  };
  const monthlyRevenue = generateMonthlyRevenue();
  const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.revenue), 100);

  const generateCategoryShare = () => {
    const categoryTotals = {};
    orders.forEach(o => {
      const cat = o.product?.category || 'General';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (o.totalAmount || 0);
    });
    if (totalRevenueNum === 0) return [];
    return Object.entries(categoryTotals).map(([cat, amount]) => ({
      category: cat,
      amount: `₹${amount.toLocaleString('en-IN')}`,
      share: Math.round((amount / totalRevenueNum) * 100)
    })).sort((a, b) => b.share - a.share);
  };
  const categoryShare = generateCategoryShare();

  return (
    <div className="vendor-overview-page">
      {/* Welcome Top Banner */}
      <div className="vendor-welcome-banner">
        <div className="v-welcome-left">
          <div className="v-verified-badge">
            <Sparkles size={14} className="text-amber-300" />
            <span>{vendorProfile.verifiedBadge} &bull; Store Rating {vendorProfile.rating} ★</span>
          </div>
          <h1 className="v-welcome-heading">Welcome, {vendorProfile.vendorName}! 👋</h1>
          <p className="v-welcome-sub">
            Here is your live rental operations pulse for <strong>{vendorProfile.businessName}</strong>.
          </p>

          <div className="v-welcome-actions">
            <Link to="/vendor/products/add" className="btn-v-primary">
              <Plus size={16} />
              <span>Add New Equipment</span>
            </Link>
            <Link to="/vendor/orders" className="btn-v-secondary">
              <ClipboardList size={16} />
              <span>Manage Active Orders</span>
            </Link>
            <Link to="/vendor/quotations/create" className="btn-v-secondary">
              <Plus size={16} />
              <span>Create Quotation</span>
            </Link>
          </div>
        </div>

        <div className="v-welcome-right">
          <div className="v-earnings-capsule">
            <span className="v-earn-label">Net Lifetime Earnings</span>
            <span className="v-earn-value">₹{totalRevenueNum.toLocaleString('en-IN')}</span>
            <span className="v-earn-trend text-emerald-300">
              <TrendingUp size={13} className="inline mr-1" />
              Live Tracked
            </span>
          </div>
        </div>
      </div>

      {/* 6 Summary Stat Cards */}
      <div className="vendor-stats-grid">
        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Total Products</span>
            <div className="v-stat-icon bg-slate-100">
              <Package size={20} className="text-slate-700" />
            </div>
          </div>
          <div className="v-stat-val">{products.length}</div>
          <div className="v-stat-footer">
            <span className="text-slate-500 font-medium">{activeProducts} live on catalog</span>
            <Link to="/vendor/products" className="v-stat-link">View &rarr;</Link>
          </div>
        </div>

        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Active Products</span>
            <div className="v-stat-icon bg-emerald-light">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
          </div>
          <div className="v-stat-val text-emerald-600">{activeProducts}</div>
          <div className="v-stat-footer">
            <span className="text-emerald-600 font-semibold">92% catalog availability</span>
            <Link to="/vendor/products" className="v-stat-link">Catalog &rarr;</Link>
          </div>
        </div>

        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Pending Orders</span>
            <div className="v-stat-icon bg-blue-light">
              <ClipboardList size={20} className="text-charcoal-light" />
            </div>
          </div>
          <div className="v-stat-val text-charcoal-light">{pendingOrders}</div>
          <div className="v-stat-footer">
            <span className="text-amber-600 font-semibold">Require staging & dispatch</span>
            <Link to="/vendor/orders" className="v-stat-link">Fulfill &rarr;</Link>
          </div>
        </div>

        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Total Revenue</span>
            <div className="v-stat-icon bg-rose-50">
              <Wallet size={20} className="text-rose-600" />
            </div>
          </div>
          <div className="v-stat-val text-primary-red">₹{totalRevenueNum.toLocaleString('en-IN')}</div>
          <div className="v-stat-footer">
            <span className="text-emerald-600 font-semibold">+18.4% YoY Growth</span>
            <Link to="/vendor/reports" className="v-stat-link">Analytics &rarr;</Link>
          </div>
        </div>

        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Low Stock Alert</span>
            <div className="v-stat-icon bg-amber-light">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
          </div>
          <div className="v-stat-val text-amber-600">{lowStockProducts}</div>
          <div className="v-stat-footer">
            <span className="text-amber-700 font-medium">Re-stock or adjust units</span>
            <Link to="/vendor/inventory" className="v-stat-link">Stock &rarr;</Link>
          </div>
        </div>

        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Pending Escrow Payout</span>
            <div className="v-stat-icon bg-slate-100">
              <CreditCard size={20} className="text-slate-700" />
            </div>
          </div>
          <div className="v-stat-val text-charcoal">₹{pendingPaymentsNum.toLocaleString('en-IN')}</div>
          <div className="v-stat-footer">
            <span className="text-slate-500 font-medium">Settles after return check</span>
            <Link to="/vendor/payments" className="v-stat-link">Ledger &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Analytics & Performance Charts Grid */}
      <div className="v-charts-grid">
        {/* Left Chart: Revenue Overview */}
        <div className="v-card-box v-chart-card">
          <div className="v-card-hdr">
            <div>
              <h3 className="v-card-title">Monthly Rental Revenue Trajectory</h3>
              <p className="v-card-sub">Gross earnings from completed equipment reservations</p>
            </div>
            <div className="v-chart-badge">FY 2026-27</div>
          </div>

          <div className="v-bar-chart-container">
            {monthlyRevenue.map((d) => {
              const heightPct = Math.round((d.revenue / maxRevenue) * 100);
              const isCurrent = d.month === new Date().toLocaleString('en-US', { month: 'short' });
              return (
                <div key={d.month} className="v-bar-col">
                  <div className="v-bar-tooltip">
                    ₹{d.revenue.toLocaleString('en-IN')} ({d.orders} orders)
                  </div>
                  <div className="v-bar-track">
                    <div
                      className={`v-bar-fill ${isCurrent ? 'v-bar-current' : ''}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className={`v-bar-month ${isCurrent ? 'v-month-bold' : ''}`}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Chart: Category Distribution */}
        <div className="v-card-box v-chart-side-card">
          <div className="v-card-hdr">
            <div>
              <h3 className="v-card-title">Revenue by Equipment Category</h3>
              <p className="v-card-sub">Performance share across inventory classes</p>
            </div>
          </div>

          <div className="v-cat-breakdown-list">
            {categoryShare.length === 0 ? (
              <div className="text-center text-sm text-slate-500 py-4">No data available</div>
            ) : categoryShare.map((cat, idx) => (
              <div key={idx} className="v-cat-item">
                <div className="v-cat-top-row">
                  <span className="v-cat-name font-semibold text-charcoal text-sm">{cat.category}</span>
                  <span className="v-cat-val font-bold text-sm text-primary-red">{cat.amount}</span>
                </div>
                <div className="v-cat-bar-bg">
                  <div
                    className="v-cat-bar-fill"
                    style={{
                      width: `${cat.share}%`,
                      backgroundColor: idx === 0 ? '#4A5D23' : idx === 1 ? '#78716C' : idx === 2 ? '#2A2626' : '#E7E5E4'
                    }}
                  />
                </div>
                <div className="v-cat-sub-share">{cat.share}% of total rental volume</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="v-card-box">
        <div className="v-card-hdr flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="v-card-title">Recent Rental Orders & Bookings</h3>
            <p className="v-card-sub">Monitor upcoming customer dispatches and returns</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Pills */}
            <div className="v-status-filter-pills">
              {['All', 'Active', 'Confirmed', 'Processing', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`v-filter-pill-btn ${orderFilter === st ? 'v-pill-active' : ''}`}
                >
                  {st}
                </button>
              ))}
            </div>

            <Link to="/vendor/orders" className="btn-v-view-all">
              <span>View All ({orders.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Equipment</th>
                <th>Rental Dates</th>
                <th>Total Billed</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-slate-500 text-sm">No orders match criteria.</td></tr>
              ) : filteredOrders.slice(0, 5).map((o) => (
                <tr key={o.id} className="v-table-row">
                  <td>
                    <span className="font-mono font-bold text-charcoal text-xs bg-slate-100 px-2 py-1 rounded">
                      {o.orderId}
                    </span>
                  </td>
                  <td>
                    <div className="v-cust-cell">
                      <img src={o.customer.avatar} alt={o.customer.name} className="v-cust-thumb" />
                      <div>
                        <div className="v-cust-name font-semibold text-charcoal text-xs">{o.customer.name}</div>
                        <div className="text-[11px] text-slate-400">{o.customer.city}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="v-prod-cell">
                      <img src={o.product.image} alt={o.product.name} className="v-prod-thumb" />
                      <div>
                        <div className="v-prod-name text-xs font-semibold text-charcoal">{o.product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {o.product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600 font-medium">
                      {o.startDate} &rarr; {o.endDate}
                    </span>
                    <div className="text-[10px] text-slate-400">{o.durationDays} Days Duration</div>
                  </td>
                  <td>
                    <div className="font-bold text-charcoal text-xs">
                      ₹{o.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-emerald-600">
                      (₹{o.securityDeposit} Escrow)
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
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="btn-v-action-view"
                      title="View Order Details"
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Quick View Modal */}
      {selectedOrder && (
        <div className="v-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="v-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <div>
                <span className="font-mono text-xs font-bold text-primary-red">{selectedOrder.orderId}</span>
                <h3 className="text-base font-bold text-charcoal mt-0.5">Order Overview & Dispatch</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="v-modal-close">✕</button>
            </div>

            <div className="v-modal-body">
              <div className="v-modal-prod-strip">
                <img src={selectedOrder.product.image} alt={selectedOrder.product.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h4 className="font-bold text-charcoal text-sm">{selectedOrder.product.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">SKU: {selectedOrder.product.sku}</p>
                  <p className="text-xs font-semibold text-charcoal-light mt-1">{selectedOrder.rentalPeriod}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Customer Name:</span>
                  <span className="font-bold text-charcoal">{selectedOrder.customer.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Phone:</span>
                  <span className="font-bold text-charcoal">{selectedOrder.customer.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Handover Mode & Address:</span>
                  <span className="font-semibold text-charcoal">{selectedOrder.handoverType} &bull; {selectedOrder.customer.address}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <strong>Special Instructions:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>

            <div className="v-modal-footer">
              <Link
                to={`/vendor/orders`}
                onClick={() => setSelectedOrder(null)}
                className="btn-v-primary"
              >
                Go to Full Orders Management &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
