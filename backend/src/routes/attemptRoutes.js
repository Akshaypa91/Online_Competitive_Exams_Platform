const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:attemptId/submit', authMiddleware, attemptController.submitExam);

module.exports = router;
