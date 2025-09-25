import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 },
  cart: [
    {
      packageId: String,
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  packages: [
    {
      packageId: String,
      quantity: Number,
      status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
      purchaseDate: Date,
    },
  ],
  role: { type: [String], default: ["OWNER"] },
  ownerEmail: { type: String },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
