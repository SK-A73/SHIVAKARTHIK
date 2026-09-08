import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Sparkles, AlertTriangle } from 'lucide-react';
import { trackProductCardClick, trackProductDetailsClick, trackOrderNowClick } from '../utils/analytics';

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
  const isSoldOut = product.is_sold_out === 1 || product.is_sold_out === true;

  const handleCardNavigation = () => {
    trackProductCardClick({
      product_id: product.id,
      product_name: product.name,
      category: product.category
    });
    navigate(`/product/${product.id}`);
  };

  const handleDetailsClick = () => {
    trackProductDetailsClick({
      product_id: product.id,
      product_name: product.name,
      category: product.category
    });
    navigate(`/product/${product.id}`);
  };

  const handleOrderClick = (e) => {
    e.stopPropagation();
    if (isSoldOut || isOutOfStock) return;
    trackOrderNowClick({
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      price: product.price
    });
    onOrderNow(product);
  };

  return (
    <div className="luxury-card product-card-luxury">
      <div 
        className="product-img-box" 
        style={{ cursor: 'pointer', position: 'relative' }}
        onClick={handleCardNavigation}
      >
        <img 
          src={imageUrl} 
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop';
          }} 
        />

        {/* Prominent SOLD OUT badge on top of product image matching reference */}
        {isSoldOut && (
          <div
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              zIndex: 3,
              width: '82px',
              height: '70px',
              pointerEvents: 'none'
            }}
          >
            <img
              src="/sold-out-badge.png"
              alt="Sold Out"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))'
              }}
            />
          </div>
        )}

        <div className="product-badge-wrap">
          {product.featured === 1 && (
            <span className="badge badge-featured">
              <Sparkles size={12} /> Divine Highlight
            </span>
          )}
          {/* PATCH 1: Only show badge when Out of Stock and not already marked Sold Out */}
          {isOutOfStock && !isSoldOut && (
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
          onClick={handleCardNavigation}
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
              onClick={handleDetailsClick}
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

            {isSoldOut ? (
              <button
                disabled
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#9CA3AF',
                  color: '#FFFFFF',
                  border: '1px solid #9CA3AF',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'not-allowed',
                  fontWeight: 600
                }}
                title="This product is currently Sold Out"
              >
                <ShoppingCart size={14} /> Sold Out
              </button>
            ) : (
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
                onClick={handleOrderClick}
              >
                <ShoppingCart size={14} /> Order Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
