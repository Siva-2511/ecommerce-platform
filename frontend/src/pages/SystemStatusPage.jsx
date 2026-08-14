import React, { useState, useEffect } from 'react';
import { Server, Activity, Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import apiClient from '../api/client';

const SystemStatusPage = () => {
  const [health, setHealth]     = useState(null);
  const [instance, setInstance] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setError(false);
    try {
      // Fetch health check and instance info concurrently
      // We manually construct the URLs here just in case apiClient prefixing interferes, 
      // but standard apiClient usage is fine if configured cleanly.
      const [healthRes, instanceRes] = await Promise.all([
        // If apiClient is configured with /api as baseURL, we might need to remove it for /health
        // But let's try direct axios if needed, or rely on the proxy/config.
        // For safety since /health is often at root:
        apiClient.get(apiClient.defaults.baseURL.replace('/api', '') + '/health'),
        apiClient.get('/instance')
      ]);

      setHealth(healthRes.data);
      setInstance(instanceRes.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const isOperational = !error && health?.status === 'OK';

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: 'calc(100vh - 72px)', padding: '4rem 2rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Activity size={48} style={{ color: 'var(--color-primary)', margin: '0 auto 1.25rem' }} />
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>System Status</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', maxWidth: 460, margin: '0 auto' }}>
            Real-time infrastructure health and load balancer routing metrics for the ShopScale cluster.
          </p>
        </div>

        {/* Global Status Banner */}
        <div style={{ 
          backgroundColor: isOperational ? 'var(--color-success)' : loading ? 'var(--color-surface)' : 'var(--color-error)',
          color: isOperational ? '#fff' : loading ? 'var(--color-text-main)' : '#fff',
          padding: '1.5rem 2rem',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          border: loading ? '1px solid var(--color-border)' : 'none',
          boxShadow: isOperational ? '0 4px 14px rgba(22, 101, 52, 0.2)' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            {loading ? <RefreshCw className="spin" size={24} /> : isOperational ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {loading ? 'Checking Systems...' : isOperational ? 'All Systems Operational' : 'System Degraded'}
            </span>
          </div>
          <button 
            onClick={fetchStatus}
            disabled={loading}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'inherit',
              border: 'none',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* API & Database */}
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>
              <Database size={22} />
              <h2 style={{ fontSize: '1.125rem', margin: 0 }}>API & Database</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Status</span>
                <span className={`badge ${isOperational ? 'badge-success' : loading ? '' : 'badge-error'}`}>
                  {loading ? '...' : isOperational ? 'Online' : 'Offline'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Last Checked</span>
                <span style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                  {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '--:--:--'}
                </span>
              </div>
            </div>
          </div>

          {/* Load Balancer */}
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>
              <Server size={22} />
              <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Load Balancer</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Active Instance</span>
                <span className="badge" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {loading ? '...' : instance?.instance || 'Unknown'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Routing Timestamp</span>
                <span style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                  {instance?.timestamp ? new Date(instance.timestamp).toLocaleTimeString() : '--:--:--'}
                </span>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default SystemStatusPage;
