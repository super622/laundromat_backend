const db = require('../config/db');

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
      qu.user_name AS question_user_name, 
      qu.email AS question_user_email, 
      qu.level AS question_user_level, 
      qu.user_role AS question_user_role,
      a.id AS answer_id, 
      a.answer, 
      a.user_id AS answer_user_id, 
      au.user_name AS answer_user_name, 
      a.created_at AS answer_created_at, 
      a.updated_at AS answer_updated_at, 
      a.isWho,
      COALESCE(likes.count, 0) AS likes_count,
      COALESCE(dislikes.count, 0) AS dislikes_count
    FROM 
      questions q
    LEFT JOIN users qu ON q.user_id = qu.id
    LEFT JOIN (
      SELECT a1.*
      FROM answers a1
      INNER JOIN (
            SELECT question_id, MIN(created_at) AS min_created_at
            FROM answers
            GROUP BY question_id
      ) a2 ON a1.question_id = a2.question_id AND a1.created_at = a2.min_created_at
    ) a ON q.id = a.question_id
    LEFT JOIN users au ON a.user_id = au.id
    LEFT JOIN (
            SELECT question_id, COUNT(*) AS count
            FROM likes_and_dislikes
            WHERE type = 1
            GROUP BY question_id
    ) likes ON q.id = likes.question_id
    LEFT JOIN (
            SELECT question_id, COUNT(*) AS count
            FROM likes_and_dislikes
            WHERE type = 0
            GROUP BY question_id
    ) dislikes ON q.id = dislikes.question_id
    ORDER BY q.id DESC;
  `;

  const [rows] = await db.promise().query(query);
  const questionsMap = {};

  rows.forEach((row, index) => {
    if (!questionsMap[index]) {
      questionsMap[index] = {
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
          : null,
        likes_count: row.likes_count || 0,
        dislikes_count: row.dislikes_count || 0,
        answers: [],
      };
    }

    if (row.answer_id) {
      questionsMap[index].answers.push({
        answer_id: row.answer_id,
        answer: row.answer,
        user_id: row.answer_user_id,
        user_name: row.answer_user_name,
        created_at: row.answer_created_at,
        updated_at: row.answer_updated_at,
        isWho: row.isWho,
      });
    }
  });

  return Object.values(questionsMap);
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

const createOrUpdateAnswer = async (data) => {
  const { question_id, user_id, answer, isWho } = data;

  try {
    const [rows] = await db.promise().query('SELECT * FROM answers WHERE question_id = ? and user_id = ?', [question_id, user_id]);
    if (rows.length > 0) {
      await db.promise().query(
        'UPDATE answers SET answer = ?, isWho = ?, updated_at = NOW() WHERE question_id = ? AND user_id = ?',
        [answer, isWho, question_id, user_id]
      );

      return "updated";
    } else  {
      await db.promise().query(
        'INSERT INTO answers (question_id, user_id, answer, isWho, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [question_id, user_id, answer, isWho]
      );

      return "insert";
    }
  } catch (error) {
    console.error(`Database error: ${error.message}`);
    throw new Error('Database operation failed');
  }
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

const getAllQuestionsWithAnswersByID = async (user_id) => {
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
      qu.user_name AS question_user_name, 
      qu.email AS question_user_email, 
      qu.level AS question_user_level, 
      qu.user_role AS question_user_role,
      a.id AS answer_id, 
      a.answer, 
      a.user_id AS answer_user_id, 
      au.user_name AS answer_user_name, 
      a.created_at AS answer_created_at, 
      a.updated_at AS answer_updated_at, 
      a.isWho,
      COALESCE(likes.count, 0) AS likes_count,
      COALESCE(dislikes.count, 0) AS dislikes_count
    FROM 
      questions q
    LEFT JOIN 
      users qu ON q.user_id = qu.id
    LEFT JOIN 
      answers a ON q.id = a.question_id AND a.user_id = ?
    LEFT JOIN 
      users au ON a.user_id = au.id
    LEFT JOIN (
      SELECT question_id, COUNT(*) AS count
      FROM likes_and_dislikes
      WHERE type = 1
      GROUP BY question_id
    ) likes ON q.id = likes.question_id
    LEFT JOIN (
      SELECT question_id, COUNT(*) AS count
      FROM likes_and_dislikes
      WHERE type = 0
      GROUP BY question_id
    ) dislikes ON q.id = dislikes.question_id
    WHERE q.user_id = ?
      AND (a.id IS NOT NULL OR NOT EXISTS (
          SELECT 1 FROM answers WHERE answers.question_id = q.id AND answers.user_id != ?
      ))
    ORDER BY q.id DESC;    
  `;

  const [rows] = await db.promise().query(query, [user_id, user_id, user_id]);

  // Group answers and likes/dislikes by question
  const questionsMap = {};

  rows.forEach((row, index) => {

    if (!questionsMap[index]) {
      questionsMap[index] = {
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
          : null,
        likes_count: row.likes_count || 0,
        dislikes_count: row.dislikes_count || 0,
        answers: [],
      };
    }

    if (row.answer_id) {
      questionsMap[index].answers.push({
        answer_id: row.answer_id,
        answer: row.answer,
        user_id: row.answer_user_id,
        user_name: row.answer_user_name,
        created_at: row.answer_created_at,
        updated_at: row.answer_updated_at,
        isWho: row.isWho,
      });
    }
  });

  return Object.values(questionsMap);
};

const getAllQuestionsWithAnswersBySearch = async (search, categories) => {
  // Determine whether to apply category filter
  const hasCategories = categories && categories.length > 0;

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
      qu.user_name AS question_user_name, 
      qu.email AS question_user_email, 
      qu.level AS question_user_level, 
      qu.user_role AS question_user_role,
      a.id AS answer_id, 
      a.answer, 
      a.user_id AS answer_user_id, 
      au.user_name AS answer_user_name, 
      a.created_at AS answer_created_at, 
      a.updated_at AS answer_updated_at, 
      a.isWho,
      COALESCE(likes.count, 0) AS likes_count,
      COALESCE(dislikes.count, 0) AS dislikes_count
    FROM 
      questions q
    LEFT JOIN 
      users qu ON q.user_id = qu.id
    LEFT JOIN 
      answers a ON q.id = a.question_id
    LEFT JOIN 
      users au ON a.user_id = au.id
    LEFT JOIN (
      SELECT question_id, COUNT(*) AS count
      FROM likes_and_dislikes
      WHERE type = 1
      GROUP BY question_id
    ) likes ON q.id = likes.question_id
    LEFT JOIN (
      SELECT question_id, COUNT(*) AS count
      FROM likes_and_dislikes
      WHERE type = 0
      GROUP BY question_id
    ) dislikes ON q.id = dislikes.question_id
    WHERE 
      q.question LIKE CONCAT('%', ?, '%') -- Search by question text
      ${hasCategories ? `AND q.category IN (${categories.map(() => '?').join(',')})` : ''}
    ORDER BY q.id DESC;
  `;

  // Build parameters dynamically
  const params = hasCategories ? [search, ...categories] : [search];

  const [rows] = await db.promise().query(query, params);

  // Group answers and likes/dislikes by question
  const questionsMap = {};

  rows.forEach((row, index) => {

    if (!questionsMap[index]) {
      questionsMap[index] = {
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
          : null,
        likes_count: row.likes_count || 0,
        dislikes_count: row.dislikes_count || 0,
        answers: [],
      };
    }

    if (row.answer_id) {
      questionsMap[index].answers.push({
        answer_id: row.answer_id,
        answer: row.answer,
        user_id: row.answer_user_id,
        user_name: row.answer_user_name,
        created_at: row.answer_created_at,
        updated_at: row.answer_updated_at,
        isWho: row.isWho,
      });
    }
  });

  return Object.values(questionsMap);
};

const getAllQuestionsWithAnswersBySearchByUserId = async (user_id, search, categories) => {
  // Determine whether to apply category filter
  const hasCategories = categories && categories.length > 0;

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
      qu.user_name AS question_user_name, 
      qu.email AS question_user_email, 
      qu.level AS question_user_level, 
      qu.user_role AS question_user_role,
      a.id AS answer_id, 
      a.answer, 
      a.user_id AS answer_user_id, 
      au.user_name AS answer_user_name, 
      a.created_at AS answer_created_at, 
      a.updated_at AS answer_updated_at, 
      a.isWho,
      COALESCE(likes.count, 0) AS likes_count,
      COALESCE(dislikes.count, 0) AS dislikes_count
    FROM 
      questions q
    LEFT JOIN 
      users qu ON q.user_id = qu.id
    LEFT JOIN 
      answers a ON q.id = a.question_id AND a.user_id = ?
    LEFT JOIN 
      users au ON a.user_id = au.id
    LEFT JOIN (
      SELECT question_id, COUNT(*) AS count
      FROM likes_and_dislikes
      WHERE type = 1
      GROUP BY question_id
    ) likes ON q.id = likes.question_id
    LEFT JOIN (
      SELECT question_id, COUNT(*) AS count
      FROM likes_and_dislikes
      WHERE type = 0
      GROUP BY question_id
    ) dislikes ON q.id = dislikes.question_id
    WHERE 
      q.user_id = ?
      AND (
        q.question LIKE CONCAT('%', ?, '%') -- Search by question text
        ${hasCategories ? `OR q.category IN (${categories.map(() => '?').join(',')})` : ''}
      )
    ORDER BY q.id DESC;
  `;

  // Build parameters dynamically
  const params = hasCategories ? [user_id, user_id, search, ...categories] : [user_id, user_id, search];

  const [rows] = await db.promise().query(query, params);

  // Group answers and likes/dislikes by question
  const questionsMap = {};

  rows.forEach((row, index) => {

    if (!questionsMap[index]) {
      questionsMap[index] = {
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
          : null,
        likes_count: row.likes_count || 0,
        dislikes_count: row.dislikes_count || 0,
        answers: [],
      };
    }

    if (row.answer_id) {
      questionsMap[index].answers.push({
        answer_id: row.answer_id,
        answer: row.answer,
        user_id: row.answer_user_id,
        user_name: row.answer_user_name,
        created_at: row.answer_created_at,
        updated_at: row.answer_updated_at,
        isWho: row.isWho,
      });
    }
  });

  return Object.values(questionsMap);
};


module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  insertAnswer,
  getAllQuestionsWithAnswers,
  createOrUpdateAnswer,
  getAllQuestionsWithAnswersByID,
  getAllQuestionsWithAnswersBySearch,
  getAllQuestionsWithAnswersBySearchByUserId
};
