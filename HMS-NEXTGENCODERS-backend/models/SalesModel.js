import mongoose from 'mongoose';

const SalesDataSchema = new mongoose.Schema({
  label: String,
  sales: Number,
  period: {
    type: String,
    enum: ['yearly', 'monthly', 'weekly', 'daily'],
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

// Use mongoose.models to avoid OverwriteModelError
const Sales = mongoose.models.Sales || mongoose.model('Sales', SalesDataSchema);

export default Sales;