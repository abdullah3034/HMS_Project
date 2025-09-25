import React, { useState, useEffect } from "react";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../../../../api/productApi";
import { fetchCategories } from "../../../../api/categoryApi";
import "./Products.css";
import Ressidebar from "../../../../components/restaurant/resSidebar/Ressidebar";
import LowStockAlert from "../../../../components/restaurant/LowStockAlert";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    limit: "",
    category: "",
    subCategory: "",
    active: true,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Failed to load products. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    try {
      setUpdateLoading(true);
      const productToAdd = { ...newProduct, price: Number(newProduct.price) };
      const data = await addProduct(productToAdd);
      setProducts([...products, data]);
      setError({ type: 'success', message: 'Product added successfully!' });

      setTimeout(() => {
        resetForm();
      }, 1500);
    } catch (err) {
      setError({ type: 'error', message: err.message || "Failed to add product. Please try again." });
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newProduct.name.trim()) errors.name = "Product name is required";
    if (!newProduct.price || isNaN(newProduct.price) || Number(newProduct.price) < 0) errors.price = "Valid price is required";
    if (!newProduct.quantity || isNaN(newProduct.quantity) || Number(newProduct.quantity) < 0) errors.quantity = "Valid quantity is required";
    if (newProduct.limit && (isNaN(newProduct.limit) || Number(newProduct.limit) < 0)) errors.limit = "Limit must be a positive number";
    if (!newProduct.category) errors.category = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProduct = async () => {
    if (!validateForm()) return;

    try {
      setUpdateLoading(true);
      setError(null);

      const productToUpdate = { ...newProduct, price: Number(newProduct.price) };
      const data = await updateProduct(editingProduct._id, productToUpdate);

      setProducts(products.map((prod) => (prod._id === data._id ? data : prod)));

      setError({ type: 'success', message: 'Product updated successfully!' });

      setTimeout(() => {
        resetForm();
      }, 1500);
    } catch (err) {
      setError({ type: 'error', message: err.message || "Failed to update product. Please try again." });
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter((product) => product._id !== id));
    } catch (err) {
      setError("Failed to delete product. Please try again.");
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setNewProduct({
      name: "",
      price: "",
      quantity: "",
      limit: "",
      category: "",
      subCategory: "",
      active: true,
    });
    setShowPopup(false);
    setFormErrors({});
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : "Unknown";
  };

  const getCategoryFullName = (product) => {
    if (!product) return "Unknown";

    let categoryPath = "";
    
    // Handle main category
    if (product.category) {
      if (typeof product.category === 'object') {
        if (product.category.parentId) {
          const parentCategory = categories.find(cat =>
            cat._id === (typeof product.category.parentId === 'object' ? product.category.parentId._id : product.category.parentId)
          );
          if (parentCategory) {
            categoryPath = `${parentCategory.name} > ${product.category.name}`;
          } else {
            categoryPath = product.category.name;
          }
        } else {
          categoryPath = product.category.name;
        }
      } else {
        categoryPath = getCategoryName(product.category);
      }
    }

    // Handle subcategory if it exists
    if (product.subCategory) {
      if (typeof product.subCategory === 'object') {
        categoryPath += ` > ${product.subCategory.name}`;
      } else {
        const subCategoryName = getCategoryName(product.subCategory);
        if (subCategoryName !== "Unknown") {
          categoryPath += ` > ${subCategoryName}`;
        }
      }
    }

    return categoryPath || "Unknown";
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0.00";
    return typeof price === 'number' ? price.toFixed(2) : "0.00";
  };

  return (
    <div className="page-layout">
      <Ressidebar />
      <div className="product-container">
        <div className="product-header">
          <h2>Product Management</h2>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowPopup(true);
            }}
            className="add-button"
          >
            Add a New Product
          </button>
        </div>

        {error && (
          <div className={`message ${error.type === 'success' ? 'success-message' : 'error-message'}`}>
            {error.message}
          </div>
        )}

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>IsActive</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>No products found</td>
                  </tr>
                ) : (
                  products.map((product, index) => {
                    const isLowStock = product.limit && product.quantity <= product.limit;
                    return (
                      <tr key={product._id} className={isLowStock ? "low-stock-row" : ""}>
                        <td>{index + 1}</td>
                        <td>{product.name}</td>
                        <td>Rs {formatPrice(product.price)}</td>
                        <td>
                          <div className={`stock-info ${isLowStock ? 'low-stock' : ''}`}>
                            <span className="stock-quantity">{product.quantity || 0}</span>
                            {product.limit && (
                              <span className="stock-limit">/ {product.limit}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {getCategoryFullName(product)}
                        </td>
                        <td>
                          <span className={product.active ? "active-status" : "inactive-status"}>
                            {product.active ? "Active" : "Not Active"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setNewProduct({
                                  name: product.name,
                                  price: product.price,
                                  quantity: product.quantity || "",
                                  limit: product.limit || "",
                                  category: product.category && typeof product.category === 'object'
                                    ? product.category._id
                                    : product.category,
                                  subCategory: product.subCategory && typeof product.subCategory === 'object'
                                    ? product.subCategory._id
                                    : product.subCategory || "",
                                  active: product.active !== undefined ? product.active : true,
                                });
                                setShowPopup(true);
                              }}
                              className="edit-button"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="delete-button"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h3 style={{ marginTop: '0', marginBottom: '15px' }}>{editingProduct ? "Edit Product" : "Add a New Product"}</h3>
              <div className="form-container" style={{ width: '100%' }}>
                {/* Row 1: Name and Price */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <div className="form-group">
                      <label htmlFor="productName">Product Name *</label>
                      <input
                        id="productName"
                        type="text"
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={(e) => {
                          setNewProduct({ ...newProduct, name: e.target.value });
                          if (formErrors.name) {
                            setFormErrors({ ...formErrors, name: null });
                          }
                        }}
                        className={formErrors.name ? "input-error" : ""}
                      />
                      {formErrors.name && <div className="error-text">{formErrors.name}</div>}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="form-group">
                      <label htmlFor="productPrice">Price *</label>
                      <input
                        id="productPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter Price"
                        value={newProduct.price}
                        onChange={(e) => {
                          setNewProduct({ ...newProduct, price: e.target.value });
                          if (formErrors.price) {
                            setFormErrors({ ...formErrors, price: null });
                          }
                        }}
                        className={formErrors.price ? "input-error" : ""}
                      />
                      {formErrors.price && <div className="error-text">{formErrors.price}</div>}
                    </div>
                  </div>
                </div>
                
                {/* Row 2: Quantity and Limit */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <div className="form-group">
                      <label htmlFor="itemQuantity">Quantity *</label>
                      <input
                        id="itemQuantity"
                        type="number"
                        min="0"
                        placeholder="Enter Quantity"
                        value={newProduct.quantity}
                        onChange={(e) => {
                          setNewProduct({ ...newProduct, quantity: e.target.value });
                          if (formErrors.quantity) {
                            setFormErrors({ ...formErrors, quantity: null });
                          }
                        }}
                        className={formErrors.quantity ? "input-error" : ""}
                      />
                      {formErrors.quantity && <div className="error-text">{formErrors.quantity}</div>}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="form-group">
                      <label htmlFor="itemLimit">Set Limit</label>
                      <input
                        id="itemLimit"
                        type="number"
                        min="0"
                        placeholder="Set Limit"
                        value={newProduct.limit}
                        onChange={(e) => setNewProduct({ ...newProduct, limit: e.target.value })}
                        className={formErrors.limit ? "input-error" : ""}
                      />
                      {formErrors.limit && <div className="error-text">{formErrors.limit}</div>}
                    </div>
                  </div>
                </div>
                
                {/* Row 3: Category and Subcategory */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <div className="form-group">
                      <label htmlFor="category">Category *</label>
                      <select
                        id="category"
                        value={newProduct.category}
                        onChange={(e) => {
                          setNewProduct({ ...newProduct, category: e.target.value });
                          if (formErrors.category) {
                            setFormErrors({ ...formErrors, category: null });
                          }
                        }}
                        className={formErrors.category ? "input-error" : ""}
                      >
                        <option value="">Select Category</option>
                        {categories.filter(cat => !cat.parentId).map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                      {formErrors.category && <div className="error-text">{formErrors.category}</div>}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="form-group">
                      <label htmlFor="itemSubCategory">Sub Category</label>
                      <select
                        id="itemSubCategory"
                        value={newProduct.subCategory}
                        onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                      >
                        <option value="">Select Sub Category</option>
                        {categories
                          .filter(cat => {
                            if (!cat.parentId) return false;
                            const parentId = typeof cat.parentId === "object" ? cat.parentId._id : cat.parentId;
                            return parentId === newProduct.category;
                          })
                          .map(subcat => (
                            <option key={subcat._id} value={subcat._id}>{subcat.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Row 4: Active */}
                <div style={{ marginBottom: '15px' }}>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="itemActive" style={{ marginRight: '10px' }}>Active</label>
                    <input
                      id="itemActive"
                      type="checkbox"
                      checked={newProduct.active}
                      onChange={(e) => setNewProduct({ ...newProduct, active: e.target.checked })}
                      style={{ width: '20px', height: '20px' }}
                    />
                  </div>
                </div>
              </div>

              <div className="popup-buttons">
                <button
                  onClick={resetForm}
                  disabled={updateLoading}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  disabled={updateLoading}
                  className={editingProduct ? "update-button" : "add-button"}
                >
                  {updateLoading ? (
                    <span>
                      {editingProduct ? "Updating..." : "Adding..."}
                    </span>
                  ) : (
                    <span>
                      {editingProduct ? "Update Product" : "Add Product"}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Low Stock Alert */}
        <LowStockAlert />
      </div>
    </div>
  );
}
