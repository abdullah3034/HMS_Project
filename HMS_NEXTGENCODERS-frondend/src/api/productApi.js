const BASE_URL = "http://localhost:8000/products";

// Helper function to check if server is available
const checkServerConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch("http://localhost:8000/health", {
      signal: controller.signal,
      method: 'HEAD'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Enhanced fetch with better error handling
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out - server may be down');
    }
    if (error.message.includes('fetch')) {
      throw new Error('Cannot connect to server - make sure backend is running on http://localhost:8000');
    }
    throw error;
  }
};

export const fetchProducts = async () => {
  try {
    const res = await fetchWithErrorHandling(BASE_URL);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
};

export const fetchProductsByCategory = async (categoryId) => {
  try {
    const res = await fetchWithErrorHandling(`${BASE_URL}/category/${categoryId}`);
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch products for category ${categoryId}:`, error);
    throw error;
  }
};

export const addProduct = async (product) => {
  try {
    const res = await fetchWithErrorHandling(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    
    return res.json();
  } catch (error) {
    console.error("Failed to add product:", error);
    throw error;
  }
};

export const updateProduct = async (id, product) => {
  try {
    const res = await fetchWithErrorHandling(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    
    return res.json();
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await fetchWithErrorHandling(`${BASE_URL}/${id}`, { 
      method: "DELETE" 
    });
    
    return res.json();
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw error;
  }
};

export const updateProductStock = async (id, quantity) => {
  try {
    const res = await fetchWithErrorHandling(`${BASE_URL}/${id}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    
    return res.json();
  } catch (error) {
    console.error("Failed to update product stock:", error);
    throw error;
  }
};

export const getLowStockProducts = async () => {
  try {
    // Check if server is available first
    const serverAvailable = await checkServerConnection();
    if (!serverAvailable) {
      throw new Error('Backend server is not available. Please start the server on http://localhost:8000');
    }
    
    const res = await fetchWithErrorHandling(`${BASE_URL}/low-stock`);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch low stock products:", error);
    throw error;
  }
};

export const updateMultipleProductStock = async (stockUpdates) => {
  try {
    const res = await fetchWithErrorHandling(`${BASE_URL}/update-stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockUpdates }),
    });
    
    return res.json();
  } catch (error) {
    console.error("Failed to update multiple product stock:", error);
    throw error;
  }
};