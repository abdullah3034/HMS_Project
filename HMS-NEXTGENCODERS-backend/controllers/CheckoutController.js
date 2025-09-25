import Checkout from "../models/CheckoutModel.js";

// Get all checkouts
export const getCheckouts = async (req, res) => {
  try {
    const checkouts = await Checkout.find();
    res.json(checkouts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single checkout by ID
export const getCheckoutById = async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: "Not found" });
    res.json(checkout);
  } catch (error) {
    res.status(500).json({ message: "Error fetching record" });
  }
};

// Create new checkout
export const createCheckout = async (req, res) => {
  try {
    const {
      guestId,
      guestName,
      guestPhone,
      guestEmail,
      nicNumber,
      roomno,
      dateFrom,
      dateTo,
      remarks,
      CheckoutHandledBy
    } = req.body;

    const newCheckout = new Checkout({
      guestId,
      guestName,
      guestPhone,
      guestEmail,
      nicNumber,
      roomno,
      dateFrom,
      dateTo,
      remarks,
      CheckoutHandledBy
    });

    const saved = await newCheckout.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Invalid data", error });
  }
};



