import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <ShoppingBag size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--color-text-muted)' }} />
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>Your cart is waiting</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Please sign in to view your cart.</p>
        <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <ShoppingBag size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--color-border)' }} />
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>Your cart is empty</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '2rem' }}>Shopping Cart</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
        
        {/* Cart Items */}
        <div style={{ flex: '1 1 600px' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: '#fafafa', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <div>Product</div>
              <div style={{ textAlign: 'center' }}>Quantity</div>
              <div style={{ textAlign: 'right' }}>Total</div>
              <div style={{ width: '40px' }}></div>
            </div>

            {/* Items */}
            {cartItems.map((item) => (
              <div key={item.item_id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', padding: '1.5rem', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
                
                {/* Product Info */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#f5f5f5', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <Link to={`/product/${item.product_id}`} style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {item.name}
                    </Link>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      ${parseFloat(item.price).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <button 
                      style={{ padding: '0.25rem 0.75rem' }} 
                      onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                    >−</button>
                    <input 
                      type="number" 
                      value={item.quantity}
                      readOnly
                      style={{ width: '40px', textAlign: 'center', border: 'none', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', fontSize: '0.875rem' }}
                    />
                    <button 
                      style={{ padding: '0.25rem 0.75rem' }} 
                      onClick={() => updateQuantity(item.product_id, Math.min(item.stock_quantity, item.quantity + 1))}
                    >+</button>
                  </div>
                </div>

                {/* Item Total */}
                <div style={{ textAlign: 'right', fontWeight: 600 }}>
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </div>

                {/* Remove */}
                <div style={{ textAlign: 'right' }}>
                  <button 
                    onClick={() => removeFromCart(item.product_id)}
                    style={{ color: 'var(--color-text-muted)', padding: '0.5rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-error)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ flex: '1 1 350px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-brand)', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
            <span>Subtotal</span>
            <span>${parseFloat(cartTotal).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            <span>Total</span>
            <span>${parseFloat(cartTotal).toFixed(2)}</span>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
