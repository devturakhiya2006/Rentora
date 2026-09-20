import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const CustomerContext = createContext();

export function CustomerProvider({ children }) {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: 'Customer',
    email: 'customer@example.com',
    phone: 'N/A',
    location: 'Unknown',
    avatar: 'https://ui-avatars.com/api/?name=Customer&background=e2e8f0&color=475569',
    kycStatus: 'Pending',
    joinDate: '2026-09-01'
  });
  
  const [rentals, setRentals] = useState([]);
  const [loadingRentals, setLoadingRentals] = useState(true);
  const [notifications, setNotifications] = useState([]);
  
  const [spendingData, setSpendingData] = useState({
    monthlySpending: [],
    categoryBreakdown: []
  });

  useEffect(() => {
    if (user) {
      setProfile({
        ...user,
        name: user.name || 'Customer',
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Customer')}&background=e2e8f0&color=475569`,
        location: user.city || 'Ahmedabad',
        kycStatus: user.verified ? 'Verified' : 'Pending',
        joinDate: new Date(user.created_at || Date.now()).toLocaleDateString('en-IN')
      });
    }
  }, [user]);

  useEffect(() => {
    async function fetchCustomerNotifications() {
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
        .channel('customer_notifications_channel')
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
    fetchCustomerNotifications();
  }, [user]);

  useEffect(() => {
    async function fetchCustomerRentals() {
      if (!user) {
        setLoadingRentals(false);
        return;
      }
      
      setLoadingRentals(true);
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
          products (
            id,
            title,
            name,
            sku,
            images,
            category,
            daily_rate
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching customer rentals:", error);
      } else if (data) {
        const formattedRentals = data.map(item => ({
          id: item.id,
          orderId: '#RNT-' + item.id.slice(0, 6).toUpperCase(),
          product: {
            name: item.products?.title || item.products?.name || 'Unknown Gear',
            category: item.products?.category || 'General',
            image: Array.isArray(item.products?.images) && item.products?.images.length > 0 
                    ? item.products.images[0] 
                    : 'https://images.unsplash.com/photo-1542261777448-23d2a287091c?auto=format&fit=crop&w=150&q=80'
          },
          vendor: { name: 'Rentora Partner' }, // vendor mapping if needed
          startDate: item.start_date,
          endDate: item.end_date,
          status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Confirmed',
          amount: item.total_price || 0,
          date: new Date(item.created_at).toLocaleDateString('en-IN')
        }));
        setRentals(formattedRentals);

        // Simple mock spending data based on live rentals count
        const total = formattedRentals.reduce((sum, r) => sum + r.amount, 0);
        setSpendingData({
          totalSpent: total,
          activeRentals: formattedRentals.filter(r => r.status === 'Active' || r.status === 'Confirmed').length,
          monthlySpending: [
            { month: 'Jul', amount: 0 },
            { month: 'Aug', amount: 0 },
            { month: 'Sep', amount: total }
          ],
          categoryBreakdown: [
            { name: 'Rentals', value: total, color: '#3b82f6' }
          ]
        });
      }
      setLoadingRentals(false);
    }
    
    fetchCustomerRentals();
  }, [user]);

  return (
    <CustomerContext.Provider value={{ 
      profile, 
      rentals, 
      loadingRentals, 
      notifications, 
      spendingData 
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  return useContext(CustomerContext);
}
