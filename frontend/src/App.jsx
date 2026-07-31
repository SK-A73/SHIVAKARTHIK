import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  return (
    <>
      {/*
        ScrollToTop listens to route changes and scrolls the window to (0,0)
        on every PUSH navigation (clicking a product, link etc.).
        For POP navigations (Back button), useScrollRestoration inside
        the Home page restores the previous scroll position.
      */}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
