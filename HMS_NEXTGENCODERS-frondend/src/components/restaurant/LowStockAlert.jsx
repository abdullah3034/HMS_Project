import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import './LowStockAlert.css';

const LowStockAlert = () => {
  const { 
    lowStockProducts, 
    showLowStockAlert, 
    dismissLowStockAlert, 
    refreshLowStockProducts 
  } = useNotifications();

  if (!showLowStockAlert || lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="low-stock-alert-overlay">
      <div className="low-stock-alert">
        <div className="alert-header">
          <div className="alert-title">
            <span className="alert-icon">⚠️</span>
            <h3>Low Stock Alert</h3>
          </div>
          <button className="close-btn" onClick={dismissLowStockAlert}>×</button>
        </div>
        
        <div className="alert-content">
          <p>The following products have reached their low stock limit:</p>
          
          <div className="low-stock-list">
            {lowStockProducts.map((product) => (
              <div key={product._id} className="low-stock-item">
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <span className="product-category">
                    {product.category && typeof product.category === 'object' 
                      ? product.category.name 
                      : 'Unknown Category'}
                  </span>
                </div>
                <div className="stock-info">
                  <span className="current-stock">Current: {product.quantity}</span>
                  <span className="limit-stock">Limit: {product.limit}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="alert-actions">
            <button className="refresh-btn" onClick={refreshLowStockProducts}>
              Refresh
            </button>
            <button className="acknowledge-btn" onClick={dismissLowStockAlert}>
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert; 