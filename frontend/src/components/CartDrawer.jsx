import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

/**
 * CartDrawer — a slide-in glassmorphism panel.
 * Props:
 *   isOpen  {boolean}   — controls visibility
 *   onClose {function}  — called when user closes it
 */
const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const backdropRef = useRef(null);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        ref={backdropRef}
        className="cart-backdrop"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ShoppingBag size={20} style={{ color: 'var(--color-primary)' }} />
            <span style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
            }}>
              Your Bag
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close bag"
            style={{ color: 'var(--color-text-muted)', padding: '0.25rem', display: 'flex' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }} className="no-scrollbar">
          {!user ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <ShoppingBag size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-border)' }} />
              <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Sign in to view your bag
              </p>
              <Link
                to="/login"
                className="btn btn-primary"
                onClick={onClose}
                style={{ padding: '0.625rem 1.5rem' }}
              >
                Sign In
              </Link>
            </div>
          ) : loading ? (
            <div style={{ padding: '2rem 0' }}>
              {[1, 2].map(i => (
                <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 72, height: 72, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, marginBottom: 8, width: '70%' }} />
                    <div className="skeleton" style={{ height: 12, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <ShoppingBag size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-border)' }} />
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Your bag is empty
              </p>
              <button
                className="btn btn-outline"
                onClick={onClose}
                style={{ fontSize: '0.75rem' }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {cartItems.map((item, idx) => (
                <div
                  key={item.item_id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem 0',
                    borderBottom: idx < cartItems.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Thumbnail */}
                  <Link to={`/product/${item.product_id}`} onClick={onClose} style={{ flexShrink: 0 }}>
                    <div style={{ width: 72, height: 72, backgroundColor: 'var(--color-surface-alt)', overflow: 'hidden' }}>
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      to={`/product/${item.product_id}`}
                      onClick={onClose}
                      style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text-main)', display: 'block', marginBottom: '0.25rem' }}
                    >
                      {item.name}
                    </Link>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                      ${parseFloat(item.price).toFixed(2)}
                    </div>

                    {/* Qty stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid var(--color-border)', width: 'fit-content' }}>
                      <button
                        aria-label="Decrease quantity"
                        style={{ width: 32, height: 32, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-main)', transition: 'background-color 150ms' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                      >−</button>
                      <span style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 500, borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
                        {item.quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        style={{ width: 32, height: 32, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-main)', transition: 'background-color 150ms' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => updateQuantity(item.product_id, Math.min(item.stock_quantity, item.quantity + 1))}
                      >+</button>
                    </div>
                  </div>

                  {/* Item subtotal + remove */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                    <button
                      aria-label={`Remove ${item.name} from bag`}
                      onClick={() => removeFromCart(item.product_id)}
                      style={{ color: 'var(--color-text-muted)', display: 'flex', transition: 'color 150ms' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — only when there are items */}
        {user && cartItems.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--color-primary)' }}>
                ${parseFloat(cartTotal).toFixed(2)}
              </span>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              onClick={handleCheckout}
            >
              Go to Checkout <ArrowRight size={16} />
            </button>
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <Link
                to="/cart"
                onClick={onClose}
                style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', textDecoration: 'underline' }}
              >
                View full bag
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
