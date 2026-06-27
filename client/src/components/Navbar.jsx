import React, { useState } from 'react';
import { ShoppingBag, Sun, Moon, LogOut, ShieldAlert, ClipboardList, Menu, X } from 'lucide-react';

export default function Navbar({
  user,
  cartCount,
  theme,
  toggleTheme,
  onCartClick,
  onAuthClick,
  onLogout,
  navigateTo,
  currentRoute
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isActive = (route) => currentRoute === route;

  const NavLink = ({ label, route, icon: Icon, onClick }) => (
    <button
      onClick={() => {
        onClick ? onClick() : navigateTo(route);
        setMobileMenuOpen(false);
      }}
      style={{
        background: isActive(route) ? 'rgba(139, 92, 246, 0.1)' : 'none',
        border: isActive(route) ? '1px solid var(--border-medium)' : 'none',
        color: isActive(route) ? 'var(--accent-primary)' : 'var(--text-secondary)',
        fontWeight: isActive(route) ? 700 : 500,
        cursor: 'pointer',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: 'var(--border-radius-md)',
        transition: 'var(--transition-fast)',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        if (!isActive(route)) {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--bg-tertiary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive(route)) {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'none';
        }
      }}
    >
      {Icon && <Icon size={18} strokeWidth={2} />}
      {label}
    </button>
  );

  return (
    <>
      {/* Main Navbar */}
      <header 
        className="glass-panel"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '72px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-6)',
          borderBottom: '1px solid var(--border-light)',
          borderRadius: 0,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Logo & Branding */}
        <div 
          onClick={() => {
            navigateTo('home');
            setMobileMenuOpen(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            color: 'white',
            padding: '8px',
            borderRadius: 'var(--border-radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}>
            <ShoppingBag size={20} strokeWidth={2} />
          </div>
          <span style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: '1.3rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--accent-primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            ShopNow
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <NavLink label="Shop" route="home" />
          
          {user && (
            <NavLink label="Orders" route="orders" icon={ClipboardList} />
          )}
          
          {user?.role === 'admin' && (
            <NavLink label="Admin" route="admin" icon={ShieldAlert} />
          )}
        </nav>

        {/* Right Section - Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--border-radius-md)'
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={onCartClick}
            className="btn btn-ghost"
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--border-radius-md)',
              position: 'relative'
            }}
            title="Shopping Cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span style={{
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 800,
                borderRadius: 'var(--border-radius-full)',
                minWidth: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
                animation: 'bounce 1s ease-in-out infinite'
              }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* User Menu / Auth */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="btn btn-secondary"
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '0.9rem'
                }}
              >
                {user.name.split(' ')[0]}
              </button>
              
              {profileMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--border-radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  minWidth: '180px',
                  zIndex: 101,
                  overflow: 'hidden',
                  animation: 'slideDown 0.2s ease forwards'
                }}>
                  <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setProfileMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3) var(--space-4)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--error)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--error-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="btn btn-primary"
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '0.9rem'
              }}
            >
              Login
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost"
            style={{
              display: 'none',
              '@media (max-width: 768px)': {
                display: 'flex'
              },
              padding: '8px 10px',
              borderRadius: 'var(--border-radius-md)'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '72px',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            zIndex: 99,
            display: 'none',
            flexDirection: 'column',
            gap: '8px',
            padding: 'var(--space-4)',
            '@media (max-width: 768px)': {
              display: 'flex'
            },
            animation: 'slideDown 0.3s ease forwards'
          }}
        >
          <NavLink label="Shop" route="home" />
          {user && <NavLink label="Orders" route="orders" icon={ClipboardList} />}
          {user?.role === 'admin' && <NavLink label="Admin" route="admin" icon={ShieldAlert} />}
        </div>
      )}

      {/* Mobile Menu - Close overlay on click outside */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 98
          }}
        />
      )}
    </>
  );
}
