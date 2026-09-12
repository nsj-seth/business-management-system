const express = require('express');
const requireAuth = require('../../middleware/requireAuth');
const bakeryController = require('./bakery.controller');

const router = express.Router();

// Every route in this file requires a logged-in user.
router.use(requireAuth);

router.post('/days', bakeryController.createDay);
router.post('/days/:dayId/sales', bakeryController.addSale);
router.get('/days/:dayId/sales', bakeryController.listSales);
router.post('/days/:dayId/expenses', bakeryController.addExpense);
router.get('/days/:dayId/expenses', bakeryController.listExpenses);
router.post('/days/:dayId/complete', bakeryController.completeDay);

module.exports = router;