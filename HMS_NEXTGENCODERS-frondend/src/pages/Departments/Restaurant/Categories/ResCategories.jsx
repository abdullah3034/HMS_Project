import React, { useState, useEffect } from "react";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  fetchSubcategories
} from "../../../../api/categoryApi.js";
import "./ResCategories.css";
import Ressidebar from "../../../../components/restaurant/resSidebar/Ressidebar";

export default function ResCategories() {
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    parentId: null
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategories();
      
      const topLevelCategories = data.filter(cat => !cat.parentId);
      setCategories(topLevelCategories);
      
      const subCatMap = {};
      data.filter(cat => cat.parentId).forEach(cat => {
        const parentId = cat.parentId._id || cat.parentId;
        if (!subCatMap[parentId]) {
          subCatMap[parentId] = [];
        }
        subCatMap[parentId].push(cat);
      });
      
      setSubcategories(subCatMap);
      setLoading(false);
    } catch (err) {
      setError("Failed to load categories. Please try again.");
      setLoading(false);
      console.error(err);
    }
  };

  const toggleCategoryExpand = async (categoryId) => {
    const newExpandedState = { ...expandedCategories };
    
    if (newExpandedState[categoryId]) {
      newExpandedState[categoryId] = false;
    } else {
      newExpandedState[categoryId] = true;
      
      if (!subcategories[categoryId]) {
        try {
          const subCats = await fetchSubcategories(categoryId);
          setSubcategories(prev => ({
            ...prev,
            [categoryId]: subCats
          }));
        } catch (err) {
          console.error("Failed to load subcategories:", err);
        }
      }
    }
    
    setExpandedCategories(newExpandedState);
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      setError("Category name is required");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await addCategory({
        name: categoryForm.name,
        parentId: categoryForm.parentId
      });
      
      if (!data.parentId) {
        setCategories([...categories, data]);
      } 
      else {
        const parentId = data.parentId;
        setSubcategories(prev => ({
          ...prev,
          [parentId]: [...(prev[parentId] || []), data]
        }));
      }
      
      resetForm();
      setLoading(false);
    } catch (err) {
      setError("Failed to add category. Please try again.");
      setLoading(false);
      console.error(err);
    }
  };

  const handleUpdateCategory = async () => {
    if (!categoryForm.name.trim()) {
      setError("Category name is required");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const oldParentId = editingCategory.parentId ? 
        (typeof editingCategory.parentId === 'object' ? editingCategory.parentId._id : editingCategory.parentId) : 
        null;
      
      const data = await updateCategory(editingCategory._id, {
        name: categoryForm.name,
        parentId: categoryForm.parentId
      });
      
      const newParentId = data.parentId;
      
      if ((oldParentId === newParentId) || 
          (oldParentId && newParentId && oldParentId === newParentId)) {
        
        if (!newParentId) {
          setCategories(categories.map(cat => 
            cat._id === data._id ? data : cat
          ));
        } 
        else {
          setSubcategories(prev => ({
            ...prev,
            [newParentId]: prev[newParentId].map(cat => 
              cat._id === data._id ? data : cat
            )
          }));
        }
      } 
      else {
        if (!oldParentId && newParentId) {
          setCategories(categories.filter(cat => cat._id !== data._id));
          
          setSubcategories(prev => ({
            ...prev,
            [newParentId]: [...(prev[newParentId] || []), data]
          }));
        }
        else if (oldParentId && !newParentId) {
          setSubcategories(prev => ({
            ...prev,
            [oldParentId]: prev[oldParentId].filter(cat => cat._id !== data._id)
          }));
          
          setCategories([...categories, data]);
        }
        else if (oldParentId && newParentId) {
          setSubcategories(prev => ({
            ...prev,
            [oldParentId]: prev[oldParentId].filter(cat => cat._id !== data._id)
          }));
          
          setSubcategories(prev => ({
            ...prev,
            [newParentId]: [...(prev[newParentId] || []), data]
          }));
        }
      }
      
      resetForm();
      setLoading(false);
    } catch (err) {
      setError("Failed to update category. Please try again.");
      setLoading(false);
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteCategory(id);
      
      const isTopLevel = categories.some(cat => cat._id === id);
      
      if (isTopLevel) {
        setCategories(categories.filter(category => category._id !== id));
      } else {
        for (const parentId in subcategories) {
          if (subcategories[parentId].some(cat => cat._id === id)) {
            setSubcategories(prev => ({
              ...prev,
              [parentId]: prev[parentId].filter(cat => cat._id !== id)
            }));
            break;
          }
        }
      }
      
      setLoading(false);
    } catch (err) {
      setError("Failed to delete category. " + (err.message || "Please try again."));
      setLoading(false);
      console.error(err);
    }
  };

  const resetForm = () => {
    setCategoryForm({
      name: "",
      parentId: null
    });
    setEditingCategory(null);
    setShowPopup(false);
  };

  const renderCategoryRow = (category, index, level = 0, parentIndex = null) => {
    const hasSubcategories = subcategories[category._id] && subcategories[category._id].length > 0;
    const isExpanded = expandedCategories[category._id];
    const displayIndex = parentIndex !== null ? `${parentIndex}.${index + 1}` : index + 1;
    
    return (
      <React.Fragment key={category._id}>
        <tr className={`category-row ${level > 0 ? 'subcategory-row' : ''}`}>
          <td>{displayIndex}</td>
          <td>
            <div className="category-name-cell">
              {level > 0 && (
                <div className="subcategory-indent" style={{ width: `${level * 20}px` }}></div>
              )}
              <div className="category-name-wrapper">
                {hasSubcategories && (
                  <button 
                    className="expand-button"
                    onClick={() => toggleCategoryExpand(category._id)}
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                )}
                <span className="category-name">{category.name}</span>
              </div>
            </div>
          </td>
          <td>
            <div className="action-buttons">
              <button 
                onClick={() => {
                  setEditingCategory(category);
                  setCategoryForm({
                    name: category.name,
                    parentId: category.parentId ? 
                      (typeof category.parentId === 'object' ? category.parentId._id : category.parentId) : 
                      null
                  });
                  setShowPopup(true);
                }}
                className="edit-button"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDeleteCategory(category._id)}
                className="delete-button"
              >
                🗑️
              </button>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({
                    name: "",
                    parentId: category._id
                  });
                  setShowPopup(true);
                }}
                className="add-subcategory-button"
              >
                +
              </button>
            </div>
          </td>
        </tr>
        
        {/* Render subcategories if expanded */}
        {isExpanded && hasSubcategories && subcategories[category._id].map((subcat, subIndex) => 
          renderCategoryRow(subcat, subIndex, level + 1, displayIndex)
        )}
      </React.Fragment>
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <Ressidebar />
      
      <div className="category-container" style={{ flex: 1, padding: "20px" }}>
        <div className="category-header">
          <h2>Category Management</h2>
          <button 
            onClick={() => { 
              setEditingCategory(null); 
              setCategoryForm({
                name: "",
                parentId: null
              });
              setShowPopup(true); 
            }}
            className="add-button"
          >
            Add a Category
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h3>{editingCategory ? "Edit Category" : "Add a Category"}</h3>
              
              <div className="form-group">
                <label htmlFor="categoryName">Category Name *</label>
                <input
                  id="categoryName"
                  type="text"
                  placeholder="Enter Category Name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="parentCategory">Parent Category</label>
                <select
                  id="parentCategory"
                  value={categoryForm.parentId || ""}
                  onChange={(e) => setCategoryForm({
                    ...categoryForm, 
                    parentId: e.target.value === "" ? null : e.target.value
                  })}
                >
                  <option value="">None (Top Level)</option>
                  {categories.map(cat => (
                    (editingCategory && cat._id === editingCategory._id) ? null : (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    )
                  ))}
                </select>
              </div>
              
              <div className="popup-buttons">
                <button onClick={resetForm}>Cancel</button>
                <button onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
                  {editingCategory ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && <div className="loading">Loading...</div>}

        {!loading && categories.length === 0 && (
          <div className="no-data">No categories found. Add a category to get started.</div>
        )}

        {!loading && categories.length > 0 && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => renderCategoryRow(category, index))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}