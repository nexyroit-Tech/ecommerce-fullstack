import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';

export default function CartDrawer({
  cart,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout
}) {
  const [removingIds, setRemovingIds] = useState(new Set());
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
  const total = subtotal + shipping;

  const handleRemove = (productId) => {
    setRemovingIds(prev => new Set([...prev, productId]));
    setTimeout(() => {
      onRemove(productId);
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 300);
  };

  const QuantityControl = ({ item }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'var(--bg-tertiary)',
      borderRadius: 'var(--border-radius-md)',
      border: '1px solid var(--border-light)',
      overflow: 'hidden'
    }}>
      <button
        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
        className="btn btn-ghost"
        style={{
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 0,
          border: 'none',
          fontSize: '0.8rem'
        }}
        disabled={item.quantity <= 1}
      >
        <Minus size={14} />
      </button>
      <span style={{
        fontSize: '0.85rem',
        fontWeight: 600,
        minWidth: '28px',
        textAlign: 'center',
        color: 'var(--text-primary)'
      }}>
        {item.quantity}
      </span>
      <button
        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
        className="btn btn-ghost"
        style={{
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 0,
          border: 'none',
          fontSize: '0.8rem'
        }}
        disabled={item.quantity >= item.stock}
      >
        <Plus size={14} />
      </button>
    </div>
  );

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.3s ease'
      }} 
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-slide-in-right"
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-2xl)',
          borderLeft: '1px solid var(--border-light)',
          borderRadius: 0,
          backgroundColor: 'var(--bg-secondary)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========== DRAWER HEADER ========== */}
        <div style={{
          padding: 'var(--space-6)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
              color: 'white',
              padding: 'var(--space-2)',
              borderRadius: 'var(--border-radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 style={{ 
                fontSize: '1.1rem', 
                fontWeight: 800,
                color: 'var(--text-primary)'
              }}>
                Shopping Cart
              </h2>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                marginTop: '2px'
              }}>
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-ghost"
            style={{
              padding: 'var(--space-2)',
              borderRadius: 'var(--border-radius-md)'
            }}
            title="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* ========== DRAWER BODY ========== */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}>
          {cart.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 'var(--space-4)',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              paddingBottom: 'var(--space-8)'
            }}>
              <div style={{
                background: 'var(--info-light)',
                color: 'var(--accent-primary)',
                padding: 'var(--space-5)',
                borderRadius: 'var(--border-radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag size={48} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1rem' }}>Cart is Empty</p>
                <p style={{ fontSize: '0.85rem', marginTop: 'var(--space-2)' }}>
                  Add items to get started shopping
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="btn btn-primary"
                style={{
                  marginTop: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-6)'
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={item.productId}
                style={{
                  animation: removingIds.has(item.productId) ? 'slideInRight 0.3s ease reverse' : `fadeIn 0.4s ease ${index * 0.05}s`,
                  opacity: removingIds.has(item.productId) ? 0 : 1,
                  transform: removingIds.has(item.productId) ? 'translateX(100%)' : 'translateX(0)'
                }}
              >
                <div 
                  className="glass-card"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Product Image */}
                  <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 'var(--border-radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    aspectRatio: '1',
                    cursor: 'pointer'
                  }}>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'var(--transition-base)',
                        transform: 'scale(1)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>

                  {/* Details */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '80px'
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        marginBottom: 'var(--space-2)',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }} 
                      title={item.title}>
                        {item.title}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        fontSize: '0.9rem'
                      }}>
                        <span style={{
                          fontWeight: 700,
                          color: 'var(--accent-primary)'
                        }}>
                          ${item.price.toFixed(2)}
                        </span>
                        <span style={{
                          color: 'var(--text-tertiary)',
                          fontSize: '0.8rem'
                        }}>
                          × {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Control */}
                    <QuantityControl item={item} />
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="btn btn-ghost"
                    style={{
                      position: 'absolute',
                      top: 'var(--space-3)',
                      right: 'var(--space-3)',
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--border-radius-md)',
                      color: 'var(--text-tertiary)',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--error)';
                      e.currentTarget.style.background = 'var(--error-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Subtotal */}
                  <div style={{
                    position: 'absolute',
                    bottom: 'var(--space-3)',
                    right: 'var(--space-4)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    textAlign: 'right'
                  }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ========== DRAWER FOOTER ========== */}
        {cart.length > 0 && (
          <div style={{
            padding: 'var(--space-6)',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}>
            {/* Promo Badge */}
            {subtotal < 100 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                <Tag size={14} color="var(--accent-primary)" />
                <span>Free shipping on orders over $100</span>
              </div>
            )}

            {/* Order Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                <span>Subtotal</span>
                <span fontWeight='600'>${subtotal.toFixed(2)}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                <span>Shipping</span>
                <span fontWeight='600'>
                  {shipping === 0 ? (
                    <span style={{ color: 'var(--success)' }}>FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              <div style={{
                height: '1px',
                background: 'var(--border-light)',
                margin: 'var(--space-2) 0'
              }} />

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1.1rem'
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 800, 
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            
            <button 
              onClick={onCheckout}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: 'var(--space-4)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-2)'
              }}
            >
              Checkout
              <ArrowRight size={18} />
            </button>

            <button 
              onClick={onClose}
              className="btn btn-ghost"
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                borderRadius: 'var(--border-radius-md)'
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
