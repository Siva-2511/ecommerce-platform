import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgeKey, setBadgeKey] = useState(0); // incremented to re-trigger pulse
  const prevCountRef = useRef(itemCount);

  // Pulse the badge whenever itemCount increases
  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setBadgeKey(k => k + 1);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setDrawerOpen(false);
  };

  const isActive = (path) => location.pathname === path && !location.search;
  const isCategoryActive = (slug) => location.search.includes(`category=${slug}`);

  const navLinks = [
    { name: 'All Collection', path: '/', isCat: false },
    { name: 'Apparel',      slug: 'apparel',      isCat: true },
    { name: 'Electronics',  slug: 'electronics',  isCat: true },
    { name: 'Home',         slug: 'home-kitchen', isCat: true },
    { name: 'Footwear',     slug: 'footwear',     isCat: true },
  ];

  const linkActive = (link) =>
    link.isCat ? isCategoryActive(link.slug) : isActive(link.path);

  return (
    <>
      <header style={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>

          {/* Brand */}
          <Link to="/" style={{
            fontFamily: 'var(--font-brand)',
            fontSize: '1.625rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            letterSpacing: '-0.03em',
            flexShrink: 0,
          }}>
            ShopScale.
          </Link>

          {/* Desktop nav — centered */}
          <nav style={{ display: 'flex', gap: '2.5rem', flex: 2, justifyContent: 'center' }}
               className="desktop-nav" aria-label="Main navigation">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.isCat ? `/?category=${link.slug}` : link.path}
                style={{
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: linkActive(link) ? 600 : 400,
                  color: linkActive(link) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  borderBottom: linkActive(link) ? '2px solid var(--color-primary)' : '2px solid transparent',
                  paddingBottom: '2px',
                  transition: 'color 150ms ease, border-color 150ms ease',
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, justifyContent: 'flex-end' }}>

            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.target).get('q')?.toString().trim();
                navigate(q ? `/?search=${encodeURIComponent(q)}` : '/');
                e.target.reset();
              }}
              style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
            >
              <input
                name="q"
                type="search"
                placeholder="SEARCH"
                autoComplete="off"
                maxLength={100}
                style={{
                  width: 160,
                  padding: '0.5rem 1.75rem 0.5rem 0',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-main)',
                }}
              />
              <button
                type="submit"
                aria-label="Search"
                style={{ position: 'absolute', right: 0, color: 'var(--color-text-main)', display: 'flex' }}
              >
                <Search size={16} />
              </button>
            </form>

            {/* Auth actions */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isAdmin && (
                  <Link to="/admin/products" title="Admin Dashboard" style={{ color: 'var(--color-text-main)', display: 'flex' }}>
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                <Link to="/orders" title="My Orders" style={{ color: 'var(--color-text-main)', display: 'flex' }}>
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} title="Sign Out" style={{ color: 'var(--color-text-muted)', display: 'flex' }}>
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 500,
                  color: 'var(--color-text-main)',
                  borderBottom: '1px solid currentColor',
                  paddingBottom: '1px',
                }}
              >
                Sign In
              </Link>
            )}

            {/* Cart bag button — triggers drawer */}
            <button
              aria-label="Open shopping bag"
              onClick={() => setDrawerOpen(true)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--color-text-main)', padding: '0.25rem' }}
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span
                  key={badgeKey}
                  className="badge-animate"
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    padding: '0 3px',
                  }}
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileMenuOpen(o => !o)}
              style={{ display: 'none', color: 'var(--color-text-main)', padding: '0.25rem' }}
              className="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            padding: '1rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.isCat ? `/?category=${link.slug}` : link.path}
                style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: linkActive(link) ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: linkActive(link) ? 600 : 400 }}
              >
                {link.name}
              </Link>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
            {user ? (
              <>
                <Link to="/orders" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>My Orders</Link>
                {isAdmin && <Link to="/admin/products" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Admin</Link>}
                <button onClick={handleLogout} style={{ fontSize: '0.875rem', textAlign: 'left', color: 'var(--color-error)' }}>Sign Out</button>
              </>
            ) : (
              <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Sign In</Link>
            )}
          </nav>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Responsive styles injected via style tag — keeps this component self-contained */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
