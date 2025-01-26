const { fetchAllPlans, createPlan, findPlanByName } = require('../models/plan.model');

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
        return res.status(201).json({ message: "Plan added successfully"});
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAllPlans, addPlan };
