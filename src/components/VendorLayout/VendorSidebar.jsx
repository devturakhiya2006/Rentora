import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  FileText,
  Tag,
  ClipboardList,
  Truck,
  Users,
  Receipt,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Store,
  Compass,
  BadgeCheck,
  Sparkles
} from 'lucide-react';
import Logo from '../Logo/Logo';
import { useVendor } from '../../context/VendorContext';
import { useAuth } from '../../context/AuthContext';
import './VendorSidebar.css';

export default function VendorSidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse
}) {
  const { vendorProfile, products, orders, notifications } = useVendor();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const productCount = products.length;
  const lowStockCount = products.filter(p => p.stock < 5).length;
  const newOrdersCount = orders.filter(o => o.orderStatus?.toLowerCase() === 'processing' || o.orderStatus?.toLowerCase() === 'confirmed').length;
  const dueReturnsCount = orders.filter(o => o.orderStatus?.toLowerCase() === 'active').length;
  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { path: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/vendor/products', label: 'Products', icon: Package, badge: productCount > 0 ? productCount : null },
    { path: '/vendor/inventory', label: 'Inventory', icon: Boxes, alert: lowStockCount > 0 ? `${lowStockCount} Low` : null },
    { path: '/vendor/pricing', label: 'Pricing & Rates', icon: Tag },
    { path: '/vendor/orders', label: 'Active Orders', icon: ClipboardList, badge: newOrdersCount > 0 ? `${newOrdersCount} New` : null },
    { path: '/vendor/quotations', label: 'Quotations', icon: FileText },
    { path: '/vendor/pickups-returns', label: 'Pickup & Returns', icon: Truck, alert: dueReturnsCount > 0 ? `${dueReturnsCount} Due` : null },
    { path: '/vendor/customers', label: 'Customers', icon: Users },
    { path: '/vendor/invoices', label: 'Invoices', icon: Receipt },
    { path: '/vendor/payments', label: 'Payouts & Ledger', icon: CreditCard },
    { path: '/vendor/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { path: '/vendor/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount > 0 ? unreadNotifsCount : null },
    { path: '/vendor/settings', label: 'Store Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="vendor-sidebar-backdrop" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`vendor-sidebar ${isOpen ? 'sidebar-mobile-open' : ''} ${
          isCollapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        {/* Top Branding Section */}
        <div className="vendor-sidebar-header">
          {!isCollapsed ? (
            <Link to="/vendor/dashboard" className="vendor-logo-link" onClick={onClose}>
              <div className="flex items-center gap-3">
                <div className="bg-[#FCFCFA] p-1.5 rounded-xl border border-white/20 shadow-md">
                  <Logo size="sm" showTagline={false} />
                </div>
                <span className="vendor-portal-badge">VENDOR</span>
              </div>
            </Link>
          ) : (
            <Link to="/vendor/dashboard" className="vendor-logo-collapsed" title="Rentora Vendor Hub">
              <span className="collapsed-logo-letter">R</span>
            </Link>
          )}

          {/* Mobile Close Button */}
          <button
            className="vendor-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            className="vendor-collapse-btn hidden lg:flex"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar Collapse"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Vendor Profile Capsule */}
        {!isCollapsed ? (
          <div className="vendor-profile-capsule">
            <div className="vendor-avatar-wrap">
              <img
                src={vendorProfile.avatar}
                alt={vendorProfile.vendorName}
                className="vendor-avatar-img"
              />
              <span className="vendor-online-dot" title="Store Online & Taking Orders" />
            </div>
            <div className="vendor-profile-info">
              <div className="vendor-profile-name">
                <span>{vendorProfile.businessName}</span>
              </div>
              <div className="vendor-profile-meta">
                <span className="vendor-role-tag">{vendorProfile.vendorName}</span>
                <span className="vendor-rating-tag">★ {vendorProfile.rating}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="vendor-profile-mini" title={`${vendorProfile.businessName} (${vendorProfile.vendorName})`}>
            <img
              src={vendorProfile.avatar}
              alt={vendorProfile.vendorName}
              className="vendor-avatar-mini"
            />
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="vendor-nav-container">
          {!isCollapsed && (
            <div className="vendor-nav-title">STORE MANAGEMENT</div>
          )}
          <ul className="vendor-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="vendor-nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `vendor-nav-link ${isActive ? 'vendor-nav-active' : ''} ${
                        isCollapsed ? 'nav-link-collapsed' : ''
                      }`
                    }
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="vendor-nav-icon flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="vendor-nav-text">{item.label}</span>
                        {item.alert && (
                          <span className="vendor-badge badge-warning">{item.alert}</span>
                        )}
                        {item.badge && !item.alert && (
                          <span className="vendor-badge">{item.badge}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="vendor-sidebar-footer">
          {!isCollapsed ? (
            <>
              <Link
                to="/products"
                className="vendor-marketplace-link"
                onClick={onClose}
              >
                <Compass size={17} />
                <span>Customer Marketplace</span>
                <Sparkles size={14} className="text-amber-300 ml-auto" />
              </Link>
              <button onClick={handleLogout} className="vendor-logout-btn">
                <LogOut size={17} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/products"
                className="vendor-mini-icon-btn"
                title="View Customer Marketplace"
              >
                <Compass size={18} />
              </Link>
              <button
                onClick={handleLogout}
                className="vendor-mini-icon-btn text-rose-400 hover:text-rose-300"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
