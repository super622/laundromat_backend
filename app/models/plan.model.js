const db = require('../config/db');

// Find exist plan
const findPlanByName = async (name) => {
  const [plan] = await db.promise().query('SELECT * FROM payment_plans WHERE plan_name = ?', [name]);
  return plan.length > 0 ? plan[0] : null;
};

// Fetch all plan
const fetchAllPlans = (callback) => {
  const sql = ('SELECT * FROM payment_plans');
  db.query(sql, callback);
};

// Create a new plan
const createPlan = async (name, price, discount) => {
  await db.promise().query('INSERT INTO payment_plans (plan_name, plan_price, plan_discount) VALUES (?, ?, ?)', [
    name,
    price,
    discount
  ]);
  return true;
};


module.exports = { findPlanByName, createPlan, fetchAllPlans };
