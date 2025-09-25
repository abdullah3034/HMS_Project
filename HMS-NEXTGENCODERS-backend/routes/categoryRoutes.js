import express from "express";
import {
  getCategories,
  getCategoryById,
  getSubcategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Define routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.get("/:id/subcategories", getSubcategories);
router.post("/", addCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
