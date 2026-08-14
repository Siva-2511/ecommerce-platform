import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Mail, ExternalLink } from 'lucide-react';

const CATEGORIES = [
  { name: 'All Collection', to: '/' },
  { name: 'Apparel',        to: '/?category=apparel' },
  { name: 'Electronics',    to: '/?category=electronics' },
  { name: 'Home & Kitchen', to: '/?category=home-kitchen' },
  { name: 'Footwear',       to: '/?category=footwear' },
];

const ACCOUNT_LINKS = [
  { name: 'Sign In',     to: '/login' },
  { name: 'Register',    to: '/register' },
  { name: 'My Orders',   to: '/orders' },
  { name: 'Shopping Bag',to: '/cart' },
];

const ARCHITECTURE_LINKS = [
  { name: 'GitHub Repository',     href: 'https://github.com/Siva-2511/ecommerce-platform', external: true },
  { name: 'API Health Check',      href: '/health', external: true },
  { name: 'Load Balancer Demo',    href: '/api/instance', external: true },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: 'var(--color-primary)',
      color: 'rgba(255,255,255,0.85)',
      marginTop: 'auto',
    }}>
      {/* ─── Main footer grid ─── */}
      <div className="container" style={{ padding: '4rem 2rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '3rem' }}>

        {/* Brand column */}
        <div style={{ gridColumn: 'span 1' }}>
          <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.875rem', letterSpacing: '-0.03em' }}>
            ShopScale.
          </div>
          <p style={{ fontSize: '0.8125rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', maxWidth: 220, marginBottom: '1.5rem' }}>
            A cloud-native e-commerce platform demonstrating horizontal scaling, load balancing, and fault-tolerant architecture on a $0 stack.
          </p>

          {/* Social / links */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
              href="https://github.com/Siva-2511/ecommerce-platform"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >
              <Code size={20} />
            </a>
            <a
              href="mailto:admin@shopscale.com"
              aria-label="Contact email"
              style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Shop column */}
        <div>
          <div className="uppercase" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>Shop</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {CATEGORIES.map(c => (
              <Link
                key={c.name}
                to={c.to}
                style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', transition: 'color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Account column */}
        <div>
          <div className="uppercase" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>Account</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ACCOUNT_LINKS.map(l => (
              <Link
                key={l.name}
                to={l.to}
                style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', transition: 'color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                {l.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Architecture / About column */}
        <div>
          <div className="uppercase" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>Architecture</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ARCHITECTURE_LINKS.map(l => (
              <a
                key={l.name}
                href={l.href}
                target={l.external ? '_blank' : '_self'}
                rel={l.external ? 'noopener noreferrer' : undefined}
                style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', transition: 'color 150ms', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                {l.name} {l.external && <ExternalLink size={12} />}
              </a>
            ))}

            {/* Tech stack summary */}
            <div style={{ marginTop: '0.5rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
                React + Vite · Node.js + Express<br />
                PostgreSQL (Neon) · Nginx LB · Docker<br />
                Hosted on Render · Cloudinary CDN
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom bar ─── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.12)',
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
          © {year} ShopScale. Built as a cloud computing academic demonstration.
        </p>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
          Designed &amp; built by Siva — round-robin load balanced.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
