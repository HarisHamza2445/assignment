const express = require('express');
const employeeRoutes = require('./employeeRoutes');
const taskRoutes = require('./taskRoutes');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.get('/dashboard', getDashboard);
router.use('/employees', employeeRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
