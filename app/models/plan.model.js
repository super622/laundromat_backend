const db = require('../config/db');

// Find exist plan
const findPlanByName = async (name) => {
  const [plan] = await db.promise().query('SELECT * FROM payment_plans WHERE plan_name = ?', [name]);
  return plan.length > 0 ? plan[0] : null;
};

const findPlanById = async (id) => {
    const [plan] = await db.promise().query('SELECT * FROM payment_plans WHERE id = ?', [id]);
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

// Fatch all plan features
const fetchAllPlanFeatures = (id, callback) => {
    const sql = 'SELECT * FROM payment_feature WHERE plan_id = ?';
    db.query(sql, [id], callback);
};

// Create a new plan feature
const createPlanFeature = async (id, feature) => {
    await db.promise().query('INSERT INTO payment_feature (plan_id, feature_name) VALUES (?, ?)', [
        id,
        feature
    ]);
    return true;
};

module.exports = { findPlanByName, createPlan, fetchAllPlans, fetchAllPlanFeatures, createPlanFeature, findPlanById };
