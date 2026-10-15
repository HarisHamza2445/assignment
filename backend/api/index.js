// Entry point for Vercel. Locally and on Render, src/server.js is used instead.
require('dotenv').config();
const app = require('../src/app');

module.exports = app;
