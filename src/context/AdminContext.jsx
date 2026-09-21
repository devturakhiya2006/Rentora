import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [metrics, setMetrics] = useState({
    totalRevenue: { value: '₹0', change: '+0%', isPositive: true },
    totalOrders: { value: 0, change: '+0%', isPositive: true },
    activeRentals: { value: 0, change: '+0%', isPositive: true },
    totalCustomers: { value: 0, change: '+0%', isPositive: true },
    totalVendors: { value: 0, change: '+0%', isPositive: true },
    activeCustomers: { value: 0, change: '+0%', isPositive: true },
    activeVendors: { value: 0, change: '+0%', isPositive: true },
    totalProducts: { value: 0, change: '+0%', isPositive: true },
    pendingPayments: { value: '₹0', change: '+0%', isPositive: true }
  });
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pickupsReturns, setPickupsReturns] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [adminUsers, setAdminUsers] = useState([{ 
    id: 'adm-001', 
    name: 'Admin User', 
    role: 'Super Admin', 
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=e2e8f0&color=475569', 
    email: 'admin@rentora.com' 
  }]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [settings, setSettings] = useState({
    general: {
      platformName: 'Rentora',
      supportEmail: 'support@rentora.com',
      supportPhone: '+91 98765 43210',
      platformUrl: 'https://rentora.com',
      address: '123 Rentora HQ, Gujarat'
    },
    commission: {
      defaultRate: 10,
      electronicsRate: 8,
      vehiclesRate: 12,
      fashionRate: 15
    },
    tax: {
      gstMode: 'inclusive',
      gstRate: 18
    },
    orderPolicy: {
      minOrderValue: 500,
      maxRentalDays: 30,
      cancellationGracePeriod: 24,
      autoCancelUnpaid: 12
    },
    vendorPolicy: {
      kycRequired: true,
      autoApproveProducts: false,
      maxProductsPerVendor: 100,
      payoutCycle: 'weekly'
    },
    security: {
      require2FA: true,
      sessionTimeout: 60,
      passwordExpiry: 90
    }
  });
  const [reportsData, setReportsData] = useState({
    financials: {
      revenue: 0,
      commission: 0,
      escrowLocked: 0,
      vendorPayouts: 0,
      processingFees: 0
    },
    monthlyRevenue: [],
    categoryPerformance: [],
    growthStats: []
  });
  const [loading, setLoading] = useState(true);

  const [currentAdmin, setCurrentAdmin] = useState(adminUsers[0]);

  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      try {
        // Fetch products with vendor info
        const { data: productsData } = await supabase.from('products').select('*');
        if (productsData) {
          setProducts(productsData.map(p => ({
            ...p,
            vendorName: 'Vendor',
            approvalStatus: p.status || 'Active',
            name: p.title || p.name || 'Unknown Product',
            sku: p.sku || 'SKU-N/A',
            category: p.category || 'General',
            pricePerDay: p.daily_rate || p.price || 0,
            deposit: p.security_deposit || p.deposit || 0,
            stock: p.stock || p.quantity || 1,
            availableStock: p.availableStock || p.stock || p.quantity || 1,
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1542261777448-23d2a287091c?auto=format&fit=crop&w=150&q=80'],
            featured: p.is_featured || false,
            revenue: p.revenue || 0,
            rentalCount: p.rental_count || 0
          })));
        }

        // Fetch customers first but wait for rentals to calculate stats
        const { data: customersData } = await supabase.from('users').select('*').eq('role', 'customer');

        // Fetch rentals/orders
        const { data: rentalsData } = await supabase.from('rentals').select('*, products(title, category, vendor_id)');
        
        // Fetch reviews
        const { data: reviewsData } = await supabase.from('reviews').select('rating, product_id');

        // Fetch vendors
        const { data: vendorsData } = await supabase.from('users').select('*').eq('role', 'vendor');
        if (vendorsData) {
          setVendors(vendorsData.map(v => {
            const vendorProducts = productsData ? productsData.filter(p => p.vendor_id === v.id || (p.vendor && p.vendor.name === (v.businessName || v.name))) : [];
            const vendorRentals = rentalsData ? rentalsData.filter(r => r.products?.vendor_id === v.id || (r.products?.vendor && r.products.vendor.name === (v.businessName || v.name))) : [];
            
            const vendorReviews = reviewsData && productsData 
              ? reviewsData.filter(r => {
                  const p = productsData.find(prod => prod.id === r.product_id);
                  return p && p.vendor_id === v.id;
                }) 
              : [];
              
            const totalProductsCount = vendorProducts.length;
            const totalOrdersCount = vendorRentals.length;
            const revCount = vendorReviews.length;
            const ratingValue = revCount > 0 
              ? (vendorReviews.reduce((sum, r) => sum + r.rating, 0) / revCount).toFixed(1)
              : 0;

            return {
              ...v,
              businessName: v.name,
              verificationStatus: 'Approved',
              accountStatus: v.status || 'Active',
              revenue: v.revenue || 0,
              payoutBalance: v.payoutBalance || 0,
              totalProducts: totalProductsCount,
              totalOrders: totalOrdersCount,
              activeListings: totalProductsCount,
              rating: Number(ratingValue),
              reviewCount: revCount,
              gstin: v.gstin || 'N/A',
              ownerName: v.ownerName || v.name || 'Owner',
              category: v.category || 'General',
              city: v.city || 'Unknown',
              location: v.location || 'Unknown',
              avatar: v.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name || 'Vendor')}&background=e2e8f0&color=475569`,
              phone: v.phone || 'N/A'
            };
          }));
        }

        if (customersData && rentalsData) {
          setCustomers(customersData.map(c => {
            const customerRentals = rentalsData.filter(r => r.user_id === c.id);
            const totalSpending = customerRentals.reduce((sum, r) => sum + (r.total_price || 0), 0);
            const activeRentals = customerRentals.filter(r => r.status !== 'completed' && r.status !== 'returned').length;
            
            return {
              ...c,
              accountStatus: c.status || 'Active',
              rentalCount: customerRentals.length,
              activeRentals: activeRentals,
              totalSpending: totalSpending,
              totalOrders: customerRentals.length,
              kycStatus: c.kycStatus || 'Verified',
              trustScore: 100, // mock score
              registrationDate: new Date(c.created_at || Date.now()).toLocaleDateString('en-IN'),
              city: c.city || 'Unknown',
              location: c.location || 'Unknown',
              avatar: c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'Customer')}&background=e2e8f0&color=475569`,
              phone: c.phone || 'N/A'
            };
          }));
        }

        if (rentalsData) {
          setOrders(rentalsData.map(r => ({
            id: r.id,
            orderNumber: 'REN-' + r.id.slice(0, 6).toUpperCase(),
            customer: {
              id: r.user_id,
              name: r.users?.name || 'Customer',
              city: r.users?.city || 'Unknown'
            },
            vendor: {
              id: r.products?.vendor_id,
              name: 'Vendor',
              city: 'Unknown'
            },
            product: {
              name: r.products?.title || 'Unknown',
              category: r.products?.category || 'Unknown'
            },
            durationDays: 1,
            totalAmount: r.total_price || 0,
            platformCommission: (r.total_price || 0) * 0.1,
            depositAmount: r.security_deposit || 0,
            orderDate: new Date(r.created_at || Date.now()).toLocaleDateString('en-IN'),
            startDate: r.start_date,
            endDate: r.end_date,
            orderStatus: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Active',
            paymentStatus: 'Paid',
            escrowStatus: 'Locked'
          })));
        }

        // Fetch notifications
        const { data: notificationsData } = await supabase.from('notifications').select('*').eq('user_id', 'admin').order('created_at', { ascending: false });
        if (notificationsData) {
          setNotifications(notificationsData.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: new Date(n.created_at).toLocaleString('en-IN'),
            read: n.read,
            type: n.type || 'info',
            link: '#'
          })));
        }

        // Setup live subscription for Admin
        const subscription = supabase
          .channel(`admin_notifs_${Date.now()}`)
          .on('postgres_changes', { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'notifications',
              filter: "user_id=eq.admin"
            }, 
            payload => {
              const n = payload.new;
              const newNotif = {
                 id: n.id,
                 title: n.title,
                 message: n.message,
                 time: new Date(n.created_at).toLocaleString('en-IN'),
                 read: n.read,
                 type: n.type || 'info',
                 link: '#'
              };
              setNotifications(prev => [newNotif, ...prev]);
            }
          )
          .subscribe();

        // Note: The subscription is not cleaned up here because the admin dashboard usually stays mounted,
        // but ideally it should be cleaned up on unmount. We attach it to the window to avoid leaks if needed.
        window.adminNotifSubscription = subscription;

        // Fetch complaints
        const { data: complaintsData } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
        if (complaintsData) {
          setComplaints(complaintsData.map(c => ({
            id: c.id,
            ticketNumber: c.ticket_number,
            raisedBy: c.raised_by,
            userType: c.user_type,
            relatedOrder: c.related_order,
            subject: c.subject,
            priority: c.priority,
            status: c.status,
            assignedStaff: c.assigned_staff || 'Unassigned',
            category: c.category || 'General',
            date: new Date(c.created_at).toLocaleDateString('en-IN')
          })));
        }

        // Fetch activity logs
        const { data: logsData } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false });
        if (logsData) {
          setActivityLogs(logsData.map(l => ({
            id: l.id,
            admin: l.admin,
            action: l.action,
            module: l.module,
            description: l.description,
            ip: l.ip,
            timestamp: new Date(l.timestamp).toLocaleString('en-IN')
          })));
        }

        // Calculate metrics
        // Update metrics based on live data
        if (rentalsData && customersData && productsData) {
          const totalRevenue = rentalsData.reduce((sum, r) => sum + (r.total_price || 0), 0);
          const totalCommission = totalRevenue * 0.1;
          const escrowLocked = rentalsData.reduce((sum, r) => sum + (r.security_deposit || 0), 0);

          setMetrics({
            totalRevenue: { value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: "+0%", isPositive: true },
            totalOrders: { value: rentalsData.length.toLocaleString(), change: "+0%", isPositive: true },
            activeRentals: { value: rentalsData.filter(r => r.status !== 'completed' && r.status !== 'returned').length.toLocaleString(), change: "+0%", isPositive: true },
            totalCustomers: { value: customersData.length.toLocaleString(), change: "+0%", isPositive: true },
            totalVendors: { value: (vendorsData ? vendorsData.length : 0).toLocaleString(), change: "+0%", isPositive: true },
            activeCustomers: { value: customersData.length.toLocaleString(), change: "+0%", isPositive: true },
            activeVendors: { value: (vendorsData ? vendorsData.length : 0).toLocaleString(), change: "+0%", isPositive: true },
            totalProducts: { value: (productsData ? productsData.length : 0).toLocaleString(), change: "+0%", isPositive: true },
            pendingPayments: { value: `₹${escrowLocked.toLocaleString('en-IN')}`, change: "+0%", isPositive: true }
          });

          const currentMonthIdx = new Date().getMonth();
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          const monthlyData = [
            { month: months[(currentMonthIdx - 2 + 12) % 12], revenue: 0, orders: 0, commission: 0 },
            { month: months[(currentMonthIdx - 1 + 12) % 12], revenue: 0, orders: 0, commission: 0 },
            { month: months[currentMonthIdx] + ' (MTD)', revenue: 0, orders: 0, commission: 0 }
          ];

          const categoryMap = {};

          rentalsData.forEach(r => {
            const date = new Date(r.created_at || Date.now());
            const monthDiff = (new Date().getFullYear() - date.getFullYear()) * 12 + new Date().getMonth() - date.getMonth();
            const revenue = r.total_price || 0;
            
            if (monthDiff === 2) {
              monthlyData[0].revenue += revenue;
              monthlyData[0].orders += 1;
              monthlyData[0].commission += revenue * 0.1;
            } else if (monthDiff === 1) {
              monthlyData[1].revenue += revenue;
              monthlyData[1].orders += 1;
              monthlyData[1].commission += revenue * 0.1;
            } else if (monthDiff === 0) {
              monthlyData[2].revenue += revenue;
              monthlyData[2].orders += 1;
              monthlyData[2].commission += revenue * 0.1;
            }

            const cat = r.products?.category || 'General';
            if (!categoryMap[cat]) {
              categoryMap[cat] = { revenue: 0, orders: 0 };
            }
            categoryMap[cat].revenue += revenue;
            categoryMap[cat].orders += 1;
          });

          const categoryPerformance = Object.keys(categoryMap).map(cat => ({
            category: cat,
            revenue: categoryMap[cat].revenue,
            orders: categoryMap[cat].orders,
            share: totalRevenue > 0 ? Math.round((categoryMap[cat].revenue / totalRevenue) * 100) : 0
          })).sort((a, b) => b.revenue - a.revenue);

          setReportsData({
            financials: {
              revenue: totalRevenue,
              commission: totalCommission,
              escrowLocked: escrowLocked,
              vendorPayouts: totalRevenue - totalCommission,
              processingFees: 0
            },
            monthlyRevenue: monthlyData,
            categoryPerformance: categoryPerformance.length ? categoryPerformance : [{ category: 'No Data', share: 0, revenue: 0, orders: 0 }],
            growthStats: [
              { label: 'Active Users', value: customersData.length, growth: '+0%' },
              { label: 'Avg Order Value', value: rentalsData.length ? Math.round(totalRevenue / rentalsData.length) : 0, growth: '+0%' },
              { label: 'Total Orders', value: rentalsData.length, growth: '+0%' },
              { label: 'Platform Rev', value: Math.round(totalCommission), growth: '+0%' }
            ]
          });
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
      setLoading(false);
    }
    fetchAdminData();
  }, []);

  // Toast System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const hideToast = () => setToast(null);

  // Confirmation Modal System
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: 'red',
    onConfirm: null
  });

  const requestConfirmation = ({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'red',
    onConfirm
  }) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      confirmColor,
      onConfirm
    });
  };

  const closeConfirmation = () => {
    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Document / KYC Modal System
  const [documentModal, setDocumentModal] = useState({
    isOpen: false,
    documentData: null
  });

  const openDocumentModal = (doc) => {
    setDocumentModal({ isOpen: true, documentData: doc });
  };

  const closeDocumentModal = () => {
    setDocumentModal({ isOpen: false, documentData: null });
  };

  // Activity Logging Helper
  const logActivity = (action, module, description) => {
    const newLog = {
      id: `LOG-${Date.now()}`,
      admin: currentAdmin?.name || 'Super Admin',
      action,
      module,
      description,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      ip: '103.24.18.92 (Ahmedabad)'
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // ================= CUSTOMERS CRUD =================
  const updateCustomerStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, accountStatus: newStatus } : c))
      );
      const target = customers.find((c) => c.id === id);
      logActivity('Updated Customer Status', 'Customers', `Changed ${target?.name} account status to ${newStatus}`);
      showToast(`Customer account status updated to "${newStatus}".`, 'success');
    } catch (err) {
      console.error("Error updating customer status:", err);
      showToast('Failed to update customer status', 'error');
    }
  };

  const updateCustomer = (id, updatedFields) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    logActivity('Edited Customer Profile', 'Customers', `Updated profile fields for ${id}`);
    showToast('Customer details saved successfully!', 'success');
  };

  const deleteCustomer = async (id) => {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      const target = customers.find((c) => c.id === id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      logActivity('Deleted Customer Account', 'Customers', `Deleted customer profile ${target?.name} (${id})`);
      showToast(`Customer "${target?.name}" removed from platform.`, 'info');
    } catch (err) {
      console.error("Error deleting customer:", err);
      showToast('Failed to delete customer', 'error');
    }
  };

  const bulkUpdateCustomerStatus = (ids, newStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, accountStatus: newStatus } : c))
    );
    logActivity('Bulk Customer Status Update', 'Customers', `Updated ${ids.length} customers to ${newStatus}`);
    showToast(`Updated ${ids.length} customer accounts to "${newStatus}".`, 'success');
  };

  const bulkDeleteCustomers = (ids) => {
    setCustomers((prev) => prev.filter((c) => !ids.includes(c.id)));
    logActivity('Bulk Customer Deletion', 'Customers', `Deleted ${ids.length} customer records`);
    showToast(`Successfully deleted ${ids.length} customers.`, 'info');
  };

  const addCustomerAdminNote = (id, note) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes: (c.notes ? c.notes + '\n\n' : '') + `[${new Date().toLocaleDateString()} Admin Note]: ` + note } : c))
    );
    showToast('Admin note appended to customer file.', 'success');
  };

  // ================= VENDORS CRUD & APPROVAL =================
  const approveVendor = (id, notes = '') => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              verificationStatus: 'Approved',
              accountStatus: 'Active',
              notes: (v.notes || '') + (notes ? `\n[Approval Note]: ${notes}` : '')
            }
          : v
      )
    );
    const target = vendors.find((v) => v.id === id);
    logActivity('Approved Vendor Registration', 'Vendors', `Approved store license & KYC for ${target?.businessName}`);
    showToast(`Vendor "${target?.businessName}" has been APPROVED and activated!`, 'success');
  };

  const rejectVendor = (id, reason) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              verificationStatus: 'Rejected',
              accountStatus: 'Inactive',
              notes: (v.notes || '') + `\n[Rejection Reason]: ${reason}`
            }
          : v
      )
    );
    const target = vendors.find((v) => v.id === id);
    logActivity('Rejected Vendor Registration', 'Vendors', `Rejected ${target?.businessName}. Reason: ${reason}`);
    showToast(`Vendor application rejected. Notification sent with reason.`, 'warning');
  };

  const updateVendorStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, accountStatus: newStatus } : v))
      );
      const target = vendors.find((v) => v.id === id);
      logActivity('Updated Vendor Status', 'Vendors', `Changed ${target?.businessName} status to ${newStatus}`);
      showToast(`Vendor status set to "${newStatus}".`, 'success');
    } catch (err) {
      console.error("Error updating vendor status:", err);
      showToast('Failed to update vendor status', 'error');
    }
  };

  const updateVendor = async (id, updatedFields) => {
    try {
      const dbUpdate = {
         name: updatedFields.businessName || updatedFields.name,
         phone: updatedFields.phone,
         email: updatedFields.email,
         city: updatedFields.city,
         gstin: updatedFields.gstNumber || updatedFields.gstin,
         category: updatedFields.category,
         location: updatedFields.address || updatedFields.location,
         status: updatedFields.accountStatus || updatedFields.status,
         kycStatus: updatedFields.verificationStatus || updatedFields.kycStatus
      };
      
      Object.keys(dbUpdate).forEach(key => dbUpdate[key] === undefined && delete dbUpdate[key]);

      const { error } = await supabase.from('users').update(dbUpdate).eq('id', id);
      if (error) throw error;

      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
      );
      showToast('Vendor store details updated.', 'success');
    } catch (err) {
      console.error("Error updating vendor:", err);
      showToast('Failed to update vendor store details', 'error');
    }
  };

  const deleteVendor = async (id) => {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      const target = vendors.find((v) => v.id === id);
      setVendors((prev) => prev.filter((v) => v.id !== id));
      logActivity('Deleted Vendor Store', 'Vendors', `Deleted vendor profile ${target?.businessName} (${id})`);
      showToast(`Vendor "${target?.businessName}" removed from platform.`, 'info');
    } catch (err) {
      console.error("Error deleting vendor:", err);
      showToast('Failed to delete vendor', 'error');
    }
  };

  const disburseVendorPayout = (id, amount) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, payoutBalance: Math.max(0, v.payoutBalance - amount) } : v))
    );
    const target = vendors.find((v) => v.id === id);
    logActivity('Disbursed Vendor Payout', 'Payments', `Disbursed ₹${amount.toLocaleString('en-IN')} to ${target?.businessName}`);
    showToast(`₹${amount.toLocaleString('en-IN')} disbursed to ${target?.businessName} bank account.`, 'success');
  };

  // ================= PRODUCTS CRUD & APPROVAL =================
  const approveProduct = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, approvalStatus: 'Approved', status: 'Active' } : p))
    );
    const target = products.find((p) => p.id === id);
    logActivity('Approved Product Listing', 'Products', `Approved product "${target?.name}" (${target?.sku})`);
    showToast(`Product "${target?.name}" is now live on marketplace!`, 'success');
  };

  const rejectProduct = (id, reason) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, approvalStatus: 'Rejected', status: 'Inactive', rejectionReason: reason } : p))
    );
    const target = products.find((p) => p.id === id);
    logActivity('Rejected Product Listing', 'Products', `Rejected product "${target?.name}". Reason: ${reason}`);
    showToast(`Product listing rejected. Feedback logged.`, 'warning');
  };

  const toggleFeaturedProduct = (id) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextVal = !p.featured;
          logActivity('Toggled Featured Product', 'Products', `${nextVal ? 'Featured' : 'Unfeatured'} product "${p.name}"`);
          return { ...p, featured: nextVal };
        }
        return p;
      })
    );
    showToast('Product featured status updated!', 'success');
  };

  const updateProductStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      showToast(`Product marked as ${newStatus}.`, 'success');
    } catch (err) {
      console.error("Error updating product status:", err);
      showToast('Failed to update product status', 'error');
    }
  };

  const deleteProduct = async (id) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      const target = products.find((p) => p.id === id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      logActivity('Deleted Product Listing', 'Products', `Removed product "${target?.name}" (${id})`);
      showToast(`Product "${target?.name || id}" removed.`, 'info');
    } catch (err) {
      console.error("Error deleting product:", err);
      showToast('Failed to delete product', 'error');
    }
  };

  const bulkApproveProducts = (ids) => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, approvalStatus: 'Approved', status: 'Active' } : p))
    );
    logActivity('Bulk Product Approval', 'Products', `Approved ${ids.length} inventory listings`);
    showToast(`${ids.length} products approved successfully!`, 'success');
  };

  // ================= CATEGORIES CRUD =================
  const addCategory = (newCat) => {
    const created = {
      id: `cat-${Date.now()}`,
      slug: newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      productCount: 0,
      activeRentals: 0,
      status: 'Active',
      subcategories: newCat.subcategories || [],
      ...newCat
    };
    setCategories((prev) => [created, ...prev]);
    logActivity('Created New Category', 'Categories', `Added rental category "${created.name}"`);
    showToast(`Category "${created.name}" created successfully!`, 'success');
    return created;
  };

  const updateCategory = (id, updatedFields) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    showToast('Category updated successfully!', 'success');
  };

  const deleteCategory = (id) => {
    const target = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logActivity('Deleted Category', 'Categories', `Deleted category "${target?.name}"`);
    showToast(`Category "${target?.name}" deleted.`, 'info');
  };

  const toggleCategoryStatus = (id) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c))
    );
    showToast('Category status updated.', 'success');
  };

  // ================= ORDERS CRUD =================
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const targetOrder = orders.find(o => o.id === orderId || o.orderNumber === orderId);
      if (!targetOrder) return;
      const { error } = await supabase.from('rentals').update({ status: newStatus.toLowerCase() }).eq('id', targetOrder.id);
      if (error) throw error;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      logActivity('Updated Order Status', 'Orders', `Order ${orderId} changed to ${newStatus}`);
      showToast(`Order ${orderId} marked as ${newStatus}.`, 'success');
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast('Failed to update order status', 'error');
    }
  };

  const updateOrderPaymentStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newStatus } : o))
    );
    showToast(`Order payment marked as ${newStatus}.`, 'success');
  };

  const resolveOrderDispute = (orderId, resolutionDetails) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: 'Resolved',
              escrowStatus: resolutionDetails.depositAction || 'Refunded',
              notes: (o.notes || '') + `\n[Dispute Resolved]: ${resolutionDetails.notes}`
            }
          : o
      )
    );
    logActivity('Resolved Order Dispute', 'Orders', `Resolved dispute on ${orderId} with ${resolutionDetails.depositAction}`);
    showToast(`Dispute on ${orderId} resolved! Escrow updated.`, 'success');
  };

  const addOrderAdminNote = (orderId, note) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, notes: (o.notes || '') + `\n[Admin Note]: ${note}` } : o))
    );
    showToast('Internal note saved on order.', 'success');
  };

  // ================= PAYMENTS & REFUNDS =================
  const processRefund = (transactionId, refundAmount, reason) => {
    setPayments((prev) =>
      prev.map((p) => (p.transactionId === transactionId || p.id === transactionId ? { ...p, status: 'Refunded', escrowStatus: 'Refunded' } : p))
    );
    logActivity('Processed Payment Refund', 'Payments', `Refunded ₹${refundAmount.toLocaleString('en-IN')} for ${transactionId}. Reason: ${reason}`);
    showToast(`Refund of ₹${refundAmount.toLocaleString('en-IN')} successfully initiated.`, 'success');
  };

  const verifyPayment = (transactionId) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === transactionId ? { ...p, status: 'Paid', escrowStatus: 'Locked' } : p))
    );
    showToast(`Transaction ${transactionId} verified.`, 'success');
  };

  // ================= PICKUPS & RETURNS =================
  const schedulePickup = (requestId, scheduledDate, notes) => {
    setPickupsReturns((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Scheduled', scheduledDate, notes: notes || r.notes } : r))
    );
    logActivity('Scheduled Pickup', 'Pickups & Returns', `Scheduled logistics pickup for request ${requestId}`);
    showToast(`Pickup scheduled for ${scheduledDate}. Driver assigned.`, 'success');
  };

  const approveReturn = (requestId, notes) => {
    setPickupsReturns((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Completed', notes: notes || r.notes } : r))
    );
    logActivity('Approved Return Inspection', 'Pickups & Returns', `Approved return checklist for ${requestId}`);
    showToast(`Return approved! Security deposit marked for release.`, 'success');
  };

  const rejectReturn = (requestId, reason) => {
    setPickupsReturns((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Disputed', notes: (r.notes || '') + `\n[QC Failure]: ${reason}` } : r))
    );
    logActivity('Flagged Return Damage', 'Pickups & Returns', `Flagged damage on return ${requestId}: ${reason}`);
    showToast(`Return flagged for damage assessment. Ticket created.`, 'warning');
  };

  const completeReturn = (requestId, qcReport) => {
    setPickupsReturns((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Completed', qcChecklist: qcReport } : r))
    );
    showToast(`QC inspection recorded for ${requestId}.`, 'success');
  };

  // ================= COMPLAINTS & TICKETS =================
  const replyComplaint = (ticketId, messageText) => {
    setComplaints((prev) =>
      prev.map((t) => {
        if (t.id === ticketId || t.ticketNumber === ticketId) {
          const newMsg = {
            sender: currentAdmin?.name || 'Super Admin',
            role: 'Super Admin',
            time: 'Just now',
            text: messageText
          };
          return {
            ...t,
            status: t.status === 'Open' ? 'In Progress' : t.status,
            messages: [...t.messages, newMsg]
          };
        }
        return t;
      })
    );
    logActivity('Replied to Ticket', 'Complaints', `Sent response to ticket ${ticketId}`);
    showToast('Reply dispatched to ticket thread.', 'success');
  };

  const updateComplaintStatus = (ticketId, newStatus) => {
    setComplaints((prev) =>
      prev.map((t) => (t.id === ticketId || t.ticketNumber === ticketId ? { ...t, status: newStatus } : t))
    );
    logActivity('Updated Ticket Status', 'Complaints', `Ticket ${ticketId} marked as ${newStatus}`);
    showToast(`Ticket status updated to "${newStatus}".`, 'success');
  };

  const assignComplaintStaff = (ticketId, staffName) => {
    setComplaints((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, assignedStaff: staffName } : t))
    );
    showToast(`Ticket assigned to ${staffName}.`, 'success');
  };

  const updateComplaintPriority = (ticketId, newPriority) => {
    setComplaints((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, priority: newPriority } : t))
    );
    showToast(`Priority updated to ${newPriority}.`, 'info');
  };

  // ================= NOTIFICATIONS BROADCAST =================
  const broadcastNotification = (newNotif) => {
    const created = {
      id: `NOTIF-${Date.now()}`,
      time: 'Just now',
      read: false,
      ...newNotif
    };
    setNotifications((prev) => [created, ...prev]);
    logActivity('Sent Broadcast Notification', 'Notifications', `Sent "${created.title}" to ${created.recipientType || 'all users'}`);
    showToast(`Broadcast "${created.title}" dispatched successfully!`, 'success');
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.', 'info');
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification removed.', 'info');
  };

  // ================= ADMIN USERS CRUD =================
  const addAdminUser = (newAdmin) => {
    const created = {
      id: `ADM-${Date.now()}`,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      lastLogin: 'Never',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      ...newAdmin
    };
    setAdminUsers((prev) => [created, ...prev]);
    
    // Insert into Supabase users table so they can log in via AuthContext fallback
    import('../supabaseClient').then(({ supabase }) => {
      supabase.from('users').insert({
        id: created.id,
        email: created.email,
        name: created.name,
        role: 'admin',
        password: created.password,
        city: created.allocatedCategory || 'All Categories' // Using city column as a hack to store category since schema is fixed, or if there is categoryAccess use that. Let's use jsonb or just name. Wait, the users table has a `category` column for vendors, we can use that!
      }).then();
      
      // Let's actually update with category column
      supabase.from('users').update({ category: created.allocatedCategory }).eq('id', created.id).then();
    });

    logActivity('Created Admin User', 'Admin Users', `Created staff account for ${created.name} (${created.role})`);
    showToast(`Admin account created for ${created.name}!`, 'success');
  };

  const updateAdminUser = (id, updatedFields) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updatedFields } : u))
    );
    showToast('Admin staff details updated.', 'success');
  };

  const updateAdminPermissions = (id, permissions) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, permissions } : u))
    );
    logActivity('Updated Staff Permissions', 'Admin Users', `Modified permissions for admin ${id}`);
    showToast('Role permissions updated successfully.', 'success');
  };

  const toggleAdminStatus = (id) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
    );
    showToast('Admin user status toggled.', 'success');
  };

  const deleteAdminUser = (id) => {
    const target = adminUsers.find((u) => u.id === id);
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    logActivity('Deleted Admin Account', 'Admin Users', `Removed staff member ${target?.name}`);
    showToast(`Admin user "${target?.name}" removed.`, 'info');
  };

  // ================= SETTINGS =================
  const updateSettings = (sectionKey, newValues) => {
    setSettings((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        ...newValues
      }
    }));
    logActivity('Updated Platform Settings', 'Platform Settings', `Updated configuration for [${sectionKey}]`);
    showToast(`Platform [${sectionKey.toUpperCase()}] settings saved!`, 'success');
  };

  // Active counts for badges
  const pendingApprovalsCount = vendors.filter((v) => v.verificationStatus === 'Pending Approval').length + products.filter((p) => p.approvalStatus === 'Pending Approval').length;
  const openComplaintsCount = complaints.filter((c) => c.status === 'Open' || c.status === 'In Progress').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <AdminContext.Provider
      value={{
        loading,
        metrics,
        customers,
        vendors,
        categories,
        products,
        orders,
        payments,
        pickupsReturns,
        complaints,
        notifications,
        adminUsers,
        activityLogs,
        settings,
        reportsData,
        currentAdmin,
        setCurrentAdmin,
        toast,
        showToast,
        hideToast,
        confirmationModal,
        requestConfirmation,
        closeConfirmation,
        documentModal,
        openDocumentModal,
        closeDocumentModal,
        logActivity,

        // Counts
        pendingApprovalsCount,
        openComplaintsCount,
        unreadNotificationsCount,

        // Customer handlers
        updateCustomerStatus,
        updateCustomer,
        deleteCustomer,
        bulkUpdateCustomerStatus,
        bulkDeleteCustomers,
        addCustomerAdminNote,

        // Vendor handlers
        approveVendor,
        rejectVendor,
        updateVendorStatus,
        updateVendor,
        deleteVendor,
        disburseVendorPayout,

        // Product handlers
        approveProduct,
        rejectProduct,
        toggleFeaturedProduct,
        updateProductStatus,
        deleteProduct,
        bulkApproveProducts,

        // Category handlers
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus,

        // Order handlers
        updateOrderStatus,
        updateOrderPaymentStatus,
        resolveOrderDispute,
        addOrderAdminNote,

        // Payment handlers
        processRefund,
        verifyPayment,

        // Pickup / Return handlers
        schedulePickup,
        approveReturn,
        rejectReturn,
        completeReturn,

        // Complaint handlers
        replyComplaint,
        updateComplaintStatus,
        assignComplaintStaff,
        updateComplaintPriority,

        // Notification handlers
        broadcastNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,

        // Admin User handlers
        addAdminUser,
        updateAdminUser,
        updateAdminPermissions,
        toggleAdminStatus,
        deleteAdminUser,

        // Settings handlers
        updateSettings
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
