const db = require('../config/db');

// Get all questions
const getAllQuestions = async () => {
  const [rows] = await db.promise().query('SELECT * FROM questions');
  return rows;
};

// Get all questions with answers
const getAllQuestionsWithAnswers = async () => {
  const query = `
    SELECT 
      q.id AS question_id, 
      q.question, 
      q.brand, 
      q.serial_number, 
      q.pounds, 
      q.year, 
      q.category, 
      q.file, 
      q.image, 
      q.tags, 
      q.created_at AS question_created_at, 
      q.updated_at AS question_updated_at,
      q.user_id AS question_user_id, 
      u.user_name AS question_user_name, 
      u.email AS question_user_email, 
      u.level AS question_user_level, 
      u.user_role AS question_user_role,
      a.id AS answer_id, 
      a.answer, 
      a.user_id AS answer_user_id, 
      a.created_at AS answer_created_at, 
      a.updated_at AS answer_updated_at, 
      a.isWho
    FROM 
      questions q
    LEFT JOIN 
      answers a 
    ON 
      q.id = a.question_id
    LEFT JOIN 
      users u
    ON 
      q.user_id = u.id;
  `;

  const [rows] = await db.promise().query(query);

  // Group answers by question
  const questionsMap = {};

  rows.forEach((row) => {
    const questionId = row.question_id;

    if (!questionsMap[questionId]) {
      questionsMap[questionId] = {
        question_id: row.question_id,
        question: row.question,
        brand: row.brand,
        serial_number: row.serial_number,
        pounds: row.pounds,
        year: row.year,
        category: row.category,
        file: row.file,
        image: row.image,
        tags: row.tags,
        created_at: row.question_created_at,
        updated_at: row.question_updated_at,
        user: row.question_user_id
          ? {
              user_id: row.question_user_id,
              user_name: row.question_user_name,
              email: row.question_user_email,
              level: row.question_user_level,
              user_role: row.question_user_role,
            }
          : null, // If no user is associated, set it to null
        answers: [],
      };
    }

    if (row.answer_id) {
      questionsMap[questionId].answers.push({
        answer_id: row.answer_id,
        answer: row.answer,
        user_id: row.answer_user_id,
        created_at: row.answer_created_at,
        updated_at: row.answer_updated_at,
        isWho: row.isWho,
      });
    }
  });

  // Convert questions map to an array
  return Object.values(questionsMap);
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
  insertAnswer,
  getAllQuestionsWithAnswers
};
