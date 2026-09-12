const supabase = require('../../config/supabaseClient');

// Finds the single most recent bakery day (by date), regardless of
// status. Returns null if no days exist yet.
async function findMostRecentDay() {
  const { data, error } = await supabase
    .from('bakery_days')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Finds a day by its exact calendar date, or null if none exists.
async function findDayByDate(date) {
  const { data, error } = await supabase
    .from('bakery_days')
    .select('*')
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Inserts a new bakery day row and returns it.
async function createDay(dayData) {
  const { data, error } = await supabase
    .from('bakery_days')
    .insert(dayData)
    .select()
    .single();

  if (error) throw error;
  return data;
}


// Finds a single day by its id, or null if it doesn't exist.
async function findDayById(dayId) {
  const { data, error } = await supabase
    .from('bakery_days')
    .select('*')
    .eq('id', dayId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Inserts a new sale row for a given day.
async function createSale(saleData) {
  const { data, error } = await supabase
    .from('bakery_sales')
    .insert(saleData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Returns all sales for a given day, oldest first.
async function findSalesByDayId(dayId) {
  const { data, error } = await supabase
    .from('bakery_sales')
    .select('*')
    .eq('day_id', dayId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Updates a day's stored totals (sales/expenses/closing balance).
async function updateDayTotals(dayId, totals) {
  const { data, error } = await supabase
    .from('bakery_days')
    .update({ ...totals, updated_at: new Date().toISOString() })
    .eq('id', dayId)
    .select()
    .single();

  if (error) throw error;
  return data;
}



async function deleteSale(saleId) {
  const { error } = await supabase.from('bakery_sales').delete().eq('id', saleId);
  if (error) throw error;
}


async function createExpense(expenseData) {
  const { data, error } = await supabase
    .from('bakery_expenses')
    .insert(expenseData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function findExpensesByDayId(dayId) {
  const { data, error } = await supabase
    .from('bakery_expenses')
    .select('*')
    .eq('day_id', dayId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

async function deleteExpense(expenseId) {
  const { error } = await supabase.from('bakery_expenses').delete().eq('id', expenseId);
  if (error) throw error;
}

module.exports = {
  findMostRecentDay,
  findDayByDate,
  findDayById,
  createDay,
  createSale,
  createExpense,
  findExpensesByDayId,
  deleteExpense,
  findSalesByDayId,
  updateDayTotals,
  deleteSale
};


