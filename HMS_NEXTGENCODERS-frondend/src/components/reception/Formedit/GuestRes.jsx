import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchSection from "./SearchSection"
import EditReservationForm from "./EditReservationForm";
import EditDayoutForm from "../Dayout/EditDayouForm";
import ViewReservationDetails from "./ViewReservationDetails";
import ViewDayoutDetails from "../Dayout/ViewDayoutDetails";
import { countries } from "../FormSection1/countries";

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
  const [roomDetails, setRoomDetails] = useState([]);
  const [packageDetails, setPackageDetails] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [filterType, setFilterType] = useState("all"); // all, room, dayOut

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    startTime: "",
    endTime: "",
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
    totalAmount: 0,
    advancePayment: 0,
    paymentMethod: "",
    paymentNotes: ""
  });

  const [persons, setPersons] = useState([
    { name: '', gender: '', age: '', address: '', idType: '', idNo: '' }
  ]);

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  // Fetch all reservations on component mount
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

  // Fetch details when viewing a reservation
  useEffect(() => {
    if (viewMode && selectedReservation) {
      const fetchDetails = async () => {
        try {
          // Fetch room details for room reservations
          if (selectedReservation.reservationType === 'room' && selectedReservation.selectedRooms) {
            const roomsResponse = await axios.get("http://localhost:8000/api/posts/rooms");
            const bookedRooms = roomsResponse.data.rooms.filter(room => 
              selectedReservation.selectedRooms.includes(room.RoomNo)
            );
            setRoomDetails(bookedRooms);
          }
          
          // Fetch package details for day-out reservations
          if (selectedReservation.reservationType === 'dayOut' && selectedReservation.selectedPackages) {
            const packagesResponse = await axios.get("http://localhost:8000/api/packages");
            const bookedPackages = packagesResponse.data.filter(pkg => 
              selectedReservation.selectedPackages.includes(pkg._id)
            );
            setPackageDetails(bookedPackages);
          }
          
          // Fetch payment history
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

  // Filter reservations based on search term and type
  useEffect(() => {
    let filtered = allReservations;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(reservation => reservation.reservationType === filterType);
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(reservation => 
        reservation.firstName.toLowerCase().includes(searchLower) ||
        (reservation.surname && reservation.surname.toLowerCase().includes(searchLower)) ||
        reservation.mobile.includes(searchTerm) ||
        (reservation._id && reservation._id.toLowerCase().includes(searchLower)) ||
        (reservation.idNumber && reservation.idNumber.toLowerCase().includes(searchLower))
      );
    }

    setDisplayedReservations(filtered);
    setCurrentPage(1);
  }, [searchTerm, allReservations, filterType]);

  const loadReservation = (reservation) => {
    setSelectedReservation(reservation);
    setViewMode(false);
    
    setFormData({
      checkIn: reservation.checkIn.split('T')[0],
      checkOut: reservation.checkOut ? reservation.checkOut.split('T')[0] : "",
      startTime: reservation.startTime || "",
      endTime: reservation.endTime || "",
      duration: reservation.duration,
      adults: reservation.adults,
      kids: reservation.kids,
      firstName: reservation.firstName,
      mobile: reservation.mobile,
      email: reservation.email,
      middleName: reservation.middleName || "",
      surname: reservation.surname || "",
      dob: reservation.dob ? reservation.dob.split('T')[0] : "",
      address: reservation.address || "",
      city: reservation.city || "",
      gender: reservation.gender || "",
      idType: reservation.idType || "",
      idNumber: reservation.idNumber || "",
      totalAmount: reservation.totalAmount || 0,
      advancePayment: reservation.advancePayment || 0,
      paymentMethod: reservation.paymentMethod || "",
      paymentNotes: reservation.paymentNotes || ""
    });

    if (reservation.otherPersons && reservation.otherPersons.length > 0) {
      setPersons(reservation.otherPersons);
    } else {
      setPersons([{ name: '', gender: '', age: '', address: '', idType: '', idNo: '' }]);
    }

    setSelectedRooms(reservation.selectedRooms || []);
    setSelectedPackages(reservation.selectedPackages || []);

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
      checkOut: reservation.checkOut ? reservation.checkOut.split('T')[0] : "",
      startTime: reservation.startTime || "",
      endTime: reservation.endTime || "",
      duration: reservation.duration,
      adults: reservation.adults,
      kids: reservation.kids,
      firstName: reservation.firstName,
      mobile: reservation.mobile,
      email: reservation.email,
      middleName: reservation.middleName || "",
      surname: reservation.surname || "",
      dob: reservation.dob ? reservation.dob.split('T')[0] : "",
      address: reservation.address || "",
      city: reservation.city || "",
      gender: reservation.gender || "",
      idType: reservation.idType || "",
      idNumber: reservation.idNumber || ""
    });
  };

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
      
      // Reset form data
      resetFormData();
    } catch (error) {
      console.error("Error deleting reservation:", error);
      setError("Error deleting reservation. Please try again.");
      setSuccess("");
    }
  };

  const resetFormData = () => {
    setFormData({
      checkIn: "",
      checkOut: "",
      startTime: "",
      endTime: "",
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
      totalAmount: 0,
      advancePayment: 0,
      paymentMethod: "",
      paymentNotes: ""
    });
    setPersons([{ name: '', gender: '', age: '', address: '', idType: '', idNo: '' }]);
    setSelectedCountry(null);
    setSelectedFiles([]);
    setSelectedRooms([]);
    setSelectedPackages([]);
  };

  const refreshReservations = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/reservations");
      setAllReservations(response.data);
      setDisplayedReservations(response.data);
    } catch (err) {
      console.error("Error refreshing reservations:", err);
    }
  };

  const renderEditForm = () => {
    if (!selectedReservation) return null;

    if (selectedReservation.reservationType === 'room') {
      return (
        <EditReservationForm
          selectedReservation={selectedReservation}
          formData={formData}
          setFormData={setFormData}
          persons={persons}
          setPersons={setPersons}
          selectedRooms={selectedRooms}
          setSelectedRooms={setSelectedRooms}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          existingFiles={existingFiles}
          onDeleteReservation={handleDeleteReservation}
          onSuccess={(message) => setSuccess(message)}
          onError={(message) => setError(message)}
          onReservationUpdate={(updatedReservation) => {
            setAllReservations(allReservations.map(res => 
              res._id === updatedReservation._id ? updatedReservation : res
            ));
            loadReservation(updatedReservation);
          }}
        />
      );
    } else {
      return (
        <EditDayoutForm
          selectedReservation={selectedReservation}
          formData={formData}
          setFormData={setFormData}
          persons={persons}
          setPersons={setPersons}
          selectedPackages={selectedPackages}
          setSelectedPackages={setSelectedPackages}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          existingFiles={existingFiles}
          onDeleteReservation={handleDeleteReservation}
          onSuccess={(message) => setSuccess(message)}
          onError={(message) => setError(message)}
          onReservationUpdate={(updatedReservation) => {
            setAllReservations(allReservations.map(res => 
              res._id === updatedReservation._id ? updatedReservation : res
            ));
            loadReservation(updatedReservation);
          }}
        />
      );
    }
  };

  const renderViewDetails = () => {
    if (!selectedReservation) return null;

    if (selectedReservation.reservationType === 'room') {
      return (
        <ViewReservationDetails
          selectedReservation={selectedReservation}
          formData={formData}
          roomDetails={roomDetails}
          paymentHistory={paymentHistory}
          setPaymentHistory={setPaymentHistory}
          onBackToEdit={() => setViewMode(false)}
          onSuccess={(message) => setSuccess(message)}
          onError={(message) => setError(message)}
          onCheckoutComplete={refreshReservations}
        />
      );
    } else {
      return (
        <ViewDayoutDetails
          selectedReservation={selectedReservation}
          formData={formData}
          packageDetails={packageDetails}
          paymentHistory={paymentHistory}
          setPaymentHistory={setPaymentHistory}
          onBackToEdit={() => setViewMode(false)}
          onSuccess={(message) => setSuccess(message)}
          onError={(message) => setError(message)}
          onCheckoutComplete={refreshReservations}
        />
      );
    }
  };

  return (
    <div className="edit-reservation-container">
      <h1 className="page-title">Manage Reservations</h1>
      
      {/* Type Filter */}
      <div className="mb-3">
        <div className="btn-group" role="group" aria-label="Reservation type filter">
          <input
            type="radio"
            className="btn-check"
            name="filterType"
            id="all"
            checked={filterType === "all"}
            onChange={() => setFilterType("all")}
          />
          <label className="btn btn-outline-primary" htmlFor="all">
            All Reservations
          </label>

          <input
            type="radio"
            className="btn-check"
            name="filterType"
            id="room"
            checked={filterType === "room"}
            onChange={() => setFilterType("room")}
          />
          <label className="btn btn-outline-success" htmlFor="room">
            Room Reservations
          </label>

          <input
            type="radio"
            className="btn-check"
            name="filterType"
            id="dayOut"
            checked={filterType === "dayOut"}
            onChange={() => setFilterType("dayOut")}
          />
          <label className="btn btn-outline-info" htmlFor="dayOut">
            Day-Out Reservations
          </label>
        </div>
      </div>
      
      <SearchSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        entriesPerPage={entriesPerPage}
        setEntriesPerPage={setEntriesPerPage}
        error={error}
        success={success}
        displayedReservations={displayedReservations}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
        selectedReservation={selectedReservation}
        viewMode={viewMode}
        loadReservation={loadReservation}
        viewReservation={viewReservation}
      />
      
      {selectedReservation && !viewMode && renderEditForm()}
      
      {selectedReservation && viewMode && renderViewDetails()}
    </div>
  );
};

export default GuestRes;