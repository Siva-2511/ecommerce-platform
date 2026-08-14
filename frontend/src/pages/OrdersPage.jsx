import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

/* ─── Status progress bar ─── */
const ORDER_STEPS = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const OrderProgress = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-error)' }} />
        <span style={{ color: 'var(--color-error)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cancelled</span>
      </div>
    );
  }

  const currentIdx = ORDER_STEPS.indexOf(status);
  const pct = currentIdx >= 0 ? ((currentIdx) / (ORDER_STEPS.length - 1)) * 100 : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        {ORDER_STEPS.map((step, i) => (
          <span key={step} style={{
            fontSize: '0.6rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: i <= currentIdx ? 600 : 400,
            color: i <= currentIdx ? 'var(--color-primary)' : 'var(--color-text-muted)',
          }}>
            {step}
          </span>
        ))}
      </div>
      {/* Progress track */}
      <div style={{ height: 3, backgroundColor: 'var(--color-border)', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          height: '100%',
          width: `${pct}%`,
          backgroundColor: 'var(--color-primary)',
          transition: 'width 600ms ease',
        }} />
      </div>
    </div>
  );
};

/* ─── Skeleton row ─── */
const OrderSkeleton = () => (
  <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '3rem' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 11, width: '50%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 15, width: '70%' }} />
        </div>
      ))}
    </div>
  </div>
);

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await apiClient.get('/orders');
        setOrders(Array.isArray(res.data.data) ? res.data.data : []);
      } catch {
        setError('Failed to load your orders. Please refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return (
    <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '0.75rem' }}>Please sign in to view orders</h2>
      <Link to="/login" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Sign In</Link>
    </div>
  );

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: 'calc(100vh - 72px)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '2rem 2rem 1.5rem' }}>
          <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Account</div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>My Orders</h1>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 2rem' }}>
        {loading ? (
          <div>{[1, 2, 3].map(i => <OrderSkeleton key={i} />)}</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Package size={52} style={{ margin: '0 auto 1.5rem', color: 'var(--color-border)' }} />
            <h3 style={{ marginBottom: '0.75rem' }}>No orders yet</h3>
            <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
              When you make a purchase, it will appear here.
            </p>
            <Link to="/" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
              <ShoppingBag size={16} style={{ marginRight: '0.375rem' }} /> Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => (
              <div key={order.order_id} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                {/* Order header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-alt)',
                }}>
                  <div>
                    <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Order</div>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                      #{String(order.order_id).padStart(6, '0')}
                    </div>
                  </div>
                  <div>
                    <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Placed</div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total</div>
                    <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-primary)' }}>
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </div>
                  </div>
                  {order.payment_status && (
                    <div>
                      <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Payment</div>
                      <span className={`badge ${order.payment_status === 'SUCCESS' ? 'badge-success' : order.payment_status === 'FAILED' ? 'badge-error' : 'badge-warning'}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <OrderProgress status={order.status} />
                </div>

                {/* Items */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {order.items.map((item, idx) => (
                    <div
                      key={item.item_id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.625rem 0',
                        borderBottom: idx < order.items.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', minWidth: 28, fontSize: '0.8125rem' }}>
                          {item.quantity}×
                        </span>
                        <Link
                          to={`/product/${item.product_id}`}
                          style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 500 }}
                        >
                          {item.product_name}
                        </Link>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                        ${parseFloat(item.product_price).toFixed(2)} each
                      </div>
                    </div>
                  ))}

                  {/* Shipping */}
                  <div style={{ marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid var(--color-border-subtle)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    <strong style={{ color: 'var(--color-text-main)' }}>Shipping address: </strong>
                    {order.shipping_address}
                  </div>

                  {/* Failure reason */}
                  {order.failure_reason && (
                    <div className="alert alert-error" style={{ marginTop: '1rem', marginBottom: 0 }}>
                      {order.failure_reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
