import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  pkgId: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  features: { type: [String], required: true },
  userEmail: { type: String, required: true },
  userId: { type: String, required: true },
  status: { type: String, default: "INCART" },
  purchaseDate: { type: Date },
});

const Cart = mongoose.models.cart || mongoose.model("cart", cartSchema);

export default Cart;
