import React, { createContext, useState, useEffect } from 'react';
import API from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setAdmin(res.data.admin);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Session validation error:', error);
          logout();
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, [token]);

  const login = async (username, password) => {
    const res = await API.post('/auth/login', { username, password });
    if (res.data.success) {
      const newToken = res.data.token;
      localStorage.setItem('adminToken', newToken);
      setToken(newToken);
      setAdmin(res.data.admin);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ token, admin, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
