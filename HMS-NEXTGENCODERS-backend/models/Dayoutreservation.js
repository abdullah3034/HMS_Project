import mongoose from "mongoose";

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  age: {
    type: Number,
    min: 0,
    max: 120
  },
  address: {
    type: String,
    trim: true
  },
  idType: {
    type: String,
    enum: ['Passport', 'Driving License', 'National ID', 'Aadhar Card', 'Voter ID']
  },
  idNo: {
    type: String,
    trim: true
  }
}, { _id: false });

const reservationSchema = new mongoose.Schema({
  // Basic reservation info
  reservationType: {
    type: String,
    required: true,
    enum: ['accommodation', 'dayout'],
    default: 'dayout'
  },
  
  // Dates
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v >= this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  duration: {
    type: Number,
    default: 1
  },

  // Guest information
  adults: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  kids: {
    type: Number,
    default: 0,
    min: 0
  },

  // Primary customer details
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  surname: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  dob: {
    type: Date
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  countryCode: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  idType: {
    type: String,
    required: true,
    enum: ['Passport', 'Driving License', 'National ID', 'Aadhar Card', 'Voter ID']
  },
  idNumber: {
    type: String,
    required: true,
    trim: true
  },

  // Other persons
  otherPersons: [personSchema],

  // Package information (for dayout)
  selectedPackages: [{
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package'
    },
    packageName: String,
    packagePrice: Number,
    category: String
  }],

  // Financial information
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  advancePayment: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Other']
  },
  paymentNotes: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Refunded'],
    default: 'Pending'
  },

  // Files
  idFiles: [{
    filename: String,
    originalname: String,
    path: String,
    mimetype: String,
    size: Number
  }],

  // Status and metadata
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  reservationNumber: {
    type: String,
    unique: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate remaining amount and set payment status
reservationSchema.pre('save', function(next) {
  this.remainingAmount = this.totalAmount - (this.paidAmount || this.advancePayment || 0);
  
  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'Paid';
  } else if (this.paidAmount > 0 || this.advancePayment > 0) {
    this.paymentStatus = 'Partial';
  } else {
    this.paymentStatus = 'Pending';
  }
  
  // Generate reservation number if not exists
  if (!this.reservationNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.reservationNumber = `${this.reservationType.toUpperCase()}${year}${month}${random}`;
  }
  
  next();
});

// Indexes for better query performance
reservationSchema.index({ reservationNumber: 1 });
reservationSchema.index({ checkIn: 1 });
reservationSchema.index({ mobile: 1 });
reservationSchema.index({ email: 1 });
reservationSchema.index({ firstName: 1, surname: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ reservationType: 1 });
reservationSchema.index({ createdAt: -1 });

// Text search index
reservationSchema.index({
  firstName: 'text',
  surname: 'text',
  mobile: 'text',
  email: 'text',
  reservationNumber: 'text'
});

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;