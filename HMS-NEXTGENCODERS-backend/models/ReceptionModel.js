import mongoose from "mongoose";

const ReceptionSchema = new mongoose.Schema({
  booked: Number,
  occupied: Number,
  vacant: Number,
  outOfService: Number,
  todayCheckIns: Number,
  todayCheckOuts: Number
}, { timestamps: true });

// Use mongoose.models to avoid OverwriteModelError
const Reception = mongoose.models.Reception || mongoose.model("Reception", ReceptionSchema);

export default Reception;
