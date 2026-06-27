import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw,
  Plus, Minus, RefreshCw, Heart, Share2, Zap
} from 'lucide-react';

export default function ProductDetails({
  productId,
  navigateTo,
  addToCart,
  showToast
}) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        showToast('Error loading product details: ' + err.message, 'error');
        navigateTo('home');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '500px',
        gap: 'var(--space-4)',
        color: 'var(--text-secondary)'
      }}>
        <div className="spinner spinner-lg" />
        <span style={{ fontWeight: 600 }}>Loading product details...</span>
      </div>
    );
  }

  if (!product) return null;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      showToast(`Maximum ${product.stock} items available`, 'warning');
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'success');
  };

  const getStockStatus = () => {
    if (product.stock <= 0) {
      return { text: 'Out of Stock', color: 'var(--error)', bgColor: 'var(--error-light)' };
    }
    if (product.stock <= 5) {
      return { text: `Only ${product.stock} left`, color: 'var(--warning)', bgColor: 'var(--warning-light)' };
    }
    return { text: 'In Stock - Ready to Ship', color: 'var(--success)', bgColor: 'var(--success-light)' };
  };

  const stockStatus = getStockStatus();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
      
      {/* ========== BACK BUTTON ========== */}
      <button
        onClick={() => navigateTo('home')}
        className="btn btn-ghost"
        style={{
          width: 'fit-content',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--border-radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontWeight: 600,
          fontSize: '0.95rem',
          color: 'var(--text-secondary)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={18} />
        Back to Shop
      </button>

      {/* ========== MAIN PRODUCT VIEW ========== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: 'var(--space-12)',
        alignItems: 'start'
      }}>
        
        {/* LEFT: Image Gallery */}
        <div className="glass-panel" style={{
          padding: 'var(--space-6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '500px',
          borderRadius: 'var(--border-radius-xl)',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            <img
              src={product.image}
              alt={product.title}
              style={{
                width: '100%',
                maxHeight: '500px',
                objectFit: 'contain',
                borderRadius: 'var(--border-radius-lg)',
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        </div>

        {/* RIGHT: Details */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)'
        }}>
          
          {/* Category & Title */}
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
              {product.category}
            </span>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              marginTop: 'var(--space-3)',
              lineHeight: 1.2,
              color: 'var(--text-primary)'
            }}>
              {product.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-3)', maxWidth: '640px' }}>
              Designed for everyday performance, premium comfort, and a refined finish that fits seamlessly into modern life.
            </p>
          </div>

          {/* Ratings */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              gap: 'var(--space-1)',
              color: 'gold'
            }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              ))}
            </div>
            <span style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              fontWeight: 600
            }}>
              {product.rating.toFixed(1)} / 5.0 (128 reviews)
            </span>
          </div>

          {/* Price & Stock */}
          <div className="glass-card" style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--border-radius-xl)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06), rgba(236, 72, 153, 0.04))'
          }}>
            <div>
              <span style={{
                fontSize: '0.85rem',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 'var(--space-2)'
              }}>
                Price
              </span>
              <span style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ${product.price.toFixed(2)}
              </span>
            </div>
            <div style={{
              backgroundColor: stockStatus.bgColor,
              color: stockStatus.color,
              padding: 'var(--space-3) var(--space-5)',
              borderRadius: 'var(--border-radius-lg)',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              {product.stock > 0 ? <Zap size={18} /> : null}
              {stockStatus.text}
            </div>
          </div>

          {/* Description */}
          <div className="section-shell" style={{ padding: 'var(--space-5)' }}>
            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7
            }}>
              {product.description}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
              {['Free returns', 'Ships in 24 hours', 'Premium materials'].map((item) => (
                <span key={item} className="badge badge-primary">{item}</span>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          {product.stock > 0 && (
            <div style={{
              display: 'flex',
              gap: 'var(--space-4)',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Quantity Selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--border-radius-lg)',
                overflow: 'hidden'
              }}>
                <button
                  onClick={handleDecrement}
                  className="btn btn-ghost"
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 0,
                    border: 'none'
                  }}
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </button>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  minWidth: '50px',
                  textAlign: 'center',
                  color: 'var(--text-primary)'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="btn btn-ghost"
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 0,
                    border: 'none'
                  }}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--border-radius-lg)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-3)'
                }}
              >
                <ShoppingBag size={20} />
                Add {quantity > 1 ? `${quantity} Items` : 'to Cart'}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlist}
                className="btn btn-secondary"
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--border-radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? 'currentColor' : 'none'}
                  color={isWishlisted ? 'var(--accent-secondary)' : 'inherit'}
                />
                {isWishlisted ? 'Liked' : 'Wishlist'}
              </button>
            </div>
          )}

          {/* Share Button */}
          <button
            className="btn btn-ghost"
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              borderRadius: 'var(--border-radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              fontSize: '0.95rem',
              fontWeight: 600
            }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: product.title,
                  text: product.description,
                  url: window.location.href
                });
              } else {
                showToast('Copied to clipboard!', 'success');
              }
            }}
          >
            <Share2 size={18} />
            Share Product
          </button>

          {/* Trust Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--border-light)'
          }}>
            {[
              { icon: ShieldCheck, label: 'Secure Checkout' },
              { icon: Truck, label: 'Free Shipping' },
              { icon: RotateCcw, label: '30-Day Returns' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    textAlign: 'center',
                    padding: 'var(--space-3)'
                  }}
                >
                  <Icon size={24} color="var(--accent-primary)" strokeWidth={1.5} />
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)'
                  }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
