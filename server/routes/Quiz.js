const express = require('express');
const router = express.Router();
const {createQuiz, deleteQuiz, getQuizDetails, getSubsectionIdsWithQuizzes, submitQuiz, getSubmittedQuizzes } = require('../controllers/Quiz');
const {auth} = require('../middlewares/auth');

// Route to create a new quiz
router.post('/create', auth, createQuiz);
// Route to delete a quiz by subsection ID
router.delete('/delete/:subsectionId', auth, deleteQuiz);
// Route to get quiz details by subsection ID
router.get('/details/:subsectionId', auth, getQuizDetails);
// Route to get all subsection IDs with quizzes for a specific course
router.get('/subsectionIds/:courseId', auth, getSubsectionIdsWithQuizzes);
// Route to submit quiz answers
router.post('/submit', auth, submitQuiz);
router.get('/submittedQuizes/:courseId', auth, getSubmittedQuizzes)

module.exports = router;