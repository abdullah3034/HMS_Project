import express from "express";
import {
  addToCart,
  countMyCart,
  myCartItems,
  myPurchasedItems,
  purchaseCartItems,
  removeCartItems,
} from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.post("/add-to-cart", addToCart);

cartRouter.get("/:userEmail/cart-count", countMyCart);
cartRouter.get("/:userEmail/cart-item", myCartItems);
cartRouter.get("/:userEmail/:role/purchased-item", myPurchasedItems);

cartRouter.put("/purchase-item", purchaseCartItems);

cartRouter.delete("/:id/cart-item", removeCartItems);

export default cartRouter;
