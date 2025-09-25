import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLowStockProducts } from '../api/productApi';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  const checkLowStockProducts = async () => {
    try {
      const products = await getLowStockProducts();
      setLowStockProducts(products);
      
      // Show alert if there are low stock products and we haven't shown it recently
      if (products.length > 0) {
        const now = Date.now();
        if (!lastCheck || now - lastCheck > 300000) { // 5 minutes
          setShowLowStockAlert(true);
          setLastCheck(now);
        }
      }
    } catch (error) {
      console.error('Error checking low stock products:', error);
    }
  };

  const dismissLowStockAlert = () => {
    setShowLowStockAlert(false);
  };

  const refreshLowStockProducts = () => {
    checkLowStockProducts();
  };

  // Check for low stock products on mount and every 2 minutes
  useEffect(() => {
    checkLowStockProducts();
    const interval = setInterval(checkLowStockProducts, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

  const value = {
    lowStockProducts,
    showLowStockAlert,
    dismissLowStockAlert,
    refreshLowStockProducts,
    checkLowStockProducts
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 