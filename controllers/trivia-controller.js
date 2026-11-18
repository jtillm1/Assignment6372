/*
  Name: Jace Tillman
  Date: 11.17.2026
  CSC 372-01

  Controller for Triviabook. Validates requests and builds responses for the
  trivia endpoints.
*/
let model = require('../models/trivia-model');

let DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * Checks that a value is a non-empty string after trimming.
 * @param {*} value - value to check
 * @return {boolean} True if value is a non-blank string
 */
function isFilled(value) {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * GET /triviabook/topics - responds with all topic names.
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @return {Promise<void>}
 */
async function listTopics(req, res) {
  try {
    res.json(await model.getTopics());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * GET /triviabook/topic/:topic - responds with a topic's questions.
 * Optional query parameters: limit (positive integer), difficulty.
 * Responds 400 for invalid query values and 404 for an unknown topic.
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @return {Promise<void>}
 */
async function listQuestions(req, res) {
  try {
    let topic = req.params.topic.trim().toLowerCase();
    let { limit, difficulty } = req.query;

    if (difficulty !== undefined && !DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or hard' });
    }
    if (limit !== undefined && !/^[1-9]\d*$/.test(limit)) {
      return res.status(400).json({ error: 'limit must be a positive integer' });
    }
    if (!(await model.topicExists(topic))) {
      return res.status(404).json({ error: `Topic "${topic}" not found` });
    }

    let questions = await model.getQuestionsByTopic(
      topic,
      difficulty,
      limit ? Number(limit) : undefined
    );
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * GET /triviabook/random - responds with one random question, no answer.
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @return {Promise<void>}
 */
async function randomQuestion(req, res) {
  try {
    let question = await model.getRandomQuestion();
    if (!question) {
      return res.status(404).json({ error: 'No questions available' });
    }
    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * POST /triviabook/answer - body { id, guess }. Compares the guess to the answer
 * ignoring case and surrounding whitespace. Responds 400 if a parameter is
 * missing or invalid and 404 if the question id does not exist.
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @return {Promise<void>}
 */
async function checkAnswer(req, res) {
  try {
    let { id, guess } = req.body || {};

    if (id === undefined || id === null || !isFilled(guess)) {
      return res.status(400).json({ error: 'Both id and guess are required' });
    }
    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({ error: 'id must be an integer' });
    }

    let question = await model.getQuestionById(Number(id));
    if (!question) {
      return res.status(404).json({ error: `Question ${id} not found` });
    }

    let correct = guess.trim().toLowerCase() === question.answer.trim().toLowerCase();
    res.json({ correct, answer: question.answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * POST /triviabook/question/add - body { topic, question, answer, difficulty }.
 * Creates the topic if needed and responds with the topic's updated questions.
 * Responds 400 if a field is missing or difficulty is invalid.
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @return {Promise<void>}
 */
async function addQuestion(req, res) {
  try {
    let { topic, question, answer, difficulty } = req.body || {};

    if (![topic, question, answer, difficulty].every(isFilled)) {
      return res.status(400).json({
        error: 'topic, question, answer, and difficulty are all required',
      });
    }
    let cleanDifficulty = difficulty.trim().toLowerCase();
    if (!DIFFICULTIES.includes(cleanDifficulty)) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or hard' });
    }

    let cleanTopic = topic.trim().toLowerCase();
    await model.addQuestion({
      topic: cleanTopic,
      question: question.trim(),
      answer: answer.trim(),
      difficulty: cleanDifficulty,
    });

    res.status(201).json(await model.getQuestionsByTopic(cleanTopic));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listTopics, listQuestions, randomQuestion, checkAnswer, addQuestion };