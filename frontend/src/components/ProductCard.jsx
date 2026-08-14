import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const isOutOfStock = product.stock_quantity === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault(); 
    if (isOutOfStock) return;
    await addToCart(product.product_id, 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', group: 'card' }}>
      
      {/* Image Container */}
      <Link to={`/product/${product.product_id}`} style={{ display: 'block', position: 'relative', width: '100%', paddingTop: '125%', backgroundColor: 'var(--color-surface-alt)', overflow: 'hidden', marginBottom: '1rem' }}>
        <img 
          src={product.image_url} 
          alt={product.name}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          loading="lazy"
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        
        {/* Stock Badges (Top Left, Editorial style) */}
        <div style={{ position: 'absolute', top: '0', left: '0', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {isOutOfStock && <span className="badge badge-neutral" style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none' }}>Sold Out</span>}
          {isLowStock && <span className="badge badge-neutral" style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', color: 'var(--color-warning)' }}>Few Left</span>}
        </div>
      </Link>

      {/* Product Info */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
          <Link to={`/product/${product.product_id}`} style={{ flex: 1, paddingRight: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-main)', lineHeight: 1.4 }}>
              {product.name}
            </h3>
          </Link>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            ${parseFloat(product.price).toFixed(2)}
          </span>
        </div>
        
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          {product.category_name}
        </span>
        
        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="btn btn-outline"
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              fontSize: '0.75rem', 
              border: '1px solid var(--color-border-subtle)',
              backgroundColor: isOutOfStock ? 'var(--color-bg)' : 'transparent',
              color: isOutOfStock ? 'var(--color-text-muted)' : 'var(--color-text-main)',
            }}
          >
            {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default ProductCard;
