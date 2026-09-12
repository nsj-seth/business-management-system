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

async function addSale(req, res) {
  const { dayId } = req.params;
  const { salesperson, amount } = req.body;

  if (!salesperson || amount === undefined) {
    return res.status(400).json({ error: 'salesperson and amount are required' });
  }

  try {
    const updatedDay = await bakeryService.addSale(dayId, salesperson, amount);
    res.status(201).json({ day: updatedDay });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}

async function listSales(req, res) {
  const { dayId } = req.params;

  try {
    const sales = await bakeryService.listSales(dayId);
    res.json({ sales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function addExpense(req, res) {
  const { dayId } = req.params;
  const { description, amount } = req.body;

  if (!description || amount === undefined) {
    return res.status(400).json({ error: 'description and amount are required' });
  }

  try {
    const updatedDay = await bakeryService.addExpense(dayId, description, amount);
    res.status(201).json({ day: updatedDay });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}

async function listExpenses(req, res) {
  const { dayId } = req.params;

  try {
    const expenses = await bakeryService.listExpenses(dayId);
    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


module.exports = { createDay, addSale, listSales, addExpense, listExpenses };