import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Sparkles, AlertTriangle } from 'lucide-react';

const ProductCard = ({ product, onOrderNow }) => {
  const navigate = useNavigate();

  const imageUrl = product.image_url
    ? product.image_url.startsWith('http')
      ? product.image_url
      : product.image_url.startsWith('sample_')
        ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop'
        : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://shivakarthik.onrender.com'}/uploads/products/${product.image_url}`
    : 'https://via.placeholder.com/500?text=No+Image';

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="luxury-card product-card-luxury">
      <div 
        className="product-img-box" 
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img 
          src={imageUrl} 
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop';
          }} 
        />
        <div className="product-badge-wrap">
          {product.featured === 1 && (
            <span className="badge badge-featured">
              <Sparkles size={12} /> Divine Highlight
            </span>
          )}
          {/* PATCH 1: Only show badge when Out of Stock. In Stock badge removed. */}
          {isOutOfStock && (
            <span className="badge badge-outofstock">
              <AlertTriangle size={12} /> Out of Stock
            </span>
          )}
        </div>
      </div>

      <div className="product-card-content">
        <span className="product-card-cat">{product.category}</span>
        <h3 
          className="product-card-heading" 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </h3>
        <p className="product-card-description">{product.description}</p>

        <div className="product-card-bottom" style={{ gap: '0.4rem' }}>
          <div className="product-card-price-tag" style={{ fontSize: '1.25rem', whiteSpace: 'nowrap' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </div>
          
          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
            <button
              onClick={() => navigate(`/product/${product.id}`)}
              style={{
                background: 'var(--color-cream)',
                border: '1px solid var(--color-gold-primary)',
                color: 'var(--color-maroon)',
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
              title="View Details"
            >
              <Eye size={14} /> Details
            </button>

            <button
              className="btn-gold-primary"
              disabled={isOutOfStock}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                opacity: isOutOfStock ? 0.5 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onOrderNow(product);
              }}
            >
              <ShoppingCart size={14} /> Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
