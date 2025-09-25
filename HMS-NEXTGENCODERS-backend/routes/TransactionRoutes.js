// routes/transactionRoutes.js
import express from "express";
import {
  createTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction
} from "../controllers/TransactionController.js";

const router = express.Router();

router.post("/", createTransaction);
router.get("/", getTransactions);
router.delete("/:id", deleteTransaction);
router.put("/:id", updateTransaction);

export default router;
