const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// All analytics routes can be accessed by authenticated users or for visualizations
router.get('/overview', analyticsController.getOverview);
router.get('/distributions', analyticsController.getDistributions);
router.get('/comparisons', analyticsController.getComparisons);
router.get('/correlations', analyticsController.getCorrelations);
router.get('/all-records', analyticsController.getAllRecords);

module.exports = router;
