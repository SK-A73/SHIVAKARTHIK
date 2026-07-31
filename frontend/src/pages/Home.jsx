import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import OrderModal from '../components/OrderModal';
import Footer from '../components/Footer';
import API from '../api/client';
import useScrollRestoration from '../hooks/useScrollRestoration';
import { Sparkles, Layers } from 'lucide-react';

const Home = () => {
  // Restore scroll position when returning from Product Detail
  useScrollRestoration();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings');
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/products');
      if (res.data.success) {
        setProducts(res.data.products);
        const uniqueCategories = ['All', ...new Set(res.data.products.map(p => p.category))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
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
                  onClick={() => setSelectedCategory(cat)}
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
                ({filteredProducts.length} items)
              </span>
            </h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-gold-deep)', fontSize: '1.1rem', fontFamily: 'var(--font-accent)' }}>
              ✨ Loading handcrafted idols...
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
