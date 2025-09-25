import express from "express";
import {
  getProducts,
  getProductById,
  getProductsByCategory,
  getLowStockProducts,
  updateProductStock,
  updateMultipleProductStock,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/low-stock", getLowStockProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/stock", updateProductStock);
router.patch("/update-stock", updateMultipleProductStock);

export default router;