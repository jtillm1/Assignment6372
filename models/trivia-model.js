/*
  Name: Jace Tillman
  Date: 11.17.2026
  CSC 372-01

  Model for Triviabook. Contains all database access for topics and questions.
*/
let pool = require('../db/pool');

/**
 * Gets every topic name.
 * @return {Promise<string[]>} Topic names in alphabetical order
 */
async function getTopics() {
  let { rows } = await pool.query('SELECT name FROM topics ORDER BY name');
  return rows.map((r) => r.name);
}

/**
 * Checks whether a topic exists.
 * @param {string} name - topic name
 * @return {Promise<boolean>} True if the topic exists
 */
async function topicExists(name) {
  let { rowCount } = await pool.query('SELECT 1 FROM topics WHERE name = $1', [name]);
  return rowCount > 0;
}

/**
 * Gets the questions for a topic.
 * @param {string} topic - topic name
 * @param {string} [difficulty] - easy, medium, or hard; omit for all
 * @param {number} [limit] - maximum number of questions; omit for all
 * @return {Promise<object[]>} Question rows (id, question, answer, difficulty)
 */
async function getQuestionsByTopic(topic, difficulty, limit) {
  let params = [topic];
  let sql = `
    SELECT q.id, q.question, q.answer, q.difficulty
    FROM questions q
    JOIN topics t ON t.id = q.topic_id
    WHERE t.name = $1`;

  if (difficulty) {
    params.push(difficulty);
    sql += ` AND q.difficulty = $${params.length}`;
  }
  sql += ' ORDER BY q.id';
  if (limit) {
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }

  let { rows } = await pool.query(sql, params);
  return rows;
}

/**
 * Gets one random question without its answer.
 * @return {Promise<object|undefined>} Row (id, topic, question, difficulty), or
 *   undefined if the database has no questions
 */
async function getRandomQuestion() {
  let { rows } = await pool.query(`
    SELECT q.id, t.name AS topic, q.question, q.difficulty
    FROM questions q
    JOIN topics t ON t.id = q.topic_id
    ORDER BY RANDOM()
    LIMIT 1`);
  return rows[0];
}

/**
 * Gets a question's id and answer.
 * @param {number} id - question id
 * @return {Promise<object|undefined>} Row (id, answer), or undefined if not found
 */
async function getQuestionById(id) {
  let { rows } = await pool.query('SELECT id, answer FROM questions WHERE id = $1', [id]);
  return rows[0];
}

/**
 * Inserts a question, creating its topic first if the topic does not exist.
 * @param {object} newQuestion - the question to add
 * @param {string} newQuestion.topic - topic name
 * @param {string} newQuestion.question - question text
 * @param {string} newQuestion.answer - correct answer
 * @param {string} newQuestion.difficulty - easy, medium, or hard
 * @return {Promise<void>}
 */
async function addQuestion({ topic, question, answer, difficulty }) {
  let topicResult = await pool.query(
    `INSERT INTO topics (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [topic]
  );
  await pool.query(
    'INSERT INTO questions (topic_id, question, answer, difficulty) VALUES ($1, $2, $3, $4)',
    [topicResult.rows[0].id, question, answer, difficulty]
  );
}

module.exports = {
  getTopics,
  topicExists,
  getQuestionsByTopic,
  getRandomQuestion,
  getQuestionById,
  addQuestion,
};