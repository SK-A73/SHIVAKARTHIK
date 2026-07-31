import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/client';
import Logo from './Logo';
import { Search, ShieldCheck, Lock, ShoppingBag } from 'lucide-react';

const Navbar = ({ onSearchChange, searchTerm }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/settings');
        if (res.data.success) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        console.error('Failed to load shop settings:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/">
          <Logo size={48} showText={true} />
        </Link>

        {onSearchChange && (
          <div className="search-input-wrap" style={{ maxWidth: '380px' }}>
            <Search className="search-input-icon" size={18} />
            <input
              type="text"
              placeholder="Search handcrafted Ganesha idols & items..."
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        <div className="nav-links">
          <Link to="/" className="nav-link">
            <ShoppingBag size={18} color="var(--color-gold-deep)" /> Catalog
          </Link>

          {isAuthenticated ? (
            <button className="admin-nav-btn" onClick={() => navigate('/admin')}>
              <ShieldCheck size={16} /> Admin Portal
            </button>
          ) : (
            <Link to="/login" className="admin-nav-btn">
              <Lock size={16} /> Admin Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
