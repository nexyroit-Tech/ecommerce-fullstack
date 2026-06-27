import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import AuthModal from './components/AuthModal.jsx';

// Pages
import Home from './pages/Home.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  // Global States
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  
  // Custom router state
  // e.g. { name: 'home' } or { name: 'product', id: 'p1' }
  const [route, setRoute] = useState({ name: 'home' });
  const [toasts, setToasts] = useState([]);

  // Toast System
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Sync state with local storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  useEffect(() => {
    const titles = {
      home: 'ShopNow • Premium commerce',
      product: 'Product details • ShopNow',
      checkout: 'Checkout • ShopNow',
      orders: 'Orders • ShopNow',
      admin: 'Admin • ShopNow'
    };

    document.title = titles[route.name] || 'ShopNow';
  }, [route.name]);

  // Save Cart to storage
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Theme Toggle
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Auth operations
  const loginUser = (userToken, userData) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setAuthModalOpen(false);
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setRoute({ name: 'home' });
    showToast('Logged out successfully.', 'info');
  };

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    const existingIndex = cart.findIndex((item) => item.productId === product.id);
    const newCart = [...cart];

    if (existingIndex > -1) {
      const newQty = newCart[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        showToast(`Cannot add more. Only ${product.stock} items in stock.`, 'error');
        return;
      }
      newCart[existingIndex].quantity = newQty;
    } else {
      if (quantity > product.stock) {
        showToast(`Cannot add. Only ${product.stock} items in stock.`, 'error');
        return;
      }
      newCart.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: quantity,
        stock: product.stock
      });
    }

    saveCart(newCart);
    showToast(`Added "${product.title}" to cart!`, 'success');
  };

  const updateCartQuantity = (productId, quantity) => {
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;

    if (quantity <= 0) {
      saveCart(cart.filter((i) => i.productId !== productId));
      showToast(`Removed from cart.`, 'info');
      return;
    }

    if (quantity > item.stock) {
      showToast(`Cannot increase. Stock limit of ${item.stock} reached.`, 'error');
      return;
    }

    const newCart = cart.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    saveCart(newCart);
  };

  const removeFromCart = (productId) => {
    saveCart(cart.filter((item) => item.productId !== productId));
    showToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Navigation route handlers
  const navigateTo = (pageName, params = {}) => {
    setRoute({ name: pageName, ...params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Global Toast System */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Navigation Header */}
      <Navbar
        user={user}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        theme={theme}
        toggleTheme={toggleTheme}
        onCartClick={() => setCartOpen(true)}
        onAuthClick={() => {
          setAuthModalTab('login');
          setAuthModalOpen(true);
        }}
        onLogout={logoutUser}
        navigateTo={navigateTo}
        currentRoute={route.name}
      />

      {/* Main Pages Router */}
      <main className="main-content">
        {route.name === 'home' && (
          <Home navigateTo={navigateTo} addToCart={addToCart} showToast={showToast} />
        )}
        
        {route.name === 'product' && (
          <ProductDetails
            productId={route.id}
            navigateTo={navigateTo}
            addToCart={addToCart}
            showToast={showToast}
          />
        )}
        
        {route.name === 'checkout' && (
          <Checkout
            cart={cart}
            token={token}
            clearCart={clearCart}
            navigateTo={navigateTo}
            showToast={showToast}
            onAuthTrigger={() => {
              setAuthModalTab('login');
              setAuthModalOpen(true);
            }}
          />
        )}
        
        {route.name === 'orders' && (
          <Orders token={token} navigateTo={navigateTo} showToast={showToast} />
        )}
        
        {route.name === 'admin' && (
          <Admin token={token} navigateTo={navigateTo} showToast={showToast} />
        )}
      </main>

      <footer className="glass-panel" style={{
        margin: '0 auto var(--space-8)',
        width: 'min(1400px, calc(100% - 2rem))',
        borderRadius: 'var(--border-radius-2xl)',
        padding: 'var(--space-6) var(--space-7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        flexWrap: 'wrap'
      }}>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 'var(--space-1)' }}>ShopNow Commerce</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Premium shopping, secure checkout, and fast delivery for modern teams and customers.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <span>Free delivery over $100</span>
          <span>24/7 support</span>
          <span>Secure checkout</span>
        </div>
      </footer>

      {/* Cart Sidebar Panel */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
          onCheckout={() => {
            setCartOpen(false);
            navigateTo('checkout');
          }}
        />
      )}

      {/* User Login/Signup Dialog */}
      {authModalOpen && (
        <AuthModal
          tab={authModalTab}
          setTab={setAuthModalTab}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={loginUser}
          showToast={showToast}
        />
      )}
    </div>
  );
}
