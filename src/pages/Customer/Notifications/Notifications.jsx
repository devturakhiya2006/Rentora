import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
  CalendarCheck,
  CreditCard,
  FileText,
  ShieldCheck,
  AlertCircle,
  Truck,
  Check
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import './Notifications.css';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = data.map(n => ({
        ...n,
        time: new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' + new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setNotifications(formatted);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      if (!user) return;
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const handleToggleRead = async (id) => {
    try {
      const notif = notifications.find(n => n.id === id);
      if (!notif) return;

      const newReadStatus = !notif.read;
      const { error } = await supabase
        .from('notifications')
        .update({ read: newReadStatus })
        .eq('id', id);

      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: newReadStatus } : n))
      );
    } catch (err) {
      console.error('Error toggling read status:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'Unread') return !n.read;
    if (activeFilter === 'Returns') return n.type === 'return_reminder' || n.type === 'late_return';
    if (activeFilter === 'Financials') return n.type === 'refund_processed' || n.type === 'payment_success';
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'return_reminder':
        return <Clock size={20} className="text-amber-500" />;
      case 'booking_confirmed':
        return <CalendarCheck size={20} className="text-charcoal-light" />;
      case 'quotation_received':
        return <FileText size={20} className="text-primary-red" />;
      case 'refund_processed':
        return <CheckCircle2 size={20} className="text-emerald-500" />;
      default:
        return <Bell size={20} className="text-charcoal" />;
    }
  };

  return (
    <div className="notifications-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Notification Center</h1>
          <p className="page-sub-heading">
            Stay updated with real-time rental returns, quotation alerts, and escrow releases.
          </p>
        </div>

        <div className="notif-top-actions">
          <button onClick={handleMarkAllAsRead} className="btn-notif-action">
            <Check size={14} />
            <span>Mark All as Read</span>
          </button>
          <button onClick={handleClearAll} className="btn-notif-action btn-notif-danger">
            <Trash2 size={14} />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="notif-filters-row">
        {['All', 'Unread', 'Returns', 'Financials'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`notif-tab ${activeFilter === tab ? 'notif-tab-active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="notifications-list-card">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading notifications...</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="notifs-empty-box">
            <Bell size={48} className="text-slate-300 mb-3" />
            <h3>No Notifications</h3>
            <p>You're all caught up! No active alerts in this section.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item-row ${!notif.read ? 'notif-unread-row' : ''}`}
            >
              <div className="notif-icon-circle">
                {getNotifIcon(notif.type)}
              </div>

              <div className="notif-main-content">
                <div className="notif-title-line">
                  <span className="notif-item-title">{notif.title}</span>
                  {!notif.read && <span className="notif-new-dot" />}
                  <span className="notif-item-time">{notif.time}</span>
                </div>
                <p className="notif-item-msg">{notif.message}</p>
                {notif.orderId && (
                  <span className="notif-ref-tag">Ref: {notif.orderId}</span>
                )}
              </div>

              <div className="notif-row-actions">
                <button
                  onClick={() => handleToggleRead(notif.id)}
                  className="btn-notif-toggle"
                  title={notif.read ? 'Mark as unread' : 'Mark as read'}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="btn-notif-delete"
                  title="Remove notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
