import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PackageSearch, ListOrdered, Plus } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    apiClient.get('/products').then(res => setProducts(res.data.data)).catch(console.error);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        <div>
          <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Management</div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Products</h2>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <Plus size={16} /> New Product
        </button>
      </div>
      
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
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.product_id}>
                <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>#{p.product_id.toString().padStart(6, '0')}</td>
                <td style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{p.name}</td>
                <td>{p.category_name}</td>
                <td>${parseFloat(p.price).toFixed(2)}</td>
                <td>
                  <span style={{ color: p.stock_quantity > 5 ? 'inherit' : 'var(--color-error)', fontWeight: p.stock_quantity <= 5 ? 600 : 400 }}>
                    {p.stock_quantity}
                  </span>
                </td>
                <td>
                  {p.is_active ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-error">Inactive</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-ghost" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    apiClient.get('/orders/admin').then(res => setOrders(res.data.data)).catch(console.error);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        <div>
          <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Management</div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Orders</h2>
        </div>
      </div>
      
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
                <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>#{o.order_id.toString().padStart(6, '0')}</td>
                <td style={{ fontSize: '0.875rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{o.first_name} {o.last_name}</div>
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
                    onChange={(e) => handleStatusChange(o.order_id, e.target.value)}
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--color-border)', 
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      backgroundColor: 'var(--color-surface)',
                      outline: 'none'
                    }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Admin Top Header (replaces standard Navbar just for layout context, though standard navbar is still rendered above this in App.jsx. Let's assume standard navbar is rendered above this. So we don't need a top header here, but we need a strict structural layout.) */}
      
      <div className="container" style={{ padding: '3rem 2rem', display: 'flex', gap: '4rem', flex: 1, alignItems: 'flex-start' }}>
        
        {/* Sidebar */}
        <div style={{ width: '220px', flexShrink: 0, position: 'sticky', top: '120px' }}>
          <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', paddingLeft: '1rem' }}>
            System Settings
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Link 
              to="/admin/products" 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', 
                padding: '0.75rem 1rem', 
                color: isActive('products') ? 'var(--color-primary)' : 'var(--color-text-muted)', 
                backgroundColor: isActive('products') ? 'var(--color-bg)' : 'transparent',
                borderLeft: isActive('products') ? '2px solid var(--color-primary)' : '2px solid transparent',
                fontWeight: isActive('products') ? 600 : 400,
                fontSize: '0.875rem'
              }}
            >
              <PackageSearch size={18} /> Products
            </Link>
            <Link 
              to="/admin/orders" 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', 
                padding: '0.75rem 1rem', 
                color: isActive('orders') ? 'var(--color-primary)' : 'var(--color-text-muted)', 
                backgroundColor: isActive('orders') ? 'var(--color-bg)' : 'transparent',
                borderLeft: isActive('orders') ? '2px solid var(--color-primary)' : '2px solid transparent',
                fontWeight: isActive('orders') ? 600 : 400,
                fontSize: '0.875rem'
              }}
            >
              <ListOrdered size={18} /> Orders
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<Navigate to="products" replace />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
          </Routes>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
