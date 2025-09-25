import React, { useState, useEffect } from "react";
import axios from "axios";
import Ownsidebar from "../../../../components/owner/ownSidebar/Ownsidebar";
import "./StockRepo.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const StockReport = () => {
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    department: "",
    productName: "",
    stockType: "",
    fromDate: "",
    toDate: ""
  });

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/stocks");
      setStockData(res.data);
      setFilteredData(res.data);
    } catch (err) {
      console.error("Error fetching stock data:", err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    const { department, productName, stockType, fromDate, toDate } = filters;

    const filtered = stockData.filter((stock) => {
      const depMatch = department ? stock.department?.toLowerCase().trim() === department.toLowerCase().trim() : true;
      const prodMatch = productName ? stock.productName?.toLowerCase().includes(productName.toLowerCase()) : true;
      const typeMatch = stockType ? stock.stockType?.toLowerCase().trim() === stockType.toLowerCase().trim() : true;

      const stockDate = new Date(stock.date).setHours(0, 0, 0, 0);
      const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
      const to = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

      const dateMatch = (!from || stockDate >= from) && (!to || stockDate <= to);

      return depMatch && prodMatch && typeMatch && dateMatch;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentStocks = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const handleExport = (format) => {
    if (!filteredData.length) return alert("No data to export.");

    if (format === "pdf") {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
      const tableColumn = ["Product No", "Product Name", "Quantity", "Price", "Date", "Department", "Stock Type"];
      const tableRows = filteredData.map(row => [
        row.productNo,
        row.productName,
        row.quantity,
        row.price,
        new Date(row.date).toLocaleDateString(),
        row.department,
        row.stockType
      ]);
      doc.setFontSize(15);
      doc.text("Stock Report", 40, 40);
      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 60, theme: "grid", headStyles: { fillColor: [100, 100, 255] } });
      doc.save("stock_report.pdf");
    } else {
      const data = filteredData.map(row => ({
        "Product No": row.productNo,
        "Product Name": row.productName,
        Quantity: row.quantity,
        Price: row.price,
        Date: new Date(row.date).toLocaleDateString(),
        Department: row.department,
        "Stock Type": row.stockType
      }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Report");
      XLSX.writeFile(workbook, `stock_report.${format}`);
    }
  };

  return (
    <div className="stock-report-wrapper">
      <Ownsidebar />
      <div className="stock-report-container">
        <div className="stock-filter-section">
          <h2>Filter Stock History</h2>
          <div className="stock-filter-grid">
            <div className="stock-form-group">
              <label>Department</label>
              <select name="department" value={filters.department} onChange={handleFilterChange}>
                <option value="">--</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Kitchen">Kitchen</option>
                <option value="HouseKeeping">House Keeping</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <div className="stock-form-group">
              <label>Product Name</label>
              <input name="productName" value={filters.productName} onChange={handleFilterChange} type="text" placeholder="Enter Product Name" />
            </div>

            <div className="stock-form-group">
              <label>Stock Type</label>
              <select name="stockType" value={filters.stockType} onChange={handleFilterChange}>
                <option value="">--</option>
                <option value="Food stock">Food Stock</option>
                <option value="Bar Stock">Bar Stock</option>
                <option value="HouseKeeping Stock">House Keeping Stock</option>
                <option value="Restaurant & Dining Stock">Restaurant & Dining Stock</option>
                <option value="Toiletries & Guest Supplies">Toiletries & Guest Supplies</option>
                <option value="Maintenance & Engineering Stock">Maintenance & Engineering Stock</option>
                <option value="Office & Stationery Stock">Office & Stationery Stock</option>
              </select>
            </div>

            <div className="stock-form-group">
              <label>Date From</label>
              <input name="fromDate" value={filters.fromDate} onChange={handleFilterChange} type="date" />
            </div>

            <div className="stock-form-group">
              <label>Date To</label>
              <input name="toDate" value={filters.toDate} onChange={handleFilterChange} type="date" />
            </div>
          </div>

          <div className="stock-filter-buttons">
            <button className="stock-search-btn" onClick={handleSearch}>Search</button>
            <select className="stock-export-btn" onChange={(e) => handleExport(e.target.value)}>
              <option value="">Export As...</option>
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <div className="stock-table-controls">
          <div>
            Show{" "}
            <select value={entriesPerPage} onChange={handleEntriesChange} className="stock-entries-select">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>{" "}
            entries
          </div>
        </div>

        <div className="stock-history">
          <h3>Stock History</h3>
          <table className="stock-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product No</th>
                <th>Product Name</th>
                <th>Stock Type</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Date</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {currentStocks.length > 0 ? (
                currentStocks.map((stock, index) => (
                  <tr key={stock._id}>
                    <td>{indexOfFirstEntry + index + 1}</td>
                    <td>{stock.productNo}</td>
                    <td>{stock.productName}</td>
                    <td>{stock.stockType}</td>
                    <td>{stock.quantity}</td>
                    <td>{stock.price}</td>
                    <td>{new Date(stock.date).toLocaleDateString()}</td>
                    <td>{stock.department}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>No matching records found.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="Stock-pagination">
            <span>
              Showing {indexOfFirstEntry + 1} to{" "}
              {indexOfLastEntry > totalEntries ? totalEntries : indexOfLastEntry} of {totalEntries} entries
            </span>
            <div className="Stock-pagination-buttons">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={currentPage === i + 1 ? "active" : ""} onClick={() => handlePageChange(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockReport;
