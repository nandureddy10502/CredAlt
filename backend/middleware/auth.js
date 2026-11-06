import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'credalt_dev_jwt_secret_change_in_production';

/**
 * Middleware: Verify JWT token from Authorization header and attach authenticated user to req.user
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Missing or malformed Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token missing.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // If database is live, fetch fresh user record from DB; otherwise use token payload
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User account associated with this token no longer exists.',
        });
      }
      req.user = user;
    } else {
      // Attached verified token claims
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
  }
};

/**
 * Middleware: Require a specific role ('loan_officer' or 'applicant')
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required before checking permissions.',
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Route requires '${role}' role, but user has '${req.user.role}'.`,
      });
    }

    next();
  };
};

/**
 * Middleware: Asynchronous Database Readiness Check for Serverless
 * Awaits connection resolution rather than prematurely failing with 503
 */
export const requireDb = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (err) {
    return res.status(503).json({
      success: false,
      error: 'MongoDB is currently offline. Ensure Atlas IP whitelist (0.0.0.0/0) and MONGODB_URI are configured.',
      details: err.message,
    });
  }
};

