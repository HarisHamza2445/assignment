// Entry point for Vercel. Locally and on Render, src/server.js is used instead.
require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB(process.env.MONGODB_URI);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Could not connect to the database' }));
    return;
  }
  return app(req, res);
};
