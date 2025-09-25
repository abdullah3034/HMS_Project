import React from 'react';

const CustomerTypeSection = ({
  customerType,
  setCustomerType,
  searchTerm,
  setSearchTerm,
  searchResults,
  showSearchResults,
  handleCustomerSearch,
  handleCustomerSelect,
  formData
}) => {
  return (
    <div className="checkinform-form-container">
      <div className="checkinform-form-group">
        <label className="checkinform-form-label">Customer Type <span className="asterisk">*</span></label>
        <div className="checkinform-customer-type-options">
          <label>
            <input
              type="radio"
              name="customerType"
              value="new"
              checked={customerType === "new"}
              onChange={() => setCustomerType("new")}
            />
            New Customer
          </label>
          <label>
            <input
              type="radio"
              name="customerType"
              value="existing"
              checked={customerType === "existing"}
              onChange={() => setCustomerType("existing")}
            />
            Existing Customer
          </label>
        </div>
      </div>

      {customerType === "existing" && (
        <div className="checkinform-existing-customer-search">
          <div className="checkinform-form-group">
            <div className="customer-search-container">
              <input
                type="text"
                placeholder="Search by ID or Phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="checkinform-form-input"
              />
              <button 
                type="button" 
                className="customer-search-button"
                onClick={handleCustomerSearch}
              >
                Search
              </button>
            </div>
          </div>

          {showSearchResults && (
            <div className="customer-search-results">
              {searchResults.length > 0 ? (
                <table className="customer-results-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((customer) => (
                      <tr key={customer._id} onClick={() => handleCustomerSelect(customer)}>
                        <td>
                          <input
                            type="radio"
                            name="selectedCustomer"
                            checked={formData.customerId === customer._id}
                            onChange={() => {}}
                          />
                        </td>
                        <td>{customer.firstName} {customer.surname}</td>
                        <td>{customer.mobile}</td>
                        <td>{customer.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="customer-no-results">No customers found</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerTypeSection;