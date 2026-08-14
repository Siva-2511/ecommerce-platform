import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft, Lock, Info } from 'lucide-react';
import apiClient from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

/* ─── Step indicator ─── */
const StepIndicator = ({ currentStep }) => {
  const steps = ['Shipping', 'Payment', 'Confirmation'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', maxWidth: 440 }}>
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const state   = stepNum < currentStep ? 'done' : stepNum === currentStep ? 'active' : 'upcoming';
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
              <div className={`step-dot ${state === 'active' ? 'active' : state === 'done' ? 'done' : ''}`}>
                {state === 'done' ? '✓' : stepNum}
              </div>
              <span style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: state === 'active' ? 600 : 400,
                color: state === 'upcoming' ? 'var(--color-text-muted)' : 'var(--color-text-main)',
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`step-line ${state === 'done' ? 'done' : ''}`}
                style={{ margin: '0 0.5rem', marginBottom: '1.375rem' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const CheckoutPage = () => {
  const { cartItems, cartTotal, refreshCart, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId]           = useState(null);

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess]       = useState(false);
  const [paymentError, setPaymentError]           = useState(null);

  if (!user) return (
    <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '1rem' }}>Sign in to checkout</h2>
      <Link to="/login" className="btn btn-primary">Sign In</Link>
    </div>
  );

  if (itemCount === 0 && !orderCreated) return (
    <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '1rem' }}>Your bag is empty</h2>
      <Link to="/" className="btn btn-primary">Back to Shop</Link>
    </div>
  );

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/checkout', { shipping_address: address });
      setOrderCreated(true);
      setOrderId(res.data.order.order_id);
      await refreshCart();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create order. Please try again.');
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
      setPaymentError(err.response?.data?.error?.message || 'Payment simulation failed.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  /* ─── Success state ─── */
  if (paymentSuccess) return (
    <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center', maxWidth: 600 }}>
      <CheckCircle size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--color-success)' }} />
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Order Confirmed!</h1>
      <p className="text-muted" style={{ marginBottom: '2.5rem', fontSize: '0.9375rem', lineHeight: 1.7 }}>
        Thank you for your purchase. Order <strong>#{orderId}</strong> has been confirmed and will be processed shortly.
      </p>
      <Link to="/orders" className="btn btn-primary" style={{ padding: '0.875rem 2.5rem' }}>
        View My Orders
      </Link>
    </div>
  );

  const currentStep = paymentSuccess ? 3 : orderCreated ? 2 : 1;

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: 'calc(100vh - 72px)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
            <ArrowLeft size={14} /> Back to Bag
          </Link>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 2rem' }}>
        <StepIndicator currentStep={currentStep} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>

          {/* ─── Left: checkout flow ─── */}
          <div style={{ flex: '1 1 560px' }}>

            {/* Step 1: Shipping */}
            {!orderCreated ? (
              <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ backgroundColor: 'var(--color-primary)', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontFamily: 'var(--font-body)', flexShrink: 0 }}>1</span>
                  Shipping Address
                </h2>

                {error && (
                  <div className="alert alert-error">
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreateOrder}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="shipping_address">
                      Full Shipping Address
                    </label>
                    <textarea
                      id="shipping_address"
                      className="input-field"
                      rows={3}
                      required
                      maxLength={500}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="123 Main Street, City, State, ZIP, Country"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    disabled={loading}
                  >
                    <Lock size={16} />
                    {loading ? 'Processing…' : 'Continue to Payment'}
                  </button>
                </form>
              </div>
            ) : (
              /* Step 2: Payment simulation */
              <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ backgroundColor: 'var(--color-primary)', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontFamily: 'var(--font-body)', flexShrink: 0 }}>2</span>
                  Payment
                </h2>

                {/* Simulation notice */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-primary-light)', marginBottom: '1.5rem', border: '1px solid rgba(27,67,50,0.2)', fontSize: '0.875rem', color: 'var(--color-primary)' }}>
                  <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong>Simulation Mode</strong> — No real charges are made.
                    This system has a 90% success / 10% random failure scenario. Order #{orderId} is reserved.
                  </div>
                </div>

                {/* Simulated card visual */}
                <div style={{ backgroundColor: 'var(--color-primary)', borderRadius: 2, padding: '1.5rem', marginBottom: '1.5rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ position: 'absolute', right: 20, top: 20, width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', opacity: 0.7, marginBottom: '1.5rem', textTransform: 'uppercase' }}>Simulated Card</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.2em', marginBottom: '1.25rem', opacity: 0.9 }}>•••• •••• •••• 4242</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.7 }}>
                    <span>DEMO USER</span><span>12/99</span>
                  </div>
                </div>

                {paymentError && (
                  <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Payment Failed</strong><br />
                      <span>{paymentError}</span>
                    </div>
                  </div>
                )}

                {paymentError ? (
                  <Link to="/cart" className="btn btn-outline" style={{ width: '100%', padding: '1rem', textAlign: 'center', display: 'block' }}>
                    Return to Bag
                  </Link>
                ) : (
                  <button
                    onClick={handleSimulatePayment}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    disabled={paymentProcessing}
                  >
                    <Lock size={16} />
                    {paymentProcessing ? 'Processing Payment…' : 'Simulate Payment Gateway'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ─── Right: Order summary ─── */}
          {!orderCreated && (
            <div style={{ flex: '0 0 320px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '1.75rem', position: 'sticky', top: 96 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                Order Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {cartItems.map(item => (
                  <div key={item.item_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-text-muted)', flex: 1, paddingRight: '0.75rem' }}>
                      {item.quantity}× {item.name}
                    </span>
                    <span style={{ fontWeight: 500, flexShrink: 0 }}>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                  ${parseFloat(cartTotal).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
