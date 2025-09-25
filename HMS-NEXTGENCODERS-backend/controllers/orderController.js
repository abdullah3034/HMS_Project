import Order from "../models/Order.js";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    // Generate a unique order number
    const orderCount = await Order.countDocuments();
    const orderNo = `ORD-${Date.now().toString().slice(-6)}-${orderCount + 1}`;
    
    // Create order with the generated order number
    const orderData = {
      ...req.body,
      orderNo
    };
    
    const newOrder = new Order(orderData);
    await newOrder.save();
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message || "Error creating order" });
  }
};

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Error fetching order" });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !["completed", "preparing", "payment pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Error updating order status" });
  }
};

// Get orders by guest
export const getOrdersByGuest = async (req, res) => {
  try {
    const { guestId } = req.params;
    
    const orders = await Order.find({
      "guestInfo.guestId": guestId
    }).sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error("Error fetching guest orders:", error);
    res.status(500).json({ error: "Error fetching guest orders" });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Error deleting order" });
  }
};

// Analytics: Get daily revenue
export const getDailyRevenue = async (req, res) => {
  try {
    const { date, orderType } = req.query;
    
    let query = { status: "completed" };
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      query.createdAt = { $gte: today, $lt: tomorrow };
    }
    
    // Filter by order type if provided
    if (orderType && orderType !== "all") {
      query.orderType = orderType;
    }
    
    const orders = await Order.find(query);
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    res.json({ totalRevenue: totalRevenue.toFixed(2) });
  } catch (error) {
    console.error("Error fetching daily revenue:", error);
    res.status(500).json({ error: "Error fetching daily revenue" });
  }
};

// Analytics: Get best-selling items
export const getBestSellingItems = async (req, res) => {
  try {
    const { date, orderType } = req.query;
    
    let query = { status: "completed" };
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      query.createdAt = { $gte: today, $lt: tomorrow };
    }
    
    // Filter by order type if provided
    if (orderType && orderType !== "all") {
      query.orderType = orderType;
    }
    
    const orders = await Order.find(query);
    
    // Aggregate items by name
    const itemStats = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (itemStats[item.name]) {
          itemStats[item.name].quantity += item.quantity;
          itemStats[item.name].totalRevenue += item.amount;
        } else {
          itemStats[item.name] = {
            name: item.name,
            unitPrice: item.price,
            quantity: item.quantity,
            totalRevenue: item.amount
          };
        }
      });
    });
    
    // Convert to array and sort by quantity
    const bestSellingItems = Object.values(itemStats)
      .sort((a, b) => b.quantity - a.quantity)
      .map((item, index) => ({
        no: (index + 1).toString().padStart(2, '0'),
        ...item,
        unitPrice: item.unitPrice.toFixed(2),
        totalRevenue: item.totalRevenue.toFixed(2)
      }));
    
    res.json(bestSellingItems);
  } catch (error) {
    console.error("Error fetching best-selling items:", error);
    res.status(500).json({ error: "Error fetching best-selling items" });
  }
};

// Analytics: Get sales breakdown
export const getSalesBreakdown = async (req, res) => {
  try {
    const { date, orderType, filterBy, page = 1, limit = 10 } = req.query;
    
    let query = { status: "completed" };
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      query.createdAt = { $gte: today, $lt: tomorrow };
    }
    
    // Filter by order type if provided
    if (orderType && orderType !== "all") {
      query.orderType = orderType;
    }
    
    // Additional filter if provided
    if (filterBy && filterBy !== "all") {
      // You can add more filter logic here based on your needs
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Flatten all items from orders
    const allItems = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        allItems.push({
          no: allItems.length + 1,
          name: item.name,
          unitPrice: item.price.toFixed(2),
          quantity: item.quantity,
          totalRevenue: item.amount.toFixed(2),
          orderNo: order.orderNo,
          createdAt: order.createdAt
        });
      });
    });
    
    res.json(allItems);
  } catch (error) {
    console.error("Error fetching sales breakdown:", error);
    res.status(500).json({ error: "Error fetching sales breakdown" });
  }
};