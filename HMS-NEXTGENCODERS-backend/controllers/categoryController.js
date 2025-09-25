import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parentId');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Error fetching categories" });
  }
};

// Get category by id
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Error fetching category" });
  }
};

// Get subcategories
export const getSubcategories = async (req, res) => {
  try {
    const subcategories = await Category.find({ parentId: req.params.id });
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: "Error fetching subcategories" });
  }
};

// Add a new category
export const addCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    let level = 0;
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(404).json({ error: "Parent category not found" });
      }
      level = parentCategory.level + 1;
    }
    
    const newCategory = new Category({ 
      name, 
      parentId: parentId || null,
      level
    });
    
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: "Error adding category" });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  try {
    const { name, parentId, isActive } = req.body;
    
    let updateData = { name };
    
    if (parentId !== undefined) {
      if (parentId) {
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
          return res.status(404).json({ error: "Parent category not found" });
        }
        
        if (parentId === req.params.id) {
          return res.status(400).json({ error: "Category cannot be its own parent" });
        }
        
        updateData.parentId = parentId;
        updateData.level = parentCategory.level + 1;
      } else {
        updateData.parentId = null;
        updateData.level = 0;
      }
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: "Error updating category" });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const hasSubcategories = await Category.exists({ parentId: categoryId });
    if (hasSubcategories) {
      return res.status(400).json({ 
        error: "Cannot delete category with subcategories. Delete subcategories first or reassign them." 
      });
    }
    
    const hasProducts = await Product.exists({ category: categoryId });
    if (hasProducts) {
      return res.status(400).json({ 
        error: "Cannot delete category with associated products. Remove or reassign products first." 
      });
    }
    
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting category" });
  }
};