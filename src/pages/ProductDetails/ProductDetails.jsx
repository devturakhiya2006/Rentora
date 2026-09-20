import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  ShieldCheck,
  Zap,
  Calendar,
  Clock,
  Heart,
  Check,
  ArrowRight,
  Share2,
  Store,
  Phone,
  Truck,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  FileText
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import ProductImageGallery from '../../components/ProductImageGallery/ProductImageGallery';
import AvailabilityCalendar from '../../components/AvailabilityCalendar/AvailabilityCalendar';
import { supabase } from '../../supabaseClient';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import './ProductDetails.css';

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { updateBookingDraft } = useBooking();

  // Supabase States
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Form States
  const [durationMode, setDurationMode] = useState('day'); // 'hour' | 'day' | 'week' | 'month'
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState('doorstep');
  const [startDate, setStartDate] = useState('2026-09-18');
  const [endDate, setEndDate] = useState('2026-09-20');
  const [durationDays, setDurationDays] = useState(2);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Review Form States
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [requestingQuote, setRequestingQuote] = useState(false);

  // Fetch Data from Supabase
  useEffect(() => {
    async function fetchProductDetails() {
      setLoading(true);
      try {
        const { data: mainProduct, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;
        setProduct(mainProduct);

        // Fetch related products dynamically from same category
        const catSlug = mainProduct?.categorySlug || mainProduct?.category;
        if (catSlug) {
          const { data: related } = await supabase
            .from('products')
            .select('*')
            .neq('id', productId)
            .limit(3);

          if (related) setRelatedProducts(related);
        }

        // Fetch Reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*, users(name)')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });
          
        if (reviewsData) setReviewsList(reviewsData);

      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F4F0] space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#E7E5E4] border-t-[#4A5D23] rounded-full animate-spin"></div>
          <div className="absolute w-5 h-5 bg-[#4A5D23] rounded-full animate-pulse"></div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-extrabold text-[#2A2626] font-['Sora'] tracking-wide">
            Unpacking Gear...
          </h2>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-[#F5F4F0]">
        <div className="text-xl font-bold text-[#2A2626]">Product Not Found! ❌</div>
        <button onClick={() => navigate('/products')} className="px-6 py-2.5 bg-[#4A5D23] text-white rounded-xl font-bold text-xs">
          Go Back to Catalog
        </button>
      </div>
    );
  }

  // Safe Fallback Pricing & Vendor Info
  const baseRate = product.daily_rate || product.pricePerDay || product.price || 500;
  const depositAmt = product.deposit || 2000;

  const getRate = () => {
    switch (durationMode) {
      case 'hour': return product.pricePerHour || Math.round(baseRate / 8);
      case 'week': return product.pricePerWeek || (baseRate * 5);
      case 'month': return product.pricePerMonth || (baseRate * 18);
      case 'day':
      default: return baseRate;
    }
  };

  const currentRate = getRate();
  const durationMultiplier = durationMode === 'day' ? durationDays : durationMode === 'hour' ? 4 : 1;
  const rentalSubtotal = currentRate * durationMultiplier * quantity;
  const depositTotal = depositAmt * quantity;
  const deliveryFee = deliveryType === 'doorstep' ? 199 : 0;
  const estimatedTotal = rentalSubtotal + depositTotal + deliveryFee;

  const handleRequestQuote = async () => {
    if (!user) {
      alert("Please log in to request a quote.");
      navigate('/auth');
      return;
    }
    
    setRequestingQuote(true);
    try {
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 7);
      
      const payload = {
        quotation_number: `QUO-2026-${Math.floor(Math.random() * 9000) + 1000}`,
        customer_name: user.user_metadata?.name || 'Customer',
        customer_email: user.email,
        customer_phone: user.phone || 'N/A',
        product_details: `${product.title} (Qty: ${quantity}, Mode: ${durationMode}, Delivery: ${deliveryType === 'doorstep' ? 'Doorstep Delivery' : 'Store Pickup'})`,
        total_amount: estimatedTotal,
        status: 'Pending Acceptance',
        valid_until: validDate.toISOString().split('T')[0],
        user_id: user.id,
        vendor_id: product.vendor_id || product.users?.id // Fallback if vendor_id isn't directly available
      };
      
      const { error } = await supabase.from('quotations').insert([payload]);
      
      if (error) throw error;
      
      alert("Quotation requested successfully! Check your Quotations page.");
      navigate('/customer'); // Or navigate to quotations page if you have one
    } catch (err) {
      console.error("Error requesting quote:", err);
      alert("Failed to request quote.");
    } finally {
      setRequestingQuote(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmittingReview(true);
    try {
      const payload = {
        product_id: productId,
        user_id: user.id,
        rating: newReviewRating,
        comment: newReviewComment
      };
      
      const { data, error } = await supabase
        .from('reviews')
        .insert([payload])
        .select('*, users(name)')
        .single();
        
      if (error) throw error;
      
      setReviewsList([data, ...reviewsList]);
      setNewReviewComment('');
      setNewReviewRating(5);
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const vendorName = product.vendor?.name || product.vendor_name || 'Rentora Verified Hub';
  const vendorCity = product.vendor?.city || product.city || 'Ahmedabad';
  
  // Calculate dynamic rating
  const avgRating = reviewsList.length > 0 
    ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1) 
    : (product.rating || 4.9);
  const totalReviewsCount = reviewsList.length > 0 ? reviewsList.length : (product.reviews || 0);

  const vendorLogo = product.vendor?.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  const productImages = product.images || [product.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'];

  const handleDatesFromCalendar = ({ start, end, count }) => {
    if (start) setStartDate(start);
    if (end) setEndDate(end);
    if (count) setDurationDays(count);
  };

  const handleRentNow = () => {
    updateBookingDraft({
      productId: product.id,
      product,
      durationMode,
      startDate,
      endDate: endDate || startDate,
      durationCount: durationMultiplier,
      quantity
    });
    navigate('/booking');
  };

  return (
    <div className="product-details-page py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb Navigation */}
        <Breadcrumb items={[
          { label: 'Explore Products', link: '/products' },
          { label: product.category || 'Rentals', link: '/products' },
          { label: product.title, link: null }
        ]} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <ProductImageGallery images={productImages} title={product.title} />

            {/* Title & Vendor */}
            <div className="space-y-3 bg-white p-6 rounded-3xl border border-[#E7E5E4]/40 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#2A2626] text-[#F5F4F0] text-xs font-bold">
                  {product.category || 'Verified Rental'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Product link copied to clipboard!");
                    }}
                    className="p-2 rounded-xl bg-[#F5F4F0] hover:bg-[#E7E5E4]/40 text-[#2A2626] text-xs font-semibold flex items-center gap-1"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${isWishlisted ? 'bg-[#4A5D23] text-white border-[#4A5D23]' : 'bg-[#F5F4F0] text-[#2A2626] border-[#E7E5E4]/40'
                      }`}
                  >
                    <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                    <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2626] font-['Sora'] tracking-tight leading-snug">
                {product.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E7E5E4]">
                    <img src={vendorLogo} alt={vendorName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-bold text-[#2A2626] flex items-center gap-1">
                      {vendorName}
                      <CheckCircle2 size={13} className="text-emerald-500" />
                    </span>
                    <span className="text-gray-500 flex items-center gap-0.5">
                      <MapPin size={11} className="text-[#4A5D23]" /> {vendorCity}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-yellow-50 text-amber-900 px-2.5 py-1 rounded-xl font-bold border border-yellow-200 cursor-pointer" onClick={() => setActiveTab('reviews')}>
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span>{avgRating}</span>
                    <span className="text-gray-500 font-normal">({totalReviewsCount} reviews)</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                    Certified Mint
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl border border-[#E7E5E4]/40 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview & Features' },
                  { id: 'specs', label: 'Technical Specs' },
                  { id: 'included', label: 'Included in Kit' },
                  { id: 'terms', label: 'Rental Policy' },
                  { id: 'reviews', label: 'Reviews' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                      ? 'bg-[#2A2626] text-white shadow-sm'
                      : 'text-[#78716C] hover:bg-[#F5F4F0] hover:text-[#2A2626]'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs sm:text-sm text-[#2A2626] leading-relaxed">
                  <p>{product.fullDescription || product.description || 'High-performance professional rental equipment inspected, calibrated, and sanitized prior to handover.'}</p>
                  <div className="pt-2">
                    <h4 className="font-bold text-sm font-['Sora'] text-[#2A2626] mb-3">Key Highlights:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(product.features || ['Verified Genuine Item', 'Escrow Protected Deposit', 'Free Calibration Check', '24/7 Priority Support']).map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 bg-[#F5F4F0] p-2.5 rounded-xl border border-[#E7E5E4]/30 text-xs">
                          <Check size={14} className="text-[#4A5D23] flex-shrink-0 mt-0.5" />
                          <span className="font-semibold text-[#2A2626]">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="divide-y divide-gray-100 text-xs">
                  {(product.specifications || [
                    { label: 'Condition', value: 'Factory Mint / Inspected' },
                    { label: 'Verification', value: '100% Genuine Serial Checked' },
                    { label: 'Hub Location', value: vendorCity },
                    { label: 'Insurance Cover', value: 'Included up to ₹50,000' }
                  ]).map((spec, i) => (
                    <div key={i} className="py-2.5 flex justify-between">
                      <span className="font-semibold text-[#78716C]">{spec.label}</span>
                      <span className="font-bold text-[#2A2626] text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'included' && (
                <div className="space-y-2 text-xs">
                  <p className="text-[#78716C] mb-3">Every equipment rental is sealed in specialized protective cases along with essential accessories:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(product.includedItems || ['Primary Unit & Accessories', 'Hard Protective Case', 'Cables & Power Adapters', 'Quick Start Guide']).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 bg-[#F5F4F0] rounded-xl border border-[#E7E5E4]/30 font-semibold text-[#2A2626]">
                        <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'terms' && (
                <div className="space-y-3 text-xs text-[#2A2626]">
                  <div className="p-3 bg-[#E7E5E4]/20 rounded-xl border border-[#E7E5E4]/40 flex items-start gap-2">
                    <ShieldCheck size={18} className="text-[#4A5D23] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-sm font-bold text-[#2A2626]">Security & Deposit Terms</strong>
                      <span>{product.terms || 'Standard damage protection included. Security deposit is fully refundable within 2 hours of verified return.'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                    <div className="text-4xl font-extrabold text-[#2A2626] font-['Sora']">{avgRating}</div>
                    <div>
                      <div className="flex text-yellow-500 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={16} className={s <= Math.round(avgRating) ? "fill-yellow-500" : "text-gray-300"} />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">{totalReviewsCount} verified reviews</div>
                    </div>
                  </div>
                  
                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviewsList.length === 0 ? (
                      <div className="text-sm text-gray-500">No reviews yet for this product.</div>
                    ) : (
                      reviewsList.map((rev) => (
                        <div key={rev.id} className="p-4 bg-[#F5F4F0] rounded-2xl border border-[#E7E5E4]/40">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-bold text-sm text-[#2A2626]">{rev.users?.name || 'Customer'}</div>
                              <div className="text-[10px] text-gray-500">{new Date(rev.created_at).toLocaleDateString()}</div>
                            </div>
                            <div className="flex text-yellow-500">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={12} className={s <= rev.rating ? "fill-yellow-500" : "text-gray-300"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-[#2A2626] mt-2">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Write a Review */}
                  {user ? (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <h4 className="font-bold text-sm mb-4">Write a Review</h4>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setNewReviewRating(s)}
                                className={`p-1 transition-colors ${s <= newReviewRating ? 'text-yellow-500' : 'text-gray-300'}`}
                              >
                                <Star size={20} className={s <= newReviewRating ? "fill-yellow-500" : ""} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Comment</label>
                          <textarea
                            className="w-full p-3 bg-white border border-[#E7E5E4] rounded-xl text-xs font-medium focus:outline-none focus:border-[#4A5D23]"
                            rows="3"
                            placeholder="Share your experience with this equipment..."
                            value={newReviewComment}
                            onChange={(e) => setNewReviewComment(e.target.value)}
                            required
                          ></textarea>
                        </div>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-6 py-2.5 bg-[#2A2626] text-white text-xs font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs">
                      <Link to="/auth" className="text-[#4A5D23] font-bold hover:underline">Log in</Link> to write a review.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Availability Calendar */}
            <div className="bg-white rounded-3xl border border-[#E7E5E4]/40 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-[#2A2626] font-['Sora'] flex items-center gap-2">
                <Calendar size={18} className="text-[#4A5D23]" />
                <span>Availability Calendar</span>
              </h3>
              <AvailabilityCalendar onDatesChange={handleDatesFromCalendar} />
            </div>
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4]/40 shadow-xl space-y-6">

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#2A2626] uppercase tracking-wider block">
                  Select Rental Duration
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'hour', label: 'Hourly', rate: product.pricePerHour || Math.round(baseRate / 8) },
                    { id: 'day', label: 'Daily', rate: baseRate },
                    { id: 'week', label: 'Weekly', rate: product.pricePerWeek || (baseRate * 5) },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setDurationMode(tier.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${durationMode === tier.id
                        ? 'bg-[#2A2626] text-white border-[#2A2626] shadow-md'
                        : 'bg-[#F5F4F0] text-[#78716C] border-[#E7E5E4] hover:text-[#2A2626]'
                        }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider">{tier.label}</div>
                      <div className="text-xs font-extrabold mt-0.5">₹{tier.rate?.toLocaleString('en-IN')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Inputs */}
              <div className="space-y-3 bg-[#F5F4F0] p-4 rounded-2xl border border-[#E7E5E4]/40 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#78716C] uppercase text-[10px] mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-[#E7E5E4] font-bold text-[#2A2626]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#78716C] uppercase text-[10px] mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-[#E7E5E4] font-bold text-[#2A2626]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-[#2A2626]">Units Quantity:</span>
                  <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-xl border border-[#E7E5E4]">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="font-bold text-[#4A5D23]">-</button>
                    <span className="font-extrabold text-sm text-[#2A2626]">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="font-bold text-[#4A5D23]">+</button>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <label className="block font-bold text-[#78716C] uppercase text-[10px] mb-2">Delivery Preference</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDeliveryType('doorstep')}
                      className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${deliveryType === 'doorstep' ? 'bg-[#4A5D23] text-white border-[#4A5D23]' : 'bg-white text-[#78716C] border-[#E7E5E4]'}`}
                    >
                      <Truck size={13} /> Doorstep
                    </button>
                    <button
                      onClick={() => setDeliveryType('store_pickup')}
                      className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${deliveryType === 'store_pickup' ? 'bg-[#4A5D23] text-white border-[#4A5D23]' : 'bg-white text-[#78716C] border-[#E7E5E4]'}`}
                    >
                      <Store size={13} /> Pickup
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-[#2A2626]">
                <div className="flex justify-between">
                  <span className="text-[#78716C]">Rental Subtotal:</span>
                  <span className="font-bold">₹{rentalSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C] flex items-center gap-1">
                    <Truck size={13} className="text-[#2A2626]" /> Delivery:
                  </span>
                  <span className="font-bold">₹{deliveryFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C] flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-600" /> Refundable Deposit:
                  </span>
                  <span className="font-bold text-emerald-700">₹{depositTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                  <div className="text-[11px] font-extrabold uppercase text-[#78716C]">Estimated Total</div>
                  <div className="text-2xl font-extrabold text-[#2A2626] font-['Sora']">₹{estimatedTotal.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRentNow}
                className="w-full py-4 rounded-2xl bg-[#4A5D23] hover:bg-[#36451A] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all"
              >
                <span>Rent Now • Reserve Instantly</span>
                <ArrowRight size={16} />
              </button>
              
              <button
                onClick={handleRequestQuote}
                disabled={requestingQuote}
                className="w-full py-3 rounded-2xl bg-white border-2 border-[#4A5D23] text-[#4A5D23] hover:bg-[#F5F4F0] font-extrabold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <FileText size={16} />
                <span>{requestingQuote ? 'Requesting...' : 'Request Custom Quote'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#E7E5E4]/40 space-y-6">
            <h3 className="text-2xl font-extrabold text-[#2A2626] font-['Sora']">Similar Rentals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => {
                const relImg = rel.images?.[0] || rel.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
                const relRate = rel.daily_rate || rel.pricePerDay || 500;
                return (
                  <div
                    key={rel.id}
                    onClick={() => navigate(`/products/${rel.id}`)}
                    className="bg-white rounded-3xl p-4 border border-[#E7E5E4]/40 cursor-pointer space-y-3"
                  >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 relative">
                      <img src={relImg} alt={rel.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#2A2626]/85 text-white text-[10px] font-bold">
                        ₹{relRate} / day
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#2A2626] line-clamp-1">{rel.title}</h4>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}