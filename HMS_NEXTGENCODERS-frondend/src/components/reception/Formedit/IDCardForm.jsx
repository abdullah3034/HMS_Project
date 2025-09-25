import React from "react";

const IDCardForm = ({
  formData,
  handleFormChange,
  handleFileChange,
  existingFiles
}) => {
  return (
   <div className="checkinform-form-container">
        <h2 className="checkinform-form-heading">ID Card Information</h2>
        <div className="checkinform-form-grid">
               {/* Type of ID */}
          <div className="checkinform-form-group">
            <label htmlFor="idType" className="checkinform-form-label">
              Type of ID <span className="asterisk">*</span>
            </label>
            <select
              name="idType"
              id="idType"
              value={formData.idType}
              onChange={handleFormChange}
              className={`checkinform-form-select ${formData.idType ? "filled" : ""}`}
              required
            >
              <option value="">--Select--</option>
              <option value="Passport">Passport</option>
              <option value="Driving License">Driving License</option>
              <option value="Aadhar Card">Aadhar Card</option>
              <option value="Voter ID">Voter ID</option>
            </select>
          </div>
          
         {/* ID Number */}
          <div className="checkinform-form-group">
            <label htmlFor="idNumber" className="checkinform-form-label">
              ID No. <span className="required">*</span>
            </label>
            <input
              type="text"
              name="idNumber"
              id="idNumber"
              placeholder="Enter ID No."
              value={formData.idNumber}
              onChange={handleFormChange}
              className={`checkinform-form-input ${formData.idNumber ? "filled" : ""}`}
              required
            />
          </div>
          <div className="checkinform-form-group">
            <label htmlFor="idFiles" className="checkinform-form-label">
              Upload ID Card <sup className="required">Multiple</sup>
            </label>
            <input
              type="file"
              multiple
              name="idFiles"
              id="idFiles"
              onChange={handleFileChange}
            />
            {existingFiles.length > 0 && (
              <div className="existing-files">
                <p>Existing Files:</p>
                <ul>
                  {existingFiles.map((file, index) => (
                    <li key={index}>
                      <a 
                        href={`http://localhost:8000/uploads/${file}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        File {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default IDCardForm;