const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Reservation = require('../models/Dayoutreservationjk');

const Package = require('../models/Package');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/id-documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image files and PDFs are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/reservations - Get all reservations with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Add filters based on query parameters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.reservationType) {
      filter.reservationType = req.query.reservationType;
    }
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }
    if (req.query.checkIn) {
      filter.checkIn = { $gte: new Date(req.query.checkIn) };
    }
    if (req.query.checkOut) {
      filter.checkOut = { $lte: new Date(req.query.checkOut) };
    }

    const reservations = await Reservation.find(filter)
      .populate('selectedPackages.packageId', 'name category pricePerChild')
      .populate('customerId', 'firstName surname mobile email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Reservation.countDocuments(filter);

    res.json({
      reservations,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
});

// GET /api/reservations/search - Search customers for existing customer selection
router.get('/search', async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term || term.trim().length < 2) {
      return res.status(400).json({ message: 'Search term must be at least 2 characters' });
    }

    // Search in both customers and reservations
    const customers = await Customer.find({
      $or: [
        { firstName: { $regex: term, $options: 'i' } },
        { surname: { $regex: term, $options: 'i' } },
        { mobile: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } }
      ],
      isActive: true
    }).limit(10);

    // Also search in reservations for customers not in Customer collection
    const reservations = await Reservation.find({
      $or: [
        { firstName: { $regex: term, $options: 'i' } },
        { surname: { $regex: term, $options: 'i' } },
        { mobile: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } }
      ]
    }).select('firstName middleName surname mobile email dob address city gender country countryCode')
      .limit(10);

    // Combine and deduplicate results
    const combinedResults = [];
    const mobileSet = new Set();

    // Add customers first
    customers.forEach(customer => {
      if (!mobileSet.has(customer.mobile)) {
        combinedResults.push(customer);
        mobileSet.add(customer.mobile);
      }
    });

    // Add unique reservations
    reservations.forEach(reservation => {
      if (!mobileSet.has(reservation.mobile)) {
        combinedResults.push(reservation);
        mobileSet.add(reservation.mobile);
      }
    });

    res.json(combinedResults.slice(0, 10));
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ message: 'Error searching customers', error: error.message });
  }
});

// GET /api/reservations/:id - Get single reservation
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('selectedPackages.packageId')
      .populate('customerId');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ message: 'Error fetching reservation', error: error.message });
  }
});

// POST /api/reservations/dayout - Create day-out reservation
router.post('/dayout', upload.array('idFiles', 5), async (req, res) => {
  try {
    const {
      checkIn,
      adults,
      kids,
      firstName,
      middleName,
      surname,
      mobile,
      email,
      dob,
      address,
      city,
      gender,
      idType,
      idNumber,
      customerId,
      otherPersons,
      selectedPackages,
      totalAmount,
      advancePayment,
      paidAmount,
      paymentMethod,
      paymentNotes,
      country,
      countryCode
    } = req.body;

    // Validate required fields
    if (!checkIn || !firstName || !mobile || !address || !idType || !idNumber) {
      return res.status(400).json({ 
        message: 'Missing required fields: checkIn, firstName, mobile, address, idType, idNumber' 
      });
    }

    // Parse JSON strings
    const parsedOtherPersons = otherPersons ? JSON.parse(otherPersons) : [];
    const parsedSelectedPackages = selectedPackages ? JSON.parse(selectedPackages) : [];

    if (parsedSelectedPackages.length === 0) {
      return res.status(400).json({ message: 'At least one package must be selected' });
    }

    // Get package details and validate
    const packages = await Package.find({ 
      '_id': { $in: parsedSelectedPackages },
      isActive: true 
    });

    if (packages.length !== parsedSelectedPackages.length) {
      return res.status(400).json({ message: 'One or more selected packages are invalid' });
    }

    // Prepare package data for reservation
    const packageData = packages.map(pkg => ({
      packageId: pkg._id,
      packageName: pkg.name,
      packagePrice: pkg.pricePerChild,
      category: pkg.category
    }));

    // Calculate total amount
    const calculatedTotal = packages.reduce((sum, pkg) => {
      const totalGuests = parseInt(adults) + parseInt(kids);
      return sum + (pkg.pricePerChild * totalGuests);
    }, 0);

    // Handle file uploads
    const idFiles = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    // Create or update customer if not existing
    let customer = null;
    if (customerId) {
      customer = await Customer.findById(customerId);
    }

    if (!customer) {
      // Check if customer exists by mobile
      customer = await Customer.findOne({ mobile });
      
      if (!customer) {
        // Create new customer
        customer = new Customer({
          firstName,
          middleName,
          surname,
          mobile,
          email,
          dob: dob ? new Date(dob) : undefined,
          address,
          city,
          gender,
          country,
          countryCode,
          idType,
          idNumber
        });
        await customer.save();
      }
    }

    // Create reservation
    const reservation = new Reservation({
      reservationType: 'dayout',
      checkIn: new Date(checkIn),
      duration: 1, // Day out is always 1 day
      adults: parseInt(adults),
      kids: parseInt(kids),
      customerId: customer._id,
      firstName,
      middleName,
      surname,
      mobile,
      email,
      dob: dob ? new Date(dob) : undefined,
      address,
      city,
      gender,
      country,
      countryCode,
      idType,
      idNumber,
      otherPersons: parsedOtherPersons,
      selectedPackages: packageData,
      totalAmount: calculatedTotal,
      advancePayment: advancePayment ? parseFloat(advancePayment) : 0,
      paidAmount: paidAmount ? parseFloat(paidAmount) : (advancePayment ? parseFloat(advancePayment) : 0),
      paymentMethod,
      paymentNotes,
      idFiles,
      status: 'Confirmed'
    });

    await reservation.save();

    // Update customer stats
    customer.totalReservations += 1;
    customer.totalSpent += calculatedTotal;
    customer.lastVisit = new Date(checkIn);
    await customer.save();

    res.status(201).json({
      message: 'Day-out reservation created successfully',
      reservation: reservation
    });

  } catch (error) {
    console.error('Error creating day-out reservation:', error);
    
    // Clean up uploaded files if there was an error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating day-out reservation', 
      error: error.message 
    });
  }
});

// PUT /api/reservations/:id - Update reservation
router.put('/:id', upload.array('idFiles', 5), async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Parse JSON strings if they exist
    if (req.body.otherPersons) {
      req.body.otherPersons = JSON.parse(req.body.otherPersons);
    }
    if (req.body.selectedPackages) {
      req.body.selectedPackages = JSON.parse(req.body.selectedPackages);
    }

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
      req.body.idFiles = [...(reservation.idFiles || []), ...newFiles];
    }

    // Update reservation
    Object.assign(reservation, req.body);
    await reservation.save();

    res.json({
      message: 'Reservation updated successfully',
      reservation: reservation
    });

  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ 
      message: 'Error updating reservation', 
      error: error.message 
    });
  }
});

// PATCH /api/reservations/:id/status - Update reservation status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json({
      message: 'Reservation status updated successfully',
      reservation: reservation
    });

  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ 
      message: 'Error updating reservation status', 
      error: error.message 
    });
  }
});

// PATCH /api/reservations/:id/payment - Update payment information
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paidAmount, paymentMethod, paymentNotes } = req.body;

    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (paidAmount !== undefined) {
      reservation.paidAmount = parseFloat(paidAmount);
    }
    if (paymentMethod) {
      reservation.paymentMethod = paymentMethod;
    }
    if (paymentNotes !== undefined) {
      reservation.paymentNotes = paymentNotes;
    }

    await reservation.save(); // This will trigger pre-save middleware to update payment status

    res.json({
      message: 'Payment information updated successfully',
      reservation: reservation
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ 
      message: 'Error updating payment information', 
      error: error.message 
    });
  }
});

// DELETE /api/reservations/:id - Delete reservation
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Delete associated files
    if (reservation.idFiles && reservation.idFiles.length > 0) {
      reservation.idFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    await Reservation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Reservation deleted successfully' });

  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ 
      message: 'Error deleting reservation', 
      error: error.message 
    });
  }
});

// GET /api/reservations/stats/summary - Get reservation statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const stats = await Reservation.aggregate([
      {
        $group: {
          _id: null,
          totalReservations: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          pending: { 
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, 1, 0] }
          },
          confirmed: { 
            $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] }
          }
        }
      }
    ]);

    const monthlyStats = await Reservation.aggregate([
      {
        $match: { createdAt: { $gte: startOfMonth } }
      },
      {
        $group: {
          _id: null,
          monthlyReservations: { $sum: 1 },
          monthlyRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const yearlyStats = await Reservation.aggregate([
      {
        $match: { createdAt: { $gte: startOfYear } }
      },
      {
        $group: {
          _id: null,
          yearlyReservations: { $sum: 1 },
          yearlyRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      overall: stats[0] || {},
      monthly: monthlyStats[0] || {},
      yearly: yearlyStats[0] || {}
    });

  } catch (error) {
    console.error('Error fetching reservation stats:', error);
    res.status(500).json({ 
      message: 'Error fetching statistics', 
      error: error.message 
    });
  }
});

module.exports = router;