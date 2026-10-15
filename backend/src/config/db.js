const mongoose = require('mongoose');

// On serverless (Vercel) the same instance can handle many requests,
// so reuse the existing connection instead of opening a new one each time.
let connectionPromise = null;

async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Check your .env file.');
  }

  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10000 })
      .then(() => {
        console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
      })
      .catch((err) => {
        connectionPromise = null;
        throw err;
      });
  }

  await connectionPromise;
}

module.exports = connectDB;
