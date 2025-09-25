import React from 'react';
import Select from 'react-select';
import { countries } from './countries';

 // Assuming you have a JSON file with country data

const GuestInfo = ({ formData, handleFormChange, selectedCountry, setSelectedCountry, emailError }) => {
  return (
    <div className="checkinform-form-container">
      <h2 className="checkinform-form-heading">Guest Information</h2>
      <div className="checkinform-form-grid">
        <div>
          <label className="checkinform-form-label">First Name <span className="asterisk">*</span></label>
          <input
            type="text"
            id="firstName"
            className="checkinform-form-input"
            placeholder="Enter First Name"
            value={formData.firstName}
            onChange={handleFormChange}
            required
          />

          <label className="checkinform-form-label">Mobile No. <span className="asterisk">*</span></label>
          <input
            type="tel"
            id="mobile"
            className="checkinform-form-input"
            value={formData.mobile}
            onChange={handleFormChange}
            required
          />

          <label className="checkinform-form-label">Gender</label>
          <select
            id="gender"
            className="checkinform-form-input"
            value={formData.gender}
            onChange={handleFormChange}
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
          />

          <label className="checkinform-form-label">E-mail</label>
          <input
            type="email"
            id="email"
            className="checkinform-form-input"
            placeholder="Enter E-mail"
            value={formData.email}
            onChange={handleFormChange}
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
          />

          <label className="checkinform-form-label">Date of Birth</label>
          <input
            type="date"
            id="dob"
            className="checkinform-form-input"
            value={formData.dob}
            onChange={handleFormChange}
          />

          <label className="checkinform-form-label">Address <span className="asterisk">*</span></label>
          <textarea
            id="address"
            className="checkinform-form-input"
            placeholder="Enter Address"
            value={formData.address}
            onChange={handleFormChange}
            required
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default GuestInfo;