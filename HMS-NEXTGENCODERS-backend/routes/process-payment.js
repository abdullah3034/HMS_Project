import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;


const router = express.Router();

router.post('/process-payment', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, error: 'Stripe secret key is not configured on the server.' });
    }

    const { payment_method_id, amount } = req.body;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'inr', // Indian Rupees
      payment_method: payment_method_id,
      confirmation_method: 'manual',
      confirm: true,
      return_url: 'http://localhost:5176/page1/return',
    });

    if (paymentIntent.status === 'succeeded') {
      // Payment successful
      res.json({
        success: true,
        transaction_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        status: paymentIntent.status
      });
    } else if (paymentIntent.status === 'requires_action') {
      // 3D Secure authentication required
      res.json({
        success: false,
        requires_action: true,
        client_secret: paymentIntent.client_secret
      });
    } else {
      res.json({
        success: false,
        error: 'Payment failed'
      });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;