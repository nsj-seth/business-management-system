const express = require('express');
const requireAuth = require('../../middleware/requireAuth');
const reservesController = require('./reserves.controller');

const router = express.Router();

router.use(requireAuth);

router.post('/opening-state', reservesController.setupOpeningState);
router.get('/opening-state', reservesController.getOpeningState);
router.post('/transactions', reservesController.addTransaction);
router.get('/transactions', reservesController.listTransactions);


module.exports = router;