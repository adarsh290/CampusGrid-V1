import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import downloadRoutes from './routes/downloadRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load env vars before anything else
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('⚠️  JWT_SECRET environment variable is not set. Exiting.');
  process.exit(1);
}

// Connect to database
connectDB();

const app: Application = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    // Allow loading images from any origin (cover art, etc.)
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── NoSQL injection prevention ────────────────────────────────────────────────
app.use(mongoSanitize());

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static('public', { maxAge: '1y', immutable: true }));

// ── CORS ──────────────────────────────────────────────────────────────────────
// Bug 2 fixed: use an explicit allowlist instead of reflecting any origin.
// Set ALLOWED_ORIGINS in your .env for production domains.
const ALLOWED_ORIGINS: string[] = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Always allow localhost in development
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080');
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ── Rate limiters ─────────────────────────────────────────────────────────────
// Bug 23 fixed: auth limiter tightened to 10 attempts per 15 minutes to
// prevent brute-force attacks. Order limiter kept at 100 (reasonable).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts from this IP, please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Swagger API Docs (non-production only) ────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const { default: swaggerUi } = await import('swagger-ui-express');
  const { swaggerSpec } = await import('./swagger/swagger.js');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📖 Swagger docs available at /api/docs');
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'CampusGrid API is running' });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// ── Centralised error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 CampusGrid Server running on port ${PORT}`);
  console.log(`📁 Game files directory: /storage (mapped from ./storage on host)`);
});
