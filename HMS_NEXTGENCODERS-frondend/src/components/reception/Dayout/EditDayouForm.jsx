import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { countries } from "../FormSection1/countries";
import "./Editdayout.css";


const EditDayoutReservationForm = ({
  selectedReservation,
  formData,
  setFormData,
  persons,
  setPersons,
  selectedPackages,
  setSelectedPackages,
  selectedCountry,
  setSelectedCountry, 
  selectedFiles,
  setSelectedFiles,
  existingFiles,
  onDeleteReservation,
  onSuccess,
  onError,
  onReservationUpdate
}) => {
  const fileInputRef = useRef(null);
  const [emailError, setEmailError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [packages, setPackages] = useState([]);
  const [packageCategoryFilter, setPackageCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uniqueCategories, setUniqueCategories] = useState([]);

  // Format date for HTML input
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Fetch packages from API
  const fetchPackages = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/packages");
      if (res.data && Array.isArray(res.data)) {
        setPackages(res.data);
        setUniqueCategories([...new Set(res.data.map(pkg => pkg.category))]);
      } else {
        setPackages([]);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      setPackages([]);
    }
  };

  // Calculate total amount based on selected packages
  const calculateTotalAmount = () => {
    if (selectedPackages.length === 0) return 0;
    
    const selectedPackageObjects = packages.filter(pkg => 
      selectedPackages.includes(pkg._id)
    );
    
    const totalAdults = parseInt(formData.adults) || 0;
    const totalKids = parseInt(formData.kids) || 0;
    
    const totalPackagePrice = selectedPackageObjects.reduce((sum, pkg) => {
      const packagePrice = pkg.pricePerChild || 0;
      const totalGuests = totalAdults + totalKids;
      return sum + (packagePrice * totalGuests);
    }, 0);
    
    return totalPackagePrice;
  };

  // Update total amount when packages or guests change
  useEffect(() => {
    const totalAmount = calculateTotalAmount();
    setFormData(prev => ({ ...prev, totalAmount }));
  }, [selectedPackages, formData.adults, formData.kids, packages]);

  // Update duration when times change
  useEffect(() => {
    const { checkIn, startTime, endTime } = formData;
    if (checkIn && startTime && endTime) {
      const start = new Date(`${checkIn}T${startTime}`);
      const end = new Date(`${checkIn}T${endTime}`);
      const diffHours = (end - start) / (1000 * 60 * 60);
      setFormData(prev => ({ ...prev, duration: diffHours > 0 ? diffHours : 1 }));
    }
  }, [formData.checkIn, formData.startTime, formData.endTime]);


// Update mobile when country changes
useEffect(() => {
  if (selectedCountry) {
    setFormData(prev => ({
      ...prev,
      mobile: selectedCountry.value + " " + ((prev.mobile || "").split(' ')[1] || ""),
    }));
  }
}, [selectedCountry]);

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const handleFormChange = (e) => {
    const { id, name, value } = e.target;
    const key = id || name;

    setFormData(prev => ({ ...prev, [key]: value }));

    if (key === "email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      setEmailError(!emailPattern.test(value));
    }

    // If advance payment is cleared, also clear payment method and notes
    if (key === "advancePayment" && (!value || parseFloat(value) === 0)) {
      setFormData(prev => ({ 
        ...prev, 
        [key]: value,
        paymentMethod: "",
        paymentNotes: ""
      }));
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleAddPerson = () => {
    setPersons([...persons, { 
      id: Date.now(),
      name: '', 
      gender: '', 
      age: '', 
      address: '', 
      idType: '', 
      idNo: '' 
    }]);
  };

  const handleRemovePerson = (index) => {
    if (persons.length > 1) {
      setPersons(persons.filter((_, i) => i !== index));
    }
  };

  const handlePersonChange = (index, field, value) => {
    setPersons(persons.map((person, i) => 
      i === index ? { ...person, [field]: value } : person
    ));
  };

  const handlePackageSelect = (packageId) => {
    setSelectedPackages(prev => {
      return prev.includes(packageId) 
        ? prev.filter(p => p !== packageId) 
        : [...prev, packageId];
    });
  };

  const handlePopupOk = () => {
    setShowSuccessPopup(false);
    window.location.reload();
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedReservation) {
    onError("No reservation selected for editing");
    return;
  }

  if (isSubmitting) return;

  // Validation
  const validationErrors = [];
  
  if (!formData.firstName?.trim()) validationErrors.push("First name is required");
  if (!formData.mobile?.trim()) validationErrors.push("Mobile number is required");
  if (!formData.checkIn) validationErrors.push("Visit date is required");
  if (!formData.startTime) validationErrors.push("Start time is required");
  if (!formData.endTime) validationErrors.push("End time is required");
  if (selectedPackages.length === 0) validationErrors.push("At least one package must be selected");

  if (formData.email && emailError) {
    validationErrors.push("Please enter a valid email address");
  }

  if (validationErrors.length > 0) {
    onError(validationErrors.join(", "));
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Clean selectedPackages to ensure only IDs are sent
    const cleanedSelectedPackages = selectedPackages.map(pkg => {
      if (typeof pkg === 'string') {
        return pkg; // It's already an ID
      } else if (pkg._id) {
        return pkg._id; // Extract ID from object
      }
      return pkg;
    }).filter(Boolean); // Remove any undefined/null values

    const updateData = {
      firstName: formData.firstName?.trim() || "",
      middleName: formData.middleName?.trim() || "",
      surname: formData.surname?.trim() || "",
      mobile: formData.mobile?.trim() || "",
      email: formData.email?.trim() || "",
      dob: formData.dob || "",
      address: formData.address?.trim() || "Not provided",
      city: formData.city?.trim() || "",
      idType: formData.idType || "Passport",
      idNumber: formData.idNumber?.trim() || "",
      checkIn: formData.checkIn,
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration: parseFloat(formData.duration) || 1,
      adults: parseInt(formData.adults) || 1,
      kids: parseInt(formData.kids) || 0,
      totalAmount: parseFloat(formData.totalAmount) || 0,
      advancePayment: parseFloat(formData.advancePayment) || 0,
      paymentMethod: formData.paymentMethod || "",
      paymentNotes: formData.paymentNotes?.trim() || "",
      otherPersons: Array.isArray(persons) ? 
        persons.filter(person => person && person.name && person.name.trim() !== "") : 
        [],
      selectedPackages: cleanedSelectedPackages, // Use cleaned package IDs
      country: selectedCountry?.label || "",
      countryCode: selectedCountry?.value || "",
      reservationType: "dayout"
    };

    // Handle gender enum
    if (formData.gender && ['Male', 'Female', 'Other'].includes(formData.gender)) {
      updateData.gender = formData.gender;
    }

    console.log('Update Data Being Sent:', JSON.stringify(updateData, null, 2));

    const response = await axios.put(
      `http://localhost:8000/api/reservations/${selectedReservation._id}`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000,
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      setShowSuccessPopup(true);
      
      if (onReservationUpdate && response.data) {
        const updatedReservation = response.data.reservation || 
                                 response.data.updatedReservation || 
                                 response.data;
        onReservationUpdate(updatedReservation);
      }
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
    
  } catch (error) {
    console.error("Update Error:", error);
    
    if (error.response) {
      let errorMessage = "Error updating day out reservation";
      
      if (error.response.data) {
        errorMessage = error.response.data.message || 
                      error.response.data.msg || 
                      error.response.data.error ||
                      errorMessage;
      }
      
      errorMessage = `${errorMessage} (Status: ${error.response.status})`;
      onError(errorMessage);
      
    } else if (error.request) {
      onError("Network error. Please check your connection and try again.");
    } else {
      onError(`Error: ${error.message}`);
    }
  } finally {
    setIsSubmitting(false);
  }
};
  // Filter packages based on category and search
  const filteredPackages = packages.filter(pkg => {
    const matchesCategory = packageCategoryFilter === "all" || pkg.category === packageCategoryFilter;
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTextColor = (value) => (value ? "#000000" : "#718096");

  return (
    <div className="edit-dayout-form-scope">
      <div className="dayout-main-form-container">
        
        {/* Visit Information Section */}
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

        {/* Customer Information Section */}
        <div className="dayout-form-section">
          <div className="dayout-form-container">
            <h5 className="dayout-form-heading"> Customer Information</h5>
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
              
            <div className="dayout-form-group dayout-mobile-group">
                <label className="dayout-form-label">Mobile *</label>
                <div className="dayout-input-group">
                  <select
                    className="dayout-form-select dayout-country-select"
                    value={selectedCountry?.value || ''}
                    onChange={(e) => {
                      const country = countries.find(c => c.value === e.target.value);
                      setSelectedCountry(country);
                    }}
                  >
                    <option value="">Country</option>
                    {countries.map((country, index) => (
                      <option key={`country-${index}-${country.value}`} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    className="dayout-form-input"
                    id="mobile"
                    value={formData.mobile ? (formData.mobile.split(' ')[1] || formData.mobile) : ''}
                    onChange={handleFormChange}
                    required
                  />
                </div>
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

        {/* Other Persons Section */}
        <div className="dayout-form-section">
          <div className="dayout-form-container">
            <div className="dayout-section-header">
              <h5 className="dayout-form-heading"> Other Persons</h5>
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

        {/* Package Selection Section */}
        <div className="dayout-form-section">
          <div className="dayout-form-container">
            <h5 className="dayout-form-heading"> Package Selection</h5>
            
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

        {/* Payment Information Section */}
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

        {/* Action Buttons */}
<div className="dayout-form-section">
  <div className="dayout-form-container">
    <div className="dayout-action-buttons">
      <button 
        type="button" 
        className="dayout-btn dayout-btn-danger"
        onClick={onDeleteReservation}
      >
         Delete Reservation
      </button>
      
      <div className="dayout-button-group">
        <button 
          type="submit" 
          className="dayout-btn dayout-btn-primary"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Updating...' : 'Update Reservation'}
        </button>
      </div>
    </div>
  </div>
</div>

{/* Success Popup */}
{showSuccessPopup && (
  <div className="dayout-popup-overlay">
    <div className="dayout-popup">
      <h4>✅ Success!</h4>
      <p>Day out reservation updated successfully!</p>
      <button 
        className="dayout-btn dayout-btn-primary"
        onClick={handlePopupOk}
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

export default EditDayoutReservationForm;