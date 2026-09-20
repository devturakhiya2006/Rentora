import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
const VendorContext = createContext();

export function VendorProvider({ children }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [quotations, setQuotations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [vendorProfile, setVendorProfile] = useState({ 
    businessName: 'Rentora Partner', 
    city: 'Ahmedabad',
    vendorName: 'Vendor',
    avatar: 'https://ui-avatars.com/api/?name=Vendor&background=0D8ABC&color=fff',
    rating: '4.9',
    verifiedBadge: 'Verified Partner',
    bankAccount: 'HDFC Bank - **** 4492'
  });
  const [toast, setToast] = useState(null);

  // Sync profile when user changes
  useEffect(() => {
    if (user) {
      setVendorProfile(prev => ({
        ...prev,
        vendorName: user.name || 'Vendor',
        businessName: user.shopName || user.name || 'Rentora Partner',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Vendor')}&background=0D8ABC&color=fff`
      }));
    }
  }, [user]);

  // Fetch vendor notifications
  useEffect(() => {
    async function fetchVendorNotifications() {
      if (!user) return;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
         setNotifications(data.map(n => ({
           id: n.id,
           title: n.title,
           message: n.message,
           time: new Date(n.created_at).toLocaleString('en-IN'),
           read: n.read,
           type: n.type || 'info',
           link: '#'
         })));
      }

      // Setup live subscription
      const subscription = supabase
        .channel('vendor_notifications_channel')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications', 
            filter: `user_id=eq.${user.id}` 
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

      return () => {
        supabase.removeChannel(subscription);
      };
    }
    fetchVendorNotifications();
  }, [user]);

  // Fetch products from Supabase database on mount
  useEffect(() => {
    async function fetchVendorProducts() {
      if (!user) return;
      setLoadingProducts(true);
      const { data, error } = await supabase.from('products').select('*').eq('vendor_id', user.id);
      if (error) {
        console.error("Error fetching vendor products:", error);
      } else if (data) {
        const formattedProducts = data.map(p => ({
          ...p,
          title: p.title || p.name || 'Unnamed Gear',
          name: p.name || p.title || 'Unnamed Gear',
          pricePerDay: p.daily_rate || p.pricePerDay || 500,
          securityDeposit: p.security_deposit || p.deposit || 2000,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.images || p.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80'),
          stock: p.stock || 1,
          availableStock: p.available_stock ?? p.stock ?? 1,
          status: p.status || 'Active',
          category: p.category || 'General',
          brand: p.brand || 'Rentora',
          sku: p.sku || `SKU-${(p.id || '001').slice(0, 6)}`
        }));
        setProducts(formattedProducts);
      }
      setLoadingProducts(false);
    }
    fetchVendorProducts();
  }, [user]);

  // Fetch orders from Supabase rentals table
  useEffect(() => {
    async function fetchVendorOrders() {
      if (!user) return;
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          id,
          start_date,
          end_date,
          status,
          total_price,
          security_deposit,
          created_at,
          products!inner (
            id,
            title,
            name,
            sku,
            images,
            category,
            daily_rate
          ),
          users (
            id,
            name,
            email
          )
        `)
        .eq('products.vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching vendor orders:", error);
      } else if (data) {
        const formattedOrders = data.map(item => ({
          orderId: 'REN-' + item.id.slice(0, 6).toUpperCase(),
          rawId: item.id,
          startDate: item.start_date,
          endDate: item.end_date,
          durationDays: Math.ceil((new Date(item.end_date) - new Date(item.start_date)) / (1000 * 60 * 60 * 24)) || 1,
          orderStatus: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Confirmed',
          totalAmount: item.total_price || 0,
          securityDeposit: item.security_deposit || 0,
          customer: {
            id: item.users?.id,
            name: item.users?.name || 'Aarav Patel',
            phone: item.users?.phone || '+91 98250 12345',
            email: item.users?.email || 'customer@rentora.in',
            address: '304, Shivalik Highstreet, Ahmedabad'
          },
          product: {
            id: item.products?.id,
            name: item.products?.title || item.products?.name || 'Rental Gear',
            sku: item.products?.sku || 'SKU-001',
            category: item.products?.category || 'General',
            image: Array.isArray(item.products?.images) ? item.products.images[0] : item.products?.images || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80'
          }
        }));

        // Dynamically compute invoices based on live orders
        const computedInvoices = formattedOrders.map(o => ({
          id: `INV-${o.rawId}`,
          invoiceNumber: `INV-2026-${o.rawId.slice(0, 5).toUpperCase()}`,
          orderId: o.orderId,
          customer: o.customer?.name,
          issueDate: new Date(o.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          paymentMethod: 'Online Payment',
          amount: o.totalAmount,
          deposit: o.securityDeposit,
          paymentStatus: 'Paid'
        }));
        setInvoices(computedInvoices);

        // Dynamically compute payments/payouts based on live orders
        const computedPayments = formattedOrders.map(o => ({
          id: `PAY-${o.rawId}`,
          txnId: `TXN-${o.rawId.slice(0, 8).toUpperCase()}`,
          orderId: o.orderId,
          customer: o.customer?.name,
          date: new Date(o.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          amount: o.totalAmount,
          platformFee: Math.round(o.totalAmount * 0.1),
          rentalEarning: o.totalAmount - Math.round(o.totalAmount * 0.1),
          payoutStatus: o.orderStatus === 'Completed' ? 'Settled to Bank' : 'Processing'
        }));
        setPayments(computedPayments);

        setOrders(formattedOrders);
      }
      setLoadingOrders(false);
    }
    fetchVendorOrders();
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const hideToast = () => setToast(null);

  // Products CRUD with Supabase
  const addProduct = async (newProd) => {
    try {
      const payload = {
        title: newProd.name || newProd.title,
        category: newProd.category,
        "categorySlug": newProd.categorySlug || 'cameras',
        daily_rate: newProd.pricePerDay || newProd.daily_rate || 500,
        deposit: newProd.securityDeposit || newProd.deposit || 2000,
        vendor: { name: vendorProfile.businessName, city: vendorProfile.city },
        images: [newProd.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'],
        rating: 5.0,
        reviews: 0
      };

      const { data, error } = await supabase.from('products').insert([payload]).select();
      if (error) throw error;

      if (data && data[0]) {
        setProducts((prev) => [data[0], ...prev]);
        showToast(`Product "${payload.title}" published successfully!`, 'success');
        return data[0];
      }
    } catch (err) {
      console.error("Error adding product:", err);
      showToast('Failed to publish product', 'error');
    }
  };

  const updateProduct = async (id, updatedFields) => {
    try {
      const dbPayload = {};
      if (updatedFields.name || updatedFields.title) dbPayload.title = updatedFields.name || updatedFields.title;
      if (updatedFields.pricePerDay || updatedFields.daily_rate) dbPayload.daily_rate = updatedFields.pricePerDay || updatedFields.daily_rate;
      if (updatedFields.securityDeposit || updatedFields.deposit) dbPayload.deposit = updatedFields.securityDeposit || updatedFields.deposit;
      if (updatedFields.category) dbPayload.category = updatedFields.category;

      const { error } = await supabase.from('products').update(dbPayload).eq('id', id);
      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
      );
      showToast('Product details updated successfully!', 'success');
    } catch (err) {
      console.error("Error updating product:", err);
      showToast('Failed to update product', 'error');
    }
  };

  const deleteProduct = async (id) => {
    try {
      const target = products.find((p) => p.id === id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Product "${target?.title || target?.name || 'Item'}" deleted.`, 'info');
    } catch (err) {
      console.error("Error deleting product:", err);
      showToast('Failed to delete product', 'error');
    }
  };

  const updateProductStatus = (id, newStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    showToast(`Product status updated to ${newStatus}.`, 'success');
  };

  const adjustStock = async (id, delta, reason) => {
    try {
      const target = products.find((p) => p.id === id);
      const currentStock = target?.stock || 10;
      const newStock = Math.max(0, currentStock + delta);

      const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id);
      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
      );
      showToast(`Stock updated (${delta > 0 ? `+${delta}` : delta} units) - ${reason}`, 'success');
    } catch (err) {
      console.error("Error adjusting stock:", err);
      showToast('Failed to adjust stock', 'error');
    }
  };
  const sendMessageToCustomer = async (customerId, message) => {
    try {
      if (!user) {
        showToast('You must be logged in to send messages.', 'error');
        return;
      }
      
      const payload = {
        user_id: customerId,
        sender_id: user.id,
        title: `Direct Message from ${vendorProfile.businessName}`,
        message: message,
        type: 'direct_message',
        read: false
      };
      
      const { error } = await supabase.from('notifications').insert([payload]);
      
      if (error) {
        throw error;
      }
      
      showToast('Direct message sent successfully!', 'success');
    } catch (err) {
      console.error('Error sending message:', err);
      showToast('Failed to send message', 'error');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const targetOrder = orders.find(o => o.orderId === orderId);
      if (!targetOrder) return;

      const { error } = await supabase.from('rentals').update({ status: newStatus.toLowerCase() }).eq('id', targetOrder.rawId);
      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      showToast(`Order ${orderId} marked as ${newStatus}.`, 'success');
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast('Failed to update order status', 'error');
    }
  };

  const addQuotation = (newQuo) => {
    const created = {
      ...newQuo,
      id: `quo-${Date.now()}`,
      quotationNumber: `QUO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Sent'
    };
    setQuotations((prev) => [created, ...prev]);
    showToast(`Quotation ${created.quotationNumber} sent to client!`, 'success');
    return created;
  };

  const updateQuotationStatus = (id, status) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
    showToast(`Quotation marked as ${status}.`, 'info');
  };

  return (
    <VendorContext.Provider
      value={{
        products,
        loadingProducts,
        orders,
        loadingOrders,
        quotations,
        notifications,
        customers,
        invoices,
        payments,
        vendorProfile,
        setVendorProfile,
        toast,
        showToast,
        hideToast,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStatus,
        adjustStock,
        updateOrderStatus,
        addQuotation,
        updateQuotationStatus,
        setNotifications,
        sendMessageToCustomer
      }}
    >
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
}