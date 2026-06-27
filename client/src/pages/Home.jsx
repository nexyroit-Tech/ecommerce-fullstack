import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Star, ArrowRight, Sparkles, Zap, ShieldCheck, Truck, Headphones, BadgeCheck, Clock3 } from 'lucide-react';

const ProductCard = ({ product, onCardClick, onAddToCart }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddClick = (e) => {
    e.stopPropagation();
    setIsAnimating(true);
    onAddToCart(product);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const StockBadge = () => {
    if (product.stock <= 0) {
      return <span className="badge badge-warning">Out of Stock</span>;
    } else if (product.stock <= 5) {
      return <span className="badge badge-warning">Only {product.stock} Left</span>;
    }
    return <span className="badge badge-success">In Stock</span>;
  };

  return (
    <div
      className="glass-card"
      onClick={onCardClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        cursor: 'pointer',
        animation: 'fadeInUp 0.5s ease forwards'
      }}
    >
      {/* Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        backgroundColor: 'var(--bg-tertiary)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          src={product.image}
          alt={product.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.12)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
        />

        {/* Stock Badge */}
        <div style={{
          position: 'absolute',
          top: 'var(--space-4)',
          left: 'var(--space-4)',
          zIndex: 2
        }}>
          <StockBadge />
        </div>

        {/* Rating Badge */}
        <div style={{
          position: 'absolute',
          bottom: 'var(--space-4)',
          right: 'var(--space-4)',
          background: 'rgba(11, 15, 25, 0.8)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--border-radius-full)',
          fontSize: '0.85rem',
          fontWeight: 700,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          zIndex: 2
        }}>
          <Star size={14} fill="currentColor" />
          {product.rating.toFixed(1)}
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        gap: 'var(--space-3)'
      }}>
        <div>
          <span style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-tertiary)',
            fontWeight: 700
          }}>
            {product.category}
          </span>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            marginTop: 'var(--space-2)',
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.title}
          </h3>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginTop: 'var(--space-2)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
            minHeight: '40px'
          }}>
            {product.description}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'var(--space-3)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--border-light)',
          gap: 'var(--space-3)'
        }} onClick={(e) => e.stopPropagation()}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              fontWeight: 600,
              display: 'block',
              marginBottom: '2px'
            }}>
              Price
            </span>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddClick}
            disabled={product.stock <= 0}
            className="btn btn-primary"
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
          >
            <ShoppingBag size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home({ navigateTo, addToCart, showToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const categories = ['All Products', 'Electronics', 'Apparel', 'Accessories'];

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      showToast('Error loading catalog: ' + err.message, 'error');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  useEffect(() => {
    let filtered = products;

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'All Products') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProducts(filtered);
  }, [search, selectedCategory, products]);

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)' }}>
      
      {/* ========== HERO SECTION ========== */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.16) 0%, rgba(236, 72, 153, 0.08) 50%, transparent 100%)',
        borderRadius: 'var(--border-radius-2xl)',
        padding: 'var(--space-12) var(--space-8)',
        border: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '520px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: 0.2,
          zIndex: 0,
          animation: 'pulse 4s ease-in-out infinite'
        }} />

        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.15,
          zIndex: 0,
          animation: 'pulse 5s ease-in-out infinite 1s'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            width: 'fit-content'
          }}>
            <Sparkles size={18} color="var(--accent-primary)" />
            <span className="badge badge-primary">New Collection 2026</span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: '3.5rem',
            lineHeight: 1.15,
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--accent-primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            Premium commerce for the next generation of retail
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '600px'
          }}>
            Discover premium electronics, apparel, and accessories handpicked for quality, speed, and style. Every order is backed by secure checkout and fast delivery.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn btn-primary"
            style={{
              padding: 'var(--space-4) var(--space-8)',
              borderRadius: 'var(--border-radius-lg)',
              fontSize: '1.05rem',
              width: 'fit-content',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)'
            }}
          >
            Explore Catalog
            <ArrowRight size={20} />
          </button>

          {/* Trust Badges */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-6)',
            marginTop: 'var(--space-4)',
            flexWrap: 'wrap'
          }}>
            {[
              { icon: Zap, text: 'Fast Shipping' },
              { icon: Star, text: 'Trusted Quality' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  <Icon size={18} color="var(--accent-primary)" />
                  {item.text}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-shell" style={{ padding: 'var(--space-6)' }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow"><Sparkles size={14} /> Why shoppers choose ShopNow</div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 'var(--space-2)' }}>Built for confidence, speed, and delight</h2>
          </div>
        </div>
        <div className="feature-grid">
          {[
            { icon: ShieldCheck, title: 'Secure checkout', text: 'Protected payments and transparent order status.' },
            { icon: Truck, title: 'Fast fulfillment', text: 'Express shipping options and clear delivery estimates.' },
            { icon: Headphones, title: 'Dedicated support', text: 'Real people ready to help with returns and orders.' },
            { icon: BadgeCheck, title: 'Curated quality', text: 'Every product is chosen for lasting performance and design.' }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="feature-card" style={{ animation: `fadeInUp 0.5s ease ${index * 0.08}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <div style={{ background: 'var(--info-light)', color: 'var(--accent-primary)', padding: 'var(--space-2)', borderRadius: 'var(--border-radius-md)' }}>
                    <Icon size={18} />
                  </div>
                  <h3 style={{ fontSize: '1rem' }}>{item.title}</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========== FILTERS & SEARCH ========== */}
      <section id="catalog-section" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: 'var(--space-8)'
      }}>
        {/* Search Bar */}
        <div style={{ display: 'flex', maxWidth: '100%', position: 'relative' }}>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              display: 'flex',
              width: '100%',
              maxWidth: '500px',
              position: 'relative'
            }}
          >
            <input
              type="text"
              placeholder="Search products, categories..."
              className="form-control"
              style={{
                paddingRight: 'var(--space-12)',
                paddingLeft: 'var(--space-4)'
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                position: 'absolute',
                right: 'var(--space-2)',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--border-radius-md)',
                display: 'flex',
                alignItems: 'center',
                height: 'auto'
              }}
              title="Search"
            >
              <Search size={18} />
            </button>

            {/* Clear Search */}
            {search && (
              <button
                onClick={() => setSearch('')}
                className="btn btn-ghost"
                style={{
                  position: 'absolute',
                  right: 'var(--space-12)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: 'var(--space-2)',
                  fontSize: '0.8rem'
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Category Selector */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-2)',
          scrollBehavior: 'smooth'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All Products' ? '' : cat)}
              className="btn"
              style={{
                padding: 'var(--space-3) var(--space-5)',
                borderRadius: 'var(--border-radius-full)',
                fontSize: '0.9rem',
                backgroundColor: (selectedCategory === '' && cat === 'All Products') || selectedCategory === cat
                  ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
                  : 'var(--bg-tertiary)',
                color: (selectedCategory === '' && cat === 'All Products') || selectedCategory === cat
                  ? 'white'
                  : 'var(--text-primary)',
                border: (selectedCategory === '' && cat === 'All Products') || selectedCategory === cat
                  ? 'none'
                  : '1px solid var(--border-light)',
                fontWeight: (selectedCategory === '' && cat === 'All Products') || selectedCategory === cat ? 700 : 600,
                boxShadow: (selectedCategory === '' && cat === 'All Products') || selectedCategory === cat
                  ? 'var(--shadow-lg)'
                  : 'none',
                whiteSpace: 'nowrap',
                transition: 'var(--transition-fast)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!((selectedCategory === '' && cat === 'All Products') || selectedCategory === cat)) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!((selectedCategory === '' && cat === 'All Products') || selectedCategory === cat)) {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="section-shell" style={{ padding: 'var(--space-6)' }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow"><Clock3 size={14} /> Live inventory snapshot</div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 'var(--space-2)' }}>Explore the curated catalog</h2>
          </div>
          <div className="stat-card" style={{ minWidth: '180px' }}>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-tertiary)' }}>Products ready to ship</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{products.length}</p>
          </div>
        </div>

        {/* ========== PRODUCTS GRID ========== */}
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            gap: 'var(--space-4)',
            color: 'var(--text-secondary)'
          }}>
            <div className="spinner spinner-lg" />
            <span style={{ fontSize: '1rem', fontWeight: 600 }}>Loading premium catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            gap: 'var(--space-4)',
            color: 'var(--text-tertiary)',
            textAlign: 'center'
          }}>
            <div style={{
              background: 'var(--info-light)',
              color: 'var(--accent-primary)',
              padding: 'var(--space-6)',
              borderRadius: 'var(--border-radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={48} strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>
                No products found
              </p>
              <p style={{ fontSize: '0.95rem', maxWidth: '400px' }}>
                Try adjusting your search or filters to find what you're looking for
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearch('');
              }}
              className="btn btn-primary"
              style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3) var(--space-6)'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product, idx) => (
              <div key={product.id} style={{
                animation: `fadeInUp 0.5s ease ${idx * 0.05}s both`
              }}>
                <ProductCard
                  product={product}
                  onCardClick={() => navigateTo('product', { id: product.id })}
                  onAddToCart={addToCart}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
