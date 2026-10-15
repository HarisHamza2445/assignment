const mongoose = require('mongoose');

// On serverless (Vercel) the same instance can handle many requests,
// so reuse the existing connection instead of opening a new one each time.
let connectionPromise = null;

const DEFAULT_DB_NAME = 'ems';

// mongodb+srv://user:pass@host/<dbName>?options -> true if <dbName> is present
function hasDatabaseName(uri) {
  const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/);
  return Boolean(match && match[1]);
}

async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Check your .env file.');
  }

  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        // Atlas copy-paste URIs usually have no db name, which would silently use "test"
        ...(hasDatabaseName(uri) ? {} : { dbName: DEFAULT_DB_NAME }),
      })
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
