import React from "react";
import Select from "react-select";

const countries = [
  { value: "+1", label: "United States (+1)" },
  { value: "+44", label: "United Kingdom (+44)" },
  { value: "+91", label: "India (+91)" },
  { value: "+86", label: "China (+86)" },
  { value: "+33", label: "France (+33)" },
  { value: "+49", label: "Germany (+49)" },
  { value: "+81", label: "Japan (+81)" },
  { value: "+61", label: "Australia (+61)" },
  { value: "+55", label: "Brazil (+55)" },
  { value: "+7", label: "Russia (+7)" },
  // Add more countries as needed
];

const GuestInformationForm = ({
  formData,
  handleFormChange,
  selectedCountry,
  setSelectedCountry,
  emailError,
  inputColor
}) => {
  return (
    <>
      <h2 className="checkinform-form-heading">Guest Information</h2>
      <div className="checkinform-form-grid">
        
        {/* Column 1 */}
        <div>
          <label className="checkinform-form-label">First Name <span className="asterisk">*</span></label>
          <input
            type="text"
            id="firstName"
            className="checkinform-form-input"
            placeholder="Enter First Name"
            value={formData.firstName}
            onChange={handleFormChange}
            style={{ color: inputColor.firstName || "#718096" }}
            required
          />

          <label className="checkinform-form-label">Mobile No. <span className="asterisk">*</span></label>
          <input
            type="tel"
            id="mobile"
            className="checkinform-form-input"
            value={formData.mobile}
            onChange={handleFormChange}
            style={{ color: inputColor.mobile || "#718096" }}
            required
          />

          <label className="checkinform-form-label">Gender</label>
          <select
            id="gender"
            className="checkinform-form-input"
            value={formData.gender}
            onChange={handleFormChange}
            style={{ color: inputColor.gender || "#718096" }}
          >
            <option value="">--Select--</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label className="checkinform-form-label">Country <span className="asterisk">*</span></label>
          <Select
            options={countries}
            value={selectedCountry}
            onChange={setSelectedCountry}
            placeholder="Select a Country"
            className="checkinform-form-input"
            required
          />
        </div>

        <div>
          <label className="checkinform-form-label">Middle Name</label>
          <input
            type="text"
            id="middleName"
            className="checkinform-form-input"
            placeholder="Enter Middle Name"
            value={formData.middleName}
            onChange={handleFormChange}
            style={{ color: inputColor.middleName || "#718096" }}
          />

          <label className="checkinform-form-label">E-mail</label>
          <input
            type="email"
            id="email"
            className="checkinform-form-input"
            placeholder="Enter E-mail"
            value={formData.email}
            onChange={handleFormChange}
            style={{ color: inputColor.email || "#718096" }}
          />
          {emailError && (
            <span className="error-message">Invalid email address</span>
          )}

          <label className="checkinform-form-label">City</label>
          <input
            type="text"
            id="city"
            className="checkinform-form-input"
            placeholder="Enter City"
            value={formData.city}
            onChange={handleFormChange}
            style={{ color: inputColor.city || "#718096" }}
          />
        </div>

        <div>
          <label className="checkinform-form-label">Surname</label>
          <input
            type="text"
            id="surname"
            className="checkinform-form-input"
            placeholder="Enter Surname"
            value={formData.surname}
            onChange={handleFormChange}
            style={{ color: inputColor.surname || "#718096" }}
          />

          <label className="checkinform-form-label">Date of Birth</label>
          <input
            type="date"
            id="dob"
            className="checkinform-form-input"
            value={formData.dob}
            onChange={handleFormChange}
            style={{ color: inputColor.dob || "#718096" }}
          />

          <label className="checkinform-form-label">Address <span className="asterisk">*</span></label>
          <textarea
            id="address"
            className="checkinform-form-input"
            placeholder="Enter Address"
            value={formData.address}
            onChange={handleFormChange}
            style={{ color: inputColor.address || "#718096" }}
            required
          ></textarea>
        </div>
      </div>
    </>
  );
};

export default GuestInformationForm;
