import express from "express";
import {
  getAllStocks,
  createStock,
  getStockById,
  updateStock,
  deleteStock
} from "../controllers/StockController.js";

const router = express.Router();

router.get("/", getAllStocks);
router.post("/", createStock);
router.get("/:id", getStockById);
router.put("/:id", updateStock);
router.delete("/:id", deleteStock);

export default router;
