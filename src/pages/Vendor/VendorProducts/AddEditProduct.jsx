import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Upload,
  ArrowLeft,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  Info,
  Loader2
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import './AddEditProduct.css';

const CATEGORIES = [
  'Cameras & Photography',
  'Drones & Aerial',
  'Electronics & Gaming',
  'Lighting & Studio',
  'Event & Sound Gear',
  'Vehicles & Superbikes',
  'Adventure & Camping'
];

export default function AddEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: CATEGORIES[0],
    brand: '',
    pricePerDay: '',
    discountPrice: '',
    securityDeposit: '',
    stock: 1,
    minStockAlert: 1,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    description: '',
    dimensions: '',
    weight: '',
    tags: ''
  });

  // Jo Edit mode hoy toh database mathi product details fetch karo
  useEffect(() => {
    if (isEditMode) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('vendor_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          name: data.title || data.name || '',
          sku: data.sku || '',
          category: data.category || CATEGORIES[0],
          brand: data.brand || '',
          pricePerDay: data.daily_rate || data.pricePerDay || '',
          discountPrice: data.discount_price || data.discountPrice || '',
          securityDeposit: data.security_deposit || data.securityDeposit || '',
          stock: data.stock_count || data.stock || 1,
          minStockAlert: data.min_stock_alert || data.minStockAlert || 1,
          status: data.status || 'Active',
          image: Array.isArray(data.images) ? data.images[0] : (data.image || data.images || ''),
          description: data.description || '',
          dimensions: data.dimensions || '',
          weight: data.weight || '',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || '')
        });
      }
    } catch (err) {
      console.error('Error fetching product for edit:', err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categorySlugMapping = {
        'Cameras & Photography': 'cameras',
        'Drones & Aerial': 'drones',
        'Electronics & Gaming': 'electronics',
        'Lighting & Studio': 'lighting',
        'Event & Sound Gear': 'event-party',
        'Vehicles & Superbikes': 'vehicles',
        'Adventure & Camping': 'sports-outdoor'
      };

      const productPayload = {
        title: formData.name, // Database column name mapping
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        categorySlug: categorySlugMapping[formData.category] || 'general',
        brand: formData.brand,
        daily_rate: Number(formData.pricePerDay),
        pricePerDay: Number(formData.pricePerDay),
        discount_price: formData.discountPrice ? Number(formData.discountPrice) : null,
        security_deposit: Number(formData.securityDeposit) || 0,
        stock_count: Number(formData.stock),
        stock: Number(formData.stock),
        min_stock_alert: Number(formData.minStockAlert),
        status: formData.status,
        images: formData.image ? [formData.image] : [],
        image: formData.image,
        description: formData.description,
        dimensions: formData.dimensions,
        weight: formData.weight,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        vendor_id: user?.id || null,
        vendor: { name: 'Rentora Partner', city: 'Ahmedabad' }
      };

      if (isEditMode) {
        // Update in Supabase
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', id)
          .eq('vendor_id', user.id);

        if (error) throw error;
        alert('Equipment successfully updated in live database! 🔄');
      } else {
        // Insert into Supabase
        const { error } = await supabase
          .from('products')
          .insert([productPayload]);

        if (error) throw error;
        alert('New equipment successfully published live! 🎉');
      }

      navigate('/vendor/products');
    } catch (err) {
      console.error('Error saving product:', err.message);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-16 text-center font-bold text-slate-500">Loading equipment details from database...</div>;
  }

  return (
    <div className="add-edit-product-page">
      {/* Top Header */}
      <div className="page-header-row">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/vendor/products')}
            className="btn-back-link"
            title="Back to Products"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-main-heading">
              {isEditMode ? `Edit Equipment: ${formData.name || 'Item'}` : 'Add New Equipment Listing'}
            </h1>
            <p className="page-sub-heading">
              {isEditMode
                ? 'Update specifications, rental pricing, and warehouse stock units.'
                : 'Publish high-demand gear to Rentora’s live multi-vendor database.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Form */}
      <form onSubmit={handleSubmit} className="product-form-layout">
        {/* Left Column: Core Specs */}
        <div className="form-col-left">
          {/* Basic Details Box */}
          <div className="v-form-card">
            <h3 className="v-form-card-title">General Information</h3>

            <div className="v-form-field">
              <label className="v-form-lbl">Equipment / Product Title *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sony Alpha FX3 Cinema Camera Full-Frame Kit"
                required
                className="v-form-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="v-form-field">
                <label className="v-form-lbl">SKU / Item Code *</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. PX-CAM-FX3-01"
                  required
                  className="v-form-input"
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Manufacturer / Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Sony, DJI, Apple"
                  required
                  className="v-form-input"
                />
              </div>
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Rental Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="v-form-select"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Product Description & Included Kit Items</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe key specs, included accessories (batteries, charger, cables), and ideal use-cases..."
                className="v-form-textarea"
              />
            </div>
          </div>

          {/* Pricing & Deposit Box */}
          <div className="v-form-card mt-5">
            <h3 className="v-form-card-title">Rental Pricing & Escrow Deposit</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="v-form-field">
                <label className="v-form-lbl">Daily Rental Rate (₹) *</label>
                <input
                  type="number"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  placeholder="1899"
                  required
                  className="v-form-input"
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Discounted Rate (₹)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="1699 (optional)"
                  className="v-form-input"
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Security Deposit (₹) *</label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  placeholder="3000"
                  required
                  className="v-form-input"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
              <Info size={12} className="text-charcoal-light" />
              <span>Deposits are held securely by Rentora Escrow until equipment return and inspection.</span>
            </p>
          </div>

          {/* Technical Specifications */}
          <div className="v-form-card mt-5">
            <h3 className="v-form-card-title">Physical Dimensions & Search Tags</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="v-form-field">
                <label className="v-form-lbl">Dimensions (L x W x H)</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="e.g. 129.7 x 77.8 x 84.5 mm"
                  className="v-form-input"
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Weight</label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 715 g"
                  className="v-form-input"
                />
              </div>
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Search Tags (Comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="cinema, 4k, video, fullframe, sony"
                className="v-form-input"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Imagery & Stock Controls */}
        <div className="form-col-right">
          {/* Image Upload Preview Box */}
          <div className="v-form-card">
            <h3 className="v-form-card-title">Product Image Showcase</h3>

            <div className="image-preview-box">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="img-preview" />
              ) : (
                <div className="img-placeholder">
                  <ImageIcon size={36} className="text-slate-300" />
                  <span>No image selected</span>
                </div>
              )}
            </div>

            <div className="v-form-field mt-3">
              <label className="v-form-lbl">Image URL (Unsplash or CDN)</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="v-form-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Inventory & Status Box */}
          <div className="v-form-card mt-5">
            <h3 className="v-form-card-title">Inventory & Listing Status</h3>

            <div className="v-form-field">
              <label className="v-form-lbl">Total Physical Units in Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="1"
                required
                className="v-form-input"
              />
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Low Stock Alert Threshold</label>
              <input
                type="number"
                name="minStockAlert"
                value={formData.minStockAlert}
                onChange={handleChange}
                min="1"
                className="v-form-input"
              />
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Catalog Listing Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="v-form-select"
              >
                <option value="Active">Active (Visible & Bookable)</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="v-form-actions-box mt-5">
            <button type="submit" disabled={loading} className="btn-v-primary w-full justify-center">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditMode ? 'Save & Update Listing' : 'Publish Product Listing'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/vendor/products')}
              className="btn-v-secondary w-full justify-center mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}