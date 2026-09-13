const cementService = require('./cement.service');

async function setupOpeningState(req, res) {
  const { asOfDate, balance } = req.body;

  if (!asOfDate || balance === undefined) {
    return res.status(400).json({ error: 'asOfDate and balance are required' });
  }

  try {
    const openingState = await cementService.setupOpeningState({
      asOfDate,
      balance,
      userId: req.user.id,
    });
    res.status(201).json({ openingState });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}

async function getOpeningState(req, res) {
  try {
    const openingState = await cementService.getOpeningState();
    res.json({ openingState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addTransaction(req, res) {
  const { date, type, particular, bags, pricePerBag } = req.body;

  if (!date || !type || bags === undefined || pricePerBag === undefined) {
    return res.status(400).json({ error: 'date, type, bags, and pricePerBag are required' });
  }

  try {
    const transaction = await cementService.addTransaction({
      date,
      type,
      particular,
      bags,
      pricePerBag,
      userId: req.user.id,
    });
    res.status(201).json({ transaction });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}

async function listTransactions(req, res) {
  try {
    const transactions = await cementService.listTransactions();
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTransaction(req, res) {
  const { transactionId } = req.params;

  try {
    const transaction = await cementService.getTransaction(transactionId);
    res.json({ transaction });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}

async function getSummary(req, res) {
  try {
    const summary = await cementService.getSummary();
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  setupOpeningState,
  getOpeningState,
  addTransaction,
  listTransactions,
  getTransaction,
  getSummary,
};