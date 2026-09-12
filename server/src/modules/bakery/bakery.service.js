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

module.exports = { createDay };