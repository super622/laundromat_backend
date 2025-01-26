const { fetchAllPlans, createPlan, findPlanByName, fetchAllPlanFeatures, createPlanFeature, findPlanById } = require('../models/plan.model');

// Get all plans
const getAllPlans = async (req, res) => {
    await fetchAllPlans((err, results) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            return res.status(500).send('Database query error');
        }
        return res.status(201).json({ data: results });
    });
};

// Create a new plan
const addPlan = async (req, res) => {
    const { name, price, discount } = req.body;

    try {
        const existingPlan = await findPlanByName(name);

        if (existingPlan) {
            return res.status(400).json({ message: 'already in use' });
        }

        await createPlan(name, price, discount);
        return res.status(201).json({ message: "Plan added successfully" });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get feature by plan_id
const getFeaturesById = async (req, res) => {
    const { id } = req.params;

    await fetchAllPlanFeatures(id, (err, results) => {
        if (err) {
            console.error('Error fetching feature:', err.message);
            return res.status(500).send('Database query error');
        }
        return res.status(201).json({ data: results });
    });
};

// Create a new feature
const addFeature = async (req, res) => {
    const { id, feature } = req.body;

    const existingPlan = await findPlanById(id);

    if (!existingPlan) {
      return res.status(400).json({ message: 'Not exist plan' });
    }

    await createPlanFeature(id, feature);
    return res.status(201).json({ message: "Plan feature added successfully" });
};

module.exports = { getAllPlans, addPlan, getFeaturesById, addFeature };
