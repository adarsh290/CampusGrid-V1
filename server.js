import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import jwt from 'jsonwebtoken'; // Imported for the emergency token
import User from './models/User.js'; // Imported for the emergency token

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CampusGrid API is running' });
});

// --- 👇 EMERGENCY TOKEN GENERATOR (ADD THIS PART) 👇 ---
app.get('/api/emergency-token', async (req, res) => {
  try {
    // 1. Get the first user in the database
    const user = await User.findOne();
    
    if (!user) return res.status(404).send("No user found! Run seed.js first.");

    // 2. Sign a token using the SERVER'S active secret
    const token = jwt.sign(
        { id: user._id, role: user.role || 'user' },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '1d' }
    );

    console.log("Emergency Token Generated for:", user.username);
    res.send(token); // Send the text directly to the browser
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// -------------------------------------------------------

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 CampusGrid Server running on port ${PORT}`);
  console.log(`📁 Game files directory: D:/CampusGames (configured per game)`);
});

