import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  // Reservation Type - NEW FIELD
  reservationType: { 
    type: String, 
    required: true,
    enum: ['room', 'dayOut'],
    default: 'room'
  },

  // Booking Information - Modified for flexibility
  checkIn: { type: Date, required: true }, // For rooms: check-in date, For day-out: day-out date
  checkOut: { type: Date }, // Optional for day-out (can be same as checkIn)
  
  // Day-out specific timing fields - NEW FIELDS
  startTime: { type: String }, // Format: "09:00" - for day-out start time
  endTime: { type: String },   // Format: "17:00" - for day-out end time
  
  duration: { type: Number, required: true }, // For rooms: nights, For day-out: hours
  adults: { type: Number, required: true, default: 1 },
  kids: { type: Number, default: 0 },
  
  // Guest Information - Same for both
  firstName: { type: String, required: true },
  middleName: String,
  surname: String,
  mobile: { type: String, required: true },
  email: { type: String, match: /.+\@.+\..+/ },
  dob: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: String, // Made optional for day-out
  city: String,
  country: String,
  countryCode: String,
  
  // Identification - Made optional for day-out
  idType: { 
    type: String,
    enum: ['Passport', 'Driving License', 'National ID', 'Aadhar Card', 'Voter ID'] 
  },
  idNumber: String,
  idFiles: [String],
  
  // Additional Guests - Same for both
  otherPersons: [{
    name: String,
    gender: String,
    age: String,
    address: String,
    idType: String,
    idNo: String
  }],
  
  // Room Assignment - Only for room reservations
  selectedRooms: {
    type: [String],
    validate: {
      validator: function(array) {
        // Only validate if this is a room reservation
        if (this.reservationType === 'room') {
          return array && array.length > 0;
        }
        return true; // Always valid for day-out reservations
      },
      message: 'At least one room must be selected for room reservations'
    }
  },
  
  // Package Selection - NEW FIELD for day-out reservations
  selectedPackages: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package'
    }],
    validate: {
      validator: function(array) {
        // Only validate if this is a day-out reservation
        if (this.reservationType === 'dayOut') {
          return array && array.length > 0;
        }
        return true; // Always valid for room reservations
      },
      message: 'At least one package must be selected for day-out reservations'
    }
  },
  
  // Payment Information - Same for both
  totalAmount: { 
    type: Number, 
    default: 0,
    set: v => Math.round(v * 100) / 100
  },
  paidAmount: { 
    type: Number, 
    default: 0,
    set: v => Math.round(v * 100) / 100
  },
  advancePayment: { // NEW FIELD - commonly used for day-out
    type: Number, 
    default: 0,
    set: v => Math.round(v * 100) / 100
  },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Other']
  },
  paymentNotes: String,
  paymentIntentId: String,
  
  // Enhanced payment status
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Fully Paid', 'Overpaid', 'Refunded', 'Failed'],
    default: 'Pending'
  },
  
  // Cash handling fields
  cashReceived: {
    type: Number,
    default: 0,
    set: v => Math.round(v * 100) / 100
  },
  change: {
    type: Number,
    default: 0,
    set: v => Math.round(v * 100) / 100
  },
  
  receiptUrl: String,
  
  // Reservation Status - Enhanced for day-out
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Cancelled', 'CheckedIn', 'CheckedOut', 'NoShow', 'Completed'], 
    default: 'Pending' 
  },

  // Checkout Information
  checkoutDate: Date,
  checkoutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  checkoutNotes: String,

  // Audit Fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Soft Delete
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for amount due
reservationSchema.virtual('amountDue').get(function() {
  return this.totalAmount - this.paidAmount;
});

// Virtual for payment completion percentage
reservationSchema.virtual('paymentProgress').get(function() {
  if (this.totalAmount === 0) return 0;
  return Math.round((this.paidAmount / this.totalAmount) * 100);
});

// Virtual for full guest name
reservationSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.middleName || ''} ${this.surname || ''}`.trim();
});

// Virtual for formatted time range (day-out only)
reservationSchema.virtual('timeRange').get(function() {
  if (this.reservationType === 'dayOut' && this.startTime && this.endTime) {
    return `${this.startTime} - ${this.endTime}`;
  }
  return null;
});

// Pre-save hooks - Enhanced for both types
reservationSchema.pre('save', function(next) {
  // Auto-calculate duration based on reservation type
  if (this.reservationType === 'room') {
    // For room reservations: calculate nights
    if (this.isModified('checkIn') || this.isModified('checkOut')) {
      if (this.checkIn && this.checkOut) {
        const diff = Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
        this.duration = diff > 0 ? diff : 1;
      }
    }
  } else if (this.reservationType === 'dayOut') {
    // For day-out reservations: calculate hours
    if (this.isModified('startTime') || this.isModified('endTime') || this.isModified('checkIn')) {
      if (this.startTime && this.endTime && this.checkIn) {
        const start = new Date(`${this.checkIn.toISOString().split('T')[0]}T${this.startTime}`);
        const end = new Date(`${this.checkIn.toISOString().split('T')[0]}T${this.endTime}`);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60));
        this.duration = diff > 0 ? diff : 1;
      }
    }
    
    // Set checkOut same as checkIn for day-out reservations
    if (!this.checkOut || this.isModified('checkIn')) {
      this.checkOut = this.checkIn;
    }
  }
  
  // Format mobile number with country code
  if (this.isModified('mobile') && this.countryCode) {
    this.mobile = `${this.countryCode} ${this.mobile.replace(/[^\d]/g, '')}`;
  }
  
  // Auto-update payment status based on amounts
  if (this.isModified('paidAmount') || this.isModified('totalAmount')) {
    this.paymentStatus = this.calculatePaymentStatus();
  }
  
  this.updatedAt = Date.now();
  next();
});

// Instance method to calculate payment status
reservationSchema.methods.calculatePaymentStatus = function() {
  const amountDue = this.totalAmount - this.paidAmount;
  
  if (this.paidAmount === 0) {
    return 'Pending';
  } else if (amountDue > 0) {
    return 'Partially Paid';
  } else if (amountDue === 0) {
    return 'Fully Paid';
  } else {
    return 'Overpaid';
  }
};

// Instance method to record payment
reservationSchema.methods.recordPayment = function(amount, method, notes, cashReceived = null) {
  const paymentAmount = parseFloat(amount);
  
  if (paymentAmount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }
  
  const newPaidAmount = this.paidAmount + paymentAmount;
  if (newPaidAmount > this.totalAmount) {
    throw new Error('Payment amount exceeds total amount due');
  }
  
  this.paidAmount = newPaidAmount;
  this.paymentMethod = method;
  if (notes) this.paymentNotes = notes;
  
  if (method === 'Cash' && cashReceived) {
    this.cashReceived = parseFloat(cashReceived);
    this.change = this.cashReceived - paymentAmount;
  }
  
  this.paymentStatus = this.calculatePaymentStatus();
  
  return this;
};

// Instance method to checkout
reservationSchema.methods.checkout = function(userId = null, notes = null) {
  this.status = this.reservationType === 'dayOut' ? 'Completed' : 'CheckedOut';
  this.checkoutDate = new Date();
  if (userId) this.checkoutBy = userId;
  if (notes) this.checkoutNotes = notes;
  
  return this;
};

// Update room statuses when reservation changes (room reservations only)
reservationSchema.post('save', async function(doc) {
  try {
    // Only update room statuses for room reservations
    if (doc.reservationType === 'room' && doc.selectedRooms && doc.selectedRooms.length > 0) {
      const Room = require('./posts'); // Adjust path as needed
      
      if (doc.status === 'Confirmed' || doc.status === 'CheckedIn') {
        await Room.updateMany(
          { RoomNo: { $in: doc.selectedRooms } },
          { $set: { RStatus: 'Occupied' } }
        );
      } else if (doc.status === 'CheckedOut' || doc.status === 'Cancelled') {
        await Room.updateMany(
          { RoomNo: { $in: doc.selectedRooms } },
          { $set: { RStatus: 'Vacant' } }
        );
      }
    }
  } catch (error) {
    console.error('Error updating room statuses:', error);
  }
});

// Static method to calculate total amount - Enhanced for both types
reservationSchema.statics.calculateTotal = async function(reservationType, items, duration, adults = 1, kids = 0) {
  try {
    if (reservationType === 'room') {
      // Existing room calculation logic
      const Room = require('./posts');
      const rooms = await Room.find({ RoomNo: { $in: items } });
      
      if (rooms.length === 0) return 0;
      
      const totalRoomPrice = rooms.reduce((sum, room) => {
        const roomPrice = room.RPrice || room.Price || 0;
        return sum + roomPrice;
      }, 0);
      
      return totalRoomPrice * duration;
    } else if (reservationType === 'dayOut') {
      // New package calculation logic
      const Package = require('./Package'); // Adjust path as needed
      const packages = await Package.find({ _id: { $in: items } });
      
      if (packages.length === 0) return 0;
      
      const totalPackagePrice = packages.reduce((sum, pkg) => {
        let packageTotal = 0;
        
        if (pkg.category === 'adults') {
          packageTotal = pkg.pricePerChild * adults;
          packageTotal += pkg.pricePerChild * 0.5 * kids;
        } else if (pkg.category === 'kids') {
          packageTotal = pkg.pricePerChild * kids;
          packageTotal += pkg.pricePerChild * 0.3 * adults;
        } else {
          packageTotal = pkg.pricePerChild * (adults + kids);
        }
        
        return sum + packageTotal;
      }, 0);
      
      return Math.round(totalPackagePrice);
    }
    
    return 0;
  } catch (error) {
    console.error('Error calculating total amount:', error);
    return 0;
  }
};

// Static method to find reservations by type
reservationSchema.statics.findByType = function(type) {
  return this.find({ reservationType: type });
};

// Static method to find day-out reservations by date
reservationSchema.statics.findDayOutByDate = function(date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  return this.find({
    reservationType: 'dayOut',
    checkIn: { $gte: startDate, $lte: endDate }
  });
};

// Static method to find room reservations by date range
reservationSchema.statics.findRoomsByDateRange = function(checkIn, checkOut) {
  return this.find({
    reservationType: 'room',
    $or: [
      {
        checkIn: { $lte: checkOut },
        checkOut: { $gte: checkIn }
      }
    ]
  });
};

// Enhanced indexes for better performance
reservationSchema.index({ reservationType: 1 });
reservationSchema.index({ reservationType: 1, checkIn: 1 });
reservationSchema.index({ reservationType: 1, status: 1 });
reservationSchema.index({ mobile: 1 });
reservationSchema.index({ checkIn: 1, checkOut: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ paymentStatus: 1 });
reservationSchema.index({ selectedRooms: 1 });
reservationSchema.index({ selectedPackages: 1 });
reservationSchema.index({ createdAt: -1 });
// Use mongoose.models to avoid OverwriteModelError
const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);

export default Reservation;
