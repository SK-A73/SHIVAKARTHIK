import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import { Lock, User, KeyRound } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username.trim(), password.trim());
      navigate('/admin');
    } catch (err) {
      console.error('Login failure:', err);
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
        <div className="luxury-card" style={{ width: '100%', maxWidth: '440px', padding: '2.75rem', background: '#FFFFFF' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Logo size={72} showText={false} />
            </div>
            <h2 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-heading)', color: 'var(--color-maroon)' }}>Admin Portal</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Sign in to manage Ganesha idols, orders, and shop settings
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid rgba(225, 29, 72, 0.3)', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.35rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.45rem', fontWeight: 600 }}>
                <User size={15} color="var(--color-gold-deep)" /> Username
              </label>
              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.45rem', fontWeight: 600 }}>
                <KeyRound size={15} color="var(--color-gold-deep)" /> Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-gold-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : <><Lock size={18} /> Sign In to Dashboard</>}
            </button>
          </form>

          <div style={{ marginTop: '2.25rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--color-text-light)', borderTop: '1px solid rgba(199,154,59,0.2)', paddingTop: '1.25rem' }}>
            Default credentials: <strong style={{ color: 'var(--color-maroon)' }}>admin / admin123</strong>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
