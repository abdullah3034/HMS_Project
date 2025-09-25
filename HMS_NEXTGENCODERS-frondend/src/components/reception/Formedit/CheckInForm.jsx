import React from "react";

const CheckInForm = ({ formData, handleFormChange, getTextColor }) => {
  return (
    <>
      <h2 className="checkinform-form-heading">Check In Information</h2>
      <div className="checkinform-form-grid">
        <div>
          <label className="checkinform-form-label">Check In</label>
          <input
            type="date"
            name="checkIn"
            className="checkinform-form-input"
            value={formData.checkIn}
            onChange={handleFormChange}
            style={{ color: getTextColor(formData.checkIn) }}
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
            style={{ color: getTextColor(formData.checkOut) }}
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
            disabled
            style={{ color: getTextColor(formData.duration) }}
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
            style={{ color: getTextColor(formData.adults) }}
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
            style={{ color: getTextColor(formData.kids) }}
          />
        </div>
      </div>
    </>
  );
};

export default CheckInForm;