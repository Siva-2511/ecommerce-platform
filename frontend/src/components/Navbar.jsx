import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path && !location.search;
  const isCategoryActive = (slug) => location.search.includes(`category=${slug}`);

  const navLinks = [
    { name: 'All Collection', path: '/', isCat: false },
    { name: 'Apparel', slug: 'apparel', isCat: true },
    { name: 'Electronics', slug: 'electronics', isCat: true },
    { name: 'Home', slug: 'home-kitchen', isCat: true },
    { name: 'Footwear', slug: 'footwear', isCat: true },
  ];

  return (
    <header style={{ 
      borderBottom: '1px solid var(--color-border)', 
      backgroundColor: 'var(--color-surface)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100 
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="btn-ghost" 
          style={{ display: 'none', padding: 0 }} // Normally hidden, would use CSS media queries to show on mobile
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ 
            fontFamily: 'var(--font-brand)', 
            fontSize: '1.75rem', 
            fontWeight: 700, 
            color: 'var(--color-primary)',
            letterSpacing: '-0.03em'
          }}>
            ShopScale.
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '2.5rem' }}>
          {navLinks.map(link => (
            <Link 
              key={link.name}
              to={link.isCat ? `/?category=${link.slug}` : link.path} 
              style={{ 
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: (link.isCat ? isCategoryActive(link.slug) : isActive(link.path)) ? 600 : 400,
                color: (link.isCat ? isCategoryActive(link.slug) : isActive(link.path)) ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1.5rem' }}>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const q = formData.get('q');
              navigate(q ? `/?search=${encodeURIComponent(q)}` : '/');
            }}
            style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
          >
            <input 
              name="q"
              type="text" 
              placeholder="SEARCH" 
              style={{
                width: '180px',
                padding: '0.5rem 0',
                border: 'none',
                borderBottom: '1px solid var(--color-border)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                outline: 'none',
                backgroundColor: 'transparent'
              }}
            />
            <button type="submit" style={{ position: 'absolute', right: 0, paddingBottom: '0.25rem', color: 'var(--color-text-main)' }}>
              <Search size={16} />
            </button>
          </form>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {isAdmin && (
                <Link to="/admin/products" style={{ color: 'var(--color-text-main)' }} title="Admin Dashboard">
                  <LayoutDashboard size={20} />
                </Link>
              )}
              <Link to="/orders" style={{ color: 'var(--color-text-main)' }} title="My Account">
                <User size={20} />
              </Link>
              <button onClick={handleLogout} style={{ color: 'var(--color-text-muted)' }} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
              Sign In
            </Link>
          )}

          <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--color-text-main)' }}>
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-8px',
                backgroundColor: 'var(--color-primary)', color: 'white',
                fontSize: '0.65rem', fontWeight: 600,
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {itemCount}
              </span>
            )}
          </Link>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
