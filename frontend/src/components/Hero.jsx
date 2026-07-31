import React from 'react';
import logoImg from '../assets/images/logo.png';
import { Sparkles, ShoppingBag, MessageSquare } from 'lucide-react';

const Hero = ({ shopName }) => {
  const brandTitle = shopName || 'SHIVA KARTHIK GANESHA COLLECTIONS';

  return (
    <section className="hero-luxury-section">
      <div className="container">
        {/* Centered Logo Frame */}
        <div className="hero-logo-frame float-gentle">
          <img
            src={logoImg}
            alt="SHIVA KARTHIK GANESHA COLLECTIONS"
            className="hero-logo-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logo.png';
            }}
          />
        </div>

        <div className="badge badge-featured" style={{ marginBottom: '1.25rem' }}>
          <Sparkles size={14} color="var(--color-maroon)" /> Direct WhatsApp Orders • Handcrafted Sacred Idols
        </div>

        <h1 className="hero-heading">
          {brandTitle}
        </h1>

        <p className="hero-subheading">
          Premium Handcrafted Ganesha Idols for Every Celebration. Discover our exquisite traditional collection crafted with divine elegance.
        </p>

        <div className="hero-cta-wrap">
          <a href="#catalog-section" className="btn-gold-primary">
            <ShoppingBag size={18} /> Explore Collection
          </a>
          <a 
            href="https://wa.me/919148572774" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-maroon-secondary"
          >
            <MessageSquare size={18} /> Order on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
