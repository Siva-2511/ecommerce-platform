import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState('0.00');
  const [loading, setLoading] = useState(false);

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartTotal('0.00');
    }
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/cart');
      setCartItems(res.data.data.items);
      setCartTotal(res.data.data.subtotal);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await apiClient.post('/cart/items', { product_id: productId, quantity });
      setCartItems(res.data.data.items);
      setCartTotal(res.data.data.subtotal);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error?.message || 'Failed to add to cart' 
      };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await apiClient.put(`/cart/items/${productId}`, { quantity });
      setCartItems(res.data.data.items);
      setCartTotal(res.data.data.subtotal);
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await apiClient.delete(`/cart/items/${productId}`);
      setCartItems(res.data.data.items);
      setCartTotal(res.data.data.subtotal);
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartTotal('0.00');
  };

  const value = {
    cartItems,
    cartTotal,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
