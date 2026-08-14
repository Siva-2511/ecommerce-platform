import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import apiClient from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CheckoutPage = () => {
  const { cartItems, cartTotal, refreshCart, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // States for the multi-step flow
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Please log in to checkout</h2>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Log In</Link>
      </div>
    );
  }

  if (itemCount === 0 && !orderCreated) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Shop</Link>
      </div>
    );
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/checkout', { shipping_address: address });
      setOrderCreated(true);
      setOrderId(res.data.order.order_id);
      await refreshCart(); // Refresh cart (should be empty now)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setPaymentProcessing(true);
    setPaymentError(null);
    try {
      await apiClient.post('/payments/simulate', { order_id: orderId });
      setPaymentSuccess(true);
    } catch (err) {
      setPaymentError(err.response?.data?.error?.message || 'Payment simulation failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center', maxWidth: '600px' }}>
        <CheckCircle size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--color-success)' }} />
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem', fontFamily: 'var(--font-brand)' }}>
          Order Confirmed!
        </h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Thank you for your purchase. Your payment was successful and your order #{orderId} is now being processed.
        </p>
        <Link to="/orders" className="btn btn-primary">View My Orders</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <Link 
        to="/cart" 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'flex-start' }}>
        
        {/* Left: Checkout Flow */}
        <div style={{ flex: '1 1 600px' }}>
          
          {/* Step 1: Shipping (Only show if order not created) */}
          {!orderCreated ? (
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-brand)', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
                1. Shipping Address
              </h2>
              
              {error && (
                <div style={{ backgroundColor: '#ffe4e6', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <AlertCircle size={20} /> {error}
                </div>
              )}

              <form onSubmit={handleCreateOrder}>
                <div className="input-group">
                  <label className="input-label">Full Address</label>
                  <textarea 
                    className="input-field" 
                    rows="3" 
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, Country, Zip"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </form>
            </div>
          ) : (
            
            /* Step 2: Payment Simulation */
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <CheckCircle size={24} color="var(--color-success)" />
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-brand)', color: 'var(--color-primary)' }}>
                  2. Payment Simulation
                </h2>
              </div>

              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                Order #{orderId} created successfully. Stock has been reserved. Please complete your payment. (90% success rate simulated)
              </p>

              {paymentError && (
                <div style={{ backgroundColor: '#ffe4e6', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} /> 
                  <div>
                    <strong>Payment Failed.</strong><br/>
                    {paymentError}
                  </div>
                </div>
              )}

              {paymentError ? (
                 <Link to="/cart" className="btn btn-outline" style={{ width: '100%', padding: '1rem', textAlign: 'center' }}>
                   Return to Cart
                 </Link>
              ) : (
                <button 
                  onClick={handleSimulatePayment} 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? 'Processing Payment...' : 'Simulate Payment Gateway'}
                </button>
              )}
            </div>
          )}

        </div>

        {/* Right: Order Summary */}
        {!orderCreated && (
          <div style={{ flex: '1 1 350px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2rem', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-brand)', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
              {cartItems.map(item => (
                <div key={item.item_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              <span>Total</span>
              <span>${parseFloat(cartTotal).toFixed(2)}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutPage;
