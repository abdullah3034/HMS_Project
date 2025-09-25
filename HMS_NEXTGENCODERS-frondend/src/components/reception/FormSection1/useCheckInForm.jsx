import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { countries } from './countries';

const useCheckInForm = () => {
  const fileInputRef = useRef(null);
  
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
    customerId: "",
    advancePayment: "",
    paymentMethod: "",
    paymentNotes: "",
    totalAmount: 0 // Added total amount field
  });

  const [customerType, setCustomerType] = useState("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [persons, setPersons] = useState([{ name: '', gender: '', age: '', address: '', idType: '', idNo: '' }]);
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [roomClassFilter, setRoomClassFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [emailError, setEmailError] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState('success'); // 'success' or 'error'
  const [popupMessage, setPopupMessage] = useState('');

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/rooms");
      const vacantRooms = res.data.rooms.filter(r => r.RStatus === "Vacant");
      setRooms(vacantRooms);
      setUniqueTypes([...new Set(vacantRooms.map(room => room.RType))]);
      setUniqueClasses([...new Set(vacantRooms.map(room => room.RClass))]);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  // Calculate total amount when rooms or duration changes
  const calculateTotalAmount = () => {
    if (selectedRooms.length === 0 || !formData.duration) return 0;
    
    const selectedRoomObjects = rooms.filter(room => 
      selectedRooms.includes(room.RoomNo)
    );
    
    const totalRoomPrice = selectedRoomObjects.reduce((sum, room) => {
      const roomPrice = room.RPrice || room.Price || 0;
      return sum + roomPrice;
    }, 0);
    
    return totalRoomPrice * parseInt(formData.duration);
  };

  // Update total amount when selected rooms or duration changes
  useEffect(() => {
    const totalAmount = calculateTotalAmount();
    setFormData(prev => ({ ...prev, totalAmount }));
  }, [selectedRooms, formData.duration, rooms]);

  // Show popup function
  const showPopupMessage = (type, message) => {
    setPopupType(type);
    setPopupMessage(message);
    setShowPopup(true);
  };

  // Handle popup OK button
  const handlePopupOk = () => {
    setShowPopup(false);
    setPopupMessage('');
  };

  const handleCustomerSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      const response = await axios.get(`http://localhost:8000/api/reservations/search?term=${searchTerm}`);
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching customers:", error);
      showPopupMessage('error', 'Error searching customers. Please try again.');
    }
  };

  const handleCustomerSelect = (customer) => {
    setFormData({
      ...formData,
      customerId: customer._id,
      firstName: customer.firstName,
      middleName: customer.middleName || "",
      surname: customer.surname || "",
      mobile: customer.mobile,
      email: customer.email || "",
      dob: customer.dob || "",
      address: customer.address || "",
      city: customer.city || "",
      gender: customer.gender || "",
    });
    
    if (customer.country) {
      const country = countries.find(c => c.label === customer.country);
      if (country) setSelectedCountry(country);
    }
    
    setShowSearchResults(false);
  };

  useEffect(() => {
    if (selectedCountry) {
      setFormData(prev => ({
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
      setFormData(prev => ({ ...prev, duration: diff > 0 ? diff : "" }));
    }
  }, [formData.checkIn, formData.checkOut]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleFormChange = (e) => {
    const { id, name, value } = e.target;
    const key = id || name;

    setFormData(prev => ({ ...prev, [key]: value }));

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that rooms are selected
    if (selectedRooms.length === 0) {
      showPopupMessage('error', 'Please select at least one room');
      return;
    }

    // Validate that duration is calculated
    if (!formData.duration) {
      showPopupMessage('error', 'Please select valid check-in and check-out dates');
      return;
    }
    
    try {
      const formDataToSend = new FormData();
    
      // Add all form data including totalAmount
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      if (customerType === "existing" && formData.customerId) {
        formDataToSend.append('customerId', formData.customerId);
      }
      
      formDataToSend.append('otherPersons', JSON.stringify(persons));
      formDataToSend.append('selectedRooms', JSON.stringify(selectedRooms));
      
      // Add advance payment as paid amount if provided
      if (formData.advancePayment) {
        formDataToSend.append('paidAmount', formData.advancePayment);
      }
      
      selectedFiles.forEach((file) => {
        formDataToSend.append('idFiles', file);
      });
      
      if (selectedCountry) {
        formDataToSend.append('country', selectedCountry.label);
        formDataToSend.append('countryCode', selectedCountry.value);
      }

      await axios.post("http://localhost:8000/api/reservations", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      showPopupMessage('success', 'Reservation submitted successfully!');
      
      // Reset form
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
        customerId: "",
        advancePayment: "",
        paymentMethod: "",
        paymentNotes: "",
        totalAmount: 0
      });
      setPersons([{ name: '', gender: '', age: '', address: '', idType: '', idNo: '' }]);
      setSelectedCountry(null);
      setSelectedFiles([]);
      setSelectedRooms([]);
      setCustomerType("new");
      setSearchTerm("");
      setSearchResults([]);
      setShowSearchResults(false);
      
      await fetchRooms();
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (error) {
      console.error("Error saving data:", error);
      showPopupMessage('error', 'Error submitting reservation. Please try again.');
    }
  };

  return {
    formData,
    customerType,
    searchTerm,
    searchResults,
    showSearchResults,
    persons,
    rooms,
    selectedRooms,
    roomTypeFilter,
    roomClassFilter,
    searchQuery,
    uniqueTypes,
    uniqueClasses,
    selectedCountry,
    emailError,
    selectedFiles,
    fileInputRef,
    // Popup states and handlers
    showPopup,
    popupType,
    popupMessage,
    handlePopupOk,
    handleFormChange,
    setCustomerType,
    setSearchTerm,
    handleCustomerSearch,
    handleCustomerSelect,
    setSelectedCountry,
    handleAddPerson,
    handleRemovePerson,
    handlePersonChange,
    handleRoomSelect,
    setRoomTypeFilter,
    setRoomClassFilter,
    setSearchQuery,
    handleFileChange,
    handleSubmit,
    fetchRooms,
    calculateTotalAmount
  };
};

export default useCheckInForm;