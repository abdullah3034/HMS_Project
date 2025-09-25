import express from 'express';
import Reservation from '../models/Reservation.js';
import { check, validationResult } from 'express-validator';

const router = express.Router();

// Get all active reservations with filtering
router.get('/', async (req, res) => {
  try {
    const { name, email, mobile, page = 1, limit = 10 } = req.query;
    
    const query = { deleted: false };
    
    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { surname: { $regex: name, $options: 'i' } }
      ];
    }
    
    if (email) query.email = { $regex: email, $options: 'i' };
    if (mobile) query.mobile = { $regex: mobile, $options: 'i' };
    
    const reservations = await Reservation.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ checkIn: -1 });
      
    const total = await Reservation.countDocuments(query);
    
    res.json({
      reservations,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get all deleted reservations
router.get('/deleted', async (req, res) => {
  try {
    const { name, email, mobile, page = 1, limit = 10 } = req.query;
    
    const query = { deleted: true };
    
    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { surname: { $regex: name, $options: 'i' } }
      ];
    }
    
    if (email) query.email = { $regex: email, $options: 'i' };
    if (mobile) query.mobile = { $regex: mobile, $options: 'i' };
    
    const reservations = await Reservation.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ deletedAt: -1 });
      
    const total = await Reservation.countDocuments(query);
    
    res.json({
      reservations,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get single reservation
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Update reservation
router.put('/:id', [
  check('firstName', 'First name is required').not().isEmpty(),
  check('mobile', 'Mobile number is required').not().isEmpty(),
  check('checkIn', 'Check-in date is required').not().isEmpty(),
  check('checkOut', 'Check-out date is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    
    const {
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
      checkIn,
      checkOut,
      duration,
      adults,
      kids,
      otherPersons,
      selectedRooms
    } = req.body;
    
    const updatedFields = {
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
      checkIn,
      checkOut,
      duration,
      adults,
      kids,
      otherPersons,
      selectedRooms,
      updatedAt: Date.now()
    };
    
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );
    
    res.json(updatedReservation);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Soft delete reservation
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    
    reservation.deleted = true;
    reservation.deletedAt = Date.now();
    await reservation.save();
    
    res.json({ msg: 'Reservation marked as deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Restore deleted reservation
router.put('/restore/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    
    reservation.deleted = false;
    reservation.deletedAt = null;
    await reservation.save();
    
    res.json({ msg: 'Reservation restored' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Hard delete reservation
router.delete('/hard/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    
    await reservation.deleteOne();
    
    res.json({ msg: 'Reservation permanently deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

export default router;