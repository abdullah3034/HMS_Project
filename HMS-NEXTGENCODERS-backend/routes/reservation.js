import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Reservation from "../models/Reservation.js";
import Room from "../models/RoomsModel.js"; // Room model

// ADD THIS: Import Package model for day-out reservations
import Package from "../models/Package.js";
 // Adjust path as needed

const router = express.Router(); // ADD THIS LINE - router was missing declaration

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Get available rooms
router.get("/available-rooms", async (req, res) => {
  try {
    const rooms = await Room.find({ RStatus: "Vacant" });
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD THIS: Get available packages endpoint
router.get("/available-packages", async (req, res) => {
  try {
    const packages = await Package.find();
    res.json({ packages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Search reservations - MINIMAL UPDATE
router.get("/search", async (req, res) => {
  try {
    const { term, type } = req.query; // ADD: type parameter
    
    let searchQuery = {
      $or: [
        { firstName: { $regex: term, $options: "i" } },
        { surname: { $regex: term, $options: "i" } },
        { mobile: { $regex: term } },
        { idNumber: { $regex: term } },
      ],
    };

    // ADD: Filter by reservation type if specified
    if (type && ['room', 'dayOut', 'dayout'].includes(type)) {
      // Normalize the type value
      const normalizedType = type === 'dayout' ? 'dayOut' : type;
      searchQuery.reservationType = normalizedType;
    }

    const results = await Reservation.find(searchQuery)
      .populate('selectedPackages') // ADD: Populate packages for day-out
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all reservations - MINIMAL UPDATE
router.get("/", async (req, res) => {
  try {
    const { type } = req.query; // ADD: type parameter
    
    let query = {};
    if (type && ['room', 'dayOut', 'dayout'].includes(type)) {
      // Normalize the type value
      const normalizedType = type === 'dayout' ? 'dayOut' : type;
      query.reservationType = normalizedType;
    }

    const reservations = await Reservation.find(query)
      .populate('selectedPackages') // ADD: Populate packages
      .sort({ createdAt: -1 });
    
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get single reservation with room details - ENHANCED
router.get("/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('selectedPackages'); // ADD: Populate packages

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    let additionalDetails = {};

    // Fetch room details for room reservations
    if (reservation.reservationType === 'room' && reservation.selectedRooms && reservation.selectedRooms.length > 0) {
      const roomDetails = await Room.find({ 
        RoomNo: { $in: reservation.selectedRooms } 
      });
      additionalDetails.roomDetails = roomDetails;
    }

    // Package details are already populated
    if (reservation.reservationType === 'dayOut') {
      additionalDetails.packageDetails = reservation.selectedPackages;
    }

    res.json({
      ...reservation.toObject(),
      ...additionalDetails
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Submit reservation (Create) - ENHANCED FOR BOTH TYPES
router.post("/", upload.array("idFiles"), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;

    console.log("Form data received:", formData);
    console.log("Raw reservationType:", formData.reservationType, "Type:", typeof formData.reservationType);

    // Determine reservation type - DEFAULT TO 'room' for backward compatibility
    // Handle case where reservationType might be an array (take first element)
    let reservationType = formData.reservationType || 'room';
    if (Array.isArray(reservationType)) {
      reservationType = reservationType[0];
    }
    // Normalize the value
    reservationType = reservationType === 'dayout' ? 'dayOut' : reservationType;

    const otherPersons = JSON.parse(formData.otherPersons || "[]");
    const selectedRooms = JSON.parse(formData.selectedRooms || "[]");
    const selectedPackages = JSON.parse(formData.selectedPackages || "[]"); // ADD

    // Validate required fields based on type
    if (!formData.firstName || !formData.mobile) {
      return res.status(400).json({ 
        message: "Missing required fields: firstName, mobile" 
      });
    }

    // Type-specific validation
    if (reservationType === 'room') {
      // EXISTING room validation
      if (!formData.checkIn || !formData.checkOut) {
        return res.status(400).json({ 
          message: "Missing required fields: checkIn, checkOut" 
        });
      }

      if (selectedRooms.length === 0) {
        return res.status(400).json({ 
          message: "At least one room must be selected" 
        });
      }
    } else if (reservationType === 'dayOut') {
      // NEW day-out validation
      if (!formData.checkIn || !formData.startTime || !formData.endTime) {
        return res.status(400).json({ 
          message: "Missing required fields for day-out: checkIn (date), startTime, endTime" 
        });
      }

      if (selectedPackages.length === 0) {
        return res.status(400).json({ 
          message: "At least one package must be selected for day-out reservation" 
        });
      }
    }

    // Calculate duration and dates - FIXED
    let checkInDate = new Date(formData.checkIn);
    let checkOutDate, duration;

    if (reservationType === 'room') {
      // EXISTING room logic
      checkOutDate = new Date(formData.checkOut);
      duration = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

      if (duration <= 0) {
        return res.status(400).json({ 
          message: "Check-out date must be after check-in date" 
        });
      }
    } else if (reservationType === 'dayOut') {
      // NEW day-out logic - FIXED
      checkOutDate = checkInDate; // Same day
      
      if (formData.startTime && formData.endTime) {
        const [startHour, startMin] = formData.startTime.split(':').map(Number);
        const [endHour, endMin] = formData.endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        if (endMinutes <= startMinutes) {
          return res.status(400).json({ 
            message: "End time must be after start time" 
          });
        }
        
        duration = Math.ceil((endMinutes - startMinutes) / 60); // Duration in hours
      } else {
        duration = 1; // Default to 1 hour if times not specified
      }
    }

    // Ensure duration is always set
    if (!duration || duration <= 0) {
      duration = 1; // Default minimum duration
    }

    // Calculate total amount - ENHANCED
    let totalAmount = 0;
    const adults = parseInt(formData.adults) || 1;
    const kids = parseInt(formData.kids) || 0;

    if (reservationType === 'room') {
      // EXISTING room calculation
      totalAmount = await Reservation.calculateTotal('room', selectedRooms, duration);
    } else if (reservationType === 'dayOut') {
      // NEW package calculation
      totalAmount = await Reservation.calculateTotal('dayOut', selectedPackages, duration, adults, kids);
    }

    console.log("Calculated total amount:", totalAmount, "Duration:", duration);

    // Prepare reservation data - ENHANCED
    const reservationData = {
      reservationType: reservationType, // ADD
      checkIn: checkInDate,
      checkOut: checkOutDate,
      duration: duration, // Ensure this is always set
      adults: adults,
      kids: kids,
      firstName: formData.firstName,
      middleName: formData.middleName || "",
      surname: formData.surname || "",
      mobile: formData.mobile,
      email: formData.email || "",
      dob: formData.dob ? new Date(formData.dob) : null,
      address: formData.address || "", // Make optional for day-out
      city: formData.city || "",
      gender: formData.gender || "",
      idType: formData.idType || "Passport",
      idNumber: formData.idNumber || "", // Make optional for day-out
      country: formData.country || "",
      countryCode: formData.countryCode || "",
      otherPersons: otherPersons,
      selectedRooms: selectedRooms, // Will be empty for day-out
      selectedPackages: selectedPackages, // ADD: Will be empty for room
      idFiles: files.map((file) => file.path),
      
      // Payment fields
      totalAmount: totalAmount,
      paidAmount: parseFloat(formData.advancePayment || formData.paidAmount || 0),
      advancePayment: parseFloat(formData.advancePayment || 0), // ADD
      paymentMethod: formData.paymentMethod || "",
      paymentNotes: formData.paymentNotes || "",
      paymentStatus: 'Pending',
      
      // Set status to Confirmed
      status: "Confirmed"
    };

    // ADD day-out specific fields
    if (reservationType === 'dayOut') {
      reservationData.startTime = formData.startTime;
      reservationData.endTime = formData.endTime;
    }

    console.log("Creating reservation with data:", reservationData);

    const reservation = new Reservation(reservationData);
    const saved = await reservation.save();

    console.log("Reservation saved:", saved._id);

    // Book rooms - ONLY for room reservations
    if (reservationType === 'room' && selectedRooms.length > 0) {
      await Room.updateMany(
        { RoomNo: { $in: selectedRooms } },
        { $set: { RStatus: "Occupied" } }
      );
      console.log("Rooms updated to Occupied:", selectedRooms);
    }

    // Return success response with amount details - ENHANCED
    res.status(201).json({
      message: `${reservationType === 'room' ? 'Room' : 'Day-out'} reservation created successfully`,
      reservation: {
        _id: saved._id,
        reservationType: saved.reservationType, // ADD
        totalAmount: saved.totalAmount,
        paidAmount: saved.paidAmount,
        amountDue: saved.totalAmount - saved.paidAmount,
        status: saved.status,
        selectedRooms: saved.selectedRooms,
        selectedPackages: saved.selectedPackages, // ADD
        checkIn: saved.checkIn,
        checkOut: saved.checkOut,
        startTime: saved.startTime, // ADD
        endTime: saved.endTime, // ADD
        duration: saved.duration
      }
    });

  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(400).json({ 
      message: "Error creating reservation", 
      error: err.message 
    });
  }
});

// ✅ Update reservation - ENHANCED FOR BOTH TYPES
router.put("/:id", async (req, res) => {
  try {
    console.log("Update request received for ID:", req.params.id);
    console.log("Request body:", req.body);

    const reservationId = req.params.id;
    const formData = req.body;

    // Validate reservation exists
    const existingReservation = await Reservation.findById(reservationId);
    if (!existingReservation) {
      return res.status(404).json({ 
        success: false,
        message: "Reservation not found" 
      });
    }

    // Handle reservation type - ensure it's not an array
    let reservationType = existingReservation.reservationType || 'room';
    if (Array.isArray(reservationType)) {
      reservationType = reservationType[0];
    }
    // Normalize the value
    reservationType = reservationType === 'dayout' ? 'dayOut' : reservationType;

    // Calculate duration based on type - ENHANCED
    let duration = parseInt(formData.duration);
    
    if (reservationType === 'room') {
      // EXISTING room logic
      if (formData.checkIn && formData.checkOut) {
        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);
        duration = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      }
    } else if (reservationType === 'dayOut') {
      // NEW day-out logic - FIXED
      if (formData.startTime && formData.endTime && formData.checkIn) {
        const [startHour, startMin] = formData.startTime.split(':').map(Number);
        const [endHour, endMin] = formData.endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        duration = Math.ceil((endMinutes - startMinutes) / 60); // Duration in hours
      }
    }

    // Ensure duration is always valid
    if (!duration || duration <= 0) {
      duration = existingReservation.duration || 1; // Use existing or default to 1
    }

    // Calculate total amount - ENHANCED
    let totalAmount = formData.totalAmount;
    const adults = parseInt(formData.adults) || 1;
    const kids = parseInt(formData.kids) || 0;

    if (reservationType === 'room') {
      // EXISTING room calculation
      const selectedRooms = formData.selectedRooms || [];
      if (selectedRooms.length > 0 && duration > 0) {
        totalAmount = await Reservation.calculateTotal('room', selectedRooms, duration);
      }
    } else if (reservationType === 'dayOut') {
      // NEW package calculation
      const selectedPackages = formData.selectedPackages || [];
      if (selectedPackages.length > 0 && duration > 0) {
        totalAmount = await Reservation.calculateTotal('dayOut', selectedPackages, duration, adults, kids);
      }
    }

    // Prepare update data with proper validation - ENHANCED
    const updateData = {
      firstName: formData.firstName?.trim(),
      middleName: formData.middleName?.trim() || "",
      surname: formData.surname?.trim() || "",
      mobile: formData.mobile?.trim(),
      email: formData.email?.trim() || "",
      dob: formData.dob || "",
      address: formData.address?.trim() || "", // Make optional
      city: formData.city?.trim() || "",
      idType: formData.idType || "Passport",
      idNumber: formData.idNumber?.trim() || "", // Make optional
      checkIn: new Date(formData.checkIn),
      duration: duration, // Ensure this is always set
      adults: adults,
      kids: kids,
      otherPersons: formData.otherPersons || [],
      country: formData.country || "",
      countryCode: formData.countryCode || "",
      totalAmount: totalAmount || 0,
      paidAmount: parseFloat(formData.paidAmount || 0),
      advancePayment: parseFloat(formData.advancePayment || 0) // ADD
    };

    // ADD type-specific fields
    if (reservationType === 'room') {
      updateData.checkOut = new Date(formData.checkOut);
      updateData.selectedRooms = formData.selectedRooms || [];
    } else if (reservationType === 'dayOut') {
      updateData.checkOut = new Date(formData.checkIn); // Same day
      updateData.selectedPackages = formData.selectedPackages || [];
      updateData.startTime = formData.startTime;
      updateData.endTime = formData.endTime;
    }

    // Handle gender enum - only set if valid
    if (formData.gender && ['Male', 'Female', 'Other'].includes(formData.gender)) {
      updateData.gender = formData.gender;
    }

    // Handle payment method enum - only set if valid and not empty
    const validPaymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Other'];
    if (formData.paymentMethod && validPaymentMethods.includes(formData.paymentMethod)) {
      updateData.paymentMethod = formData.paymentMethod;
    }

    // Handle payment notes - only set if not empty
    if (formData.paymentNotes && formData.paymentNotes.trim() !== "") {
      updateData.paymentNotes = formData.paymentNotes.trim();
    }

    // Validate required fields - UPDATED
    const requiredCheckOut = reservationType === 'room';
    if (!updateData.firstName || !updateData.mobile || !updateData.checkIn || (requiredCheckOut && !updateData.checkOut)) {
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: firstName, mobile, checkIn${requiredCheckOut ? ', checkOut' : ''}` 
      });
    }

    console.log("Prepared update data:", updateData);

    // Get original rooms to update their status later - ONLY for room reservations
    if (reservationType === 'room') {
      const originalRooms = existingReservation.selectedRooms || [];
      const newRooms = updateData.selectedRooms || [];

      // Update room statuses if rooms changed
      if (JSON.stringify(originalRooms.sort()) !== JSON.stringify(newRooms.sort())) {
        console.log("Updating room statuses...");
        
        const roomsToVacate = originalRooms.filter(room => !newRooms.includes(room));
        if (roomsToVacate.length > 0) {
          await Room.updateMany(
            { RoomNo: { $in: roomsToVacate } },
            { $set: { RStatus: "Vacant" } }
          );
          console.log("Vacated rooms:", roomsToVacate);
        }

        if (newRooms.length > 0) {
          await Room.updateMany(
            { RoomNo: { $in: newRooms } },
            { $set: { RStatus: "Occupied" } }
          );
          console.log("Occupied rooms:", newRooms);
        }
      }
    }

    // Update the reservation
    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { $set: updateData },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedReservation) {
      return res.status(404).json({ 
        success: false,
        message: "Failed to update reservation" 
      });
    }

    console.log("Successfully updated reservation:", updatedReservation._id);

    res.json({ 
      success: true,
      message: "Reservation updated successfully", 
      reservation: {
        _id: updatedReservation._id,
        reservationType: updatedReservation.reservationType, // ADD
        totalAmount: updatedReservation.totalAmount,
        paidAmount: updatedReservation.paidAmount,
        amountDue: updatedReservation.totalAmount - updatedReservation.paidAmount,
        status: updatedReservation.status
      }
    });

  } catch (err) {
    console.error("Error updating reservation:", err);
    
    // More specific error handling
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false,
        message: "Validation error", 
        errors: validationErrors 
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid reservation ID format" 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: err.message 
    });
  }
});

// ✅ Delete reservation - ENHANCED
router.delete("/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Mark rooms as Vacant when room reservation is deleted - ONLY for room reservations
    if (reservation.reservationType === 'room' && reservation.selectedRooms && reservation.selectedRooms.length > 0) {
      await Room.updateMany(
        { RoomNo: { $in: reservation.selectedRooms } },
        { $set: { RStatus: "Vacant" } }
      );
    }

    res.json({ 
      message: `${reservation.reservationType === 'room' ? 'Room' : 'Day-out'} reservation deleted successfully` 
    });
  } catch (err) {
    console.error("Error deleting reservation:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Checkout endpoint with payment status tracking - ENHANCED
router.put("/:id/checkout", async (req, res) => {
  try {
    const { paymentStatus, paidAmount, totalAmount } = req.body;
    
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const updateData = { 
      status: reservation.reservationType === 'dayOut' ? 'Completed' : 'CheckedOut', // ENHANCED
      checkoutDate: new Date(),
      paymentStatus: paymentStatus || 'Pending'
    };

    // Update payment fields if provided
    if (paidAmount !== undefined) {
      updateData.paidAmount = paidAmount;
    }
    if (totalAmount !== undefined) {
      updateData.totalAmount = totalAmount;
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Mark rooms as Vacant when room reservation is checked out - ONLY for room reservations
    if (reservation.reservationType === 'room' && reservation.selectedRooms && reservation.selectedRooms.length > 0) {
      await Room.updateMany(
        { RoomNo: { $in: reservation.selectedRooms } },
        { $set: { RStatus: "Vacant" } }
      );
    }

    res.json({ 
      message: `${reservation.reservationType === 'room' ? 'Guest checked out' : 'Day-out completed'} successfully`, 
      reservation: updatedReservation,
      paymentStatus: updatedReservation.paymentStatus,
      amountDue: updatedReservation.totalAmount - updatedReservation.paidAmount
    });
  } catch (err) {
    console.error("Error during checkout:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get payments for a reservation - ENHANCED
router.get("/:id/payments", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Return payment information from the reservation
    const paymentInfo = {
      reservationType: reservation.reservationType, // ADD
      totalAmount: reservation.totalAmount,
      paidAmount: reservation.paidAmount,
      advancePayment: reservation.advancePayment, // ADD
      amountDue: reservation.totalAmount - reservation.paidAmount,
      paymentMethod: reservation.paymentMethod,
      paymentNotes: reservation.paymentNotes,
      paymentStatus: reservation.paymentStatus
    };

    res.json(paymentInfo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Add payment to reservation - MINIMAL UPDATE
router.post("/:id/payments", async (req, res) => {
  try {
    const { amount, paymentMethod, notes, cashReceived, change } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const paymentAmount = parseFloat(amount);
    const newPaidAmount = reservation.paidAmount + paymentAmount;
    
    // Validate payment amount
    if (paymentAmount <= 0) {
      return res.status(400).json({ 
        message: "Payment amount must be greater than 0" 
      });
    }

    if (newPaidAmount > reservation.totalAmount) {
      return res.status(400).json({ 
        message: "Payment amount exceeds total amount due" 
      });
    }

    // Prepare update data
    const updateData = {
      paidAmount: newPaidAmount,
      paymentStatus: newPaidAmount >= reservation.totalAmount ? 'Fully Paid' : 'Partially Paid' // UPDATED
    };

    // Update payment method if provided
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }

    // Update payment notes if provided
    if (notes) {
      updateData.paymentNotes = notes;
    }

    // Store cash handling details if provided
    if (cashReceived !== undefined) {
      updateData.cashReceived = parseFloat(cashReceived);
    }
    if (change !== undefined) {
      updateData.change = parseFloat(change);
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      message: "Payment added successfully",
      payment: {
        amount: paymentAmount,
        method: paymentMethod,
        notes: notes,
        cashReceived: cashReceived,
        change: change,
        date: new Date()
      },
      reservation: {
        reservationType: updatedReservation.reservationType, // ADD
        totalAmount: updatedReservation.totalAmount,
        paidAmount: updatedReservation.paidAmount,
        amountDue: updatedReservation.totalAmount - updatedReservation.paidAmount,
        paymentStatus: updatedReservation.paymentStatus
      }
    });

  } catch (err) {
    console.error("Error adding payment:", err);
    res.status(500).json({ message: err.message });
  }
});

// ES6 Module Export - FIXED
export default router;