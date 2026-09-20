import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Copy,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import './VendorProducts.css';

export default function VendorProducts() {
  const { products, deleteProduct, updateProductStatus, addProduct } = useVendor();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const categories = ['All', ...new Set((products || []).map((p) => p.category || 'General'))];
  const statuses = ['All', 'Active', 'Low Stock', 'Out of Stock'];

  // Helper for safe image extraction
  const getImageUrl = (p) => {
    if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
    if (typeof p.images === 'string') return p.images;
    if (p.image) return p.image;
    return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80';
  };

  // Filtering
  const filteredProducts = (products || []).filter((p) => {
    const pCategory = p.category || 'General';
    const pStatus = p.status || 'Active';
    const pName = (p.title || p.name || '').toLowerCase();
    const pSku = (p.sku || '').toLowerCase();
    const pBrand = (p.brand || '').toLowerCase();

    if (selectedCategory !== 'All' && pCategory !== selectedCategory) return false;
    if (selectedStatus !== 'All' && pStatus !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return pName.includes(q) || pSku.includes(q) || pBrand.includes(q);
    }
    return true;
  });

  // Bulk actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedIds.length} selected equipment listings?`)) {
      selectedIds.forEach((id) => deleteProduct(id));
      setSelectedIds([]);
    }
  };

  const handleBulkStatus = (status) => {
    selectedIds.forEach((id) => updateProductStatus(id, status));
    setSelectedIds([]);
  };

  const handleDuplicate = (p) => {
    const dup = {
      ...p,
      title: `${p.title || p.name || 'Product'} (Copy)`,
      name: `${p.title || p.name || 'Product'} (Copy)`,
      sku: `${p.sku || 'SKU'}-CPY`
    };
    addProduct(dup);
  };

  return (
    <div className="vendor-products-page">
      {/* Top Header Row */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Equipment & Product Listings</h1>
          <p className="page-sub-heading">
            Manage your rental catalog, set real-time stock availability, and update daily rates.
          </p>
        </div>

        <Link to="/vendor/products/add" className="btn-v-primary">
          <Plus size={16} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter & View Control Bar */}
      <div className="v-filter-toolbar">
        {/* Search */}
        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by gear name, SKU, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="v-filter-dropdowns">
          <div className="v-select-wrap">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="v-select-elem"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div className="v-select-wrap">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="v-select-elem"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>

          {/* Grid / Table Toggle */}
          <div className="v-view-toggle-btns">
            <button
              onClick={() => setViewMode('table')}
              className={`v-toggle-icon-btn ${viewMode === 'table' ? 'v-toggle-active' : ''}`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`v-toggle-icon-btn ${viewMode === 'grid' ? 'v-toggle-active' : ''}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar if Selected */}
      {selectedIds.length > 0 && (
        <div className="v-bulk-action-bar">
          <span className="font-bold text-xs text-charcoal">
            {selectedIds.length} items selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus('Active')}
              className="btn-bulk-sub btn-bulk-active"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBulkStatus('Out of Stock')}
              className="btn-bulk-sub"
            >
              Mark Out of Stock
            </button>
            <button
              onClick={handleBulkDelete}
              className="btn-bulk-sub btn-bulk-danger"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table View Mode */}
      {viewMode === 'table' ? (
        <div className="v-products-table-card">
          <div className="v-table-responsive">
            <table className="v-products-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        filteredProducts.length > 0 &&
                        selectedIds.length === filteredProducts.length
                      }
                    />
                  </th>
                  <th>Equipment & SKU</th>
                  <th>Category & Brand</th>
                  <th>Daily Rate</th>
                  <th>Stock Levels</th>
                  <th>Status</th>
                  <th>Total Rentals</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">
                      No equipment records matched your filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isSelected = selectedIds.includes(p.id);
                    const prodName = p.title || p.name || 'Unnamed Equipment';
                    const prodSku = p.sku || `SKU-${p.id?.slice(0, 6) || '001'}`;
                    const prodCategory = p.category || 'General';
                    const prodBrand = p.brand || (typeof p.vendor === 'object' ? p.vendor?.name : 'Rentora Hub');
                    const dailyRate = p.daily_rate || p.pricePerDay || p.price || 500;
                    const stockTotal = p.stock || 1;
                    const availableStock = p.availableStock ?? stockTotal;
                    const reservedStock = p.reservedStock || 0;
                    const status = p.status || 'Active';
                    const totalRentals = p.totalRentals || 0;
                    const revenue = p.revenueGenerated || 0;

                    return (
                      <tr
                        key={p.id}
                        className={`v-prod-row ${isSelected ? 'row-selected' : ''}`}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(p.id)}
                          />
                        </td>
                        <td>
                          <div className="v-gear-flex">
                            <img src={getImageUrl(p)} alt={prodName} className="v-gear-img" />
                            <div>
                              <h4 className="v-gear-name">{prodName}</h4>
                              <span className="v-gear-sku">{prodSku}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="v-cat-meta">
                            <span className="font-semibold text-xs text-charcoal">{prodCategory}</span>
                            <span className="text-[11px] text-slate-400">{prodBrand}</span>
                          </div>
                        </td>
                        <td>
                          <div className="v-price-meta">
                            <span className="font-bold text-charcoal text-sm">₹{dailyRate.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-slate-400">/ day</span>
                            {p.discountPrice && (
                              <span className="text-[10px] text-emerald-600 font-semibold block">
                                (Offer: ₹{p.discountPrice})
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="v-stock-meta">
                            <span className="font-bold text-xs text-charcoal">{availableStock} / {stockTotal} units</span>
                            <span className="text-[10px] text-slate-400 block">{reservedStock} on rental</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`v-status-badge ${status === 'Active'
                              ? 'status-active'
                              : status === 'Low Stock'
                                ? 'status-processing'
                                : 'status-out'
                              }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td>
                          <span className="font-semibold text-xs text-charcoal">{totalRentals} bookings</span>
                          <span className="text-[10px] text-emerald-600 block">₹{revenue.toLocaleString('en-IN')}</span>
                        </td>
                        <td>
                          <div className="v-row-actions">
                            <Link
                              to={`/vendor/products/${p.id}/edit`}
                              className="v-action-btn"
                              title="Edit Listing"
                            >
                              <Edit2 size={14} />
                            </Link>
                            <button
                              onClick={() => handleDuplicate(p)}
                              className="v-action-btn"
                              title="Duplicate Listing"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="v-action-btn v-btn-del"
                              title="Delete Listing"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View Mode */
        <div className="v-products-grid">
          {filteredProducts.map((p) => {
            const prodName = p.title || p.name || 'Unnamed Equipment';
            const prodSku = p.sku || `SKU-${p.id?.slice(0, 6) || '001'}`;
            const prodCategory = p.category || 'General';
            const dailyRate = p.daily_rate || p.pricePerDay || p.price || 500;
            const stockTotal = p.stock || 1;
            const availableStock = p.availableStock ?? stockTotal;
            const securityDeposit = p.deposit || p.securityDeposit || 2000;
            const status = p.status || 'Active';

            return (
              <div key={p.id} className="v-product-grid-card">
                <div className="v-grid-img-wrap">
                  <img src={getImageUrl(p)} alt={prodName} className="v-grid-img" />
                  <span className="v-grid-cat">{prodCategory}</span>
                  <span
                    className={`v-status-badge v-grid-status ${status === 'Active'
                      ? 'status-active'
                      : status === 'Low Stock'
                        ? 'status-processing'
                        : 'status-out'
                      }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="v-grid-content">
                  <span className="v-grid-sku">{prodSku}</span>
                  <h4 className="v-grid-title">{prodName}</h4>

                  <div className="v-grid-stock-row">
                    <span>Available: <strong>{availableStock} / {stockTotal}</strong></span>
                    <span>Deposit: <strong>₹{securityDeposit.toLocaleString('en-IN')}</strong></span>
                  </div>

                  <div className="v-grid-price-row">
                    <div>
                      <span className="v-grid-rate">₹{dailyRate.toLocaleString('en-IN')}</span>
                      <span className="v-grid-day"> / day</span>
                    </div>
                    <div className="v-grid-btn-group">
                      <Link
                        to={`/vendor/products/${p.id}/edit`}
                        className="v-grid-edit-btn"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="v-grid-del-btn"
                        title="Delete Product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="v-modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="v-modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-primary-red flex items-center justify-center mx-auto mb-3">
                <Trash2 size={24} />
              </div>
              <h3 className="font-bold text-charcoal text-base mb-1">Delete Equipment Listing?</h3>
              <p className="text-xs text-slate-500 mb-5">
                This action will remove the product from your store catalog and rental booking widget.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="btn-v-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteProduct(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="btn-v-primary flex-1 bg-[#36451A] hover:bg-red-700"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}