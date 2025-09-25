import React, { useState } from "react";
import "./CheckoutPopup.css";

export default function CheckoutPopup({ order, onClose, onPaymentComplete }) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (paymentMethod === "cash" && parseFloat(amountReceived) < order.total) {
      alert("Amount received must be greater than or equal to the total amount.");
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onPaymentComplete(order._id);
      onClose();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = () => {
    if (paymentMethod === "cash" && amountReceived) {
      return parseFloat(amountReceived) - order.total;
    }
    return 0;
  };

  return (
    <div className="checkout-overlay">
      <div className="checkout-popup">
        <div className="checkout-header">
          <h2>Complete Payment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="checkout-content">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-details">
              <p><strong>Order No:</strong> {order.orderNo}</p>
              <p><strong>Guest:</strong> {order.guestInfo?.guestName || "Walk-in Customer"}</p>
              <p><strong>Room:</strong> {order.guestInfo?.roomNo || "N/A"}</p>
            </div>
            
            <div className="items-summary">
              <h4>Items:</h4>
              {order.items.map((item, index) => (
                <div key={index} className="item-row">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="total-row">
              <strong>Total Amount:</strong>
              <strong>${order.total.toFixed(2)}</strong>
            </div>
          </div>
          
          <div className="payment-section">
            <h3>Payment Method</h3>
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Cash</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Card</span>
              </label>
            </div>
            
            {paymentMethod === "cash" && (
              <div className="cash-payment">
                <label>
                  Amount Received:
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Enter amount"
                    min={order.total}
                    step="0.01"
                  />
                </label>
                {amountReceived && calculateChange() >= 0 && (
                  <div className="change-amount">
                    <strong>Change:</strong> ${calculateChange().toFixed(2)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="checkout-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="complete-payment-btn" 
            onClick={handlePayment}
            disabled={loading || (paymentMethod === "cash" && !amountReceived)}
          >
            {loading ? "Processing..." : "Complete Payment"}
          </button>
        </div>
      </div>
    </div>
  );
} 