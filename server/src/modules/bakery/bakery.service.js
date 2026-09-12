const repository = require('./bakery.repository');

// Adds one calendar day to a 'YYYY-MM-DD' date string, returning
// a new 'YYYY-MM-DD' string. Done in UTC deliberately, so we never
// get an off-by-one error from local timezone/DST shifts.
function addOneDay(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

// Builds a reference number like BAK-20260912 from a date string.
function buildReferenceNumber(dateString) {
  return `BAK-${dateString.replace(/-/g, '')}`;
}

// The core business rule for creating a new bakery day:
// - the very first day ever created starts with opening_balance 0
// - every subsequent day must come immediately after the most
//   recent day, and that most recent day must be completed first
async function createDay(requestedDate) {
  const existingDay = await repository.findDayByDate(requestedDate);
  if (existingDay) {
    const error = new Error(`A day already exists for ${requestedDate}`);
    error.statusCode = 409; // Conflict
    throw error;
  }

  const previousDay = await repository.findMostRecentDay();

  let openingBalance;

  if (!previousDay) {
    // First day ever -- no prior balance to inherit.
    openingBalance = 0;
  } else {
    if (previousDay.status !== 'completed') {
      const error = new Error(
        `Cannot create a new day: ${previousDay.date} has not been completed yet`
      );
      error.statusCode = 400;
      throw error;
    }

    const expectedNextDate = addOneDay(previousDay.date);
    if (requestedDate !== expectedNextDate) {
      const error = new Error(
        `Days cannot be skipped. The next valid day is ${expectedNextDate}`
      );
      error.statusCode = 400;
      throw error;
    }

    openingBalance = previousDay.closing_balance;
  }

  const newDay = await repository.createDay({
    reference_number: buildReferenceNumber(requestedDate),
    date: requestedDate,
    opening_balance: openingBalance,
    total_sales: 0,
    total_expenses: 0,
    closing_balance: openingBalance, // no sales/expenses yet
    status: 'open',
  });

  return newDay;
}




// Recalculates and persists a day's totals based on its current
// sales and expenses. Called after any sale or expense is added,
// edited, or removed, so the stored totals never drift out of sync.
async function recalculateDayTotals(dayId) {
  const day = await repository.findDayById(dayId);
  const sales = await repository.findSalesByDayId(dayId);
  const expenses = await repository.findExpensesByDayId(dayId); // TODO: replace with repository.findExpensesByDayId once expenses exist (Chunk 3)
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const closingBalance = Number(day.opening_balance) + totalSales - totalExpenses;

  return repository.updateDayTotals(dayId, {
    total_sales: totalSales,
    total_expenses: totalExpenses,
    closing_balance: closingBalance,
  });
}

async function addSale(dayId, salesperson, amount) {
  const day = await repository.findDayById(dayId);

  if (!day) {
    const error = new Error('Day not found');
    error.statusCode = 404;
    throw error;
  }

  if (day.status === 'completed') {
    const error = new Error('Cannot add a sale to a completed day');
    error.statusCode = 400;
    throw error;
  }

  if (amount < 0) {
    const error = new Error('Amount cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  let newSale;
  try {
    newSale = await repository.createSale({ day_id: dayId, salesperson, amount });
  } catch (dbError) {
    if (dbError.code === '23505') {
      const error = new Error(`${salesperson} already has a sale recorded for this day`);
      error.statusCode = 409;
      throw error;
    }
    throw dbError;
  }

  try {
    return await recalculateDayTotals(dayId);
  } catch (recalcError) {
    // Roll back: the sale was inserted, but we couldn't safely
    // recalculate totals, so undo the insert rather than leave
    // the day in an inconsistent state.
    await repository.deleteSale(newSale.id);
    throw recalcError;
  }
}
async function listSales(dayId) {
  return repository.findSalesByDayId(dayId);
}

async function addExpense(dayId, description, amount) {
  const day = await repository.findDayById(dayId);

  if (!day) {
    const error = new Error('Day not found');
    error.statusCode = 404;
    throw error;
  }

  if (day.status === 'completed') {
    const error = new Error('Cannot add an expense to a completed day');
    error.statusCode = 400;
    throw error;
  }

  if (amount < 0) {
    const error = new Error('Amount cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  const newExpense = await repository.createExpense({ day_id: dayId, description, amount });

  try {
    return await recalculateDayTotals(dayId);
  } catch (recalcError) {
    await repository.deleteExpense(newExpense.id);
    throw recalcError;
  }
}

async function listExpenses(dayId) {
  return repository.findExpensesByDayId(dayId);
}

module.exports = { createDay, addSale, listSales, addExpense, listExpenses };