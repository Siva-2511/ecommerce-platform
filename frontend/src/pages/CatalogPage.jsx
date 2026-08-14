import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';

/* ─── Skeleton card shown while products load ─── */
const SkeletonCard = () => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div className="skeleton" style={{ paddingTop: '125%', position: 'relative', marginBottom: '0.875rem' }} />
    <div className="skeleton" style={{ height: 13, width: '75%', marginBottom: 8 }} />
    <div className="skeleton" style={{ height: 11, width: '45%', marginBottom: 16 }} />
    <div className="skeleton" style={{ height: 34 }} />
  </div>
);

const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchQuery    = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/products');
        let data = Array.isArray(res.data.data) ? res.data.data : [];

        if (categoryFilter) {
          data = data.filter(p => p.category_slug === categoryFilter);
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          data = data.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          );
        }
        setProducts(data);
      } catch {
        setError('Failed to load the catalog. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryFilter, searchQuery]);

  let headerTitle = 'All Collection';
  if (categoryFilter === 'apparel')      headerTitle = 'Apparel';
  if (categoryFilter === 'electronics')  headerTitle = 'Electronics';
  if (categoryFilter === 'home-kitchen') headerTitle = 'Home & Kitchen';
  if (categoryFilter === 'footwear')     headerTitle = 'Footwear';
  if (searchQuery)                       headerTitle = `Search: "${searchQuery}"`;

  const isHome = !categoryFilter && !searchQuery;

  return (
    <div>
      {/* ─── Editorial Hero (shown only on home/all collection view) ─── */}
      {isHome && (
        <div style={{ position: 'relative', overflow: 'hidden', height: 420, backgroundColor: 'var(--color-primary)' }}>
          {/* Ken-Burns background */}
          <div
            className="hero-bg-img"
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.35,
            }}
          />

          {/* Content */}
          <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '3rem' }}>
            <div className="uppercase" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem' }}>
              New Season
            </div>
            <h1 style={{ color: '#ffffff', fontSize: 'clamp(2rem, 5vw, 3.5rem)', maxWidth: 600, marginBottom: '1.5rem', fontWeight: 600 }}>
              Curated for Every Occasion
            </h1>
            <Link
              to="/?category=apparel"
              className="btn"
              style={{ backgroundColor: '#ffffff', color: 'var(--color-primary)', width: 'fit-content', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.75rem', fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              Shop Collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* ─── Catalog Header ─── */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '2rem 2rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="uppercase" style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Shop</div>
              <h2 style={{ margin: 0, fontSize: '2rem' }}>{headerTitle}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {!loading && (
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {products.length} {products.length === 1 ? 'product' : 'products'}
                </span>
              )}
              <button
                className="btn-outline btn"
                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Product Grid ─── */}
      <div className="container" style={{ padding: '3rem 2rem' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2.5rem 1.5rem' }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="alert alert-error" style={{ maxWidth: 600, margin: '0 auto' }}>
            {error}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>No products found</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              We couldn't find products matching your selection.
            </p>
            <Link to="/" className="btn btn-outline" style={{ fontSize: '0.75rem' }}>Clear Selection</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2.5rem 1.5rem' }}>
            {products.map((product, i) => (
              <ProductCard
                key={product.product_id}
                product={product}
                animationDelay={Math.min(i * 50, 400)} // stagger capped at 400ms
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
