import React, { useState, useEffect } from 'react';
import { RefreshCw, ClipboardList, Package, ExternalLink, Calendar, MapPin } from 'lucide-react';

export default function Orders({ token, navigateTo, showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Could not fetch orders history.');
      const data = await res.json();
      
      // Sort orders by date descending
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!token) {
    return (
      <div className="animate-fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '0 auto',
        gap: '20px'
      }}>
        <ClipboardList size={48} className="text-secondary" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sign In Required</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You must be signed in to see your purchase history.</p>
        <button onClick={() => navigateTo('home')} className="btn btn-primary">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Order History</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Track your packages and view receipts.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="btn btn-secondary"
          style={{ padding: '10px 14px', borderRadius: '10px' }}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
          Reload
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          color: 'var(--text-secondary)',
          gap: '12px'
        }}>
          <RefreshCw size={24} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
          <span>Fetching your orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '260px',
          borderRadius: '20px',
          border: '1px solid var(--border-light)',
          gap: '16px',
          color: 'var(--text-tertiary)',
          padding: '24px'
        }}>
          <Package size={48} strokeWidth={1} />
          <p style={{ fontWeight: 500 }}>You haven't placed any orders yet.</p>
          <button onClick={() => navigateTo('home')} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            Shop Products
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="glass-panel" 
              style={{
                borderRadius: '20px',
                border: '1px solid var(--border-light)',
                overflow: 'hidden'
              }}
            >
              {/* Order Header info bar */}
              <div style={{
                padding: '20px 24px',
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Order ID</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{order.id}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Placed On</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} className="text-secondary" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Total Paid</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--accent-primary)' }}>${order.total.toFixed(2)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {order.paymentStatus === 'paid' && (
                    <span className="badge badge-success">Paid</span>
                  )}
                  {order.status === 'processing' && (
                    <span className="badge badge-primary">Processing</span>
                  )}
                  {order.status === 'shipped' && (
                    <span className="badge badge-success" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>Shipped</span>
                  )}
                  {order.status === 'delivered' && (
                    <span className="badge badge-success">Delivered</span>
                  )}
                </div>
              </div>

              {/* Order content detail body */}
              <div style={{
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {/* List items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '4px' }}>
                    Purchased Items
                  </h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-tertiary)'
                          }}
                        />
                      )}
                      <div style={{ minWidth: 0, flexGrow: 1 }}>
                        <h5 style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} title={item.title}>
                          {item.title}
                        </h5>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping details */}
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} />
                    Shipping Details
                  </h4>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{order.shippingDetails.name}</strong>
                    <span style={{ display: 'block', color: 'var(--text-secondary)' }}>{order.shippingDetails.address}</span>
                    <span style={{ display: 'block', color: 'var(--text-secondary)' }}>
                      {order.shippingDetails.city}, {order.shippingDetails.zip}
                    </span>
                    <span style={{ display: 'block', color: 'var(--text-secondary)' }}>{order.shippingDetails.country}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
