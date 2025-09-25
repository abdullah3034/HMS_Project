import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { countries } from "../FormSection1/countries";

const useDayoutForm = () => {
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    duration: "",
    startTime: "10:00", // Default start time
    endTime: "18:00",   // Default end time
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
    totalAmount: 0,
    reservationType: "dayout"
  });

  const [customerType, setCustomerType] = useState("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [persons, setPersons] = useState([{ 
    id: Date.now(), 
    name: '', 
    gender: '', 
    age: '', 
    address: '', 
    idType: '', 
    idNo: '' 
  }]);
  const [packages, setPackages] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [packageCategoryFilter, setPackageCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [emailError, setEmailError] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState('success'); // 'success' or 'error'
  const [popupMessage, setPopupMessage] = useState('');

  // Generate unique keys for dropdown options
  const getOptionKey = (prefix, value) => `${prefix}-${value}`;

  // Popup handler
  const handlePopupOk = () => {
    setShowPopup(false);
    setPopupMessage('');
  };

  // Show popup function
  const showPopupMessage = (type, message) => {
    setPopupType(type);
    setPopupMessage(message);
    setShowPopup(true);
  };

  const fetchPackages = async () => {
    try {
      console.log("Fetching packages from API..."); // Debug log
      const res = await axios.get("http://localhost:8000/api/packages");
      console.log("API Response:", res.data); // Debug log
      
      if (res.data && Array.isArray(res.data)) {
        setPackages(res.data);
        setUniqueCategories([...new Set(res.data.map(pkg => pkg.category))]);
        console.log("Packages set:", res.data.length); // Debug log
        console.log("Categories found:", [...new Set(res.data.map(pkg => pkg.category))]); // Debug log
      } else {
        console.error("Invalid API response format:", res.data);
        setPackages([]);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      console.error("Error details:", err.response?.data); // More detailed error
      setPackages([]); // Ensure packages is always an array
    }
  };

  const calculateTotalAmount = () => {
    if (selectedPackages.length === 0) return 0;
    
    const selectedPackageObjects = packages.filter(pkg => 
      selectedPackages.includes(pkg._id)
    );
    
    const totalAdults = parseInt(formData.adults) || 0;
    const totalKids = parseInt(formData.kids) || 0;
    
    const totalPackagePrice = selectedPackageObjects.reduce((sum, pkg) => {
      const packagePrice = pkg.pricePerChild || 0;
      const totalGuests = totalAdults + totalKids;
      return sum + (packagePrice * totalGuests);
    }, 0);
    
    return totalPackagePrice;
  };

  useEffect(() => {
    const totalAmount = calculateTotalAmount();
    setFormData(prev => ({ ...prev, totalAmount }));
  }, [selectedPackages, formData.adults, formData.kids, packages]);

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
    const { checkIn, startTime, endTime } = formData;
    if (checkIn && startTime && endTime) {
      const start = new Date(`${checkIn}T${startTime}`);
      const end = new Date(`${checkIn}T${endTime}`);
      const diffHours = (end - start) / (1000 * 60 * 60);
      setFormData(prev => ({ ...prev, duration: diffHours > 0 ? diffHours : 1 }));
    }
  }, [formData.checkIn, formData.startTime, formData.endTime]);
  
  useEffect(() => {
    console.log("useEffect triggered - fetching packages"); // Debug log
    fetchPackages();
  }, []);

  // Debug useEffect to track packages state
  useEffect(() => {
    console.log("Packages state updated:", packages);
  }, [packages]);

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

    // If advance payment is cleared, also clear payment method and notes
    if (key === "advancePayment" && (!value || parseFloat(value) === 0)) {
      setFormData(prev => ({ 
        ...prev, 
        [key]: value,
        paymentMethod: "",
        paymentNotes: ""
      }));
    }
  };

  
  const handleAddPerson = () => {
    setPersons([...persons, { 
      id: Date.now(), // Unique ID for each person
      name: '', 
      gender: '', 
      age: '', 
      address: '', 
      idType: '', 
      idNo: '' 
    }]);
  };

  const handleRemovePerson = (index) => { // Fixed: accept index instead of id
    if (persons.length > 1) {
      setPersons(persons.filter((_, i) => i !== index));
    }
  };

  const handlePersonChange = (index, field, value) => { // Fixed: accept index instead of id
    setPersons(persons.map((person, i) => 
      i === index ? { ...person, [field]: value } : person
    ));
  };

  const handlePackageSelect = (packageId) => {
    console.log("Package selected:", packageId); // Debug log
    setSelectedPackages(prev => {
      const newSelection = prev.includes(packageId) 
        ? prev.filter(p => p !== packageId) 
        : [...prev, packageId];
      console.log("Selected packages updated:", newSelection); // Debug log
      return newSelection;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedPackages.length === 0) {
      showPopupMessage('error', 'Please select at least one package');
      return;
    }

    if (!formData.checkIn || !formData.startTime || !formData.endTime) {
      showPopupMessage('error', 'Please fill in all required time fields');
      return;
    }

    if (!formData.paymentMethod && formData.advancePayment && parseFloat(formData.advancePayment) > 0) {
      showPopupMessage('error', 'Please select a payment method for the advance payment');
      return;
    }
    
    try {
      const formDataToSend = new FormData();
    
      // Add basic form fields - ONLY ONCE, but exclude empty paymentMethod
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          // Skip paymentMethod if it's empty and no advance payment
          if (key === 'paymentMethod' && value === '' && (!formData.advancePayment || parseFloat(formData.advancePayment) === 0)) {
            return;
          }
          formDataToSend.append(key, value);
        }
      });

      // Add customerId only if it exists and customer type is existing
      if (customerType === "existing" && formData.customerId) {
        // Only append if not already added above
        if (!formData.customerId) {
          formDataToSend.append('customerId', formData.customerId);
        }
      }

      // Add other persons data (ensure clean JSON)
      const cleanPersons = persons.map(p => ({
        id: p.id,
        name: p.name || '',
        gender: p.gender || '',
        age: p.age ? Number(p.age) : 0,
        address: p.address || '',
        idType: p.idType || '',
        idNo: p.idNo || ''
      }));
      formDataToSend.append('otherPersons', JSON.stringify(cleanPersons));
      
      // Add selected packages as JSON string (ensure it's a clean array)
      const cleanPackages = selectedPackages.filter(pkg => pkg && pkg.trim());
      formDataToSend.append('selectedPackages', JSON.stringify(cleanPackages));

      // Add paid amount if advance payment exists
      if (formData.advancePayment) {
        formDataToSend.append('paidAmount', formData.advancePayment);
      }
      
      // Add files
      selectedFiles.forEach((file) => {
        formDataToSend.append('idFiles', file);
      });
      
      // Add country information
      if (selectedCountry) {
        formDataToSend.append('country', selectedCountry.label);
        formDataToSend.append('countryCode', selectedCountry.value);
      }

      // Debug: Log what we're sending
      console.log('FormData contents:');
      console.log('Selected Packages:', selectedPackages);
      console.log('Clean Packages JSON:', JSON.stringify(cleanPackages));
      console.log('Persons:', persons);
      console.log('Clean Persons JSON:', JSON.stringify(cleanPersons));
      
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await axios.post("http://localhost:8000/api/reservations/", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Server response:', response.data);
      showPopupMessage('success', 'Day Out reservation submitted successfully!');
      
      // Reset form
      setFormData({
        checkIn: "",
        checkOut: "",
        startTime: "10:00",
        endTime: "18:00",
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
        totalAmount: 0,
        reservationType: "dayout"
      });
      setPersons([{ 
        id: Date.now(),
        name: '', 
        gender: '', 
        age: '', 
        address: '', 
        idType: '', 
        idNo: '' 
      }]);
      setSelectedCountry(null);
      setSelectedFiles([]);
      setSelectedPackages([]);
      setCustomerType("new");
      setSearchTerm("");
      setSearchResults([]);
      setShowSearchResults(false);
      
      await fetchPackages();
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (error) {
      console.error("Error saving data:", error);
      console.error("Error response:", error.response?.data);
      showPopupMessage('error', 'Error submitting day out reservation. Please try again.');
    }
  };

  return {
    formData,
    customerType,
    searchTerm,
    searchResults,
    showSearchResults,
    persons,
    packages,
    selectedPackages,
    packageCategoryFilter,
    searchQuery,
    uniqueCategories,
    selectedCountry,
    emailError,
    selectedFiles,
    fileInputRef,
    // Popup states
    showPopup,
    popupType,
    popupMessage,
    handlePopupOk,
    // Functions
    handleFormChange,
    setCustomerType,
    setSearchTerm,
    handleCustomerSearch,
    handleCustomerSelect,
    setSelectedCountry,
    handleAddPerson,
    handleRemovePerson,
    handlePersonChange,
    handlePackageSelect,
    setPackageCategoryFilter,
    setSearchQuery,
    handleFileChange,
    handleSubmit,
    calculateTotalAmount
  };
};

export default useDayoutForm;