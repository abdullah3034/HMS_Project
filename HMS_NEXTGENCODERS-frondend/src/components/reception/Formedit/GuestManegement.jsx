import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { useNavigate } from "react-router-dom";


const countries = [
    { label: "Afghanistan", value: "+93" },
    { label: "Albania", value: "+355" },
    { label: "Algeria", value: "+213" },
    { label: "Andorra", value: "+376" },
    { label: "Angola", value: "+244" },
    { label: "Argentina", value: "+54" },
    { label: "Australia", value: "+61" },
    { label: "Austria", value: "+43" },
    { label: "Bangladesh", value: "+880" },
    { label: "Belgium", value: "+32" },
    { label: "Brazil", value: "+55" },
    { label: "Canada", value: "+1" },
    { label: "China", value: "+86" },
    { label: "Denmark", value: "+45" },
    { label: "Egypt", value: "+20" },
    { label: "France", value: "+33" },
    { label: "Germany", value: "+49" },
    { label: "India", value: "+91" },
    { label: "Indonesia", value: "+62" },
    { label: "Italy", value: "+39" },
    { label: "Japan", value: "+81" },
    { label: "Mexico", value: "+52" },
    { label: "Netherlands", value: "+31" },
    { label: "Nigeria", value: "+234" },
    { label: "Pakistan", value: "+92" },
    { label: "Philippines", value: "+63" },
    { label: "Russia", value: "+7" },
    { label: "Saudi Arabia", value: "+966" },
    { label: "South Africa", value: "+27" },
    { label: "Spain", value: "+34" },
    { label: "Sri Lanka", value: "+94" },
    { label: "Sweden", value: "+46" },
    { label: "Thailand", value: "+66" },
    { label: "United Arab Emirates", value: "+971" },
    { label: "United Kingdom", value: "+44" },
    { label: "United States", value: "+1" },
    { label: "Vietnam", value: "+84" }
];
// programmatically navigate to another route (e.g., navigate to the home page after form submission
const GuestRes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [allReservations, setAllReservations] = useState([]);
  const [displayedReservations, setDisplayedReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);

  
  const [viewMode, setViewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [roomDetails, setRoomDetails] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    duration: "",
    adults: "1",
    kids: "0",
    firstName: "",
    mobile: "",
    email: "",
    middleName: "",
    surname: "",
    dob: "",
    address: "",
    city: "",
    gender: "",
    idType: "",
    idNumber: "",
  });

  const [persons, setPersons] = useState([
    { name: '', gender: '', age: '', address: '', idType: '', idNo: '' }
  ]);

  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [roomClassFilter, setRoomClassFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [emailError, setEmailError] = useState(false);
  const [inputColor, setInputColor] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    const fetchAllReservations = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/api/reservations");
        setAllReservations(response.data);
        setDisplayedReservations(response.data);
      } catch (err) {
        setError("Error fetching reservations");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllReservations();
  }, []);

  useEffect(() => {
    if (viewMode && selectedReservation) {
      const fetchDetails = async () => {
        try {
          const roomsResponse = await axios.get("http://localhost:8000/api/posts/rooms");
          const bookedRooms = roomsResponse.data.rooms.filter(room => 
            selectedReservation.selectedRooms.includes(room.RoomNo)
          );
          setRoomDetails(bookedRooms);
          
          const paymentsResponse = await axios.get(
            `http://localhost:8000/api/reservations/${selectedReservation._id}/payments`
          );
          setPaymentHistory(paymentsResponse.data);
        } catch (err) {
          console.error("Error fetching details:", err);
        }
      };
      
      fetchDetails();
    }
  }, [viewMode, selectedReservation]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setDisplayedReservations(allReservations);
    } else {
      const filtered = allReservations.filter(reservation => {
        const searchLower = searchTerm.toLowerCase();
        return (
          reservation.firstName.toLowerCase().includes(searchLower) ||
          (reservation.surname && reservation.surname.toLowerCase().includes(searchLower)) ||
          reservation.mobile.includes(searchTerm) ||
          (reservation._id && reservation._id.toLowerCase().includes(searchLower)) ||
          (reservation.idNumber && reservation.idNumber.toLowerCase().includes(searchLower))
        );
      });
      setDisplayedReservations(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, allReservations]);

  const totalPages = Math.ceil(displayedReservations.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedReservations = displayedReservations.slice(startIndex, endIndex);

  const loadReservation = (reservation) => {
    setSelectedReservation(reservation);
    setViewMode(false);
    
    setFormData({
      checkIn: reservation.checkIn.split('T')[0],
      checkOut: reservation.checkOut.split('T')[0],
      duration: reservation.duration,
      adults: reservation.adults,
      kids: reservation.kids,
      firstName: reservation.firstName,
      mobile: reservation.mobile,
      email: reservation.email,
      middleName: reservation.middleName || "",
      surname: reservation.surname || "",
      dob: reservation.dob ? reservation.dob.split('T')[0] : "",
      address: reservation.address,
      city: reservation.city || "",
      gender: reservation.gender || "",
      idType: reservation.idType || "",
      idNumber: reservation.idNumber || "",
    });

    if (reservation.otherPersons && reservation.otherPersons.length > 0) {
      setPersons(reservation.otherPersons);
    } else {
      setPersons([{ name: '', gender: '', age: '', address: '', idType: '', idNo: '' }]);
    }

    setSelectedRooms(reservation.selectedRooms || []);

    if (reservation.countryCode) {
      const country = countries.find(c => c.value === reservation.countryCode);
      if (country) setSelectedCountry(country);
    }

    setExistingFiles(reservation.idFiles || []);
  };

  const viewReservation = (reservation) => {
    setSelectedReservation(reservation);
    setViewMode(true);
    setFormData({
      checkIn: reservation.checkIn.split('T')[0],
      checkOut: reservation.checkOut.split('T')[0],
      duration: reservation.duration,
      adults: reservation.adults,
      kids: reservation.kids,
      firstName: reservation.firstName,
      mobile: reservation.mobile,
      email: reservation.email,
      middleName: reservation.middleName || "",
      surname: reservation.surname || "",
      dob: reservation.dob ? reservation.dob.split('T')[0] : "",
      address: reservation.address,
      city: reservation.city || "",
      gender: reservation.gender || "",
      idType: reservation.idType || "",
      idNumber: reservation.idNumber || "",
    });
  };

  useEffect(() => {
    if (selectedCountry) {
      setFormData((prev) => ({
        ...prev,
        mobile: selectedCountry.value + " " + (prev.mobile.split(' ')[1] || ""),
      }));
    }
  }, [selectedCountry]);

  useEffect(() => {
    const { checkIn, checkOut } = formData;
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setFormData((prev) => ({ ...prev, duration: diff > 0 ? diff : "" }));
    }
  }, [formData.checkIn, formData.checkOut]);

  useEffect(() => {
    if (selectedReservation) {
      axios.get("http://localhost:8000/api/posts/rooms")
        .then(res => {
          const vacantRooms = res.data.rooms.filter(r => r.RStatus === "Vacant" || selectedRooms.includes(r.RoomNo));
          setRooms(vacantRooms);

          const types = [...new Set(vacantRooms.map(room => room.RType))];
          const classes = [...new Set(vacantRooms.map(room => room.RClass))];
          setUniqueTypes(types);
          setUniqueClasses(classes);
        })
        .catch(err => console.error(err));
    }
  }, [selectedReservation, selectedRooms]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

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

  const handleAddPerson = () => {
    setPersons([...persons, { name: '', gender: '', age: '', address: '', idType: '', idNo: '' }]);
  };

  const handleRemovePerson = (index) => {
    if (persons.length > 1) {
      const updatedPersons = [...persons];
      updatedPersons.splice(index, 1);
      setPersons(updatedPersons);
    }
  };

  const handlePersonChange = (index, field, value) => {
    const updatedPersons = [...persons];
    updatedPersons[index][field] = value;
    setPersons(updatedPersons);
  };

  const handleRoomSelect = (roomNo) => {
    setSelectedRooms(prev => 
      prev.includes(roomNo) 
        ? prev.filter(r => r !== roomNo) 
        : [...prev, roomNo]
    );
  };

  const filteredRooms = rooms.filter(room => {
    const typeMatch = roomTypeFilter === "all" || 
                      room.RType.toLowerCase().includes(roomTypeFilter.toLowerCase());
    const classMatch = roomClassFilter === "all" || 
                       room.RClass.toLowerCase().includes(roomClassFilter.toLowerCase());
    const searchMatch = searchQuery === "" || 
                        room.RoomNo.toString().includes(searchQuery) || 
                        room.RType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        room.RClass.toLowerCase().includes(searchQuery.toLowerCase());

    return typeMatch && classMatch && searchMatch;
  });

  const getTextColor = (value) => (value ? "#000000" : "#718096");

  const calculateTotalDue = () => {
    if (!selectedReservation || !roomDetails.length) return 0;
    
    const roomPrices = roomDetails.reduce((total, room) => total + room.RPrice, 0);
    const duration = parseInt(selectedReservation.duration);
    const totalRoomCost = roomPrices * duration;
    
    const totalPaid = paymentHistory.reduce((total, payment) => total + payment.amount, 0);
    
    return totalRoomCost - totalPaid;
  };

  const handlePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }
    
    try {
      const paymentData = {
        reservationId: selectedReservation._id,
        amount: paymentAmount,
        method: paymentMethod,
        notes: paymentNotes,
        date: new Date().toISOString()
      };
      
      await axios.post("http://localhost:8000/api/payments", paymentData);
      
      const paymentsResponse = await axios.get(
        `http://localhost:8000/api/reservations/${selectedReservation._id}/payments`
      );
      setPaymentHistory(paymentsResponse.data);
      
      setSuccess("Payment recorded successfully!");
      setError("");
      setPaymentAmount(0);
      setPaymentNotes("");
    } catch (err) {
      console.error("Error recording payment:", err);
      setError("Error recording payment. Please try again.");
      setSuccess("");
    }
  };

  const handleCheckout = async () => {
    if (!window.confirm("Are you sure you want to checkout this guest? This will mark all rooms as vacant.")) {
      return;
    }
    
    try {
      await axios.put(`http://localhost:8000/api/reservations/${selectedReservation._id}/checkout`);
      
      await Promise.all(
        selectedReservation.selectedRooms.map(roomNo => 
          axios.put(`http://localhost:8000/api/posts/rooms/${roomNo}`, { RStatus: "Vacant" })
        )
      );
      
      setSuccess("Guest checked out successfully! Rooms are now vacant.");
      setError("");
      setViewMode(false);
      
      const response = await axios.get("http://localhost:8000/api/reservations");
      setAllReservations(response.data);
      setDisplayedReservations(response.data);
    } catch (err) {
      console.error("Error during checkout:", err);
      setError("Error during checkout. Please try again.");
      setSuccess("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReservation) {
      setError("No reservation selected for editing");
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      formDataToSend.append('otherPersons', JSON.stringify(persons));
      formDataToSend.append('selectedRooms', JSON.stringify(selectedRooms));
      
      selectedFiles.forEach((file) => {
        formDataToSend.append('idFiles', file);
      });
      
      existingFiles.forEach(file => {
        formDataToSend.append('existingFiles', file);
      });
      
      if (selectedCountry) {
        formDataToSend.append('country', selectedCountry.label);
        formDataToSend.append('countryCode', selectedCountry.value);
      }

      const response = await axios.put(
        `http://localhost:8000/api/reservations/${selectedReservation._id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setSuccess("Reservation updated successfully!");
      setError("");
      
      loadReservation(response.data.updatedReservation);
      
      setAllReservations(allReservations.map(res => 
        res._id === response.data.updatedReservation._id ? response.data.updatedReservation : res
      ));
      
    } catch (error) {
      console.error("Error updating reservation:", error);
      setError("Error updating reservation. Please try again.");
      setSuccess("");
    }
  };

  {/* Handle delete reservation */}

  const handleDeleteReservation = async () => {
    if (!selectedReservation || !window.confirm("Are you sure you want to delete this reservation?")) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:8000/api/reservations/${selectedReservation._id}`);
      setSuccess("Reservation deleted successfully!");
      setError("");
      setSelectedReservation(null);
      
      setAllReservations(allReservations.filter(r => r._id !== selectedReservation._id));
      setDisplayedReservations(displayedReservations.filter(r => r._id !== selectedReservation._id));
      
      setFormData({
        checkIn: "",
        checkOut: "",
        duration: "",
        adults: "1",
        kids: "0",
        firstName: "",
        mobile: "",
        email: "",
        middleName: "",
        surname: "",
        dob: "",
        address: "",
        city: "",
        gender: "",
        idType: "",
        idNumber: "",
      });
      setPersons([{ name: '', gender: '', age: '', address: '', idType: '', idNo: '' }]);
      setSelectedCountry(null);
      setSelectedFiles([]);
      setSelectedRooms([]);
    } catch (error) {
      console.error("Error deleting reservation:", error);
      setError("Error deleting reservation. Please try again.");
      setSuccess("");
    }
  };

  return (
    
    <div className="edit-reservation-container">
      <h1 className="page-title">Edit Reservation</h1>
      
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, ID, or phone number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="entries-selector">
            <label>Show entries:</label>
            <select 
              value={entriesPerPage} 
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="search-results">
          <h3>Reservations</h3>
          <div className="results-info">
            Showing {startIndex + 1} to {Math.min(endIndex, displayedReservations.length)} of {displayedReservations.length} entries
          </div>
          <table>
            <thead>
              <tr>
                <th>Reservation ID</th>
                <th>Guest Name</th>
                <th>Phone</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="loading-message">Loading reservations...</td>
                </tr>
              ) : paginatedReservations.length > 0 ? (
                paginatedReservations.map((reservation) => (
                  <tr 
                    key={reservation._id}
                    className={selectedReservation?._id === reservation._id ? "selected-row" : ""}
                  >
                    <td>{reservation._id.substring(18)}</td>
                    <td>{reservation.firstName} {reservation.surname}</td>
                    <td>{reservation.mobile}</td>
                    <td>{new Date(reservation.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(reservation.checkOut).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => loadReservation(reservation)}
                          className={selectedReservation?._id === reservation._id && !viewMode ? "active-edit-btn" : ""}
                        >
                          {selectedReservation?._id === reservation._id && !viewMode ? "Editing..." : "Edit"}
                        </button>
                        <button 
                          onClick={() => viewReservation(reservation)}
                          className={selectedReservation?._id === reservation._id && viewMode ? "active-view-btn" : ""}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">No reservations found</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {displayedReservations.length > 0 && (
            <div className="pagination-controls">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <span>
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      
      {selectedReservation && !viewMode && (
        <form className="checkinform-form-container" onSubmit={handleSubmit}>
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

          <div className="reservation3-container">
            <h2 className="form-heading">Information of Other Person</h2>
            <div className="table-responsive">
              <table className="person-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>Address</th>
                    <th>Type of ID</th>
                    <th>ID No.</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {persons.map((person, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                          placeholder="Enter Name"
                          style={{ color: getTextColor(person.name) }}
                          className="table-input"
                        />
                      </td>
                      <td>
                        <select
                          value={person.gender}
                          onChange={(e) => handlePersonChange(index, 'gender', e.target.value)}
                          style={{ color: getTextColor(person.gender) }}
                          className="table-select"
                        >
                          <option value="">--Select--</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={person.age}
                          onChange={(e) => handlePersonChange(index, 'age', e.target.value)}
                          placeholder="Enter Age"
                          style={{ color: getTextColor(person.age) }}
                          className="person-table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={person.address}
                          onChange={(e) => handlePersonChange(index, 'address', e.target.value)}
                          placeholder="Enter Address"
                          style={{ color: getTextColor(person.address) }}
                          className="person-table-input"
                        />
                      </td>
                      <td>
                        <select
                          value={person.idType}
                          onChange={(e) => handlePersonChange(index, 'idType', e.target.value)}
                          style={{ color: getTextColor(person.idType) }}
                          className="person-table-select"
                        >
                          <option value="">--Select--</option>
                          <option value="Passport">Passport</option>
                          <option value="Driver License">Driver License</option>
                          <option value="National ID">National ID</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={person.idNo}
                          onChange={(e) => handlePersonChange(index, 'idNo', e.target.value)}
                          placeholder="Enter ID No."
                          style={{ color: getTextColor(person.idNo) }}
                          className="person-table-input"
                        />
                      </td>
                      <td>
                        {index === 0 ? (
                          <button type="button" className="add-btn" onClick={handleAddPerson}>
                            +
                          </button>
                        ) : (
                          <button type="button" className="remove-btn" onClick={() => handleRemovePerson(index)}>
                            -
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="checkinform-form-container">
            <h1 className="checkinform-form-heading">Search For Rooms</h1>
            
            <div className="room-section">
              <div className="filter-controls">
                <div className="filter-group">
                  <label>Search:</label>
                  <input
                    type="text"
                    placeholder="Room no, type, or class"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="filter-group">
                  <label>Filter by type:</label>
                  <select 
                    value={roomTypeFilter}
                    onChange={(e) => setRoomTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Filter by class:</label>
                  <select 
                    value={roomClassFilter}
                    onChange={(e) => setRoomClassFilter(e.target.value)}
                  >
                    <option value="all">All Classes</option>
                    {uniqueClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="rooms-table-container">
                <table className="rooms-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Room No.</th>
                      <th>Type</th>
                      <th>Class</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.length > 0 ? (
                      filteredRooms.map(room => (
                        <tr key={room._id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRooms.includes(room.RoomNo)}
                              onChange={() => handleRoomSelect(room.RoomNo)}
                            />
                          </td>
                          <td>{room.RoomNo}</td>
                          <td>{room.RType}</td>
                          <td>{room.RClass}</td>
                          <td>{room.RStatus}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-rooms">No rooms match your filters</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="delete-button" onClick={handleDeleteReservation}>
              Delete Reservation
            </button>
            <button type="submit" className="submit-button">
              Update Reservation
            </button>
          </div>
        </form>
      )}
      
      {selectedReservation && viewMode && (
        <div className="view-container">
          <div className="view-header">
            <h2>Reservation Details</h2>
            <button className="back-button" onClick={() => setViewMode(false)}>
              Back to Edit
            </button>
          </div>
          
          <div className="guest-info-section">
            <h3>Guest Information</h3>
            <div className="info-grid">
              <div>
                <p><strong>Name:</strong> {formData.firstName} {formData.middleName} {formData.surname}</p>
                <p><strong>Phone:</strong> {formData.mobile}</p>
                <p><strong>Email:</strong> {formData.email || "N/A"}</p>
              </div>
              <div>
                <p><strong>Check-In:</strong> {formData.checkIn}</p>
                <p><strong>Check-Out:</strong> {formData.checkOut}</p>
                <p><strong>Duration:</strong> {formData.duration} nights</p>
              </div>
              <div>
                <p><strong>Adults:</strong> {formData.adults}</p>
                <p><strong>Kids:</strong> {formData.kids}</p>
                <p><strong>ID:</strong> {formData.idType}: {formData.idNumber}</p>
              </div>
            </div>
          </div>
          
          <div className="rooms-section">
            <h3>Booked Rooms</h3>
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Room No.</th>
                  <th>Type</th>
                  <th>Class</th>
                  <th>Price/Night</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {roomDetails.map(room => (
                  <tr key={room._id}>
                    <td>{room.RoomNo}</td>
                    <td>{room.RType}</td>
                    <td>{room.RClass}</td>
                    <td>${room.RPrice.toFixed(2)}</td>
                    <td>${(room.RPrice * formData.duration).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="4"><strong>Total Room Charges:</strong></td>
                  <td>
                    <strong>
                      ${roomDetails.reduce((total, room) => 
                        total + (room.RPrice * formData.duration), 0).toFixed(2)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="payments-section">
            <h3>Payment History</h3>
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={index}>
                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                    <td>${payment.amount.toFixed(2)}</td>
                    <td>{payment.method}</td>
                    <td>{payment.notes || "N/A"}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td><strong>Total Paid:</strong></td>
                  <td>
                    <strong>
                      ${paymentHistory.reduce((total, payment) => 
                        total + payment.amount, 0).toFixed(2)}
                    </strong>
                  </td>
                  <td colSpan="2"></td>
                </tr>
                <tr className="due-row">
                  <td><strong>Amount Due:</strong></td>
                  <td>
                    <strong className={calculateTotalDue() > 0 ? "amount-due" : "amount-paid"}>
                      ${calculateTotalDue().toFixed(2)}
                    </strong>
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="payment-form">
            <h3>Record Payment</h3>
            <div className="payment-inputs">
              <div>
                <label>Amount ($)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div>
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label>Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
              <button 
                type="button" 
                className="record-payment-btn"
                onClick={handlePayment}
                disabled={!paymentAmount || paymentAmount <= 0}
              >
                Record Payment
              </button>
            </div>
          </div>
          
          <div className="checkout-section">
            <button 
              className="checkout-button"
              onClick={handleCheckout}
              disabled={calculateTotalDue() > 0}
            >
              Checkout Guest
            </button>
            {calculateTotalDue() > 0 && (
              <p className="checkout-warning">
                Cannot checkout until full payment is received. Remaining balance: ${calculateTotalDue().toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestRes;