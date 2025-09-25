// routes/dailyData.js
import express from 'express';
import Reservation from '../models/Reservation.js';
import Room from '../models/RoomsModel.js';

const router = express.Router();

// GET /api/daily-data/summary - Quick daily numbers
router.get('/summary', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get today's checkouts
    const checkouts = await Reservation.find({
      status: 'CheckedOut',
      checkoutDate: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Get today's new bookings
    const bookings = await Reservation.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Get room counts
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ RStatus: 'Occupied' });
    
    // Calculate revenue
    const checkoutRevenue = checkouts.reduce((sum, res) => sum + (res.totalAmount || 0), 0);
    const bookingRevenue = bookings.reduce((sum, res) => sum + (res.paidAmount || 0), 0);
    const totalRevenue = checkoutRevenue + bookingRevenue;
    
    res.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      totalRevenue: totalRevenue,
      totalCheckouts: checkouts.length,
      totalBookings: bookings.length,
      occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      availableRooms: totalRooms - occupiedRooms,
      occupiedRooms: occupiedRooms,
      totalRooms: totalRooms
    });
    
  } catch (error) {
    console.error('Error getting daily summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting daily summary',
      error: error.message
    });
  }
});

// GET /api/daily-data - Complete daily data
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get today's data
    const checkouts = await Reservation.find({
      status: 'CheckedOut',
      checkoutDate: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const bookings = await Reservation.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ RStatus: 'Occupied' });
    
    // Calculate revenue
    const checkoutRevenue = checkouts.reduce((sum, res) => sum + (res.totalAmount || 0), 0);
    const bookingRevenue = bookings.reduce((sum, res) => sum + (res.paidAmount || 0), 0);
    const totalRevenue = checkoutRevenue + bookingRevenue;
    
    // Payment methods breakdown
    const allTransactions = [...checkouts, ...bookings];
    const cashPayments = allTransactions
      .filter(res => res.paymentMethod === 'Cash')
      .reduce((sum, res) => sum + (res.totalAmount || res.paidAmount || 0), 0);
    
    const cardPayments = allTransactions
      .filter(res => ['Credit Card', 'Debit Card'].includes(res.paymentMethod))
      .reduce((sum, res) => sum + (res.totalAmount || res.paidAmount || 0), 0);
    
    res.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      
      // Summary
      totalRevenue: totalRevenue,
      totalCheckouts: checkouts.length,
      totalBookings: bookings.length,
      occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      
      // Revenue breakdown
      revenue: {
        checkouts: checkoutRevenue,
        bookings: bookingRevenue,
        total: totalRevenue,
        cash: cashPayments,
        cards: cardPayments,
        other: totalRevenue - cashPayments - cardPayments
      },
      
      // Room data
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        available: totalRooms - occupiedRooms,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
      },
      
      // Guest details
      checkouts: checkouts.map(res => ({
        id: res._id,
        guestName: `${res.firstName} ${res.surname || ''}`.trim(),
        rooms: res.selectedRooms,
        amount: res.totalAmount || 0,
        paymentMethod: res.paymentMethod || 'N/A',
        checkoutTime: res.checkoutDate
      })),
      
      bookings: bookings.map(res => ({
        id: res._id,
        guestName: `${res.firstName} ${res.surname || ''}`.trim(),
        rooms: res.selectedRooms,
        amount: res.paidAmount || 0,
        paymentMethod: res.paymentMethod || 'N/A',
        bookingTime: res.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Error getting daily data:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting daily data',
      error: error.message
    });
  }
});

// GET /api/daily-data/revenue - Just revenue data
router.get('/revenue', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const checkouts = await Reservation.find({
      status: 'CheckedOut',
      checkoutDate: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const bookings = await Reservation.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const checkoutRevenue = checkouts.reduce((sum, res) => sum + (res.totalAmount || 0), 0);
    const bookingRevenue = bookings.reduce((sum, res) => sum + (res.paidAmount || 0), 0);
    
    // Payment methods
    const allTransactions = [...checkouts, ...bookings];
    const paymentMethods = {};
    
    allTransactions.forEach(res => {
      const method = res.paymentMethod || 'Unknown';
      const amount = res.totalAmount || res.paidAmount || 0;
      paymentMethods[method] = (paymentMethods[method] || 0) + amount;
    });
    
    res.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      checkoutRevenue: checkoutRevenue,
      bookingRevenue: bookingRevenue,
      totalRevenue: checkoutRevenue + bookingRevenue,
      paymentMethods: paymentMethods
    });
    
  } catch (error) {
    console.error('Error getting revenue data:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting revenue data',
      error: error.message
    });
  }
});

export default router;