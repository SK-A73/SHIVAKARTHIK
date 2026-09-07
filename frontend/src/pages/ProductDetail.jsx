import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OrderModal from '../components/OrderModal';
import ProductCard from '../components/ProductCard';
import API from '../api/client';
import { ArrowLeft, MessageSquare, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ZoomIn, X } from 'lucide-react';
import { trackViewProduct, trackOrderNowClick } from '../utils/analytics';

import initialProducts from '../data/initialProducts.json';

const getProductFromCacheOrInitial = (id) => {
  try {
    const cached = localStorage.getItem('cached_products');
    if (cached) {
      const list = JSON.parse(cached);
      const found = list.find(p => String(p.id) === String(id));
      if (found) return found;
    }
  } catch (e) {}
  return initialProducts.find(p => String(p.id) === String(id)) || null;
};

const getRelatedFromCacheOrInitial = (currentProduct) => {
  if (!currentProduct) return [];
  try {
    const cached = localStorage.getItem('cached_products');
    const list = cached ? JSON.parse(cached) : initialProducts;
    return list.filter(p => p.category === currentProduct.category && String(p.id) !== String(currentProduct.id)).slice(0, 3);
  } catch (e) {
    return [];
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const initialProduct = getProductFromCacheOrInitial(id);
  const [product, setProduct] = useState(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState(() => getRelatedFromCacheOrInitial(initialProduct));
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    if (isImageOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsImageOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isImageOpen]);

  useEffect(() => {
    // PATCH 2 & 4: Always scroll to top smoothly when this page opens
    window.scrollTo({ top: 0, behavior: 'instant' });
    const p = getProductFromCacheOrInitial(id);
    if (p) {
      setProduct(p);
      setRelatedProducts(getRelatedFromCacheOrInitial(p));
      setLoading(false);
    }
    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    if (product) {
      trackViewProduct({
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        price: product.price
      });
    }
  }, [product?.id]);

  const fetchProductDetails = async () => {
    if (!product) setLoading(true);
    try {
      const res = await API.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.product);

        const allRes = await API.get('/products');
        if (allRes.data.success) {
          const related = allRes.data.products.filter(
            p => p.category === res.data.product.category && String(p.id) !== String(res.data.product.id)
          );
          setRelatedProducts(related.slice(0, 3));
          try {
            localStorage.setItem('cached_products', JSON.stringify(allRes.data.products));
          } catch (e) {}
        }
      } else {
        if (!product) setError('Product not found.');
      }
    } catch (err) {
      console.error('Failed to load product detail:', err);
      if (!product) setError('Product not found or has been removed.');
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
        : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://shivakarthik.onrender.com'}/uploads/products/${product.image_url}`
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
            <div
              className="product-detail-gallery"
              onClick={() => setIsImageOpen(true)}
              style={{ cursor: 'pointer', position: 'relative' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsImageOpen(true);
                }
              }}
              title="Click or tap to enlarge image"
            >
              <img
                src={imageUrl}
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop';
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(255, 253, 247, 0.95)',
                  border: '1px solid var(--color-gold-primary)',
                  borderRadius: '20px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  color: 'var(--color-maroon)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  pointerEvents: 'none'
                }}
              >
                <ZoomIn size={14} color="var(--color-gold-deep)" /> Tap to enlarge
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                <span className="badge badge-featured">{product.category}</span>
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
                  onClick={() => {
                    trackOrderNowClick({
                      product_id: product.id,
                      product_name: product.name,
                      category: product.category,
                      price: product.price
                    });
                    setShowOrderModal(true);
                  }}
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

      {/* Enlarged Image Lightbox Modal */}
      {isImageOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsImageOpen(false)}
          style={{
            zIndex: 9999,
            backgroundColor: 'rgba(12, 10, 8, 0.88)',
            backdropFilter: 'blur(8px)',
            padding: '1.25rem',
            cursor: 'zoom-out'
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsImageOpen(false)}
              aria-label="Close enlarged image"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255, 253, 247, 0.96)',
                border: '1.5px solid var(--color-gold-primary)',
                color: 'var(--color-maroon)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>

            {/* High-Resolution Full-Size Image */}
            <img
              src={imageUrl}
              alt={product.name}
              style={{
                maxWidth: '90vw',
                maxHeight: '82vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '12px',
                border: '2px solid var(--color-gold-primary)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
                background: '#FFFFFF',
                display: 'block'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&auto=format&fit=crop';
              }}
            />

            {/* Product Title Caption & Tap to close hint */}
            <div
              style={{
                marginTop: '0.75rem',
                color: '#FFFDF7',
                fontSize: '0.92rem',
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                textAlign: 'center',
                letterSpacing: '0.04em',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              {product.name} <span style={{ opacity: 0.75, fontWeight: 400, fontSize: '0.8rem' }}>• Tap outside or ✕ to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
