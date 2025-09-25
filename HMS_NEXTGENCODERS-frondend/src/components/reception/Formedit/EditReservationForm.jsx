import React, { useState, useEffect } from "react";
import axios from "axios";
import CheckInForm from "./CheckInForm";
import GuestInformationForm from "./GuestInformationForm";
import IdCardForm from "./IdCardForm";
import OtherPersonsForm from "./OtherPersonsForm";
import RoomSelectionForm from "./RoomSelectionForm";
import "./EditReservationForm.css"; // Import the scoped CSS file

const EditReservationForm = ({
  selectedReservation,
  formData,
  setFormData,
  persons,
  setPersons,
  selectedRooms,
  setSelectedRooms,
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
  const [emailError, setEmailError] = useState(false);
  const [inputColor, setInputColor] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Update duration when check-in or check-out dates change
  useEffect(() => {
    const { checkIn, checkOut } = formData;
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setFormData((prev) => ({ ...prev, duration: diff > 0 ? diff : "" }));
    }
  }, [formData.checkIn, formData.checkOut, setFormData]);

  // Update mobile number when country changes
  useEffect(() => {
    if (selectedCountry && formData.mobile) {
      const currentMobile = formData.mobile.split(' ');
      const phoneNumber = currentMobile.length > 1 ? currentMobile.slice(1).join(' ') : currentMobile[0];
      
      setFormData((prev) => ({
        ...prev,
        mobile: selectedCountry.value + " " + phoneNumber,
      }));
    }
  }, [selectedCountry]);

  const handleFormChange = (e) => {
    const { id, name, value } = e.target;
    const key = id || name;

    setFormData((prev) => ({ ...prev, [key]: value }));
    setInputColor((prev) => ({ ...prev, [key]: "black" }));

    if (key === "email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      setEmailError(!emailPattern.test(value));
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
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

    if (isSubmitting) {
      return;
    }

    // Enhanced validation
    const validationErrors = [];
    
    if (!formData.firstName?.trim()) validationErrors.push("First name is required");
    if (!formData.mobile?.trim()) validationErrors.push("Mobile number is required");
    if (!formData.checkIn) validationErrors.push("Check-in date is required");
    if (!formData.checkOut) validationErrors.push("Check-out date is required");
    
    // Date validation
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      
      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        validationErrors.push("Invalid date format");
      } else if (checkInDate >= checkOutDate) {
        validationErrors.push("Check-out date must be after check-in date");
      }
    }

    if (formData.email && emailError) {
      validationErrors.push("Please enter a valid email address");
    }

    if (validationErrors.length > 0) {
      onError(validationErrors.join(", "));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the update data to match backend expectations and schema requirements
      const updateData = {
        firstName: formData.firstName?.trim() || "",
        middleName: formData.middleName?.trim() || "",
        surname: formData.surname?.trim() || "",
        mobile: formData.mobile?.trim() || "",
        email: formData.email?.trim() || "",
        dob: formData.dob || "",
        address: formData.address?.trim() || "Not provided", // Address is required in schema
        city: formData.city?.trim() || "",
        idType: formData.idType || "Passport", // idType is required in schema
        idNumber: formData.idNumber?.trim() || "",
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        duration: parseInt(formData.duration) || 1,
        adults: parseInt(formData.adults) || 1,
        kids: parseInt(formData.kids) || 0,
        // Ensure otherPersons is properly formatted
        otherPersons: Array.isArray(persons) ? 
          persons.filter(person => person && person.name && person.name.trim() !== "") : 
          [],
        // Ensure selectedRooms is properly formatted
        selectedRooms: Array.isArray(selectedRooms) ? selectedRooms : [],
        // Add country fields if available
        country: selectedCountry?.label || "",
        countryCode: selectedCountry?.value || ""
      };

      // Handle gender enum (only include if it's a valid value)
      if (formData.gender && ['Male', 'Female', 'Other'].includes(formData.gender)) {
        updateData.gender = formData.gender;
      }

      // Only add payment fields if they have valid values
      if (formData.totalAmount !== undefined && formData.totalAmount !== null) {
        updateData.totalAmount = parseFloat(formData.totalAmount) || 0;
      }
      
      if (formData.paidAmount !== undefined && formData.paidAmount !== null) {
        updateData.paidAmount = parseFloat(formData.paidAmount) || 0;
      }
      
      // Only add paymentMethod if it's a valid enum value
      const validPaymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Other'];
      if (formData.paymentMethod && validPaymentMethods.includes(formData.paymentMethod)) {
        updateData.paymentMethod = formData.paymentMethod;
      }
      
      // Only add paymentNotes if it has content
      if (formData.paymentNotes && formData.paymentNotes.trim() !== "") {
        updateData.paymentNotes = formData.paymentNotes.trim();
      }

      // Debug logging - this will help us see exactly what's being sent
      console.log('=== DEBUG INFO ===');
      console.log('Reservation ID:', selectedReservation._id);
      console.log('Form Data Raw:', formData);
      console.log('Persons Raw:', persons);
      console.log('Selected Rooms Raw:', selectedRooms);
      console.log('Selected Country Raw:', selectedCountry);
      console.log('Update Data Being Sent:', JSON.stringify(updateData, null, 2));
      console.log('================');

      // Validate that we have essential data
      if (!updateData.firstName || !updateData.mobile || !updateData.checkIn || !updateData.checkOut) {
        throw new Error("Missing required fields after processing");
      }

      // Make the API call
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
      
      console.log('=== RESPONSE INFO ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);
      console.log('===================');
      
      // Check for success
      if (response.status >= 200 && response.status < 300) {
        setShowSuccessPopup(true);
        
        if (onReservationUpdate && response.data) {
          // Handle different response formats
          const updatedReservation = response.data.reservation || 
                                   response.data.updatedReservation || 
                                   response.data;
          onReservationUpdate(updatedReservation);
        }
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
      
    } catch (error) {
      console.error("=== ERROR INFO ===");
      console.error("Full Error Object:", error);
      
      if (error.response) {
        console.error("Error Response Status:", error.response.status);
        console.error("Error Response Headers:");
        console.table(error.response.headers);
        console.error("Error Response Data:");
        console.log(error.response.data);
        console.error("Error Response Data (stringified):");
        try {
          console.error(JSON.stringify(error.response.data, null, 2));
        } catch (e) {
          console.error("Could not stringify error data:", e);
          console.error("Raw error data:", error.response.data);
        }
        
        // Extract error message from response
        let errorMessage = "Error updating reservation";
        
        if (error.response.data) {
          // Try different possible error message fields
          errorMessage = error.response.data.message || 
                        error.response.data.msg || 
                        error.response.data.error ||
                        (error.response.data.errors && Array.isArray(error.response.data.errors) 
                          ? error.response.data.errors.join(', ') 
                          : errorMessage);
        }
        
        // Add status code for context
        errorMessage = `${errorMessage} (Status: ${error.response.status})`;
        onError(errorMessage);
        
      } else if (error.request) {
        console.error("Network Error - Request made but no response:", error.request);
        onError("Network error. Please check your connection and try again.");
      } else {
        console.error("Error Message:", error.message);
        onError(`Error: ${error.message}`);
      }
      console.error("================");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTextColor = (value) => (value ? "#000000" : "#718096");

  return (
    <div className="edit-reservation-form-scope">
      <div className="main-form-container">
        
        {/* Check-in Information Section */}
        <div className="form-section checkin-section">
          
          <CheckInForm 
            formData={formData}
            handleFormChange={handleFormChange}
            getTextColor={getTextColor}
          />
        </div>

        {/* Guest Information Section */}
        <div className="form-section guest-section">
          
          <GuestInformationForm
            formData={formData}
            handleFormChange={handleFormChange}
            inputColor={inputColor}
            emailError={emailError}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
          />
        </div>

        {/* ID Card Information Section */}
        <div className="form-section id-section">
          
          <IdCardForm
            formData={formData}
            handleFormChange={handleFormChange}
            selectedFiles={selectedFiles}
            handleFileChange={handleFileChange}
            existingFiles={existingFiles}
          />
        </div>

        {/* Other Persons Section */}
        <div className="form-section persons-section">
          
          <OtherPersonsForm
            persons={persons}
            setPersons={setPersons}
            getTextColor={getTextColor}
          />
        </div>

        {/* Room Selection Section */}
        <div className="form-section rooms-section">
          
          <RoomSelectionForm
            selectedReservation={selectedReservation}
            selectedRooms={selectedRooms}
            setSelectedRooms={setSelectedRooms}
          />
        </div>

        {/* Form Actions Section */}
        <div className="form-actions-container">
          <h2 className="section-title">Actions</h2>
          <div className="form-actions">
            <button 
              type="button" 
              className="delete-button" 
              onClick={onDeleteReservation}
              disabled={isSubmitting}
            >
              Delete Reservation
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Updating..." : "Update Reservation"}
            </button>
          </div>
        </div>

      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup-content">
            <div className="success-popup-icon">
              ✅
            </div>
            <h3 className="success-popup-title">
              Success!
            </h3>
            <p className="success-popup-message">
              Reservation updated successfully!
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
  );
};

export default EditReservationForm;