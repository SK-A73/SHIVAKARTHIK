import React, { useState } from 'react';
import API from '../api/client';
import { X, MessageSquare, Plus, Minus, User, Phone, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';
import { trackWhatsAppOrderClick } from '../utils/analytics';

const OrderModal = ({ product, onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderData, setPlacedOrderData] = useState(null);

  if (!product || product.is_sold_out === 1 || product.is_sold_out === true) return null;

  const total = (product.price * quantity).toLocaleString('en-IN');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission

    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create and save order in PostgreSQL Database
      const response = await API.post('/orders', {
        customerName: customerName.trim(),
        phone: phone.trim(),
        productId: product.id,
        quantity: quantity
      });

      if (response.data && response.data.success && response.data.order) {
        const orderData = response.data.order;
        setPlacedOrderData(orderData);
        setOrderPlaced(true);
        setLoading(false);

        // 2. Track analytics event
        trackWhatsAppOrderClick({
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          quantity: quantity,
          total_amount: orderData.totalAmount || (product.price * quantity)
        });

        // 3. Open WhatsApp reliably across desktop and mobile
        const whatsappUrl = orderData.whatsappUrl;
        if (whatsappUrl) {
          const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            // On mobile devices, window.location.href automatically launches the native WhatsApp app
            window.location.href = whatsappUrl;
          } else {
            // On desktop, window.open opens WhatsApp Web in a new tab
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          }
        }
      } else {
        setLoading(false);
        setError(response.data?.message || 'Failed to place order in database. Please try again.');
      }
    } catch (err) {
      console.error('Order placement database error:', err);
      setLoading(false);
      setError(
        err.response?.data?.message ||
        'Unable to connect to the database to place your order. Please check your connection and try again.'
      );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-luxury" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(199, 154, 59, 0.25)', paddingBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gold-deep)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Divine Order Portal
            </span>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-maroon)', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
              {orderPlaced ? 'Order Confirmation' : 'Place Order via WhatsApp'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'var(--color-cream)', border: '1px solid var(--color-gold-primary)', color: 'var(--color-maroon)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {orderPlaced && placedOrderData ? (
          <div>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <CheckCircle2 size={36} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.45rem', color: 'var(--color-maroon)', fontFamily: 'var(--font-heading)', marginBottom: '0.4rem' }}>
                Order Placed Successfully!
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                Your order reference ID is <strong style={{ color: 'var(--color-maroon)' }}>#{placedOrderData.id}</strong>
              </p>

              <div style={{ background: 'var(--color-cream)', padding: '1.15rem', borderRadius: '8px', border: '1px solid var(--color-gold-primary)', textAlign: 'left', marginBottom: '1.75rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <div><strong>Product:</strong> {placedOrderData.productName || product.name}</div>
                <div><strong>Quantity:</strong> {placedOrderData.quantity || quantity} item(s)</div>
                <div><strong>Total Amount:</strong> <span style={{ color: 'var(--color-gold-deep)', fontWeight: 800 }}>₹{(placedOrderData.totalAmount || (product.price * quantity)).toLocaleString('en-IN')}</span></div>
                <div><strong>Customer:</strong> {placedOrderData.customerName} ({placedOrderData.phone})</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <a
                  href={placedOrderData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-gold"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1.05rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <MessageSquare size={20} /> Open WhatsApp Chat
                </a>
                <button
                  type="button"
                  className="admin-nav-btn"
                  onClick={onClose}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', cursor: 'pointer' }}
                >
                  Done / Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ background: 'var(--color-cream)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--color-gold-primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'var(--gradient-gold)', width: '44px', height: '44px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShoppingBag size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-maroon)', fontFamily: 'var(--font-heading)' }}>{product.name}</div>
                <div style={{ color: 'var(--color-gold-deep)', fontSize: '0.9rem', fontWeight: 600 }}>Price: ₹{product.price.toLocaleString('en-IN')} per unit</div>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid rgba(225, 29, 72, 0.3)', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  <User size={15} color="var(--color-gold-deep)" /> Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  <Phone size={15} color="var(--color-gold-deep)" /> Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Quantity *
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'var(--color-cream)', border: '1px solid var(--color-gold-primary)', color: 'var(--color-maroon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      style={{ width: '80px', textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'var(--color-cream)', border: '1px solid var(--color-gold-primary)', color: 'var(--color-maroon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                    Stock Available: {product.stock}
                  </span>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0', padding: '1.15rem 0', borderTop: '1px solid rgba(199, 154, 59, 0.25)', borderBottom: '1px solid rgba(199, 154, 59, 0.25)' }}>
                <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>Total Order Price:</span>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-gold-deep)', fontFamily: 'var(--font-accent)' }}>₹{total}</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className="admin-nav-btn"
                  onClick={onClose}
                  style={{ flex: 1, justifyContent: 'center', cursor: 'pointer' }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-whatsapp-gold"
                  disabled={loading}
                  style={{ flex: 2, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Processing Order...' : <><MessageSquare size={18} /> Confirm Order</>}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderModal;

