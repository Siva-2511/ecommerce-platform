import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      borderTop: '1px solid var(--color-border)', 
      backgroundColor: 'var(--color-surface)',
      padding: '3rem 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            ShopScale
          </h3>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            A scalable cloud-based e-commerce demonstration.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <strong>Shop</strong>
            <a href="#" className="text-muted">Apparel</a>
            <a href="#" className="text-muted">Electronics</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <strong>About</strong>
            <a href="#" className="text-muted">Architecture</a>
            <a href="#" className="text-muted">Source Code</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
