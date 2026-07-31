import React from 'react';
import Logo from './Logo';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-luxury">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3.5rem', marginBottom: '3rem' }}>

          {/* LEFT COLUMN — Brand Information */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <Logo size={44} showText={true} />
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.8', color: 'var(--color-text-muted)', maxWidth: '420px' }}>
              Curators of premium handcrafted Ganesha idols and festive spiritual collections. Bringing divine elegance and blessings to your home celebrations with direct WhatsApp ordering.
            </p>
          </div>

          {/* RIGHT COLUMN — Connect With Us (merged with Contact) */}
          <div>
            <h4 style={{ fontSize: '1.15rem', color: 'var(--color-maroon)', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.03em' }}>
              Connect With Us
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>
              {/* Address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={18} color="var(--color-gold-deep)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Lingarajapuram, Bangalore</span>
              </div>

              {/* WhatsApp Numbers */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Phone size={18} color="var(--color-gold-deep)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <a href="https://wa.me/919148572775" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                    +91 9148572775
                  </a>
                  <a href="https://wa.me/918553119757" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                    +91 8553119757
                  </a>
                </div>
              </div>

              {/* Email */}

            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(199, 154, 59, 0.2)', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
          <p>© {new Date().getFullYear()} SHIVA KARTHIK GANESHA COLLECTIONS. All rights reserved. Handcrafted Ganesha Collections.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
