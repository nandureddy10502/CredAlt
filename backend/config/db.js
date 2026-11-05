import mongoose from 'mongoose';
import dns from 'dns';

// Fix Node.js Windows SRV lookup bug on mongodb+srv URIs by ensuring reliable public DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if not supported in environment
}

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/credalt';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Live connection established: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB Connection Failed]: ${error.message}`);
    console.error(`[MongoDB Strict Policy]: In-memory fallback is disabled. Unhandled DB operations will return HTTP 503.`);
    return false;
  }
};

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
