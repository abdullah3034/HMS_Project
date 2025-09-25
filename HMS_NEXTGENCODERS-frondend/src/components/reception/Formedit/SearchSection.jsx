import React from "react";
import ReservationsTable from "./ReservationsTable";
import "./SearchSection.css"; // Assuming you have a CSS file for styling


const SearchSection = ({
  searchTerm,
  setSearchTerm,
  entriesPerPage,
  setEntriesPerPage,
  error,
  success,
  displayedReservations,
  currentPage,
  setCurrentPage,
  isLoading,
  selectedReservation,
  viewMode,
  loadReservation,
  viewReservation
}) => {
  const totalPages = Math.ceil(displayedReservations.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedReservations = displayedReservations.slice(startIndex, endIndex);

  return (
    <div className="search-section">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name, ID, or phone number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="entries-selector">
          <label>Show entries:</label>
          <select 
            value={entriesPerPage} 
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="search-results">
        <h3>Reservations</h3>
        <div className="results-info">
          Showing {startIndex + 1} to {Math.min(endIndex, displayedReservations.length)} of {displayedReservations.length} entries
        </div>
        
        <ReservationsTable
          reservations={paginatedReservations}
          isLoading={isLoading}
          selectedReservation={selectedReservation}
          viewMode={viewMode}
          onLoadReservation={loadReservation}
          onViewReservation={viewReservation}
        />
        
        {displayedReservations.length > 0 && (
          <div className="pagination-controls">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <span>
              Page {currentPage} of {totalPages}
            </span>
            
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSection;