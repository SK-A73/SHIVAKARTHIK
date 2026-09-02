import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../api/client';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Save,
  X,
  Sparkles,
  User,
  Phone,
  Calendar,
  ArrowLeft,
  MessageSquare,
  MapPin
} from 'lucide-react';

const AdminDashboard = () => {
  const { isAuthenticated, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Stats State
  const [stats, setStats] = useState(null);

  // Products State
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    stock: '',
    featured: false,
    hidden: false
  });
  const [productImageFile, setProductImageFile] = useState(null);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    shopName: '',
    whatsappNumber: '',
    address: '',
    instagram: '',
    facebook: ''
  });
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // General Loading & Notice
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'dashboard') fetchStats();
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'settings') fetchSettings();
    }
  }, [activeTab, isAuthenticated]);

  const fetchStats = async () => {
    try {
      const res = await API.get('/dashboard/stats');
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/products?includeHidden=true');
      if (res.data.success) {
        setProducts(res.data.products);
        try {
          localStorage.setItem('cached_products', JSON.stringify(res.data.products.filter(p => !p.hidden)));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = `/orders?`;
      if (orderSearch) query += `search=${encodeURIComponent(orderSearch)}&`;
      if (orderStatusFilter !== 'All') query += `status=${encodeURIComponent(orderStatusFilter)}`;

      const res = await API.get(query);
      if (res.data.success) setOrders(res.data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings');
      if (res.data.success && res.data.settings) {
        setSettingsForm({
          shopName: res.data.settings.shopName || '',
          whatsappNumber: res.data.settings.whatsappNumber || '',
          address: res.data.settings.address || '',
          instagram: res.data.settings.instagram || '',
          facebook: res.data.settings.facebook || ''
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        name: prod.name,
        category: prod.category,
        price: prod.price,
        description: prod.description,
        stock: prod.stock,
        featured: prod.featured === 1,
        hidden: prod.hidden === 1
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: '',
        price: '',
        description: '',
        stock: '',
        featured: false,
        hidden: false
      });
    }
    setProductImageFile(null);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('category', productForm.category);
      formData.append('price', productForm.price);
      formData.append('description', productForm.description);
      formData.append('stock', productForm.stock);
      formData.append('featured', productForm.featured);
      formData.append('hidden', productForm.hidden);

      if (productImageFile) {
        formData.append('image', productImageFile);
      }

      if (editingProduct) {
        await API.put(`/products/${editingProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setNotice('Product updated successfully!');
      } else {
        await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setNotice('Product added successfully!');
      }

      setShowProductModal(false);
      fetchProducts();
    } catch (err) {
      console.error('Product submit error:', err);
      alert(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setLoading(false);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/products/${id}`);
        setNotice('Product deleted.');
        fetchProducts();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete product.');
      }
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await API.patch(`/products/${id}/visibility`);
      fetchProducts();
    } catch (err) {
      console.error('Visibility toggle error:', err);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setNotice(`Order ${orderId} updated to ${newStatus}`);
      setSelectedOrder(prev => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev));
      fetchOrders();
    } catch (err) {
      console.error('Order status update error:', err);
      alert('Failed to update status.');
    }
  };

  const handleOpenOrderDetails = async (order) => {
    setSelectedOrder(order);
    if (!order.items || order.items.length === 0) {
      try {
        const res = await API.get(`/orders/${order.id}`);
        if (res.data.success && res.data.order) {
          setSelectedOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load full order details:', err);
      }
    }
  };

  const resolveOrderItemImage = (item) => {
    let raw = item?.image_url || item?.imageUrl;
    if (!raw && item?.productId) {
      const match = products.find(p => p.id === item.productId || String(p.id) === String(item.productId));
      if (match) raw = match.image_url;
    }
    if (!raw) return 'https://via.placeholder.com/80?text=Ganesha';
    if (raw.startsWith('http')) return raw;
    if (raw.startsWith('sample_')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop';
    const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://shivakarthik.onrender.com';
    return `${apiBase}/uploads/products/${raw}`;
  };

  const resolveOrderItemCategory = (item) => {
    if (item?.category) return item.category;
    if (item?.variant) return item.variant;
    if (item?.productId) {
      const match = products.find(p => p.id === item.productId || String(p.id) === String(item.productId));
      if (match?.category) return match.category;
    }
    return null;
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put('/settings', settingsForm);
      setSettingsSuccess('Shop settings saved successfully!');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      console.error('Settings save error:', err);
      alert('Failed to save settings.');
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <div className="container" style={{ paddingTop: '2.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid var(--color-gold-primary)' }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', color: 'var(--color-maroon)' }}>Admin Dashboard</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Manage Ganesha idol catalog, customer orders, and store parameters
              </p>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="admin-tab-item"
              style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', border: '1px solid rgba(225, 29, 72, 0.3)', flex: 'none', padding: '0.65rem 1.35rem' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          {notice && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.75rem', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> {notice}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="admin-tab-bar">
            <button
              className={`admin-tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} /> Overview
            </button>
            <button
              className={`admin-tab-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package size={18} /> Idols Catalog ({products.length})
            </button>
            <button
              className={`admin-tab-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingCart size={18} /> Orders ({orders.length})
            </button>
            <button
              className={`admin-tab-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> Settings
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="stats-grid-luxury">
                <div className="stat-box-luxury">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Idols</div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-maroon)', fontFamily: 'var(--font-heading)' }}>{stats?.totalProducts || 0}</div>
                  </div>
                  <Package size={36} color="var(--color-gold-deep)" />
                </div>

                <div className="stat-box-luxury">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-maroon)', fontFamily: 'var(--font-heading)' }}>{stats?.totalOrders || 0}</div>
                  </div>
                  <ShoppingCart size={36} color="var(--color-gold-deep)" />
                </div>

                <div className="stat-box-luxury">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-heading)' }}>{stats?.pendingOrders || 0}</div>
                  </div>
                  <Clock size={36} color="#d97706" />
                </div>

                <div className="stat-box-luxury">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirmed</div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-heading)' }}>{stats?.confirmedOrders || 0}</div>
                  </div>
                  <CheckCircle2 size={36} color="#2563eb" />
                </div>

                <div className="stat-box-luxury">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivered</div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>{stats?.deliveredOrders || 0}</div>
                  </div>
                  <Truck size={36} color="#059669" />
                </div>

                <div className="stat-box-luxury">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cancelled</div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-heading)' }}>{stats?.cancelledOrders || 0}</div>
                  </div>
                  <XCircle size={36} color="#dc2626" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--color-maroon)', fontFamily: 'var(--font-heading)' }}>Catalog Management</h3>
                <button
                  className="btn-gold-primary"
                  onClick={() => handleOpenProductModal(null)}
                >
                  <Plus size={18} /> Add New Idol
                </button>
              </div>

              <div className="table-luxury-wrap">
                <table className="table-luxury">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem' }}>No products found in database.</td>
                      </tr>
                    ) : (
                      products.map((p) => {
                        const img = p.image_url
                          ? p.image_url.startsWith('http')
                            ? p.image_url
                            : p.image_url.startsWith('sample_')
                              ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop'
                              : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://shivakarthik.onrender.com'}/uploads/products/${p.image_url}`
                          : 'https://via.placeholder.com/50';

                        return (
                          <tr key={p.id}>
                            <td>
                              <img src={img} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--color-gold-primary)' }} />
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--color-maroon)' }}>{p.name}</td>
                            <td><span className="badge badge-featured">{p.category}</span></td>
                            <td style={{ color: 'var(--color-gold-deep)', fontWeight: 700 }}>₹{p.price.toLocaleString('en-IN')}</td>
                            <td>{p.stock}</td>
                            <td>
                              <span className={`badge ${p.hidden === 1 ? 'badge-outofstock' : 'badge-stock'}`}>
                                {p.hidden === 1 ? 'Hidden' : 'Visible'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  onClick={() => handleToggleVisibility(p.id)}
                                  style={{ background: 'var(--color-cream)', border: '1px solid var(--color-gold-primary)', padding: '0.35rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--color-maroon)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                >
                                  {p.hidden === 1 ? <><Eye size={14} /> Show</> : <><EyeOff size={14} /> Hide</>}
                                </button>
                                <button
                                  onClick={() => handleOpenProductModal(p)}
                                  style={{ background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.3)', padding: '0.35rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  style={{ background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.3)', padding: '0.35rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold-deep)' }} />
                  <input
                    type="text"
                    placeholder="Search by Order ID, Customer Name, or Phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{ width: '100%', paddingLeft: '2.75rem' }}
                  />
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  style={{ width: '180px' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button className="btn-gold-primary" onClick={fetchOrders} style={{ padding: '0 1.5rem' }}>
                  Search
                </button>
              </div>

              <div className="table-luxury-wrap">
                <table className="table-luxury">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Phone</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem' }}>No orders matching search criteria.</td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 700, color: 'var(--color-maroon)' }}>{o.id}</td>
                          <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{o.customerName}</td>
                          <td>{o.phone}</td>
                          <td style={{ fontWeight: 700, color: 'var(--color-gold-deep)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <select
                              value={o.status}
                              onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() => handleOpenOrderDetails(o)}
                              style={{ background: 'var(--color-cream)', border: '1px solid var(--color-gold-primary)', color: 'var(--color-maroon)', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
                              title="View Order Details"
                            >
                              <Eye size={14} /> Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="luxury-card" style={{ maxWidth: '650px', padding: '2.5rem', margin: '0 auto', background: '#FFFFFF' }}>
              <h3 style={{ marginBottom: '1.75rem', fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--color-maroon)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles color="var(--color-gold-primary)" size={20} /> Shop Configurations
              </h3>

              {settingsSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  ✓ {settingsSuccess}
                </div>
              )}

              <form onSubmit={handleSettingsSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text)', fontWeight: 600 }}>
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.shopName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shopName: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text)', fontWeight: 600 }}>
                    WhatsApp Phone Number (With Country Code e.g. 919148572774)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text)', fontWeight: 600 }}>
                    Shop Address
                  </label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text)', fontWeight: 600 }}>
                    Instagram Link
                  </label>
                  <input
                    type="text"
                    value={settingsForm.instagram}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text)', fontWeight: 600 }}>
                    Facebook Link
                  </label>
                  <input
                    type="text"
                    value={settingsForm.facebook}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <button type="submit" className="btn-gold-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.95rem' }}>
                  <Save size={18} /> Save Configurations
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content-luxury" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(199,154,59,0.25)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--color-maroon)' }}>
                {editingProduct ? 'Edit Idol' : 'Add New Ganesha Idol'}
              </h2>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'none', color: 'var(--color-maroon)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.3rem', fontWeight: 600 }}>Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.3rem', fontWeight: 600 }}>Category *</label>
                  <input
                    type="text"
                    placeholder="e.g. Eco Ganesha, Brass Idol"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.3rem', fontWeight: 600 }}>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.3rem', fontWeight: 600 }}>Stock Quantity *</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.3rem', fontWeight: 600 }}>Description *</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.3rem', fontWeight: 600 }}>Product Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {(productImageFile || editingProduct?.image_url) && (
                    <img 
                      src={productImageFile ? URL.createObjectURL(productImageFile) : (editingProduct.image_url.startsWith('http') ? editingProduct.image_url : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://shivakarthik.onrender.com'}/uploads/products/${editingProduct.image_url}`)} 
                      alt="Preview" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-gold-primary)' }} 
                    />
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={(e) => {
                      if (e.target.files[0] && e.target.files[0].size > 10 * 1024 * 1024) {
                        alert('Image size exceeds 10MB limit.');
                        e.target.value = '';
                        return;
                      }
                      setProductImageFile(e.target.files[0]);
                    }}
                    style={{ flex: 1, padding: '0.4rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  />
                  Featured Idol Highlight
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={productForm.hidden}
                    onChange={(e) => setProductForm({ ...productForm, hidden: e.target.checked })}
                  />
                  Hide from Store
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className="admin-tab-item"
                  onClick={() => setShowProductModal(false)}
                  style={{ border: '1px solid var(--color-gold-primary)', color: 'var(--color-maroon)' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div
            className="modal-content-luxury"
            style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', padding: '2rem', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                borderBottom: '1px solid rgba(199, 154, 59, 0.25)',
                paddingBottom: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: 'var(--color-cream)',
                    border: '1px solid var(--color-gold-primary)',
                    color: 'var(--color-maroon)',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Back to Orders List"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--color-maroon)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Package size={20} color="var(--color-gold-deep)" /> Order Details
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gold-deep)', fontWeight: 600 }}>
                    #{selectedOrder.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'var(--color-cream)',
                  border: '1px solid var(--color-gold-primary)',
                  color: 'var(--color-maroon)',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Information Grid: Order Info & Customer Info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              {/* Box 1: Order Information */}
              <div
                style={{
                  background: 'var(--color-cream)',
                  padding: '1.15rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-gold-primary)'
                }}
              >
                <h4
                  style={{
                    margin: '0 0 0.65rem 0',
                    color: 'var(--color-maroon)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.98rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Clock size={16} color="var(--color-gold-deep)" /> Order Information
                </h4>
                <div style={{ fontSize: '0.88rem', lineHeight: '1.8' }}>
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Order ID:</strong>{' '}
                    <span style={{ color: 'var(--color-maroon)', fontWeight: 700 }}>{selectedOrder.id}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Date & Time:</strong>{' '}
                    <span>
                      {selectedOrder.createdAt
                        ? new Date(selectedOrder.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <strong style={{ color: 'var(--color-text)' }}>Status:</strong>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleOrderStatusUpdate(selectedOrder.id, e.target.value)}
                      style={{
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.82rem',
                        borderRadius: '4px',
                        border: '1px solid var(--color-gold-primary)',
                        background: '#FFFFFF',
                        color: 'var(--color-maroon)',
                        fontWeight: 600
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '0.25rem' }}>
                    <strong style={{ color: 'var(--color-text)' }}>Order Total:</strong>{' '}
                    <span style={{ color: 'var(--color-gold-deep)', fontWeight: 800, fontSize: '1.05rem' }}>
                      ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: Customer Information */}
              <div
                style={{
                  background: 'var(--color-cream)',
                  padding: '1.15rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-gold-primary)'
                }}
              >
                <h4
                  style={{
                    margin: '0 0 0.65rem 0',
                    color: 'var(--color-maroon)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.98rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <User size={16} color="var(--color-gold-deep)" /> Customer Information
                </h4>
                <div style={{ fontSize: '0.88rem', lineHeight: '1.8' }}>
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Customer Name:</strong>{' '}
                    <span style={{ fontWeight: 600 }}>{selectedOrder.customerName || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ color: 'var(--color-text)' }}>Phone:</strong>{' '}
                    <span>{selectedOrder.phone || 'N/A'}</span>
                    {selectedOrder.phone && (
                      <a
                        href={`https://wa.me/${selectedOrder.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#059669',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px'
                        }}
                        title="Direct WhatsApp with customer"
                      >
                        <MessageSquare size={12} /> WhatsApp
                      </a>
                    )}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Delivery / Address:</strong>{' '}
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {selectedOrder.address ||
                        selectedOrder.deliveryAddress ||
                        selectedOrder.shippingAddress ||
                        selectedOrder.customerAddress ||
                        'Coordinated via WhatsApp (Direct Delivery)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Products Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    color: 'var(--color-maroon)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.05rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <ShoppingCart size={16} color="var(--color-gold-deep)" /> Ordered Products
                </h4>
                <span className="badge badge-featured" style={{ fontSize: '0.75rem' }}>
                  {selectedOrder.items && selectedOrder.items.length > 0
                    ? `${selectedOrder.items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)} items`
                    : '1 item'}
                </span>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid rgba(199, 154, 59, 0.3)',
                    overflow: 'hidden'
                  }}
                >
                  {selectedOrder.items.map((item, idx) => {
                    const itemImg = resolveOrderItemImage(item);
                    const itemCat = resolveOrderItemCategory(item);
                    const qty = Number(item.quantity) || 1;
                    const unitPrice = Number(item.price || (item.total && qty ? item.total / qty : 0));
                    const subtotal = Number(item.total || unitPrice * qty);

                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.85rem 1.15rem',
                          borderBottom:
                            idx < selectedOrder.items.length - 1
                              ? '1px solid rgba(199, 154, 59, 0.15)'
                              : 'none',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 253, 247, 0.6)'
                        }}
                      >
                        <img
                          src={itemImg}
                          alt={item.productName || 'Idol'}
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '8px',
                            objectFit: 'contain',
                            background: '#FFFFFF',
                            border: '1px solid var(--color-gold-primary)',
                            padding: '2px',
                            flexShrink: 0
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop';
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: 'var(--color-maroon)',
                              fontSize: '0.95rem'
                            }}
                          >
                            {item.productName || 'Handcrafted Ganesha Idol'}
                          </div>
                          {itemCat && (
                            <span
                              className="badge badge-featured"
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.5rem',
                                marginTop: '0.2rem',
                                display: 'inline-block'
                              }}
                            >
                              {itemCat}
                            </span>
                          )}
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--color-text-muted)',
                              marginTop: '0.2rem'
                            }}
                          >
                            Unit Price: ₹{unitPrice.toLocaleString('en-IN')} × {qty}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Subtotal</div>
                          <div
                            style={{
                              fontWeight: 800,
                              color: 'var(--color-gold-deep)',
                              fontSize: '1.05rem'
                            }}
                          >
                            ₹{subtotal.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-cream)',
                    borderRadius: '8px',
                    border: '1px dashed var(--color-gold-primary)'
                  }}
                >
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--color-maroon)' }}>
                    Item breakdown for this order:
                  </p>
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>
                    Single item order recorded via WhatsApp checkout • Order Total: ₹
                    {selectedOrder.totalAmount?.toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>

            {/* Total Summary Breakdown */}
            <div
              style={{
                background: 'var(--color-cream)',
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid var(--color-gold-primary)',
                marginBottom: '1.5rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem'
                }}
              >
                <span>Total Items:</span>
                <span style={{ fontWeight: 600 }}>
                  {selectedOrder.items && selectedOrder.items.length > 0
                    ? selectedOrder.items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)
                    : 1}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(199, 154, 59, 0.3)',
                  paddingTop: '0.65rem',
                  marginTop: '0.35rem'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-maroon)' }}>
                  Final Order Total:
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '1.35rem',
                    color: 'var(--color-gold-deep)',
                    fontFamily: 'var(--font-accent)'
                  }}
                >
                  ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-gold-primary"
                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem' }}
                onClick={() => setSelectedOrder(null)}
              >
                <ArrowLeft size={16} /> Back to Orders List
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
