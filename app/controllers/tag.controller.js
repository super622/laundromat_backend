const { fetchAllTags, findTagByName, createTag } = require('../models/tag.model');

// Get all tags
const getAllTags = async (req, res) => {
    await fetchAllTags((err, results) => {
        if (err) {
            console.error('Error fetching tags:', err.message);
            return res.status(500).send('Database query error');
        }
        return res.status(201).json({ data: results });
    });
};

// Create a new tag
const addTag = async (req, res) => {
    const { name } = req.body;

    try {
        const existingTag = await findTagByName(name);

        if (existingTag) {
            return res.status(400).json({ message: 'already in use' });
        }

        await createTag(name);
        return res.status(201).json({ message: "Tag added successfully"});
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAllTags, addTag };
