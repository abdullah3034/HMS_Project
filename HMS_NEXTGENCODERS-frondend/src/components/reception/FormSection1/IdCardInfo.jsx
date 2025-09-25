import React from 'react';

const IdCardInfo = ({ formData, handleFormChange, handleFileChange, fileInputRef }) => {
  return (
    <div className="checkinform-form-container">
      <h2 className="checkinform-form-heading">ID Card Information</h2>
      <div className="checkinform-form-grid">
        <div>
          <label className="checkinform-form-label">Type of ID <span className="asterisk">*</span></label>
          <select
            name="idType"
            id="idType"
            value={formData.idType}
            onChange={handleFormChange}
            className="checkinform-form-input"
            required
          >
            <option value="">--Select--</option>
            <option value="Passport">Passport</option>
            <option value="Driving License">Driving License</option>
            <option value="Aadhar Card">Aadhar Card</option>
            <option value="Voter ID">Voter ID</option>
          </select>
        </div>

        <div>
          <label className="checkinform-form-label">ID No. <span className="asterisk">*</span></label>
          <input
            type="text"
            name="idNumber"
            id="idNumber"
            placeholder="Enter ID No."
            value={formData.idNumber}
            onChange={handleFormChange}
            className="checkinform-form-input"
            required
          />
        </div>

        <div>
          <label className="checkinform-form-label">Upload ID Card <span className="asterisk">*</span></label>
          <input
            type="file"
            multiple
            name="idFiles"
            id="idFiles"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="checkinform-form-input"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default IdCardInfo;