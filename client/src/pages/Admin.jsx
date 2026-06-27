import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, Edit2, Check, RefreshCw, BarChart2, Package, ShoppingCart, DollarSign } from 'lucide-react';

export default function Admin({ token, navigateTo, showToast }) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'products' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for adding products
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    description: '',
    category: 'Electronics',
    image: '',
    stock: ''
  });

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Fetch products
      const prodRes = await fetch('/api/products');
      if (!prodRes.ok) throw new Error('Failed to load products');
      const prodData = await prodRes.json();
      setProducts(prodData);

      // Fetch orders
      const orderRes = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!orderRes.ok) throw new Error('Failed to load orders');
      const orderData = await orderRes.json();
      setOrders(orderData);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // CRUD: Create Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.description || !newProduct.image || !newProduct.stock) {
      showToast('Please fill out all product fields.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add product');

      setProducts([...products, data]);
      setNewProduct({ title: '', price: '', description: '', category: 'Electronics', image: '', stock: '' });
      showToast(`Product "${data.title}" added successfully!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // CRUD: Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete product');
      }

      setProducts(products.filter((p) => p.id !== productId));
      showToast('Product deleted.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Update order status (Advance workflow: processing -> shipped -> delivered)
  const handleUpdateOrderStatus = async (orderId, currentStatus) => {
    let nextStatus = 'processing';
    if (currentStatus === 'processing') nextStatus = 'shipped';
    else if (currentStatus === 'shipped') nextStatus = 'delivered';
    else return;

    try {
      // Simulate orders status update via backend order API update (using Stripe orders modification mockup flow)
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Auth failed');

      // Update in local state (since we are mocking database changes)
      // Usually, there would be a PUT /api/orders/:id route, let's create a quick status updater
      const updatedOrders = orders.map((o) => {
        if (o.id === orderId) {
          return { ...o, status: nextStatus };
        }
        return o;
      });
      setOrders(updatedOrders);
      showToast(`Order #${orderId} status advanced to ${nextStatus}.`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Calculations for Analytics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00';
  
  // Categorized Sales data for custom chart
  const categorySales = products.reduce((acc, p) => {
    // Sum quantities of items sold in this category
    const salesInCat = orders.reduce((sum, o) => {
      const itemsInCat = o.items.filter((item) => {
        const fullProd = products.find((prod) => prod.id === item.productId);
        return fullProd ? fullProd.category === p.category : false;
      });
      return sum + itemsInCat.reduce((s, i) => s + (i.price * i.quantity), 0);
    }, 0);

    acc[p.category] = (acc[p.category] || 0) + salesInCat;
    return acc;
  }, {});

  const categories = Object.keys(categorySales);
  const maxCategorySales = Math.max(...Object.values(categorySales), 1);

  if (loading && products.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'var(--text-secondary)',
        gap: '12px'
      }}>
        <RefreshCw size={24} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
        <span>Loading admin configurations...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={28} className="text-secondary" />
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Global oversight of products, transactions, and sales metrics.</p>
        </div>
        
        <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '10px' }}>
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {/* 2. Admin Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-light)',
        gap: '24px'
      }}>
        {['analytics', 'products', 'orders'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '1rem',
              borderBottom: activeTab === tab ? '3px solid var(--accent-primary)' : '3px solid transparent',
              textTransform: 'capitalize',
              transition: 'var(--transition-smooth)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Tab Contents */}

      {/* A. Analytics Dashboard */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>Total Revenue</span>
                <strong style={{ fontSize: '1.5rem', fontWeight: 800 }}>${totalRevenue.toFixed(2)}</strong>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-secondary)' }}>
                <ShoppingCart size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>Total Orders</span>
                <strong style={{ fontSize: '1.5rem', fontWeight: 800 }}>{orders.length}</strong>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                <Package size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>Inventory Items</span>
                <strong style={{ fontSize: '1.5rem', fontWeight: 800 }}>{products.length}</strong>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                <BarChart2 size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>Avg Order Value</span>
                <strong style={{ fontSize: '1.5rem', fontWeight: 800 }}>${averageOrderValue}</strong>
              </div>
            </div>
          </div>

          {/* Graph Section */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px' }}>Revenue Distribution by Category</h3>
            
            {categories.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0' }}>No sales data available to chart.</p>
            ) : (
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'flex-end',
                height: '240px',
                paddingTop: '20px',
                borderBottom: '2px solid var(--border-light)'
              }}>
                {categories.map((cat) => {
                  const sales = categorySales[cat] || 0;
                  const percent = Math.min((sales / maxCategorySales) * 100, 100);

                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', gap: '12px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>${sales.toFixed(0)}</span>
                      {/* Bar */}
                      <div style={{
                        height: `${Math.max(percent, 8)}px`,
                        width: '32px',
                        background: 'linear-gradient(to top, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                        borderRadius: '6px 6px 0 0',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                        transition: 'height 0.8s ease'
                      }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {cat}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* B. Product Catalog Manager */}
      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
          
          {/* Add product form */}
          <form onSubmit={handleAddProduct} className="glass-panel" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <Plus size={18} />
              Add New Product
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Product Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nebula Active Shirt"
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="49.99"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Stock Qty</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="15"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Category</label>
              <select
                className="form-control"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                style={{ cursor: 'pointer' }}
              >
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Image URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://images.unsplash.com/...?"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Product Details Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Provide a detailed description of the specs, dimensions, materials..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
              Publish Product
            </button>
          </form>

          {/* Products List Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-light)', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Inventory List</h3>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={p.image} alt={p.title} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={p.title}>{p.title}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{p.category}</span></td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>${p.price.toFixed(2)}</td>
                    <td style={{ fontSize: '0.85rem' }}>{p.stock}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px', borderRadius: '6px' }}
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* C. Order Queue Manager */}
      {activeTab === 'orders' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-light)', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Global Order Fulfillment Queue</h3>
          
          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0' }}>No customer orders placed yet.</p>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total Paid</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Fulfillment Control</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{o.id}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{o.userName}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{o.userEmail}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>${o.total.toFixed(2)}</td>
                    <td>
                      {o.status === 'processing' && <span className="badge badge-primary">Processing</span>}
                      {o.status === 'shipped' && <span className="badge badge-warning">Shipped</span>}
                      {o.status === 'delivered' && <span className="badge badge-success">Delivered</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {o.status !== 'delivered' ? (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, o.status)}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={12} />
                          {o.status === 'processing' ? 'Ship Parcel' : 'Complete Delivery'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>Fulfilled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}
