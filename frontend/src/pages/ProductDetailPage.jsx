import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Truck, RefreshCw, ShieldCheck, Check, ShoppingBag } from 'lucide-react';
import apiClient from '../api/client';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

/* ─── Skeleton for product detail ─── */
const ProductSkeleton = () => (
  <div className="container" style={{ padding: '3rem 2rem' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem' }}>
      <div style={{ flex: '1 1 480px' }}>
        <div className="skeleton" style={{ paddingTop: '125%' }} />
      </div>
      <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="skeleton" style={{ height: 12, width: '30%' }} />
        <div className="skeleton" style={{ height: 48, width: '85%' }} />
        <div className="skeleton" style={{ height: 24, width: '20%' }} />
        <div className="skeleton" style={{ height: 80 }} />
        <div className="skeleton" style={{ height: 56 }} />
      </div>
    </div>
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [quantity, setQuantity]     = useState(1);
  const [addState, setAddState]     = useState('idle'); // idle | adding | added
  const [showStickyBar, setShowStickyBar] = useState(false);

  const mainAddRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch {
        setError('Product not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Sticky add-to-bag bar — appears when main button is out of view
  useEffect(() => {
    if (!mainAddRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(mainAddRef.current);
    return () => observer.disconnect();
  }, [product]);

  if (loading) return <ProductSkeleton />;
  if (error || !product) return (
    <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
      <div className="alert alert-error" style={{ display: 'inline-flex', maxWidth: 500 }}>{error || 'Product not found.'}</div>
      <br />
      <Link to="/" className="btn btn-outline" style={{ marginTop: '1.5rem', fontSize: '0.75rem' }}>← Back to Shop</Link>
    </div>
  );

  const isOutOfStock = product.stock_quantity === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock || addState !== 'idle') return;
    setAddState('adding');
    const result = await addToCart(product.product_id, quantity);
    if (result?.success !== false) {
      setAddState('added');
      addToast({ productName: product.name, imageUrl: product.image_url });
      setTimeout(() => setAddState('idle'), 1600);
    } else {
      setAddState('idle');
    }
  };

  const btnLabel = addState === 'added' ? '✓ Added to Bag' : addState === 'adding' ? 'Adding…' : isOutOfStock ? 'Sold Out' : 'Add to Bag';

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', flexWrap: 'wrap' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)' }}>
            <ArrowLeft size={12} /> Shop
          </Link>
          <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
          <Link to={`/?category=${product.category_slug}`} style={{ color: 'var(--color-text-muted)' }}>
            {product.category_name}
          </Link>
          <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'flex-start' }}>

          {/* Image */}
          <div style={{ flex: '1 1 480px' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              paddingTop: '125%',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}>
              <img
                src={product.image_url}
                alt={product.name}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Info panel */}
          <div style={{ flex: '1 1 380px', position: 'sticky', top: 96 }}>

            {/* Identity */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.75rem', marginBottom: '1.75rem' }}>
              <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                {product.category_name}
              </div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                {product.name}
              </h1>
              <div style={{ fontSize: '1.625rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
                ${parseFloat(product.price).toFixed(2)}
              </div>
            </div>

            {/* Description */}
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.75, marginBottom: '2rem', fontSize: '0.9375rem' }}>
              {product.description}
            </p>

            {/* Add to bag panel */}
            <div ref={mainAddRef} style={{ border: '1px solid var(--color-border)', padding: '1.5rem', marginBottom: '2rem' }}>
              {/* Availability */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                <span className="uppercase" style={{ color: 'var(--color-text-muted)' }}>Availability</span>
                {isOutOfStock ? (
                  <span style={{ color: 'var(--color-error)', fontWeight: 500 }}>Out of Stock</span>
                ) : (
                  <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>
                    In Stock — {product.stock_quantity} units
                  </span>
                )}
              </div>

              {/* Qty + CTA */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* Quantity stepper */}
                <div style={{ display: 'flex', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                  <button
                    aria-label="Decrease quantity"
                    disabled={isOutOfStock}
                    style={{ width: 40, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >−</button>
                  <span style={{ width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', fontSize: '0.875rem', fontWeight: 500 }}>
                    {quantity}
                  </span>
                  <button
                    aria-label="Increase quantity"
                    disabled={isOutOfStock}
                    style={{ width: 40, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  >+</button>
                </div>

                {/* Add button */}
                <button
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    ...(addState === 'added' && { backgroundColor: '#166534', borderColor: '#166534' }),
                  }}
                  disabled={isOutOfStock || addState === 'adding'}
                  onClick={handleAddToCart}
                  aria-label={btnLabel}
                >
                  {addState === 'added'
                    ? <><Check size={18} /> {btnLabel}</>
                    : <><ShoppingBag size={18} /> {btnLabel}</>
                  }
                </button>
              </div>
            </div>

            {/* Value props */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
              {[
                { icon: <Truck size={18} />, title: 'Complimentary Shipping', text: 'On all domestic orders over $150.' },
                { icon: <RefreshCw size={18} />, title: '30-Day Returns', text: 'Return in original condition for a full refund.' },
                { icon: <ShieldCheck size={18} />, title: 'Secure Checkout', text: 'Your payment information is encrypted and safe.' },
              ].map(({ icon, title, text }) => (
                <div key={title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-text-muted)', marginTop: 2, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sticky bottom add bar (appears on scroll) ─── */}
      {showStickyBar && product && !isOutOfStock && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          backgroundColor: 'var(--color-primary)',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          padding: '0.875rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          animation: 'fade-slide-up 250ms ease both',
        }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category_name}
            </div>
            <div style={{ color: '#ffffff', fontWeight: 500, fontSize: '0.9375rem' }}>
              {product.name}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.125rem' }}>
              ${parseFloat(product.price).toFixed(2)}
            </span>
            <button
              className="btn"
              onClick={handleAddToCart}
              disabled={addState !== 'idle'}
              aria-label="Add to bag"
              style={{ backgroundColor: '#ffffff', color: 'var(--color-primary)', padding: '0.625rem 1.5rem', fontSize: '0.75rem' }}
            >
              {addState === 'added' ? '✓ Added' : addState === 'adding' ? 'Adding…' : 'Add to Bag'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
