import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import OrderModal from '../components/OrderModal';
import Footer from '../components/Footer';
import API from '../api/client';
import useScrollRestoration from '../hooks/useScrollRestoration';
import { Sparkles, Layers } from 'lucide-react';
import { trackCategorySelected, trackProductSearch } from '../utils/analytics';

import initialProducts from '../data/initialProducts.json';
import initialSettings from '../data/initialSettings.json';

const getInitialProducts = () => {
  try {
    const cached = localStorage.getItem('cached_products');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return initialProducts || [];
};

const getInitialSettings = () => {
  try {
    const cached = localStorage.getItem('cached_settings');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed) return parsed;
    }
  } catch (e) {}
  return initialSettings || null;
};

const Home = () => {
  // Restore scroll position when returning from Product Detail
  useScrollRestoration();

  // Instant landing: Initialize immediately from cache or bundled initial data
  const [products, setProducts] = useState(getInitialProducts);
  const [categories, setCategories] = useState(() => {
    const list = getInitialProducts();
    return ['All', ...new Set(list.map(p => p.category))];
  });
  const [loading, setLoading] = useState(() => getInitialProducts().length === 0);
  const [error, setError] = useState(null);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [settings, setSettings] = useState(getInitialSettings);

  // Preserve filter state in sessionStorage so Back navigation keeps the selection
  const [selectedCategory, setSelectedCategory] = useState(
    () => sessionStorage.getItem('shop_selectedCategory') || 'All'
  );
  const [searchTerm, setSearchTerm] = useState(
    () => sessionStorage.getItem('shop_searchTerm') || ''
  );

  // Persist filter choices whenever they change
  useEffect(() => {
    sessionStorage.setItem('shop_selectedCategory', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    sessionStorage.setItem('shop_searchTerm', searchTerm);
  }, [searchTerm]);

  // Debounced search tracking (avoids sending events on every keystroke)
  useEffect(() => {
    if (searchTerm && searchTerm.trim().length >= 2) {
      const handler = setTimeout(() => {
        trackProductSearch(searchTerm.trim());
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [searchTerm]);

  // Fetch fresh data in the background to seamlessly revalidate
  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings');
      if (res.data.success) {
        setSettings(res.data.settings);
        try {
          localStorage.setItem('cached_settings', JSON.stringify(res.data.settings));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchProducts = async (attempt = 1) => {
    // If we already have products displayed, don't show full-page loading blocker
    if (products.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await API.get('/products');
      if (res.data.success) {
        setProducts(res.data.products);
        const uniqueCategories = ['All', ...new Set(res.data.products.map(p => p.category))];
        setCategories(uniqueCategories);
        try {
          localStorage.setItem('cached_products', JSON.stringify(res.data.products));
        } catch (e) {}
      }
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching products (Attempt ${attempt}):`, err);
      if (attempt < 3) {
        const delay = attempt * 1500; // 1.5s then 3s
        setTimeout(() => fetchProducts(attempt + 1), delay);
      } else {
        if (products.length === 0) {
          setError('Unable to load products. Please check your connection.');
        }
        setLoading(false);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = searchTerm.trim() === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const featuredProducts = filteredProducts.filter(p => p.featured === 1);

  return (
    <div className="app-container">
      <Navbar onSearchChange={setSearchTerm} searchTerm={searchTerm} />

      <main className="main-content">
        <Hero shopName={settings?.shopName} />

        <div className="container" id="catalog-section" style={{ paddingTop: '2.5rem' }}>
          {/* Filter & Search Controls */}
          <div className="filter-search-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-maroon)', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-accent)' }}>
              <Layers size={18} color="var(--color-gold-deep)" /> Categories:
            </div>
            
            <div className="category-pill-list">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    trackCategorySelected(cat);
                    setSelectedCategory(cat);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Idols Showcase */}
          {featuredProducts.length > 0 && selectedCategory === 'All' && !searchTerm && (
            <div style={{ marginBottom: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles color="var(--color-gold-primary)" size={24} /> 
                  Divine Featured Idols
                </h2>
                <span className="badge badge-featured">Exclusive Craftsmanship</span>
              </div>
              <div className="products-grid-section">
                {featuredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOrderNow={setSelectedProductForOrder}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Main Catalog Grid */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.85rem' }}>
              {selectedCategory === 'All' ? 'Sacred Ganesha Catalog' : `${selectedCategory} Collection`}
              <span style={{ fontSize: '1rem', color: 'var(--color-text-light)', marginLeft: '0.85rem', fontWeight: 'normal', fontFamily: 'var(--font-body)' }}>
                
              </span>
            </h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-gold-deep)', fontSize: '1.1rem', fontFamily: 'var(--font-accent)' }}>
              ✨ Loading handcrafted idols...
            </div>
          ) : error ? (
            <div className="luxury-card" style={{ padding: '4rem 2rem', textAlign: 'center', background: '#FFFFFF' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>Connection Error</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{error}</p>
              <button 
                onClick={() => fetchProducts(1)}
                className="btn-gold-primary" 
                style={{ padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer' }}
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="luxury-card" style={{ padding: '4rem 2rem', textAlign: 'center', background: '#FFFFFF' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🪔</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>No Idols Found</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Try adjusting your search query or category selection.</p>
            </div>
          ) : (
            <div className="products-grid-section">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOrderNow={setSelectedProductForOrder}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {selectedProductForOrder && (
        <OrderModal
          product={selectedProductForOrder}
          onClose={() => setSelectedProductForOrder(null)}
        />
      )}
    </div>
  );
};

export default Home;
