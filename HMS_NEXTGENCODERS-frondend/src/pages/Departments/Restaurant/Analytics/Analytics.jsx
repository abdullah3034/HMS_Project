import React, { useState, useEffect } from "react";
import Navbar from '../../../../components/restaurant/resSidebar/Ressidebar';
import { getDailyRevenue, getBestSellingItems, getSalesBreakdown } from '../../../../api/orderApi';
import './Analytics.css';

export default function Analytics() {
  const [dailyRevenue, setDailyRevenue] = useState("0.00");
  const [bestSellingItems, setBestSellingItems] = useState([]);
  const [salesBreakdown, setSalesBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [globalDate, setGlobalDate] = useState("");
  const [globalOrderType, setGlobalOrderType] = useState("all");
  const [breakdownDate, setBreakdownDate] = useState("");
  const [breakdownFilter, setBreakdownFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load data on component mount
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    loadAnalyticsData();
  }, [globalDate, globalOrderType]);

  // Load breakdown data when breakdown filters change
  useEffect(() => {
    loadSalesBreakdown();
  }, [breakdownDate, breakdownFilter, currentPage]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load daily revenue
      const revenueData = await getDailyRevenue(globalDate, globalOrderType);
      setDailyRevenue(revenueData.totalRevenue);
      
      // Load best-selling items
      const bestSellingData = await getBestSellingItems(globalDate, globalOrderType);
      setBestSellingItems(bestSellingData);
      
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesBreakdown = async () => {
    try {
      const breakdownData = await getSalesBreakdown(breakdownDate, globalOrderType, breakdownFilter, currentPage);
      setSalesBreakdown(breakdownData.items || breakdownData);
      setTotalPages(Math.ceil((breakdownData.total || breakdownData.length) / itemsPerPage));
    } catch (error) {
      console.error("Error loading sales breakdown:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="analytics-container">
      <Navbar />
      
      <div className="analytics-main-content">
        {/* Top Section - Daily Revenue and Global Filters */}
        <div className="analytics-top-section">
          <div className="revenue-section">
            <h2>Today Revenue</h2>
            <div className="revenue-box">
              {loading ? "Loading..." : dailyRevenue}
            </div>
          </div>
          
          <div className="global-filters">
            <div className="resfilter-group">
              <label>Select Date</label>
              <input
                type="date"
                value={globalDate}
                onChange={(e) => setGlobalDate(e.target.value)}
                className="resfilter-input"
              />
            </div>
            
            <div className="resfilter-group">
              <label>Select Order Type</label>
              <select
                value={globalOrderType}
                onChange={(e) => setGlobalOrderType(e.target.value)}
                className="resfilter-input"
              >
                <option value="all">All Orders</option>
                <option value="Take Away">Take Away</option>
                <option value="Dine In">Dine In</option>
              </select>
            </div>
          </div>
        </div>

        {/* Middle Section - Most Sold Item */}
        <div className="most-sold-section">
          <h2>Most Sold Item of Today</h2>
          <div className="restable-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Item</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bestSellingItems.length > 0 ? (
                  bestSellingItems.slice(0, 1).map((item, index) => (
                    <tr key={index}>
                      <td>{item.no}</td>
                      <td>{item.name}</td>
                      <td>{item.unitPrice}</td>
                      <td>{item.quantity}</td>
                      <td>{item.totalRevenue}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lower Section - Detailed Sales Breakdown */}
        <div className="sales-breakdown-section">
          <div className="breakdown-filters">
            <div className="resfilter-group">
              <label>Select Date</label>
              <input
                type="date"
                value={breakdownDate}
                onChange={(e) => setBreakdownDate(e.target.value)}
                className="resfilter-input"
              />
            </div>
            
            <div className="resfilter-group">
              <label>Filter By</label>
              <select
                value={breakdownFilter}
                onChange={(e) => setBreakdownFilter(e.target.value)}
                className="resfilter-input"
              >
                <option value="all">All Items</option>
                <option value="name">By Name</option>
                <option value="price">By Price</option>
                <option value="quantity">By Quantity</option>
              </select>
            </div>
          </div>

          <div className="restable-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Item</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesBreakdown.length > 0 ? (
                  salesBreakdown.map((item, index) => (
                    <tr key={index}>
                      <td>{item.no}</td>
                      <td>{item.name}</td>
                      <td>{item.unitPrice}</td>
                      <td>{item.quantity}</td>
                      <td>{item.totalRevenue}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-section">
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
