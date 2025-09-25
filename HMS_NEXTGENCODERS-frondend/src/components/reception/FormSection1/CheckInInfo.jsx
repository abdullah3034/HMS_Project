import React from 'react';
//accept props
//form data object containg current values
//handleformchange fun tion
const CheckInInfo = ({ formData, handleFormChange }) => {
  return (
    <div className="checkinform-form-container">
      <h2 className="checkinform-form-heading">Check In Information</h2>
      <div className="checkinform-form-grid">
        <div>
          <label className="checkinform-form-label">Check In</label>
          <input
            type="date"
            name="checkIn"
            className="checkinform-form-input"
            value={formData.checkIn}//the input’s current value from props
            onChange={handleFormChange}//calls the function when user changes input
            required
          />
        </div>
        
        <div>
          <label className="checkinform-form-label">Check Out</label>
          <input
            type="date"
            name="checkOut"
            className="checkinform-form-input"
            value={formData.checkOut}
            onChange={handleFormChange}
            required
          />
        </div>
        
        <div>
          <label className="checkinform-form-label">Duration of Stay</label>
          <input
            type="number"
            name="duration"
            className="checkinform-form-input"
            value={formData.duration}
            placeholder="Duration"
            disabled//user cannot edit 
          />
        </div>
        
        <div>
          <label className="checkinform-form-label">Adults</label>
          <input
            type="number"
            name="adults"
            className="checkinform-form-input"
            value={formData.adults}
            min="1"
            onChange={handleFormChange}
          />
        </div>
        
        <div>
          <label className="checkinform-form-label">Kids</label>
          <input
            type="number"
            name="kids"
            className="checkinform-form-input"
            value={formData.kids}
            min="0"
            onChange={handleFormChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckInInfo;