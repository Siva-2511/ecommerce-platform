import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ─── Not logged in ─── */
  if (!user) return (
    <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
      <ShoppingBag size={52} style={{ margin: '0 auto 1.5rem', color: 'var(--color-border)' }} />
      <h2 style={{ marginBottom: '0.75rem' }}>Sign in to view your bag</h2>
      <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>Your saved items will appear here.</p>
      <Link to="/login" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>Sign In</Link>
    </div>
  );

  /* ─── Loading ─── */
  if (loading) return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div className="skeleton" style={{ width: 96, height: 96, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 12, width: '35%' }} />
          </div>
          <div className="skeleton" style={{ height: 36, width: 110 }} />
          <div className="skeleton" style={{ height: 20, width: 60 }} />
        </div>
      ))}
    </div>
  );

  /* ─── Empty ─── */
  if (cartItems.length === 0) return (
    <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
      <ShoppingBag size={52} style={{ margin: '0 auto 1.5rem', color: 'var(--color-border)' }} />
      <h2 style={{ marginBottom: '0.75rem' }}>Your bag is empty</h2>
      <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>Looks like you haven't added anything yet.</p>
      <Link to="/" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>Continue Shopping</Link>
    </div>
  );

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: 'calc(100vh - 72px)' }}>
      {/* Page header */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '2rem 2rem 1.5rem' }}>
          <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Review</div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>
            Shopping Bag
            <span style={{ fontSize: '1rem', fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '0.875rem' }}>
              {cartItems.reduce((s, i) => s + i.quantity, 0)} item{cartItems.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
            </span>
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>

          {/* ─── Items ─── */}
          <div style={{ flex: '1 1 580px' }}>
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              {/* Column headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                padding: '0.875rem 1.5rem',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-alt)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 500,
                color: 'var(--color-text-muted)',
                gap: '1rem',
              }}>
                <div>Product</div>
                <div style={{ textAlign: 'center', minWidth: 110 }}>Quantity</div>
                <div style={{ textAlign: 'right', minWidth: 70 }}>Total</div>
                <div style={{ width: 32 }} />
              </div>

              {cartItems.map((item, idx) => (
                <div
                  key={item.item_id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto auto',
                    padding: '1.25rem 1.5rem',
                    borderBottom: idx < cartItems.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  {/* Product info */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: 0 }}>
                    <Link to={`/product/${item.product_id}`} style={{ flexShrink: 0 }}>
                      <div style={{ width: 80, height: 80, backgroundColor: 'var(--color-surface-alt)', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </Link>
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/product/${item.product_id}`} style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--color-text-main)', display: 'block', marginBottom: '0.25rem' }}>
                        {item.name}
                      </Link>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        ${parseFloat(item.price).toFixed(2)} each
                      </div>
                    </div>
                  </div>

                  {/* Qty stepper */}
                  <div style={{ display: 'flex', border: '1px solid var(--color-border)', width: 'fit-content' }}>
                    <button
                      aria-label="Decrease quantity"
                      style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
                      onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                    >−</button>
                    <span style={{ width: 38, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', fontSize: '0.8125rem', fontWeight: 500 }}>
                      {item.quantity}
                    </span>
                    <button
                      aria-label="Increase quantity"
                      style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
                      onClick={() => updateQuantity(item.product_id, Math.min(item.stock_quantity, item.quantity + 1))}
                    >+</button>
                  </div>

                  {/* Item total */}
                  <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.9375rem', minWidth: 70 }}>
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove */}
                  <button
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeFromCart(item.product_id)}
                    style={{ color: 'var(--color-text-muted)', display: 'flex', transition: 'color 150ms', padding: '0.25rem' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <Link to="/" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', borderBottom: '1px solid currentColor', paddingBottom: '1px' }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* ─── Order Summary ─── */}
          <div style={{ flex: '0 0 340px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '2rem', position: 'sticky', top: 96 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
              {cartItems.map(item => (
                <div key={item.item_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.quantity}× {item.name}</span>
                  <span style={{ fontWeight: 500 }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '1.0625rem' }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                ${parseFloat(cartTotal).toFixed(2)}
              </span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
