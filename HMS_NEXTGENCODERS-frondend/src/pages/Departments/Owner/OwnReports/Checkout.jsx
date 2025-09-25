import React, { useState, useEffect } from 'react';
import Ownsidebar from "../../../../components/owner/ownSidebar/Ownsidebar";
import './Checkout.css';

// Main Component for Checkout Page
const CheckoutP = () => {
  const [data, setData] = useState([]); // Store fetched checkout data
  const [entriesToShow, setEntriesToShow] = useState(6); // Controls how many entries to show in the table

  // Fetch checkout data from backend API when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/reception/checkouts'); // Replace with your actual API
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching checkout data:', error);
      }
    };

    fetchData();
  }, []);

  return (
   <div className="checkout-report-wrapper">
      <Ownsidebar/>
      
      <div className="check-report-container">
      {/* Filter Section */}
      <div className="checkout-filter-section">
        <h2>Filter Checkouts</h2>
        
        <div className="checkout-filter-grid">
          {/* Filter by Guest */}
          <div className="checkout-form-group">
            <label>Guest</label>
            <select>
              <option>Select</option>
            </select>
          </div>

          {/* Filter by Payment Status */}
          <div className="checkout-form-group">
            <label>Payment Status</label>
            <select>
              <option>Select</option>
            </select>
          </div>

          {/* Filter by Date Range */}
          <div className="checkout-form-group">
            <label>Date From</label>
            <input type="date"/>
          </div>

          <div className="checkout-form-group">
            <label>Date To</label>
            <input type="date" />
          </div>
        </div>

        {/* Search Button */}
        <button className="checkout-search-button">Search</button>
      </div>
      
      {/* Table Section */}
      <div className="checkout-table-section">
        {/* Entries Selection */}
        <div className="checkout-table-header">
          <div>
            Show
            <select
              value={entriesToShow}
              onChange={(e) => setEntriesToShow(parseInt(e.target.value))}
              className="checkout-entries-select"
            >
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
            entries
          </div>
        </div>

        {/* Data Table */}
        <table className="checkout-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Guest ID</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Date From</th>
              <th>Date To</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, entriesToShow).map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.guestId}</td>
                <td>{item.phone}</td>
                <td>{item.email}</td>
                <td>{item.dateFrom}</td>
                <td>{item.dateTo}</td>
                <td>{item.amount}</td>
                <td>
                  <button className="checkout-view-button">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default CheckoutP;
