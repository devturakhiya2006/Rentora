import React, { createContext, useContext, useState, useEffect } from 'react';
import { testAccounts } from '../testAccounts';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('rentora_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    let account = testAccounts.find(acc => acc.email === email && acc.password === password);

    // If not a test account, use LIVE SUPABASE AUTHENTICATION
    if (!account) {
      try {
        const { supabase } = await import('../supabaseClient');
        // REAL Supabase Auth Login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError || !authData.user) {
          throw new Error(authError ? authError.message : 'Invalid email or password.');
        }

        // Fetch user role and details from users table
        const { data: userData, error: dbError } = await supabase.from('users').select('*').eq('id', authData.user.id).single();

        if (userData) {
          account = userData;
        } else {
          // If they are in auth but not in users table (shouldn't happen if signup is correct)
          account = { id: authData.user.id, email: email, role: 'customer' };
        }
      } catch (err) {
        throw new Error(err.message || 'Login failed. Please check your credentials.');
      }
    }

    const mockUser = {
      id: account.id,
      name: account.name || account.full_name || account.owner_name || 'User',
      email: account.email,
      phone: account.phone || '+91 98765 43210',
      role: account.role || 'customer',
      city: account.city || 'Ahmedabad',
      avatar: account.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      verified: true
    };

    setUser(mockUser);
    sessionStorage.setItem('rentora_user', JSON.stringify(mockUser));

    // Sync the mock name to Supabase so Vendor Dashboard sees the same name
    if (mockUser.role === 'customer' || mockUser.role === 'vendor') {
      import('../supabaseClient').then(({ supabase }) => {
        supabase.from('users').upsert({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }).then(() => {
          if (mockUser.role === 'vendor') {
            supabase.from('vendors').upsert({ id: mockUser.id, user_id: mockUser.id, business_name: mockUser.name, owner_name: mockUser.name, email: mockUser.email, phone: mockUser.phone }).then();
          } else if (mockUser.role === 'customer') {
            supabase.from('customers').upsert({ id: mockUser.id, user_id: mockUser.id, name: mockUser.name, email: mockUser.email, phone: mockUser.phone }).then();
          }

          // Send live notification to Admin
          supabase.from('notifications').insert({
            user_id: 'admin',
            title: `New ${mockUser.role === 'vendor' ? 'Vendor' : 'Customer'} Signup!`,
            message: `${mockUser.name} just joined the platform.`,
            type: 'info',
            read: false
          }).then();
        });
      });
    }

    return mockUser;
  };

  const signup = async (userData) => {
    const { supabase } = await import('../supabaseClient');

    // 1. REAL Supabase Auth Signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    const authUser = authData.user;
    if (!authUser) {
      throw new Error('Signup failed. Please try again.');
    }

    const name = userData.fullName || userData.ownerName || 'Rentora User';

    const mockUser = {
      id: authUser.id,
      name: name,
      email: userData.email,
      phone: userData.phone || '+91 98765 43210',
      role: userData.role || 'customer',
      shopName: userData.shopName || '',
      city: userData.city || 'Ahmedabad',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      verified: true
    };

    setUser(mockUser);
    sessionStorage.setItem('rentora_user', JSON.stringify(mockUser));

    // 2. Insert into users table
    await supabase.from('users').upsert({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role
    });

    // 3. Insert into specific tables
    if (mockUser.role === 'vendor') {
      await supabase.from('vendors').upsert({ id: mockUser.id, user_id: mockUser.id, business_name: mockUser.shopName || mockUser.name, owner_name: mockUser.name, email: mockUser.email, phone: mockUser.phone });
    } else if (mockUser.role === 'customer') {
      await supabase.from('customers').upsert({ id: mockUser.id, user_id: mockUser.id, name: mockUser.name, email: mockUser.email, phone: mockUser.phone });
    }

    // 4. Notification
    await supabase.from('notifications').insert({
      user_id: 'admin',
      title: `New ${mockUser.role === 'vendor' ? 'Vendor' : 'Customer'} Signup!`,
      message: `${mockUser.name} just joined the platform.`,
      type: 'info',
      read: false
    });

    return mockUser;
  };

  const logout = async () => {
    const { supabase } = await import('../supabaseClient');
    await supabase.auth.signOut();
    setUser(null);
    sessionStorage.removeItem('rentora_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}