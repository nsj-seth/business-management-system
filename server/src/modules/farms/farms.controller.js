const service = require('./farms.service');

function handleError(res, error) {
  console.error('Farms request failed:', error);
  res.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : 'Unable to complete Farms request',
  });
}

async function setupOpeningState(req, res) {
  try {
    const openingState = await service.setupOpeningState({
      asOfDate: req.body.asOfDate,
      balance: req.body.balance,
      userId: req.user.id,
    });
    res.status(201).json({ openingState });
  } catch (error) { handleError(res, error); }
}

async function getOpeningState(req, res) {
  try {
    res.json({ openingState: await service.getOpeningState() });
  } catch (error) { handleError(res, error); }
}

async function addTransaction(req, res) {
  try {
    const transaction = await service.addTransaction({
      date: req.body.date, particular: req.body.particular,
      type: req.body.type, amount: req.body.amount, userId: req.user.id,
    });
    res.status(201).json({ transaction });
  } catch (error) { handleError(res, error); }
}

async function listTransactions(req, res) {
  try {
    res.json({ transactions: await service.listTransactions() });
  } catch (error) { handleError(res, error); }
}

async function getSummary(req, res) {
  try {
    res.json({ summary: await service.getSummary() });
  } catch (error) { handleError(res, error); }
}

module.exports = { setupOpeningState, getOpeningState, addTransaction, listTransactions, getSummary };
