// controllers/transactionController.js
import Transaction from "../models/TransactionModel.js";

// Create Transaction
export const createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Transactions + Filtering
export const getTransactions = async (req, res) => {
  try {
    const { department, paymentMode, transactionType, fromDate, toDate } = req.query;
    const query = {};

    if (department) query.department = department;
    if (paymentMode) query.paymentMode = paymentMode;
    if (transactionType) query.transactionType = transactionType;

    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) {
        const toDateEnd = new Date(toDate);
        toDateEnd.setHours(23, 59, 59, 999);
        query.date.$lte = toDateEnd;
      }
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id);
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Default export (optional, for compatibility)
