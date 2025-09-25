import express from "express";
import {
  getCheckouts,
  createCheckout,
  getCheckoutById
} from "../controllers/CheckoutController.js";

const router = express.Router();

router.get("/", getCheckouts);
router.post("/", createCheckout);
router.get("/:id", getCheckoutById);

export default router;
