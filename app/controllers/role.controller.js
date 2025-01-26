const { fetchAllRoles, createRole, findRoleByName, createRoleQuestion, fetchAllRolesQuestions, findRoleById } = require('../models/role.model');

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

// Create a new Role
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

// Get question by role_id
const getQuestionByRoldId = async (req, res) => {
    const { id } = req.params;

    await fetchAllRolesQuestions(id, (err, results) => {
        if (err) {
            console.error('Error fetching question:', err.message);
            return res.status(500).send('Database query error');
        }
        return res.status(201).json({ data: results });
    });
};

// Create a new question
const addRoleQuestion = async (req, res) => {
    const { id, question } = req.body;

    const existingRole = await findRoleById(id);

    if (!existingRole) {
      return res.status(400).json({ message: 'Not exist role' });
    }

    await createRoleQuestion(id, question);
    return res.status(201).json({ message: "Role question added successfully"});
};

module.exports = { getAllRoles, addRole, getQuestionByRoldId, addRoleQuestion };
