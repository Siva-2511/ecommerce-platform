import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import apiClient from '../api/client';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}><span className="uppercase text-muted">Loading product...</span></div>;
  if (error || !product) return <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}><div className="alert alert-error" style={{ display: 'inline-block' }}>{error}</div></div>;

  const isOutOfStock = product.stock_quantity === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setAddingToCart(true);
    await addToCart(product.product_id, quantity);
    setAddingToCart(false);
  };

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="container" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Link to="/" className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowLeft size={12} /> Shop
          </Link>
          <ChevronRight size={12} className="text-muted" />
          <Link to={`/?category=${product.category_slug}`} className="text-muted">{product.category_name}</Link>
          <ChevronRight size={12} className="text-muted" />
          <span style={{ fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'flex-start' }}>
          
          {/* Left: Product Image (Larger focus) */}
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ position: 'relative', width: '100%', paddingTop: '125%', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
              <img 
                src={product.image_url} 
                alt={product.name}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Right: Dense Information & Actions */}
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', position: 'sticky', top: '100px' }}>
            
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
              <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                {product.category_name}
              </div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                {product.name}
              </h1>
              <div style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
                ${parseFloat(product.price).toFixed(2)}
              </div>
            </div>

            <div style={{ color: 'var(--color-text-main)', lineHeight: 1.6, marginBottom: '2.5rem', fontSize: '0.9375rem' }}>
              {product.description}
            </div>

            {/* Action Block */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <span className="uppercase" style={{ color: 'var(--color-text-muted)' }}>Status</span>
                {isOutOfStock ? (
                  <span style={{ color: 'var(--color-error)', fontWeight: 500 }}>Out of Stock</span>
                ) : (
                  <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>
                    In Stock — {product.stock_quantity} Available
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', border: '1px solid var(--color-border)', width: '120px' }}>
                  <button 
                    style={{ flex: 1, padding: '0.75rem 0', fontSize: '1rem' }} 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                  >−</button>
                  <input 
                    type="text" 
                    value={quantity}
                    readOnly
                    style={{ width: '40px', textAlign: 'center', border: 'none', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', fontSize: '0.875rem', fontFamily: 'var(--font-body)', backgroundColor: 'transparent' }}
                  />
                  <button 
                    style={{ flex: 1, padding: '0.75rem 0', fontSize: '1rem' }} 
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={isOutOfStock}
                  >+</button>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '1rem', borderRadius: 0 }}
                  disabled={isOutOfStock || addingToCart}
                  onClick={handleAddToCart}
                >
                  {addingToCart ? 'ADDING...' : (isOutOfStock ? 'SOLD OUT' : 'ADD TO BAG')}
                </button>
              </div>
            </div>

            {/* Value Props / Metadata */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <Truck size={20} className="text-muted" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Complimentary Shipping</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>On all domestic orders over $150.</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <RefreshCw size={20} className="text-muted" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>30-Day Returns</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Return in original condition for a full refund.</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <ShieldCheck size={20} className="text-muted" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Secure Checkout</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Your payment information is encrypted and secure.</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
