const db = require('../config/db');

// Get all questions
const getAllQuestions = async () => {
  const [rows] = await db.promise().query('SELECT * FROM questions');
  return rows;
};

// Get a question by ID
const getQuestionById = async (id) => {
  const [rows] = await db.promise().query('SELECT * FROM questions WHERE id = ?', [id]);
  return rows.length > 0 ? rows[0] : null;
};

const createQuestion = async (questionData) => {
  const {
    userID,
    question,
    brand,
    serial_number,
    pounds,
    year,
    category,
    tags,
    file,
    image,
  } = questionData;

  // Insert question and return the insertId
  const [result] = await db.promise().query(
    'INSERT INTO questions (user_id, question, brand, serial_number, pounds, year, category, file, image, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userID, question, brand, serial_number, pounds, year, category, file, image, tags]
  );

  return result.insertId; // Return the ID of the newly inserted question
};

const insertAnswer = async (answerData) => {
  const { question_id, answer, user_id, is_who } = answerData;

  // Insert the GPT-generated answer into the answers table
  await db.promise().query(
    'INSERT INTO answers (question_id, answer, user_id, isWho) VALUES (?, ?, ?, ?)',
    [question_id, answer, user_id, is_who]
  );
};

// Update a question by ID
const updateQuestion = async (id, updates) => {
  const queryParts = [];
  const values = [];

  for (const key in updates) {
    queryParts.push(`${key} = ?`);
    values.push(updates[key]);
  }
  values.push(id);

  const query = `UPDATE questions SET ${queryParts.join(', ')} WHERE id = ?`;
  await db.promise().query(query, values);
};

// Delete a question by ID
const deleteQuestion = async (id) => {
  await db.promise().query('DELETE FROM questions WHERE id = ?', [id]);
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  insertAnswer
};
