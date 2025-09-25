import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  productNo: { type: String, required: true },
  productName: { type: String, required: true },
  stockType: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  date: { type: Date, required: true },
  department: { type: String, required: true }
});

// Use mongoose.models to avoid OverwriteModelError
const Stock = mongoose.models.Stock || mongoose.model("Stock", stockSchema);

export default Stock;
