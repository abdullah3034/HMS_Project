import Product from "../models/Product.js";
import Category from "../models/Category.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("subCategory")
      .populate({
        path: "category",
        populate: {
          path: "parentId",
          model: "Category"
        }
      })
      .populate({
        path: "subCategory", 
        populate: {
          path: "parentId",
          model: "Category"
        }
      });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("subCategory")
      .populate({
        path: "category",
        populate: {
          path: "parentId",
          model: "Category"
        }
      })
      .populate({
        path: "subCategory", 
        populate: {
          path: "parentId",
          model: "Category"
        }
      });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error fetching product" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    
    const subcategories = await Category.find({ parentId: categoryId });
    const categoryIds = [categoryId, ...subcategories.map(sub => sub._id)];
    
    const products = await Product.find({ 
      category: { $in: categoryIds } 
    })
      .populate("category")
      .populate("subCategory")
      .populate({
        path: "category",
        populate: {
          path: "parentId",
          model: "Category"
        }
      })
      .populate({
        path: "subCategory", 
        populate: {
          path: "parentId",
          model: "Category"
        }
      });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products by category" });
  }
};

// New endpoint: Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $and: [
        { limit: { $exists: true, $ne: null } },
        { $expr: { $lte: ["$quantity", "$limit"] } }
      ]
    })
      .populate("category")
      .populate("subCategory")
      .populate({
        path: "category",
        populate: {
          path: "parentId",
          model: "Category"
        }
      })
      .populate({
        path: "subCategory", 
        populate: {
          path: "parentId",
          model: "Category"
        }
      });
    
    res.json(lowStockProducts);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({ error: "Error fetching low stock products" });
  }
};

// New endpoint: Update product stock
export const updateProductStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.id;
    
    if (typeof quantity !== 'number') {
      return res.status(400).json({ error: "Quantity must be a number" });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Update the quantity (can be positive or negative)
    const newQuantity = Math.max(0, product.quantity + quantity);
    product.quantity = newQuantity;
    
    await product.save();
    
    const updatedProduct = await Product.findById(productId)
      .populate("category")
      .populate("subCategory")
      .populate({
        path: "category",
        populate: {
          path: "parentId",
          model: "Category"
        }
      })
      .populate({
        path: "subCategory", 
        populate: {
          path: "parentId",
          model: "Category"
        }
      });
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product stock:", error);
    res.status(500).json({ error: "Error updating product stock" });
  }
};

// New endpoint: Update multiple product stock
export const updateMultipleProductStock = async (req, res) => {
  try {
    const { stockUpdates } = req.body;
    
    if (!Array.isArray(stockUpdates)) {
      return res.status(400).json({ error: "stockUpdates must be an array" });
    }
    
    const updatePromises = stockUpdates.map(async (update) => {
      const { productId, quantity } = update;
      
      if (!productId || typeof quantity !== 'number') {
        throw new Error(`Invalid update data: productId=${productId}, quantity=${quantity}`);
      }
      
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      // Update the quantity (can be positive or negative)
      const newQuantity = Math.max(0, product.quantity + quantity);
      product.quantity = newQuantity;
      
      return product.save();
    });
    
    await Promise.all(updatePromises);
    
    // Return updated products
    const updatedProducts = await Product.find({
      _id: { $in: stockUpdates.map(update => update.productId) }
    })
      .populate("category")
      .populate("subCategory")
      .populate({
        path: "category",
        populate: {
          path: "parentId",
          model: "Category"
        }
      })
      .populate({
        path: "subCategory", 
        populate: {
          path: "parentId",
          model: "Category"
        }
      });
    
    res.json(updatedProducts);
  } catch (error) {
    console.error("Error updating multiple product stock:", error);
    res.status(500).json({ error: "Error updating multiple product stock" });
  }
};

export const addProduct = async (req, res) => {
  try {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({ error: "Invalid category" });
    }
    
    const newProduct = new Product(req.body);
    await newProduct.save();
    
    const populatedProduct = await Product.findById(newProduct._id)
      .populate("category")
      .populate("subCategory")
      .populate({
        path: "category",
        populate: {
          path: "parentId",
          model: "Category"
        }
      })
      .populate({
        path: "subCategory", 
        populate: {
          path: "parentId",
          model: "Category"
        }
      });
    
    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: error.message || "Error adding product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    // Validate that the category exists if it's being updated
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ error: "Invalid category" });
      }
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("category")
      .populate("subCategory")
      .populate({
        path: "category",
        populate: {
          path: "parentId",
          model: "Category"
        }
      })
      .populate({
        path: "subCategory", 
        populate: {
          path: "parentId",
          model: "Category"
        }
      });
    
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message || "Error updating product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message || "Error deleting product" });
  }
};
