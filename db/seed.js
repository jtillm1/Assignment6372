/*
  Name: Jace Tillman
  Date: 11.17.2026
  CSC 372-01

  Creates the tables and loads the seed data. Run with: npm run seed
*/
let fs = require('fs');
let path = require('path');
let pool = require('./pool');

let seedData = {
  science: [
    { question: 'What planet is known as the Red Planet?', answer: 'Mars', difficulty: 'easy' },
    { question: 'What is the chemical symbol for gold?', answer: 'Au', difficulty: 'medium' },
    { question: 'What is the powerhouse of the cell?', answer: 'Mitochondria', difficulty: 'easy' },
  ],
  geography: [
    { question: 'What is the capital of Australia?', answer: 'Canberra', difficulty: 'medium' },
    { question: 'Which river flows through Cairo?', answer: 'The Nile', difficulty: 'easy' },
  ],
};

/**
 * Resets the schema, then inserts every seed topic and its questions.
 * @return {Promise<void>}
 */
async function seed() {
  let schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  for (let [topic, questions] of Object.entries(seedData)) {
    let { rows } = await pool.query(
      'INSERT INTO topics (name) VALUES ($1) RETURNING id',
      [topic]
    );
    for (let q of questions) {
      await pool.query(
        'INSERT INTO questions (topic_id, question, answer, difficulty) VALUES ($1, $2, $3, $4)',
        [rows[0].id, q.question, q.answer, q.difficulty]
      );
    }
  }
  console.log('Database seeded.');
}

seed()
  .catch((err) => console.error('Seeding failed:', err))
  .finally(() => pool.end());