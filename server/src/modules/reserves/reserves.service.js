const repository = require('./reserves.repository');

async function setupOpeningState({ asOfDate, cumulativeProfit, cumulativeExpense, balance, userId }) {
  const existing = await repository.findOpeningState();

  if (existing) {
    const error = new Error('Reserves have already been set up. Opening state cannot be created twice.');
    error.statusCode = 409;
    throw error;
  }

  return repository.createOpeningState({
    as_of_date: asOfDate,
    opening_cumulative_profit: cumulativeProfit,
    opening_cumulative_expense: cumulativeExpense,
    opening_balance: balance,
    created_by: userId,
  });
}

async function getOpeningState() {
  return repository.findOpeningState();
}

module.exports = { setupOpeningState, getOpeningState };