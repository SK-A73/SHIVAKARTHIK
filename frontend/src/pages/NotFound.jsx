import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import { Home as HomeIcon } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '6rem' }}>
        <div className="luxury-card" style={{ padding: '3.5rem', maxWidth: '520px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Logo size={80} showText={false} />
          </div>
          <div style={{ fontSize: '4.5rem', color: 'var(--color-gold-deep)', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>404</div>
          <h2 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-maroon)' }}>Page Not Found</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', lineHeight: '1.7' }}>
            The requested page does not exist or has been moved.
          </p>
          <button className="btn-gold-primary" onClick={() => navigate('/')} style={{ margin: '0 auto' }}>
            <HomeIcon size={18} /> Return to Homepage
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
