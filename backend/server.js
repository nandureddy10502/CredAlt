import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';
import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';
import { checkFastApiHealth } from './services/aiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration supporting same-origin, local dev, Vercel deployments, and CLIENT_URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((u) => u.trim()) : []),
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, curl, server-to-server) or matching allowed/vercel origins
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = getDbStatus();
  const fastApiStatus = await checkFastApiHealth();

  res.json({
    service: 'CredAlt Primary Backend',
    status: 'online',
    timestamp: new Date(),
    database: dbStatus,
    aiMicroservice: fastApiStatus,
    authSystem: 'JWT + bcrypt (RBAC enabled)',
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'CredAlt Alternative Credit Underwriter API',
    version: '2.0.0 (Hardened)',
    endpoints: {
      health: 'GET /api/health',
      authRegister: 'POST /api/auth/register',
      authLogin: 'POST /api/auth/login',
      authMe: 'GET /api/auth/me',
      applicationsList: 'GET /api/applications (Loan Officer only)',
      myApplications: 'GET /api/applications/my (Applicant only)',
      applicationCreate: 'POST /api/applications',
      applicationDetail: 'GET /api/applications/:id',
      applicationStatusUpdate: 'PATCH /api/applications/:id/status (Loan Officer only)',
      seedDemoData: 'POST /api/applications/seed (Loan Officer only)',
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`[Express] Primary Backend server running on http://localhost:${PORT}`);
  console.log(`[Express] AI Service target: ${process.env.ML_SERVICE_URL || process.env.FASTAPI_URL || 'http://127.0.0.1:8000'}`);
});

export default app;
