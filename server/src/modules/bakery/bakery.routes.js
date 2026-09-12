const express = require('express');
const requireAuth = require('../../middleware/requireAuth');
const bakeryController = require('./bakery.controller');

const router = express.Router();

// Every route in this file requires a logged-in user.
router.use(requireAuth);

router.post('/days', bakeryController.createDay);

module.exports = router;