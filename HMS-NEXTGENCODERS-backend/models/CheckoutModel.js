import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema({
  guestId: { type: String, required: true },
  guestName: { type: String, required: true },
  guestPhone: { type: String, required: true },
  guestEmail: { type: String, required: true },
  nicNumber: { type: String, required: true },
  roomno: { type: Number, required: true },
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  remarks: { type: String },
  CheckoutHandledBy: { type: String, required: true }
}, {
  timestamps: true
});

// Use mongoose.models to avoid OverwriteModelError
const Checkout = mongoose.models.Checkout || mongoose.model("Checkout", checkoutSchema);

export default Checkout;
