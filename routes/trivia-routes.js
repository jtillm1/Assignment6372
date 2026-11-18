/*
  Name: Jace Tillman
  Date: 11.17.2026
  CSC 372-01

  Maps the /triviabook endpoints to their controller functions.
*/
let express = require('express');
let controller = require('../controllers/trivia-controller');

let router = express.Router();

router.get('/topics', controller.listTopics);
router.get('/topic/:topic', controller.listQuestions);
router.get('/random', controller.randomQuestion);
router.post('/answer', controller.checkAnswer);
router.post('/question/add', controller.addQuestion);

module.exports = router;