const repository = require('./cement.repository');

function buildReferenceNumber() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  return `CMT-${stamp}`;
}

// Builds a default human-readable particular if the user didn't
// supply their own description, matching the existing paper
// ledger's style (e.g. "144 x 73" for a sale, "1000 bags" for a
// purchase).
function buildDefaultParticular(type, bags, pricePerBag) {
  return type === 'sale' ? `${bags} x ${pricePerBag}` : `${bags} bags`;
}

async function setupOpeningState({ asOfDate, balance, userId }) {
  const existing = await repository.findOpeningState();

  if (existing) {
    const error = new Error('Cement has already been set up. Opening state cannot be created twice.');
    error.statusCode = 409;
    throw error;
  }

  return repository.createOpeningState({
    as_of_date: asOfDate,
    opening_balance: balance,
    created_by: userId,
  });
}

async function getOpeningState() {
  return repository.findOpeningState();
}

async function addTransaction({ date, type, particular, bags, pricePerBag, userId }) {
  if (!['sale', 'purchase'].includes(type)) {
    const error = new Error("type must be 'sale' or 'purchase'");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(bags) || bags <= 0) {
    const error = new Error('bags must be a whole number greater than zero');
    error.statusCode = 400;
    throw error;
  }

  if (pricePerBag <= 0) {
    const error = new Error('pricePerBag must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  const openingState = await repository.findOpeningState();
  if (!openingState) {
    const error = new Error('Cement has not been set up yet. Complete opening-state setup first.');
    error.statusCode = 400;
    throw error;
  }

  const previous = await repository.findMostRecentTransaction();
  const priorBalance = previous ? Number(previous.balance) : Number(openingState.opening_balance);

  // These are the values a client can never be trusted to supply --
  // the backend is the only source of truth for amount, cr, dr, and
  // the resulting balance.
  const amount = bags * pricePerBag;
  const cr = type === 'sale' ? amount : 0;
  const dr = type === 'purchase' ? amount : 0;
  const newBalance = priorBalance + cr - dr;

  return repository.createTransaction({
    reference_number: buildReferenceNumber(),
    date,
    type,
    particular: particular || buildDefaultParticular(type, bags, pricePerBag),
    bags,
    price_per_bag: pricePerBag,
    amount,
    cr,
    dr,
    balance: newBalance,
    created_by: userId,
  });
}

async function listTransactions() {
  return repository.findAllTransactions();
}

async function getTransaction(transactionId) {
  const transaction = await repository.findTransactionById(transactionId);

  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  return transaction;
}

// Summary figures for the Cement dashboard/overview (item 15):
// current balance, total bags/value sold and purchased.
async function getSummary() {
  const openingState = await repository.findOpeningState();
  const transactions = await repository.findAllTransactions();

  const currentBalance = transactions.length > 0
    ? Number(transactions[transactions.length - 1].balance)
    : (openingState ? Number(openingState.opening_balance) : 0);

  const totals = transactions.reduce(
    (acc, tx) => {
      if (tx.type === 'sale') {
        acc.totalBagsSold += tx.bags;
        acc.totalSalesValue += Number(tx.amount);
      } else {
        acc.totalBagsPurchased += tx.bags;
        acc.totalPurchaseValue += Number(tx.amount);
      }
      return acc;
    },
    { totalBagsSold: 0, totalBagsPurchased: 0, totalSalesValue: 0, totalPurchaseValue: 0 }
  );

  return {
    currentBalance,
    ...totals,
    netBagMovement: totals.totalBagsPurchased - totals.totalBagsSold,
  };
}

module.exports = {
  setupOpeningState,
  getOpeningState,
  addTransaction,
  listTransactions,
  getTransaction,
  getSummary,
};