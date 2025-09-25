const BASE_URL = "http://localhost:8000/categories";

export const fetchCategories = async () => {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
      throw new Error(`Error fetching categories: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

export const fetchCategoryById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) {
      throw new Error(`Error fetching category: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch category with id ${id}:`, error);
    throw error;
  }
};

export const fetchSubcategories = async (parentId) => {
  try {
    const res = await fetch(`${BASE_URL}/${parentId}/subcategories`);
    if (!res.ok) {
      throw new Error(`Error fetching subcategories: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch subcategories for parent ${parentId}:`, error);
    throw error;
  }
};

export const addCategory = async (categoryData) => {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error adding category: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Failed to add category:", error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error updating category: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Failed to update category with id ${id}:`, error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error deleting category: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Failed to delete category with id ${id}:`, error);
    throw error;
  }
};