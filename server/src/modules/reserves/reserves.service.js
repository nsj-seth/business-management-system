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


// Builds a reference number like RES-20260912-143022 using the
// current timestamp, so multiple transactions on the same date
// still get unique references.
function buildReferenceNumber() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  return `RES-${stamp}`;
}

async function addTransaction({ date, particular, type, amount, userId }) {
  if (!['profit', 'expense'].includes(type)) {
    const error = new Error("type must be 'profit' or 'expense'");
    error.statusCode = 400;
    throw error;
  }

  if (amount < 0) {
    const error = new Error('Amount cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  const openingState = await repository.findOpeningState();
  if (!openingState) {
    const error = new Error('Reserves have not been set up yet. Complete opening-state setup first.');
    error.statusCode = 400;
    throw error;
  }

  const previous = await repository.findMostRecentTransaction();

  // Start from either the previous transaction's running totals,
  // or the migrated opening state if this is the very first entry.
  const priorCumulativeProfit = previous
    ? Number(previous.cumulative_profit)
    : Number(openingState.opening_cumulative_profit);
  const priorCumulativeExpense = previous
    ? Number(previous.cumulative_expense)
    : Number(openingState.opening_cumulative_expense);
  const priorBalance = previous
    ? Number(previous.balance)
    : Number(openingState.opening_balance);

  const newCumulativeProfit =
    type === 'profit' ? priorCumulativeProfit + Number(amount) : priorCumulativeProfit;
  const newCumulativeExpense =
    type === 'expense' ? priorCumulativeExpense + Number(amount) : priorCumulativeExpense;
  const newBalance =
    type === 'profit' ? priorBalance + Number(amount) : priorBalance - Number(amount);

  return repository.createTransaction({
    reference_number: buildReferenceNumber(),
    date,
    particular,
    type,
    amount,
    cumulative_profit: newCumulativeProfit,
    cumulative_expense: newCumulativeExpense,
    balance: newBalance,
    created_by: userId,
  });
}

async function listTransactions() {
  return repository.findAllTransactions();
}


module.exports = { setupOpeningState, getOpeningState, addTransaction, listTransactions };