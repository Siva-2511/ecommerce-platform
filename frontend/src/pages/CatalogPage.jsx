import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal } from 'lucide-react';

const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/products');
        let fetchedProducts = res.data.data;
        
        if (categoryFilter) {
          fetchedProducts = fetchedProducts.filter(p => p.category_slug === categoryFilter);
        }

        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          fetchedProducts = fetchedProducts.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) || 
            p.description.toLowerCase().includes(lowerQuery)
          );
        }
        
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Failed to fetch catalog', err);
        setError('Failed to load catalog. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, searchQuery]);

  let headerTitle = 'All Collection';
  if (categoryFilter === 'apparel') headerTitle = 'Apparel';
  if (categoryFilter === 'electronics') headerTitle = 'Electronics';
  if (categoryFilter === 'home-kitchen') headerTitle = 'Home & Kitchen';
  if (categoryFilter === 'footwear') headerTitle = 'Footwear';
  if (searchQuery) headerTitle = `Search: "${searchQuery}"`;

  return (
    <div>
      {/* Header Section */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '3rem 2rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="uppercase" style={{ marginBottom: '0.5rem' }}>Shop</div>
              <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{headerTitle}</h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {products.length} {products.length === 1 ? 'Product' : 'Products'}
              </span>
              <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: 0 }}>
                <SlidersHorizontal size={14} /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container" style={{ padding: '3rem 2rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <span className="text-muted uppercase">Loading Collection...</span>
          </div>
        ) : error ? (
          <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {error}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ marginBottom: '1rem' }}>No products found</h3>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>We couldn't find any products matching your current selection.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
            gap: '2.5rem 1.5rem' 
          }}>
            {products.map(product => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
