const bakeryService = require('./bakery.service');

async function createDay(req, res) {
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ error: 'date is required' });
  }

  try {
    const newDay = await bakeryService.createDay(date);
    res.status(201).json({ day: newDay });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}

module.exports = { createDay };