const { fetchAllRoles, createRole, findRoleByName } = require('../models/role.model');

// Get all users
const getAllRoles = async (req, res) => {
    await fetchAllRoles((err, results) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            return res.status(500).send('Database query error');
        }
        return res.status(201).json({ data: results });
    });
};

const addRole = async (req, res) => {
    const { name } = req.body;

    try {
        const existingRole = await findRoleByName(name);

        if (existingRole) {
          return res.status(400).json({ message: 'already in use' });
        }

        await createRole(name);
        return res.status(201).json({ message: "Role added successfully"});
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAllRoles, addRole };
