import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product, animationDelay = 0 }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [addState, setAddState] = useState('idle'); // idle | adding | added

  const isLowStock  = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const isOutOfStock = product.stock_quantity === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock || addState !== 'idle') return;

    setAddState('adding');
    const result = await addToCart(product.product_id, 1);

    if (result?.success !== false) {
      setAddState('added');
      addToast({ productName: product.name, imageUrl: product.image_url });
      setTimeout(() => setAddState('idle'), 1600);
    } else {
      setAddState('idle');
    }
  };

  return (
    <div
      className="product-card-wrapper product-grid-item"
      style={{ display: 'flex', flexDirection: 'column', animationDelay: `${animationDelay}ms` }}
    >
      {/* Image container */}
      <Link
        to={`/product/${product.product_id}`}
        style={{ display: 'block', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--color-surface-alt)' }}
        tabIndex={0}
        aria-label={`View ${product.name}`}
      >
        <div style={{ paddingTop: '125%', position: 'relative' }}>
          <img
            className="product-card-img"
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Stock badges */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {isOutOfStock && (
            <span style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: 'var(--color-text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, padding: '0.2rem 0.5rem' }}>
              Sold Out
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: 'var(--color-warning)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, padding: '0.2rem 0.5rem' }}>
              Only {product.stock_quantity} left
            </span>
          )}
        </div>

        {/* Quick-add icon — fades in on hover */}
        {!isOutOfStock && (
          <button
            className="product-card-quick-add"
            aria-label={`Quick add ${product.name} to bag`}
            onClick={handleAddToCart}
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '0.75rem',
              width: 38,
              height: 38,
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {addState === 'added' ? <Check size={18} /> : <ShoppingBag size={18} />}
          </button>
        )}
      </Link>

      {/* Info */}
      <div style={{ padding: '0.875rem 0 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Link to={`/product/${product.product_id}`} style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-main)', lineHeight: 1.4, margin: 0 }}>
              {product.name}
            </h3>
          </Link>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', flexShrink: 0 }}>
            ${parseFloat(product.price).toFixed(2)}
          </span>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.875rem' }}>
          {product.category_name}
        </span>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || addState === 'adding'}
          className="btn btn-outline"
          aria-label={isOutOfStock ? `${product.name} is sold out` : `Add ${product.name} to bag`}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '0.7rem',
            marginTop: 'auto',
            transition: 'all 150ms ease',
            ...(addState === 'added' && {
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              borderColor: 'var(--color-primary)',
            }),
            ...(isOutOfStock && { opacity: 0.5, cursor: 'not-allowed' }),
          }}
        >
          {addState === 'added' ? '✓ Added' : addState === 'adding' ? 'Adding…' : isOutOfStock ? 'Sold Out' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
