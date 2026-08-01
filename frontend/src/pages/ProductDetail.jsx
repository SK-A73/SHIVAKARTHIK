import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OrderModal from '../components/OrderModal';
import ProductCard from '../components/ProductCard';
import API from '../api/client';
import { ArrowLeft, MessageSquare, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    // PATCH 2 & 4: Always scroll to top smoothly when this page opens
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.product);

        const allRes = await API.get('/products');
        if (allRes.data.success) {
          const related = allRes.data.products.filter(
            p => p.category === res.data.product.category && p.id !== res.data.product.id
          );
          setRelatedProducts(related.slice(0, 3));
        }
      } else {
        setError('Product not found.');
      }
    } catch (err) {
      console.error('Failed to load product detail:', err);
      setError('Product not found or has been removed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--color-gold-deep)', fontFamily: 'var(--font-accent)' }}>
          ✨ Loading Ganesha idol details...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🪔</div>
          <h2 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>{error || 'Idol Not Found'}</h2>
          <button className="btn-gold-primary" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Return to Catalog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const imageUrl = product.image_url
    ? product.image_url.startsWith('http')
      ? product.image_url
      : product.image_url.startsWith('sample_')
        ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'
        : `http://localhost:5000/uploads/products/${product.image_url}`
    : 'https://via.placeholder.com/600?text=No+Image';

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', color: 'var(--color-maroon)', fontSize: '0.95rem', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
            <ArrowLeft size={18} /> Back to Catalog
          </button>

          <div className="product-detail-grid luxury-card" style={{ padding: '2.5rem', background: '#FFFFFF' }}>
            <div className="product-detail-gallery">
              <img
                src={imageUrl}
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop';
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                <span className="badge badge-featured">{product.category}</span>
                <span className={`badge ${isOutOfStock ? 'badge-outofstock' : 'badge-stock'}`}>
                  {isOutOfStock ? (
                    <><AlertTriangle size={14} /> Out of Stock</>
                  ) : (
                    <><CheckCircle2 size={14} /> In Stock ({product.stock} available)</>
                  )}
                </span>
              </div>

              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)', color: 'var(--color-maroon)' }}>{product.name}</h1>
              
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-gold-deep)', marginBottom: '1.5rem', fontFamily: 'var(--font-accent)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </div>

              <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(199, 154, 59, 0.2)', borderBottom: '1px solid rgba(199, 154, 59, 0.2)', padding: '1.5rem 0' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-maroon)', marginBottom: '0.75rem', fontFamily: 'var(--font-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="var(--color-gold-primary)" /> Craftsmanship & Divine Significance
                </h3>
                <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: '1.8' }}>{product.description}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--color-gold-deep)', fontWeight: 600 }}>
                <ShieldCheck size={20} /> Handcrafted Genuine Quality • Direct WhatsApp Confirmation
              </div>

              <div style={{ marginTop: 'auto' }}>
                <button
                  className="btn-whatsapp-gold"
                  style={{ padding: '1.1rem 2rem', fontSize: '1.15rem', opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                  disabled={isOutOfStock}
                  onClick={() => setShowOrderModal(true)}
                >
                  <MessageSquare size={22} /> Order Now via WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Related Products Grid */}
          {relatedProducts.length > 0 && (
            <div style={{ marginTop: '5rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem' }}>Similar Sacred Collections</h2>
              </div>
              <div className="products-grid-section">
                {relatedProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onOrderNow={() => {
                      setProduct(p);
                      setShowOrderModal(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {showOrderModal && (
        <OrderModal
          product={product}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
