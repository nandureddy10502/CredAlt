import mongoose from 'mongoose';
import dns from 'dns';

// Fix Node.js Windows SRV lookup bug on mongodb+srv URIs by ensuring reliable public DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if not supported in environment
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/credalt';
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 5,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('[OK] Connected to MongoDB Atlas');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error('[FAIL] MongoDB connection failed:', err.message);
    throw err;
  }

  return cached.conn;
}

// Event listeners for connection monitoring
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost. Database is currently offline.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Connection re-established.');
});

export const getDbStatus = () => {
  const state = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    connected: state === 1,
    readyState: state,
    statusText: states[state] || 'unknown',
    host: mongoose.connection.host || null,
    dbName: mongoose.connection.name || null,
  };
};

export default connectDB;
