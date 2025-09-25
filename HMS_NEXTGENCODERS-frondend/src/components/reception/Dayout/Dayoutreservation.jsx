import React from 'react';
import { countries } from "../FormSection1/countries";
import useDayoutForm from './useDayoutForm';
import './DayoutReservation.css';

const DayoutReservation = () => {
  const {
    formData,
    customerType,
    searchTerm,
    searchResults,
    showSearchResults,
    persons,
    packages,
    selectedPackages,
    packageCategoryFilter,
    searchQuery,
    uniqueCategories,
    selectedCountry,
    emailError,
    selectedFiles,
    fileInputRef,
    // Popup states
    showPopup,
    popupType,
    popupMessage,
    handlePopupOk,
    
    handleFormChange,
    setCustomerType,
    setSearchTerm,
    handleCustomerSearch,
    handleCustomerSelect,
    setSelectedCountry,
    handleAddPerson,
    handleRemovePerson,
    handlePersonChange,
    handlePackageSelect,
    setPackageCategoryFilter,
    setSearchQuery,
    handleFileChange,
    handleSubmit,
    calculateTotalAmount
  } = useDayoutForm();

  // Helper function to format date for HTML input
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      
      // Convert to YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Handle country selection and update mobile field with country code
  const handleCountryChange = (e) => {
    const country = countries.find(c => c.value === e.target.value);
    setSelectedCountry(country);
    
    if (country) {
      // Extract the country code from the country object
      const countryCode = country.value; // Assuming country.value contains the code like "+94"
      
      // Update the mobile field to include the country code
      const currentMobile = formData.mobile || '';
      // Remove any existing country code if present
      const mobileWithoutCode = currentMobile.replace(/^\+\d+\s*/, '');
      
      // Create new mobile number with country code
      const newMobile = `${countryCode} ${mobileWithoutCode}`;
      
      // Update form data
      handleFormChange({
        target: {
          id: 'mobile',
          value: newMobile
        }
      });
    }
  };

  // Handle mobile number change
  const handleMobileChange = (e) => {
    let value = e.target.value;
    
    // If there's a selected country, ensure the country code is preserved
    if (selectedCountry) {
      const countryCode = selectedCountry.value;
      
      // If the value doesn't start with the country code, add it
      if (!value.startsWith(countryCode)) {
        // Remove any existing country code first
        const cleanValue = value.replace(/^\+\d+\s*/, '');
        value = `${countryCode} ${cleanValue}`;
      }
    }
    
    handleFormChange({
      target: {
        id: 'mobile',
        value: value
      }
    });
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesCategory = packageCategoryFilter === "all" || pkg.category === packageCategoryFilter;
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="dayout-form-scope">
      <div className="dayout-container">
        <h2 className="dayout-main-heading">Day Out Reservation</h2>
        
        <form onSubmit={handleSubmit} className="dayout-form">
          {/* Date and Guest Information */}
          <div className="dayout-form-section">
            <div className="dayout-form-container">
              <h5 className="dayout-form-heading">Visit Information</h5>
              <div className="dayout-form-grid">
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Visit Date *</label>
                  <input
                    type="date"
                    className="dayout-form-input"
                    id="checkIn"
                    value={formatDateForInput(formData.checkIn)}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="dayout-form-group">
                  <label className="dayout-form-label">Start Time *</label>
                  <input
                    type="time"
                    className="dayout-form-input"
                    id="startTime"
                    value={formData.startTime || ''}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="dayout-form-group">
                  <label className="dayout-form-label">End Time *</label>
                  <input
                    type="time"
                    className="dayout-form-input"
                    id="endTime"
                    value={formData.endTime || ''}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="dayout-form-group">
                  <label className="dayout-form-label">Adults *</label>
                  <select
                    className="dayout-form-select"
                    id="adults"
                    value={formData.adults}
                    onChange={handleFormChange}
                    required
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={`adults-${i + 1}`} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="dayout-form-group">
                  <label className="dayout-form-label">Kids</label>
                  <select
                    className="dayout-form-select"
                    id="kids"
                    value={formData.kids}
                    onChange={handleFormChange}
                  >
                    {[...Array(11)].map((_, i) => (
                      <option key={`kids-${i}`} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Type Selection */}
          <div className="dayout-form-section">
            <div className="dayout-form-container">
              <h5 className="dayout-form-heading">Customer Information</h5>
              
              <div className="dayout-customer-type-options">
                <label className="dayout-radio-label">
                  <input
                    type="radio"
                    name="customerType"
                    checked={customerType === "new"}
                    onChange={() => setCustomerType("new")}
                    className="dayout-radio-input"
                  />
                  <span>New Customer</span>
                </label>

                <label className="dayout-radio-label">
                  <input
                    type="radio"
                    name="customerType"
                    checked={customerType === "existing"}
                    onChange={() => setCustomerType("existing")}
                    className="dayout-radio-input"
                  />
                  <span>Existing Customer</span>
                </label>
              </div>

              {/* Existing Customer Search */}
              {customerType === "existing" && (
                <div className="dayout-search-section">
                  <div className="dayout-search-controls">
                    <input
                      type="text"
                      className="dayout-form-input"
                      placeholder="Search by name, mobile, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                      type="button"
                      className="dayout-btn dayout-btn-info"
                      onClick={handleCustomerSearch}
                    >
                      Search
                    </button>
                  </div>
                  
                  {/* Search Results */}
                  {showSearchResults && (
                    <div className="dayout-search-results">
                      <h6>Search Results:</h6>
                      {searchResults.length === 0 ? (
                        <p>No customers found</p>
                      ) : (
                        <div className="dayout-results-list">
                          {searchResults.map((customer) => (
                            <button
                              key={customer._id}
                              type="button"
                              className="dayout-result-item"
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <strong>{customer.firstName} {customer.surname}</strong>
                              <br />
                              📱 {customer.mobile} | 📧 {customer.email}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Customer Details Form */}
              <div className="dayout-form-grid">
                <div className="dayout-form-group">
                  <label className="dayout-form-label">First Name *</label>
                  <input
                    type="text"
                    className="dayout-form-input"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="dayout-form-group">
                  <label className="dayout-form-label">Middle Name</label>
                  <input
                    type="text"
                    className="dayout-form-input"
                    id="middleName"
                    value={formData.middleName}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="dayout-form-group">
                  <label className="dayout-form-label">Surname</label>
                  <input
                    type="text"
                    className="dayout-form-input"
                    id="surname"
                    value={formData.surname}
                    onChange={handleFormChange}
                  />
                </div>
                
                {/* Separate Country Field */}
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Country *</label>
                  <select
                    className="dayout-form-select"
                    value={selectedCountry?.value || ''}
                    onChange={handleCountryChange}
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country, index) => (
                      <option key={`country-${index}-${country.value}`} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Mobile Number Field */}
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="dayout-form-input"
                    id="mobile"
                    value={formData.mobile || ''}
                    onChange={handleMobileChange}
                    placeholder={selectedCountry ? `${selectedCountry.value} Enter mobile number` : "Select country first"}
                    required
                  />
                </div>
                
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Email</label>
                  <input
                    type="email"
                    className={`dayout-form-input ${emailError ? 'dayout-form-input-error' : ''}`}
                    id="email"
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="dayout-form-input"
                    id="dob"
                    value={formatDateForInput(formData.dob)}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Gender</label>
                  <select
                    className="dayout-form-select"
                    id="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="dayout-form-group">
                  <label className="dayout-form-label">City</label>
                  <input
                    type="text"
                    className="dayout-form-input"
                    id="city"
                    value={formData.city}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="dayout-form-group dayout-form-group-full">
                  <label className="dayout-form-label">Address *</label>
                  <textarea
                    className="dayout-form-textarea"
                    id="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    rows="2"
                    required
                  />
                </div>
                
                <div className="dayout-form-group">
                  <label className="dayout-form-label">ID Type *</label>
                  <select
                    className="dayout-form-select"
                    id="idType"
                    value={formData.idType}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select ID Type</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="National ID">National ID</option>
                    <option value="Aadhar Card">Aadhar Card</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
                
                <div className="dayout-form-group">
                  <label className="dayout-form-label">ID Number *</label>
                  <input
                    type="text"
                    className="dayout-form-input"
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div className="dayout-form-group dayout-form-group-full">
                  <label className="dayout-form-label">Upload ID Files</label>
                  <input
                    type="file"
                    className="dayout-form-input dayout-file-input"
                    ref={fileInputRef}
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                  <div className="dayout-form-text">
                    Upload images or PDF files of identification documents
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Persons */}
          <div className="dayout-form-section">
            <div className="dayout-form-container">
              <div className="dayout-section-header">
                <h5 className="dayout-form-heading">Other Persons</h5>
                <button
                  type="button"
                  className="dayout-btn dayout-btn-success"
                  onClick={handleAddPerson}
                >
                  ➕
                </button>
              </div>
              
              {persons.map((person, index) => (
                <div key={`person-${index}`} className="dayout-person-card">
                  <div className="dayout-person-header">
                    <h6>Person {index + 1}</h6>
                    {persons.length > 1 && (
                      <button
                        type="button"
                        className="dayout-btn dayout-btn-danger"
                        onClick={() => handleRemovePerson(index)}
                      >
                        ✖️
                      </button>
                    )}
                  </div>
                  <div className="dayout-form-grid">
                    <div className="dayout-form-group">
                      <label className="dayout-form-label">Name</label>
                      <input
                        type="text"
                        className="dayout-form-input"
                        value={person.name}
                        onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="dayout-form-group">
                      <label className="dayout-form-label">Gender</label>
                      <select
                        className="dayout-form-select"
                        value={person.gender}
                        onChange={(e) => handlePersonChange(index, 'gender', e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="dayout-form-group">
                      <label className="dayout-form-label">Age</label>
                      <input
                        type="number"
                        className="dayout-form-input"
                        value={person.age}
                        onChange={(e) => handlePersonChange(index, 'age', e.target.value)}
                      />
                    </div>
                    <div className="dayout-form-group">
                      <label className="dayout-form-label">ID Type</label>
                      <select
                        className="dayout-form-select"
                        value={person.idType}
                        onChange={(e) => handlePersonChange(index, 'idType', e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                        <option value="National ID">National ID</option>
                        <option value="Aadhar Card">Aadhar Card</option>
                        <option value="Voter ID">Voter ID</option>
                      </select>
                    </div>
                    <div className="dayout-form-group">
                      <label className="dayout-form-label">ID Number</label>
                      <input
                        type="text"
                        className="dayout-form-input"
                        value={person.idNo}
                        onChange={(e) => handlePersonChange(index, 'idNo', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Package Selection */}
          <div className="dayout-form-section">
            <div className="dayout-form-container">
              <h5 className="dayout-form-heading">Package Selection</h5>
              
              {/* Package Filters */}
              <div className="dayout-filter-section">
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Search Packages</label>
                  <input
                    type="text"
                    className="dayout-form-input"
                    placeholder="Search packages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Category</label>
                  <select
                    className="dayout-form-select"
                    value={packageCategoryFilter}
                    onChange={(e) => setPackageCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map((category, index) => (
                      <option key={`category-${index}-${category}`} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Selected Packages</label>
                  <div className="dayout-selected-count">
                    {selectedPackages.length} package(s) selected
                  </div>
                </div>
              </div>

              {/* Available Packages */}
              <div className="dayout-packages-grid">
                {filteredPackages.length === 0 ? (
                  <div className="dayout-no-packages">
                    <p>No packages available</p>
                  </div>
                ) : (
                  filteredPackages.map(pkg => (
                    <div 
                      key={pkg._id} 
                      className={`dayout-package-card ${selectedPackages.includes(pkg._id) ? 'dayout-package-selected' : ''}`}
                      onClick={() => handlePackageSelect(pkg._id)}
                    >
                      <div className="dayout-package-header">
                        <h6 className="dayout-package-title">{pkg.name}</h6>
                        <input
                          type="checkbox"
                          className="dayout-checkbox"
                          checked={selectedPackages.includes(pkg._id)}
                          onChange={() => {}}
                        />
                      </div>
                      <p className="dayout-package-description">{pkg.description}</p>
                      <p className="dayout-package-category">
                        <strong>Category:</strong> {pkg.category}
                      </p>
                      <p className="dayout-package-price">
                        <strong>Rs {pkg.pricePerChild}</strong> per child
                      </p>
                      {pkg.features && pkg.features.length > 0 && (
                        <div className="dayout-package-features">
                          <small>Features:</small>
                          <ul>
                            {pkg.features.slice(0, 2).map((feature, index) => (
                              <li key={`feature-${index}`}>• {feature}</li>
                            ))}
                            {pkg.features.length > 2 && (
                              <li>... +{pkg.features.length - 2} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="dayout-form-section">
            <div className="dayout-form-container">
              <h5 className="dayout-form-heading">Payment Information</h5>
              <div className="dayout-form-grid">
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Total Amount</label>
                  <div className="dayout-input-group">
                    <span className="dayout-input-prefix">Rs</span>
                    <input
                      type="number"
                      className="dayout-form-input dayout-readonly"
                      value={formData.totalAmount}
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Advance Payment</label>
                  <div className="dayout-input-group">
                    <span className="dayout-input-prefix">Rs</span>
                    <input
                      type="number"
                      className="dayout-form-input"
                      id="advancePayment"
                      value={formData.advancePayment}
                      onChange={handleFormChange}
                      min="0"
                      max={formData.totalAmount}
                    />
                  </div>
                </div>
                
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Payment Method</label>
                  <select
                    className="dayout-form-select"
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="dayout-form-group">
                  <label className="dayout-form-label">Payment Notes</label>
                  <textarea
                    className="dayout-form-textarea"
                    id="paymentNotes"
                    value={formData.paymentNotes}
                    onChange={handleFormChange}
                    rows="2"
                    placeholder="Any additional payment notes..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="dayout-form-actions">
            <button type="button" className="dayout-btn dayout-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="dayout-btn dayout-btn-primary">
              Create Day Out Reservation
            </button>
          </div>
        </form>

        {/* SUCCESS/ERROR POPUP */}
        {showPopup && (
          <div className="success-popup-overlay">
            <div className="success-popup-content">
              <div className="success-popup-icon">
                {popupType === 'success' ? '✅' : '❌'}
              </div>
              <h3 className="success-popup-title">
                {popupType === 'success' ? 'Success!' : 'Error!'}
              </h3>
              <p className="success-popup-message">
                {popupMessage}
              </p>
              <button
                onClick={handlePopupOk}
                className="success-popup-button"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayoutReservation;