const router = require('express').Router();
const requireAuth = require('../../middleware/requireAuth');
const controller = require('./farms.controller');

router.use(requireAuth);
router.get('/opening-state', controller.getOpeningState);
router.post('/opening-state', controller.setupOpeningState);
router.get('/transactions', controller.listTransactions);
router.post('/transactions', controller.addTransaction);
router.get('/summary', controller.getSummary);

module.exports = router;
