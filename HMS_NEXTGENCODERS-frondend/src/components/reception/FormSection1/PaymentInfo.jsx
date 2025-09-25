import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.STRIPE_PUBLISHABLE_KEY);

// Card Input Component
const CardPaymentForm = ({ onPaymentSuccess, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setError(error.message);
        setProcessing(false);
        return;
      }

      // Send payment method to your backend
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          amount: amount * 100, // Convert to cents
        }),
      });

      const result = await response.json();

      if (result.success) {
        onPaymentSuccess(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    }

    setProcessing(false);
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card-element-container">
        <CardElement options={cardStyle} />
      </div>
      
      {error && (
        <div className="payment-error" style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="payment-submit-btn"
        style={{
          marginTop: '15px',
          padding: '12px 24px',
          backgroundColor: processing ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: processing ? 'not-allowed' : 'pointer'
        }}
      >
        {processing ? 'Processing...' : `Pay Rs. ${amount || 0}`}
      </button>
    </form>
  );
};

// Enhanced PaymentInfo Component
const PaymentInfo = ({ formData, handleFormChange }) => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentMethodChange = (e) => {
    handleFormChange(e);
    setShowCardForm(e.target.value === 'Credit Card' || e.target.value === 'Debit Card');
  };

  const handlePaymentSuccess = (result) => {
    setPaymentSuccess(true);
    // Update form data with payment details
    handleFormChange({
      target: {
        name: 'paymentStatus',
        value: 'completed'
      }
    });
    handleFormChange({
      target: {
        name: 'transactionId',
        value: result.transaction_id
      }
    });
  };

  return (
    <div className="checkinform-form-container">
      <h2 className="checkinform-form-heading">Payment Information</h2>
      <div className="checkinform-form-grid">
        <div>
          <label className="checkinform-form-label">
            Advance Payment (Rs.) <span className="asterisk">*</span>
          </label>
          <input
            type="number"
            name="paidAmount"
            className="checkinform-form-input"
            value={formData.paidAmount || ''}
            onChange={handleFormChange}
            placeholder="Enter amount"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="checkinform-form-label">
            Payment Method <span className="asterisk">*</span>
          </label>
          <select
            name="paymentMethod"
            className="checkinform-form-input"
            value={formData.paymentMethod || ''}
            onChange={handlePaymentMethodChange}
            required
          >
            <option value="">--Select Payment Method--</option>
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Card Payment Form */}
        {showCardForm && !paymentSuccess && (
          <div className="full-width" style={{ marginTop: '20px' }}>
            <h3>Card Details</h3>
            <Elements stripe={stripePromise}>
              <CardPaymentForm 
                onPaymentSuccess={handlePaymentSuccess}
                amount={formData.paidAmount}
              />
            </Elements>
          </div>
        )}

        {/* Payment Success Message */}
        {paymentSuccess && (
          <div className="full-width payment-success" style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '15px',
            borderRadius: '4px',
            marginTop: '15px'
          }}>
            ✅ Payment processed successfully!
          </div>
        )}

        <div className="full-width">
          <label className="checkinform-form-label">Payment Notes</label>
          <textarea
            name="paymentNotes"
            className="checkinform-form-input"
            value={formData.paymentNotes || ''}
            onChange={handleFormChange}
            placeholder="Any additional payment information"
            rows="2"
          />
        </div>
      </div>

      <style jsx>{`
        .card-element-container {
          padding: 15px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
          margin-top: 10px;
        }
        
        .payment-submit-btn:hover:not(:disabled) {
          background-color: #0056b3;
        }
        
        .full-width {
          grid-column: 1 / -1;
        }
      `}</style>
    </div>
  );
};

export default PaymentInfo;