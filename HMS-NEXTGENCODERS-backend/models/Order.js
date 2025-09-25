import mongoose from "mongoose";

class OrderModel {
  constructor() {
    this.schema = new mongoose.Schema(
      {
        orderNo: {
          type: String,
          required: true,
          unique: true
        },
        items: [{
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
          },
          name: {
            type: String,
            required: true
          },
          price: {
            type: Number,
            required: true
          },
          quantity: {
            type: Number,
            required: true,
            min: 1
          },
          amount: {
            type: Number,
            required: true
          }
        }],
        total: {
          type: Number,
          required: true,
          min: 0
        },
        status: {
          type: String,
          enum: ["completed", "preparing", "payment pending"],
          default: "payment pending"
        },
        orderType: {
          type: String,
          enum: ["Take Away", "Dine In"],
          default: "Take Away"
        },
        guestInfo: {
          guestId: String,
          guestName: String,
          roomNo: String
        },
        isWalkin: {
          type: Boolean,
          default: true
        }
      },
      { timestamps: true }
    );

    this.model = mongoose.model("Order", this.schema);
  }

  getModel() {
    return this.model;
  }
}

const Order = new OrderModel().getModel();

export default Order;