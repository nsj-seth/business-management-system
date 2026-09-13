const express = require('express');
const requireAuth = require('../../middleware/requireAuth');
const cementController = require('./cement.controller');

const router = express.Router();

router.use(requireAuth);

router.post('/opening-state', cementController.setupOpeningState);
router.get('/opening-state', cementController.getOpeningState);
router.post('/transactions', cementController.addTransaction);
router.get('/transactions', cementController.listTransactions);
router.get('/transactions/:transactionId', cementController.getTransaction);
router.get('/summary', cementController.getSummary);

module.exports = router;