import React, { useEffect, useState } from "react";
import axios from "axios";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./TransactionReports.css";

const TransactionReport = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const [filters, setFilters] = useState({
    department: "",
    paymentMode: "",
    transactionType: "",
    fromDate: "",
    toDate: ""
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/transactions");
      setAllTransactions(response.data);
      setFilteredTransactions(response.data);
      calculateTotals(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const calculateTotals = (data) => {
    let income = 0;
    let expense = 0;

    data.forEach((t) => {
      if (t.transactionType?.toLowerCase() === "expense") {
        expense += t.totalAmount;
      } else {
        income += t.totalAmount;
      }
    });

    setTotalIncome(income);
    setTotalExpense(expense);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    const { department, paymentMode, transactionType, fromDate, toDate } = filters;

    const filtered = allTransactions.filter((t) => {
      const matchDept = department ? t.department === department : true;
      const matchPay = paymentMode ? t.paymentMode === paymentMode : true;
      const matchType = transactionType ? t.transactionType === transactionType : true;

      const tDate = new Date(t.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const matchDate = (!from || tDate >= from) && (!to || tDate <= to);

      return matchDept && matchPay && matchType && matchDate;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
    calculateTotals(filtered);
  };

  const totalEntries = filteredTransactions.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstEntry, indexOfLastEntry);

  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExport = (format) => {
    const exportData = filteredTransactions.map((t) => ({
  "Transaction ID": t.transactionId,
  Activity: t.activity,
  Department: t.department, // 👈 Add this line
  "Transaction Type": t.transactionType,
  "Payment Mode": t.paymentMode,
  Date: new Date(t.date).toLocaleDateString(),
  "Total Amount": t.totalAmount,
}));

    if (format === "pdf") {
      const doc = new jsPDF("landscape");
      doc.text("Transaction Report", 14, 20);
      doc.autoTable({
        head: [Object.keys(exportData[0])],
        body: exportData.map((row) => Object.values(row)),
        startY: 30
      });
      doc.save("transaction_report.pdf");
    } else {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `transaction_report.${format}`);
    }
  };

  return (
    <div className="transaction-report-wrapper">
      
      <div className="transaction-report-container">
        <div className="transaction-filter-section">
          <h3>Filter Transaction History</h3>
          <div className="transaction-filter-grid">
            <div className="transaction-form-group">
              <label>Department</label>
              <select name="department" value={filters.department} onChange={handleFilterChange}>
                <option value="">~~</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Reception">Reception</option>
                <option value="Kitchen">Kitchen</option>
                <option value="HouseKeeping">House Keeping</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <div className="transaction-form-group">
              <label>Payment Mode</label>
              <select name="paymentMode" value={filters.paymentMode} onChange={handleFilterChange}>
                <option value="">~~</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Mobile Wallet">Mobile Wallet</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="transaction-form-group">
              <label>Transaction Type</label>
              <select name="transactionType" value={filters.transactionType} onChange={handleFilterChange}>
                <option value="">~~</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>

            <div className="transaction-form-group">
              <label>Date From</label>
              <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
            </div>

            <div className="transaction-form-group">
              <label>Date To</label>
              <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} />
            </div>
          </div>

          <div className="transaction-filter-buttons">
            <button className="transaction-search-btn" onClick={handleSearch}>Search</button>
            <select className="transaction-export-btn" onChange={(e) => handleExport(e.target.value)}>
              <option value="">Export As...</option>
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <div className="transaction-table-controls">
          <div>
            Show
            <select className="transaction-entries-select" value={entriesPerPage} onChange={handleEntriesChange}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            entries
          </div>
        </div>

        <div className="transaction-table-section">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Transaction ID</th>
                <th>Activity</th>
                <th>Department</th> {/*Add this line */}
                <th>Transaction Type</th>
                <th>Payment Mode</th>
                <th>Date</th>
                <th>Total Amount</th>
             </tr>
           </thead>
            <tbody>
              {currentTransactions.map((transaction, index) => (
                <tr key={transaction._id}>
                  <td>{indexOfFirstEntry + index + 1}</td>
                  <td>{transaction.transactionId}</td>
                  <td>{transaction.activity}</td>
                  <td>{transaction.department}</td> {/*  Add this line */}
                  <td>{transaction.transactionType}</td>
                  <td>{transaction.paymentMode}</td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>₹{transaction.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
           </tbody>
          </table>

          <div className="transaction-pagination">
            <span>
              Showing {indexOfFirstEntry + 1} to{" "}
              {indexOfLastEntry > totalEntries ? totalEntries : indexOfLastEntry} of{" "}
              {totalEntries} entries
            </span>
            <div className="transaction-pagination-buttons">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="transaction-summary-section">
          <div>Total Income: <span className="transaction-income">Rs. {totalIncome.toFixed(2)}</span></div>
          <div>Total Expense: <span className="transaction-expense">Rs. {totalExpense.toFixed(2)}</span></div>
          <div>Net Amount: <span className="transaction-net-amount">Rs. {(totalIncome - totalExpense).toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default TransactionReport;
