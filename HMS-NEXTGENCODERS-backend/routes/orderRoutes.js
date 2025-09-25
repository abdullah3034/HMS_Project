import express from "express";
import * as orderController from "../controllers/orderController.js";

const router = express.Router();

// Create a new order
router.post("/", orderController.createOrder);

// Get all orders
router.get("/", orderController.getOrders);

// Get order by ID
router.get("/:id", orderController.getOrderById);

// Update order status
router.patch("/:id/status", orderController.updateOrderStatus);

// Get orders by guest
router.get("/guest/:guestId", orderController.getOrdersByGuest);

// Delete order
router.delete("/:id", orderController.deleteOrder);

// Analytics routes
router.get("/analytics/daily-revenue", orderController.getDailyRevenue);
router.get("/analytics/best-selling", orderController.getBestSellingItems);
router.get("/analytics/sales-breakdown", orderController.getSalesBreakdown);

export default router;
