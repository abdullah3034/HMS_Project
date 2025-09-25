import React from "react";
import "./ViewBillPopup.css";

export default function ViewBillPopup({ order, onClose }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bill-overlay">
      <div className="bill-popup">
        <div className="bill-header">
          <h2>NexStay Hotel</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="bill-content">
          <div className="bill-info">
            <div className="bill-row">
              <span><strong>Bill No:</strong></span>
              <span>{order.orderNo}</span>
            </div>
            <div className="bill-row">
              <span><strong>Date:</strong></span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="bill-row">
              <span><strong>Time:</strong></span>
              <span>{formatTime(order.createdAt)}</span>
            </div>
            <div className="bill-row">
              <span><strong>Guest:</strong></span>
              <span>{order.guestInfo?.guestName || "Walk-in Customer"}</span>
            </div>
            <div className="bill-row">
              <span><strong>Room:</strong></span>
              <span>{order.guestInfo?.roomNo || "N/A"}</span>
            </div>
            <div className="bill-row">
              <span><strong>Order Type:</strong></span>
              <span>{order.orderType}</span>
            </div>
            <div className="bill-row">
              <span><strong>Status:</strong></span>
              <span className={`status-badge ${order.status.toLowerCase().replace(' ', '-')}`}>
                {order.status}
              </span>
            </div>
          </div>
          
          <div className="bill-items">
            <div className="bill-items-header">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            
            {order.items.map((item, index) => (
              <div key={index} className="bill-item">
                <span className="item-name">{item.name}</span>
                <span className="item-qty">{item.quantity}</span>
                <span className="item-price">${(item.amount / item.quantity).toFixed(2)}</span>
                <span className="item-total">${item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="bill-total">
            <div className="total-row">
              <span><strong>Total Amount:</strong></span>
              <span><strong>${order.total.toFixed(2)}</strong></span>
            </div>
          </div>
          
          <div className="bill-footer">
            <p>Thank you for dining with us!</p>
            <p>Please visit again</p>
          </div>
        </div>
        
        <div className="bill-actions">
          <button className="print-btn" onClick={() => window.print()}>
            Print Bill
          </button>
          <button className="close-bill-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 