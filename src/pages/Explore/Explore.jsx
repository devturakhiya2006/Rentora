import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  ChevronDown,
  X,
  Heart,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tag
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { supabase } from '../../supabaseClient';
import { useBooking } from '../../context/BookingContext';
import './Explore.css';

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateBookingDraft } = useBooking();

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedDuration, setSelectedDuration] = useState('day'); // 'hour' | 'day' | 'week' | 'month'
  const [maxPrice, setMaxPrice] = useState(50000);
  const [instantOnly, setInstantOnly] = useState(false);
  const [selectedCity, setSelectedCity] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [wishlist, setWishlist] = useState({});

  // Supabase Data States
  const [dbProducts, setDbProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data from Supabase
  useEffect(() => {
    async function fetchExploreData() {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*')
      ]);

      if (prodRes.data) setDbProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
      setLoading(false);
    }
    fetchExploreData();
  }, []);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickRent = (product, e) => {
    e.stopPropagation();
    // Redirect to product details so users can see both Rent Now and Request Quote options
    navigate(`/products/${product.id}`);
  };

  // Robust Filter products logic matching Supabase columns
  const filteredProducts = useMemo(() => {
    return dbProducts.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q) || false;
        const matchesCat = item.category?.toLowerCase().includes(q) || false;
        const matchesVendor = item.vendor?.name?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesCat && !matchesVendor) return false;
      }

      // Category
      if (selectedCategory && selectedCategory !== 'all') {
        const itemCat = item.categorySlug || item.category || '';
        if (itemCat.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // City
      if (selectedCity && selectedCity !== 'all') {
        const vendorCity = item.vendor?.city || item.city || '';
        if (vendorCity.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }

      // Instant Booking
      if (instantOnly && !item.instantBooking) {
        return false;
      }

      // Min Rating
      if (minRating > 0 && (item.rating || 0) < minRating) {
        return false;
      }

      // Price Filter
      const baseRate = item.daily_rate || item.pricePerDay || item.price || 500;
      const price = selectedDuration === 'hour'
        ? (item.pricePerHour || item.price_per_hour || Math.round(baseRate / 8))
        : baseRate;

      if (price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.daily_rate || a.pricePerDay || a.price || 0;
      const priceB = b.daily_rate || b.pricePerDay || b.price || 0;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      return 0; // Default popular
    });
  }, [dbProducts, searchQuery, selectedCategory, selectedDuration, maxPrice, instantOnly, selectedCity, minRating, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDuration('day');
    setMaxPrice(50000);
    setInstantOnly(false);
    setSelectedCity('all');
    setMinRating(0);
    setSortBy('popular');
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F4F0] space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#E7E5E4] border-t-[#4A5D23] rounded-full animate-spin"></div>
          <div className="absolute w-5 h-5 bg-[#4A5D23] rounded-full animate-pulse"></div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-extrabold text-[#2A2626] font-['Sora'] tracking-wide flex items-center justify-center gap-1">
            Loading Catalog
            <span className="animate-bounce [animation-delay:-0.3s]">.</span>
            <span className="animate-bounce [animation-delay:-0.15s]">.</span>
            <span className="animate-bounce">.</span>
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb Navigation */}
        <Breadcrumb items={[{ label: 'Explore Products', link: '/products' }]} />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7E5E4]/30 text-[#2A2626] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-[#4A5D23]" />
              <span>Multi-Vendor Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2A2626] font-['Sora'] tracking-tight">
              Explore Rental Products
            </h1>
            <p className="text-sm text-[#78716C] mt-1 max-w-2xl">
              Browse thousands of verified products from top rental stores across Gujarat. Compare rates, check real-time availability, and rent with zero deposit.
            </p>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#E7E5E4] text-xs font-bold text-[#2A2626] flex items-center justify-center gap-2 shadow-sm"
            >
              <SlidersHorizontal size={15} className="text-[#4A5D23]" />
              <span>Filter Products ({filteredProducts.length})</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left Filter Sidebar + Right Products Listing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
            <div className="explore-filter-card space-y-6">

              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-bold text-[#2A2626] font-['Sora']">
                  <SlidersHorizontal size={16} className="text-[#4A5D23]" />
                  <span>Filter Catalog</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#4A5D23] hover:underline font-bold flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#2A2626] uppercase tracking-wider block">
                  Category
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${selectedCategory === 'all'
                        ? 'bg-[#2A2626] text-white font-bold'
                        : 'text-[#78716C] hover:bg-[#F5F4F0]'
                      }`}
                  >
                    <span>All Categories</span>
                    <span>{dbProducts.length}</span>
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${selectedCategory === cat.slug
                          ? 'bg-[#2A2626] text-white font-bold'
                          : 'text-[#78716C] hover:bg-[#F5F4F0]'
                        }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] opacity-75">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rental Duration Filter */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#2A2626] uppercase tracking-wider block">
                  Rental Duration
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-[#F5F4F0] p-1 rounded-xl">
                  {[
                    { id: 'hour', label: 'Hourly' },
                    { id: 'day', label: 'Daily' },
                    { id: 'week', label: 'Weekly' },
                    { id: 'month', label: 'Monthly' },
                  ].map((dur) => (
                    <button
                      key={dur.id}
                      onClick={() => setSelectedDuration(dur.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${selectedDuration === dur.id
                          ? 'bg-[#4A5D23] text-white shadow-sm'
                          : 'text-[#78716C] hover:text-[#2A2626]'
                        }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#2A2626] uppercase tracking-wider">Max Price</span>
                  <span className="font-bold text-[#4A5D23]">₹{maxPrice.toLocaleString('en-IN')} / day</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="50000"
                  step="200"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#4A5D23] cursor-pointer"
                />
              </div>

              {/* City / Location */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#2A2626] uppercase tracking-wider block">
                  Location / Hub
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F4F0] border border-[#E7E5E4] text-xs font-semibold text-[#2A2626] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Gujarat Cities</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Surat">Surat</option>
                  <option value="Vadodara">Vadodara</option>
                  <option value="Rajkot">Rajkot</option>
                  <option value="Gandhinagar">Gandhinagar</option>
                </select>
              </div>

            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="lg:col-span-9 space-y-6">

            {/* Top Bar: Search Bar & Sort Dropdown */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E7E5E4]/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="Search cameras, consoles, Thar, speakers, etc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="explore-search-input"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <span className="text-xs text-[#78716C] font-bold">
                  Showing <strong className="text-[#2A2626]">{filteredProducts.length}</strong> items
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#2A2626]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort by"
                    className="px-3 py-1.5 rounded-xl bg-[#F5F4F0] border border-[#E7E5E4] text-xs font-semibold text-[#2A2626] focus:outline-none cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated (4.9+)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const baseRate = product.daily_rate || product.pricePerDay || product.price || 500;
                  const price = selectedDuration === 'hour'
                    ? (product.pricePerHour || Math.round(baseRate / 8))
                    : selectedDuration === 'week'
                      ? (product.pricePerWeek || (baseRate * 5))
                      : selectedDuration === 'month'
                        ? (product.pricePerMonth || (baseRate * 18))
                        : baseRate;

                  const unit = selectedDuration === 'hour'
                    ? '/ hr'
                    : selectedDuration === 'week'
                      ? '/ wk'
                      : selectedDuration === 'month'
                        ? '/ mo'
                        : '/ day';

                  const imgUrl = product.images?.[0] || product.image || 'https://via.placeholder.com/400';
                  const vendorName = product.vendor?.name || product.vendor_name || 'Rentora Verified Hub';
                  const vendorCity = product.vendor?.city || product.city || 'Ahmedabad';

                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="group bg-white rounded-3xl overflow-hidden border border-[#E7E5E4]/40 card-shadow card-shadow-hover flex flex-col justify-between cursor-pointer transition-all duration-300"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#2A2626]/5">
                        <img
                          src={imgUrl}
                          alt={product.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                          <span className="px-2.5 py-1 rounded-full bg-[#2A2626]/80 text-[#F5F4F0] text-[11px] font-bold">
                            {product.category || 'Rental'}
                          </span>
                          <button
                            onClick={(e) => toggleWishlist(product.id, e)}
                            aria-label="Wishlist"
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${wishlist[product.id] ? 'bg-[#4A5D23] text-white scale-110' : 'bg-white/80 text-[#2A2626]'
                              }`}
                          >
                            <Heart size={16} fill={wishlist[product.id] ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-xs text-[#78716C] mb-1.5">
                            <span className="font-semibold text-[#2A2626] truncate max-w-[170px]">
                              {vendorName}
                            </span>
                            <span className="flex items-center gap-0.5 text-gray-500 text-[11px]">
                              <MapPin size={11} className="text-[#4A5D23]" /> {vendorCity}
                            </span>
                          </div>

                          <h3 className="text-base font-bold font-['Sora'] text-[#2A2626] group-hover:text-[#4A5D23] transition-colors line-clamp-2">
                            {product.title}
                          </h3>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[10px] text-gray-500 font-medium uppercase">Rental Rate</div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-extrabold text-[#2A2626] font-['Sora']">
                                ₹{price.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-[#78716C] font-medium">{unit}</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleQuickRent(product, e)}
                            className="px-3.5 py-2.5 rounded-xl bg-[#4A5D23] hover:bg-[#36451A] text-white text-xs font-bold shadow-md flex items-center gap-1"
                          >
                            <span>Rent Now</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E7E5E4]/40 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#E7E5E4]/30 text-[#78716C] flex items-center justify-center mx-auto">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#2A2626] font-['Sora']">No matching rental products found</h3>
                <button onClick={resetFilters} className="px-6 py-2.5 rounded-xl bg-[#4A5D23] text-white text-xs font-bold">
                  Reset All Filters
                </button>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}