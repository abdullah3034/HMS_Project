const BASE_URL = "http://localhost:8000/orders";

export const createOrder = async (orderData) => {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error creating order: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
      throw new Error(`Error fetching orders: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) {
      throw new Error(`Error fetching order: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch order ${id}:`, error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error updating order status: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
};

export const getOrdersByGuest = async (guestId) => {
  try {
    const res = await fetch(`${BASE_URL}/guest/${guestId}`);
    if (!res.ok) {
      throw new Error(`Error fetching guest orders: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch guest orders:", error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error deleting order: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Failed to delete order:", error);
    throw error;
  }
};

// Analytics API functions
export const getDailyRevenue = async (date, orderType) => {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (orderType) params.append('orderType', orderType);
    
    const res = await fetch(`${BASE_URL}/analytics/daily-revenue?${params}`);
    if (!res.ok) {
      throw new Error(`Error fetching daily revenue: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch daily revenue:", error);
    throw error;
  }
};

export const getBestSellingItems = async (date, orderType) => {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (orderType) params.append('orderType', orderType);
    
    const res = await fetch(`${BASE_URL}/analytics/best-selling?${params}`);
    if (!res.ok) {
      throw new Error(`Error fetching best-selling items: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch best-selling items:", error);
    throw error;
  }
};

export const getSalesBreakdown = async (date, orderType, filterBy, page = 1) => {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (orderType) params.append('orderType', orderType);
    if (filterBy) params.append('filterBy', filterBy);
    params.append('page', page);
    
    const res = await fetch(`${BASE_URL}/analytics/sales-breakdown?${params}`);
    if (!res.ok) {
      throw new Error(`Error fetching sales breakdown: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch sales breakdown:", error);
    throw error;
  }
};