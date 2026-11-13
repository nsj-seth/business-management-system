const repository = require('./farms.repository');

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function databaseError(error) {
  if (error.code === 'PGRST202' || error.code === '42883') {
    return httpError('Farms database setup is incomplete. Apply database/farms.sql in the BMS project.', 503);
  }
  if (error.code === '23503') {
    return httpError('Your account needs a matching user profile before recording Farms entries', 409);
  }
  if (error.code === '22023') return httpError(error.message, 400);
  return error;
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validAmount(value) {
  return typeof value === 'number' && Number.isFinite(value)
    && value >= 0 && value <= 999999999999.99
    && Math.abs(Math.round(value * 100) - value * 100) < 0.00001;
}

async function setupOpeningState({ asOfDate, balance, userId }) {
  if (!isValidDate(asOfDate) || !validAmount(balance)) {
    throw httpError('A valid opening date and nonnegative amount are required', 400);
  }
  if (await repository.findOpeningState()) {
    throw httpError('Farms opening balance has already been set', 409);
  }
  try {
    return await repository.createOpeningState({
      as_of_date: asOfDate,
      opening_balance: balance,
      created_by: userId,
    });
  } catch (error) {
    if (error.code === '23505') throw httpError('Farms opening balance has already been set', 409);
    throw databaseError(error);
  }
}

async function getOpeningState() {
  return repository.findOpeningState();
}

async function addTransaction({ date, particular, type, amount, userId }) {
  if (!isValidDate(date)) throw httpError('A valid date is required', 400);
  if (typeof particular !== 'string' || !particular.trim()) {
    throw httpError('Particular is required', 400);
  }
  if (!['credit', 'debit'].includes(type)) {
    throw httpError('Type must be credit or debit', 400);
  }
  if (!validAmount(amount)) throw httpError('Amount must be a valid nonnegative monetary value', 400);
  const opening = await repository.findOpeningState();
  if (!opening) throw httpError('Set the Farms opening balance before adding transactions', 400);
  if (date < opening.as_of_date) {
    throw httpError('Date cannot be earlier than the Farms opening date', 400);
  }
  try {
    return await repository.createTransaction({ date, particular: particular.trim(), type, amount, userId });
  } catch (error) {
    if (/opening balance|opening date|Invalid farm transaction/i.test(error.message)) {
      throw httpError(error.message, 400);
    }
    throw databaseError(error);
  }
}

async function listTransactions() {
  return repository.findAllTransactions();
}

async function getSummary() {
  try { return await repository.getSummary(); }
  catch (error) { throw databaseError(error); }
}

module.exports = { setupOpeningState, getOpeningState, addTransaction, listTransactions, getSummary };
