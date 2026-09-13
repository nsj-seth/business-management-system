const reservesService = require('./reserves.service');

async function setupOpeningState(req, res) {
  const { asOfDate, cumulativeProfit, cumulativeExpense, balance } = req.body;

  if (!asOfDate || cumulativeProfit === undefined || cumulativeExpense === undefined || balance === undefined) {
    return res.status(400).json({
      error: 'asOfDate, cumulativeProfit, cumulativeExpense, and balance are all required',
    });
  }

  try {
    const openingState = await reservesService.setupOpeningState({
      asOfDate,
      cumulativeProfit,
      cumulativeExpense,
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
    const openingState = await reservesService.getOpeningState();
    res.json({ openingState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function addTransaction(req, res) {
  const { date, particular, type, amount } = req.body;

  if (!date || !particular || !type || amount === undefined) {
    return res.status(400).json({ error: 'date, particular, type, and amount are required' });
  }

  try {
    const transaction = await reservesService.addTransaction({
      date,
      particular,
      type,
      amount,
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
    const transactions = await reservesService.listTransactions();
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



module.exports = { setupOpeningState, getOpeningState, addTransaction, listTransactions };