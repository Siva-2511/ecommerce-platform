import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PackageSearch, ListOrdered, Plus } from 'lucide-react';

/* ─── Animated count-up hook ─── */
const useCountUp = (target, duration = 600) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target === 0) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration]);

  return count;
};

/* ─── Stat card ─── */
const StatCard = ({ label, value, prefix = '' }) => {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '1.25rem 1.5rem', flex: '1 1 160px' }}>
      <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-brand)', fontSize: '2rem', fontWeight: 600, color: 'var(--color-primary)' }}>
        {prefix}{animated}
      </div>
    </div>
  );
};

/* ─── Products section ─── */
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    apiClient.get('/products')
      .then(r => setProducts(Array.isArray(r.data.data) ? r.data.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const lowStock    = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
  const outOfStock  = products.filter(p => p.stock_quantity === 0).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.75rem' }}>
        <div>
          <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Management</div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Products</h2>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}>
          <Plus size={16} /> New Product
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard label="Total Products" value={products.length} />
        <StatCard label="Low Stock" value={lowStock} />
        <StatCard label="Out of Stock" value={outOfStock} />
      </div>

      {loading ? (
        <div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', gap: '2rem' }}>
              {[1, 2, 3, 4, 5].map(j => <div key={j} className="skeleton" style={{ height: 14, flex: 1 }} />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>SKU / ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.product_id}>
                  <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    #{String(p.product_id).padStart(6, '0')}
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{p.name}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{p.category_name}</td>
                  <td style={{ fontWeight: 500 }}>${parseFloat(p.price).toFixed(2)}</td>
                  <td>
                    <span style={{
                      fontWeight: p.stock_quantity <= 5 ? 600 : 400,
                      color: p.stock_quantity === 0
                        ? 'var(--color-error)'
                        : p.stock_quantity <= 5
                          ? 'var(--color-warning)'
                          : 'var(--color-text-main)',
                    }}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td>
                    {p.is_active
                      ? <span className="badge badge-success">Active</span>
                      : <span className="badge badge-error">Inactive</span>
                    }
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-ghost" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── Orders section ─── */
const AdminOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/orders/admin')
      .then(r => setOrders(Array.isArray(r.data.data) ? r.data.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
    } catch {
      alert('Failed to update order status. Please try again.');
    }
  };

  const totalRevenue = orders.filter(o => o.payment_status === 'SUCCESS').reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.75rem' }}>
        <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Management</div>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Orders</h2>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard label="Total Orders" value={orders.length} />
        <StatCard label="Revenue" value={Math.round(totalRevenue)} prefix="$" />
        <StatCard label="Pending" value={orders.filter(o => o.status === 'PENDING').length} />
      </div>

      {loading ? (
        <div>{[1, 2, 3].map(i => <div key={i} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', gap: '2rem' }}>{[1,2,3,4,5].map(j => <div key={j} className="skeleton" style={{ height: 14, flex: 1 }} />)}</div>)}</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.order_id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    #{String(o.order_id).padStart(6, '0')}
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{o.first_name} {o.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{o.email}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>${parseFloat(o.total_amount).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${o.payment_status === 'SUCCESS' ? 'badge-success' : o.payment_status === 'FAILED' ? 'badge-error' : 'badge-warning'}`}>
                      {o.payment_status || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={e => handleStatusChange(o.order_id, e.target.value)}
                      aria-label={`Update status for order ${o.order_id}`}
                      style={{
                        padding: '0.3rem 0.5rem',
                        border: '1px solid var(--color-border)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-main)',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── Admin shell ─── */
const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const isActive = (path) => location.pathname.includes(path);

  const navItem = (to, icon, label) => (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        fontWeight: isActive(to.split('/').pop()) ? 600 : 400,
        color: isActive(to.split('/').pop()) ? 'var(--color-primary)' : 'var(--color-text-muted)',
        backgroundColor: isActive(to.split('/').pop()) ? 'var(--color-bg)' : 'transparent',
        borderLeft: isActive(to.split('/').pop()) ? '2px solid var(--color-primary)' : '2px solid transparent',
        transition: 'all 150ms ease',
      }}
    >
      {icon} {label}
    </Link>
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      {/* Admin subheader */}
      <div style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', padding: '0.75rem 2rem' }}>
        <span className="uppercase" style={{ color: 'var(--color-text-muted)' }}>
          Admin — ShopScale Operations Console
        </span>
      </div>

      <div className="container" style={{ padding: '3rem 2rem', display: 'flex', gap: '3rem', flex: 1, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0, position: 'sticky', top: 110 }}>
          <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', paddingLeft: '1rem', fontSize: '0.65rem' }}>
            Operations
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            {navItem('/admin/products', <PackageSearch size={18} />, 'Products')}
            {navItem('/admin/orders',   <ListOrdered size={18} />,   'Orders')}
          </nav>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Routes>
            <Route path="/"        element={<Navigate to="products" replace />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders"   element={<AdminOrders />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
