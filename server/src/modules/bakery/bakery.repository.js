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

module.exports = { findMostRecentDay, findDayByDate, createDay };