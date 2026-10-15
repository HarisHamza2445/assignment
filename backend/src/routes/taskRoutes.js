const express = require('express');
const controller = require('../controllers/taskController');

const router = express.Router();

router.get('/', controller.getTasks);
router.get('/export', controller.exportTasks);
router.get('/:id', controller.getTask);
router.post('/', controller.createTask);
router.put('/:id', controller.updateTask);
router.put('/:id/status', controller.updateTaskStatus);
router.delete('/:id', controller.deleteTask);

module.exports = router;
