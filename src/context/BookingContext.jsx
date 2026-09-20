import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  // Initialize booking draft from localStorage if available to persist state across refreshes
  const [bookingDraft, setBookingDraft] = useState(() => {
    const saved = localStorage.getItem('rentora_booking_draft');
    return saved ? JSON.parse(saved) : {
      product: null,
      durationMode: 'day',
      startDate: '2026-09-18',
      endDate: '2026-09-20',
      durationCount: 2,
      quantity: 1,
      deliveryType: 'doorstep'
    };
  });

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Sync draft updates to localStorage
  useEffect(() => {
    if (bookingDraft && bookingDraft.product) {
      localStorage.setItem('rentora_booking_draft', JSON.stringify(bookingDraft));
    } else {
      localStorage.removeItem('rentora_booking_draft');
    }
  }, [bookingDraft]);

  const updateBookingDraft = (newFields) => {
    setBookingDraft((prev) => ({
      ...prev,
      ...newFields
    }));
  };

  // Clear booking draft and remove it from localStorage
  const clearBookingDraft = () => {
    setBookingDraft({
      product: null,
      durationMode: 'day',
      startDate: '2026-09-18',
      endDate: '2026-09-20',
      durationCount: 2,
      quantity: 1,
      deliveryType: 'doorstep'
    });
    localStorage.removeItem('rentora_booking_draft');
  };

  const calculateTotal = (overrides = {}) => {
    if (!bookingDraft || !bookingDraft.product) {
      return { subtotal: 0, deposit: 0, deliveryFee: 0, total: 0 };
    }

    const prod = bookingDraft.product;
    const mode = overrides.durationMode || bookingDraft.durationMode || 'day';
    const count = overrides.durationCount || bookingDraft.durationCount || 1;
    const qty = overrides.quantity || bookingDraft.quantity || 1;
    const deliveryType = overrides.deliveryType || bookingDraft.deliveryType || 'doorstep';

    const baseRate = prod.daily_rate || prod.pricePerDay || prod.price || 500;
    
    let rate = baseRate;
    if (mode === 'hour') rate = prod.pricePerHour || Math.round(baseRate / 8);
    if (mode === 'week') rate = prod.pricePerWeek || (baseRate * 5);
    if (mode === 'month') rate = prod.pricePerMonth || (baseRate * 18);

    const subtotal = rate * count * qty;
    const deposit = (prod.deposit || 0) * qty;
    const deliveryFee = deliveryType === 'doorstep' ? 199 : 0;
    const total = subtotal + deposit + deliveryFee;

    return { subtotal, deposit, deliveryFee, total, rate };
  };

  return (
    <BookingContext.Provider
      value={{
        bookingDraft,
        updateBookingDraft,
        clearBookingDraft,
        calculateTotal,
        confirmedBooking,
        setConfirmedBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}