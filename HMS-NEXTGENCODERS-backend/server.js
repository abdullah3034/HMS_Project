import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

// Import DB connection helper (optional if using direct connect below)
// import connectDB from './config/mongodb.js' 

// Import Routes
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import cartRouter from './routes/cartRoutes.js';

import roomsRoutes from './routes/RoomsRoutes.js';
import receptionRoutes from './routes/ReceptionRoutes.js';
import settingsRoutes from './routes/SettingsRoutes.js';
import salesRoutes from './routes/SalesRoutes.js';
import transactionRoutes from './routes/TransactionRoutes.js';
import stockRoutes from './routes/StockRoutes.js';
import checkoutRoutes from './routes/CheckoutRoutes.js';

import roomRoutes from './routes/rooms.js';
import reservationRoutes from './routes/reservation.js';
import guestRoutes from './routes/guestRoutes.js';
import packageRoutes from './routes/packages.js';
import dailyDataRoutes from './routes/dailyData.js';
import paymentRoutes from './routes/process-payment.js'; // Add this line

import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// App initialization
const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads")); // For image/file uploads

// Root Route
app.get('/', (req, res) => res.send('✅ API Working'));

// Route Mappings
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);

app.use('/api/rooms', roomsRoutes); // Admin rooms
app.use('/api/reception', receptionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/checkouts', checkoutRoutes);

app.use('/api/hotel-rooms', roomRoutes); // Frontend room viewing
app.use('/api/reservations', reservationRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/daily-data', dailyDataRoutes);
app.use('/api/process-payment', paymentRoutes); 

app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
