import React, { useState, useEffect } from "react";
import "./ResDashboard.css";
import Navbar from '../../../../components/restaurant/resSidebar/Ressidebar';
import { getOrders, updateOrderStatus, deleteOrder } from '../../../../api/orderApi';
import { updateMultipleProductStock } from '../../../../api/productApi';
import CheckoutPopup from './CheckoutPopup';
import ViewBillPopup from './ViewBillPopup';
import LowStockAlert from '../../../../components/restaurant/LowStockAlert';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [orderTypeFilter, setOrderTypeFilter] = useState("All Orders");
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const [billOrder, setBillOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await getOrders();
      setAllOrders(ordersData);
      setTotalPages(Math.ceil(ordersData.length / ordersPerPage));
      setOrders(ordersData.slice(0, ordersPerPage));
    } catch (err) {
      setError("Failed to fetch orders. Please try again.");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };



  const filterOrders = () => {
    let filtered = allOrders;

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(order => 
        order.guestInfo?.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.guestInfo?.roomNo?.toString().includes(searchQuery)
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter(order => 
        order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (orderTypeFilter !== "All Orders") {
      filtered = filtered.filter(order => 
        order.orderType === orderTypeFilter
      );
    }

    return filtered;
  };

  useEffect(() => {
    const filteredOrders = filterOrders();
    setTotalPages(Math.ceil(filteredOrders.length / ordersPerPage));
    
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    setOrders(filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder));
  }, [allOrders, searchQuery, statusFilter, orderTypeFilter, currentPage, ordersPerPage]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleOrderTypeFilterChange = (e) => {
    setOrderTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleAddPayment = (order) => {
    setSelectedOrder(order);
    setShowCheckout(true);
  };

  const handlePaymentComplete = async (orderId) => {
    try {
      // Find the order to get its items
      const order = allOrders.find(o => o._id === orderId);
      
      // Update order status
      await updateOrderStatus(orderId, "completed");
      
      // Update product stock if order has items
      if (order && order.items && order.items.length > 0) {
        try {
          const stockUpdates = order.items.map(item => ({
            productId: item.productId || item._id,
            quantity: -item.quantity // Negative to reduce stock
          }));
          
          await updateMultipleProductStock(stockUpdates);
          console.log("Stock updated successfully for order:", orderId);
        } catch (stockError) {
          console.error("Error updating stock for order:", orderId, stockError);
          // Don't fail the order completion if stock update fails
        }
      }
      
      await fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const closeCheckout = () => {
    setShowCheckout(false);
    setSelectedOrder(null);
  };

  const handleViewBill = (order) => {
    setBillOrder(order);
    setShowBill(true);
  };

  const closeBill = () => {
    setShowBill(false);
    setBillOrder(null);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      try {
        await deleteOrder(orderId);
        await fetchOrders();
      } catch (err) {
        console.error("Error deleting order:", err);
        alert("Failed to delete order. Please try again.");
      }
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="restaurant-dashboard">
        <Navbar />
        <div className="dashboard-content">
          <div className="loading-container">
            <h2>Loading orders...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-dashboard">
        <Navbar />
        <div className="dashboard-content">
          <div className="error-container">
            <h2>Error: {error}</h2>
            <button onClick={fetchOrders}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-dashboard">
      <Navbar />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>NexStay Hotel</h1>
        </div>
        
        <div className="search-filters">
          <div className="search-container">
            <h4>Search Orders</h4>
            <div className="search-input-container">
              <input 
                type="text" 
                placeholder="Search Guest Name, Room No" 
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="filter-container">
            <h4>Select Orders</h4>
            <div className="select-dropdown">
              <select value={orderTypeFilter} onChange={handleOrderTypeFilterChange}>
                <option>All Orders</option>
                <option>Take Away</option>
                <option>Dine In</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="filters-row">
          <div className="filter-container">
            <h4>Select Order Status</h4>
            <div className="select-dropdown">
              <select value={statusFilter} onChange={handleStatusFilterChange}>
                <option>All</option>
                <option>Completed</option>
                <option>Preparing</option>
                <option>Payment Pending</option>
              </select>
            </div>
          </div>
          
          <div className="filter-container">
            <h4>Select Date</h4>
            <div className="select-dropdown">
              <select>
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 Days</option>
                <option>This Month</option>
                <option>Custom Range</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Items and Prices</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time and Date</th>
                <th>Guest Name</th>
                <th>Room No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className={order.status === "preparing" ? "preparing-row" : ""}>
                  <td>{order.orderNo}</td>
                  <td>
                    <div className="items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="item-entry">
                          <span>{item.quantity} {item.name}</span>
                          <span className="item-price">{item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="total-column">{order.total.toFixed(2)}</td>
                  <td className="status-column">
                    <span className={`status-pill ${order.status.toLowerCase().replace(' ', '-')}`}>
                      {order.status}
                    </span>
                    {order.status === "preparing" && <div className="prep-time">15 Min</div>}
                  </td>
                  <td className="time-column">
                    <div>{formatDate(order.createdAt)}</div>
                    <div className="time-detail">{formatTime(order.createdAt)}</div>
                  </td>
                  <td>{order.guestInfo?.guestName || "Walk-in Customer"}</td>
                  <td>{order.guestInfo?.roomNo || "N/A"}</td>
                  <td>
                    <div className="res-dashboard-action-buttons">
                      <button 
                        className="res-dashboard-action-btn res-dashboard-view-btn"
                        onClick={() => handleViewBill(order)}
                      >
                        View Bill
                      </button>
                      {order.status === "payment pending" && (
                        <button 
                          className="res-dashboard-action-btn res-dashboard-add-btn"
                          onClick={() => handleAddPayment(order)}
                        >
                          Add Payment
                        </button>
                      )}
                      <button 
                        className="res-dashboard-action-btn res-dashboard-delete-btn"
                        onClick={() => handleDeleteOrder(order._id)}
                      >
                        Delete Record
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="pagination-container">
          <div className="pagination">
            <button 
              className="pagination-btn" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {pageNumbers.map(number => (
              <button 
                key={number} 
                className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                onClick={() => handlePageChange(number)}
              >
                {number}
              </button>
            ))}
            
            <button 
              className="pagination-btn" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>
      
      {showCheckout && selectedOrder && (
        <CheckoutPopup
          order={selectedOrder}
          onClose={closeCheckout}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      
      {showBill && billOrder && (
        <ViewBillPopup
          order={billOrder}
          onClose={closeBill}
        />
      )}
      
      {/* Low Stock Alert */}
      <LowStockAlert />
    </div>
  );
}
