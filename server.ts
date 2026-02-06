import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import jwt from 'jsonwebtoken'; // Imported for the emergency token
import User from './models/User.js'; // Imported for the emergency token

if (!process.env.JWT_SECRET) {
  console.error('⚠️ JWT_SECRET environment variable is not set. Exiting.');
  process.exit(1);
}
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Connect to database
connectDB();

const app: Application = express();

// Rate limiting for auth and order endpoints – 100 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware with strict origin validation
const allowedOrigins = [
  'http://localhost',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:5000',
  'http://172.25.7.114',
  'http://172.25.7.114:5173',
  'http://172.25.7.114:8080',
  'http://172.25.7.114:5000',
];

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  // Allow only whitelisted origins; reject others with 403
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // No Origin header – allow for same‑origin requests (e.g., curl)
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});


// Health check route
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/upload', uploadRoutes);
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'CampusGrid API is running' });
});

// --- EMERGENCY TOKEN GENERATOR ---
app.get('/api/emergency-token', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne();
    
    if (!user) return res.status(404).send("No user found! Run seed.js first.");

    const token = jwt.sign(
        { id: user._id, role: user.role || 'user' },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '1d' }
    );

    console.log("Emergency Token Generated for:", user.username);
    res.send(token);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

// Generic error handling – never expose stack traces or internal messages
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  // Send a minimal response to the client
  res.status(500).json({ message: 'Something went wrong' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 CampusGrid Server running on port ${PORT}`);
  console.log(`📁 Game files directory: D:/CampusGames (configured per game)`);
});
