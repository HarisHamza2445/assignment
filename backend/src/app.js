const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const connectDB = require('./config/db');
const ApiError = require('./utils/ApiError');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    exposedHeaders: ['Content-Disposition'],
  })
);
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Make sure the DB is connected before handling a request. On a normal server this
// resolves instantly; on serverless (Vercel) it opens the connection on a cold start.
app.use(async (req, res, next) => {
  try {
    await connectDB(process.env.MONGODB_URI);
    next();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    next(new ApiError(503, 'Could not connect to the database. Please try again shortly.'));
  }
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
