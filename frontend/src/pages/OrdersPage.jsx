import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const res = await apiClient.get('/orders');
        setOrders(res.data.data);
      } catch (err) {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <h2>Please log in to view orders</h2>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Log In</Link>
      </div>
    );
  }

  if (loading) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading orders...</div>;
  if (error) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--color-error)' }}>{error}</div>;

  if (orders.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <Package size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--color-border)' }} />
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>No orders yet</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>When you make a purchase, it will appear here.</p>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Start Shopping</Link>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle size={16} color="var(--color-success)" />;
      case 'CANCELLED': return <XCircle size={16} color="var(--color-error)" />;
      default: return <Clock size={16} color="var(--color-warning)" />;
    }
  };

  const getStatusBadge = (status) => {
    let className = 'badge ';
    switch (status) {
      case 'DELIVERED': className += 'badge-success'; break;
      case 'CANCELLED': className += 'badge-error'; break;
      default: className += 'badge-warning'; break;
    }
    return <span className={className}>{status}</span>;
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '2rem', fontFamily: 'var(--font-brand)' }}>
        My Orders
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {orders.map(order => (
          <div key={order.order_id} className="card" style={{ padding: '0' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: '#fafafa' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                  Order Placed
                </div>
                <div style={{ fontWeight: 500 }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                  Total
                </div>
                <div style={{ fontWeight: 500 }}>
                  ${parseFloat(order.total_amount).toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                  Order # {order.order_id}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  {getStatusIcon(order.status)} {getStatusBadge(order.status)}
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: '1.5rem' }}>
              {order.items.map(item => (
                <div key={item.item_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{item.quantity}x</div>
                    <div>
                      <Link to={`/product/${item.product_id}`} style={{ color: 'var(--color-primary)' }}>
                        {item.product_name}
                      </Link>
                    </div>
                  </div>
                  <div style={{ color: 'var(--color-text-muted)' }}>
                    ${parseFloat(item.product_price).toFixed(2)} each
                  </div>
                </div>
              ))}
              
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
                <strong>Shipping Address:</strong><br/>
                <span className="text-muted">{order.shipping_address}</span>
              </div>
              
              {order.payment_status && (
                <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                  <strong>Payment Status:</strong> {order.payment_status}
                  {order.failure_reason && <span style={{ color: 'var(--color-error)', marginLeft: '0.5rem' }}>({order.failure_reason})</span>}
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
