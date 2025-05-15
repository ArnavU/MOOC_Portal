const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// Controller to create a new quiz with its questions
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, courseId, subsectionId, questions } = req.body;

        // Validate required quiz fields
        if (!title || !description || !subsectionId) {
            return res.status(400).json({ message: 'Quiz title, description, and subsectionId are required.' });
        }

        // Create and save the quiz
        const quiz = new Quiz({ title, description, course: courseId, subsection: subsectionId });
        await quiz.save();

        // Validate and save each question
        if (Array.isArray(questions) && questions.length > 0) {
            const savedQuestions = [];

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];

                if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
                    return res.status(400).json({
                        message: `Question ${i + 1} must have a "question" string, exactly 4 "options", and a valid "correctAnswer".`
                    });
                }

                if (!q.options.includes(q.correctAnswer)) {
                    return res.status(400).json({
                        message: `In question ${i + 1}, the correct answer must match one of the provided options.`
                    });
                }

                const newQuestion = new Question({
                    serial: i + 1,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    quiz: quiz._id,
                });

                const savedQuestion = await newQuestion.save();
                savedQuestions.push(savedQuestion);
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            quizId: quiz._id,
        });

    } catch (error) {
        console.error("Quiz creation error:", error);
        return res.status(500).json({
            message: 'Error creating quiz',
            error: error.message,
        });
    }
};


exports.deleteQuiz = async (req, res) => {
    try {
        const { subsectionId } = req.params;
        if (!subsectionId) {
            return res.status(400).json({ message: 'subsectionId is required.' });
        }
        // Find the quiz associated with the given subsection
        const quiz = await Quiz.findOne({ subsection: subsectionId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found for the provided subsection.' });
        }

        // Delete all questions related to this quiz
        await Question.deleteMany({ quiz: quiz._id });

        // Delete the quiz
        await quiz.deleteOne({subsection: subsectionId});

        return res.status(200).json({ success: true, message: 'Quiz and its questions deleted successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting quiz', error: error.message });
    }
};

// Controller to get quiz details along with its questions using the subsection id
exports.getQuizDetails = async (req, res) => {
    try {
        const { subsectionId } = req.params;
        if (!subsectionId) {
            return res.status(400).json({ message: 'subsectionId is required.' });
        }
        
        // Find quiz by subsection id
        let quiz = await Quiz.find({ subsection: subsectionId }).sort({ createdAt: -1 }).limit(1);
        quiz = quiz?.[0]; 
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found for the provided subsection.' });
        }
        
        // Retrieve all questions associated with the quiz
        const questions = await Question.find({ quiz: quiz._id }).sort({ serial: 1 });
        
        // return res.status(200).json({ quiz, questions });
        return res.status(200).json({
            success: true,
            quizData: {
                subsectionId: quiz.subsection,
                title: quiz.title,
                description: quiz.description,
                questions: questions.map(q => ({
                    _id: q._id,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer
                }))
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving quiz details', error: error.message });
    }
};

exports.getSubsectionIdsWithQuizzes = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).json({ message: 'courseId is required.' });
        }
        const subSectionIds = await Quiz.find({ course: courseId }).distinct('subsection');
        return res.status(200).json({ success: true, subSectionIds });
    } catch (error) {
        console.error("Error retrieving subsection ids:", error);
        return res.status(500).json({ message: 'Error retrieving subsection ids', error: error.message });
    }
};


exports.submitQuiz = async (req, res) => {
    try {
        const { subSectionId, answers } = req.body;
        // Handle stringified answers (e.g., from Word/JSON-formatted input)
        if (typeof answers === 'string') {
            try {
                answers = JSON.parse(answers);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid JSON in answers." });
            }
        }

        const userId = req.user.id;
        if (!userId || !subSectionId || Object.keys(answers).length === 0) {
            return res.status(400).json({ message: 'userId, subSection, and an array of answers are required.' });
        }

        // delete previous answers for this user and subsection
        await Answer.deleteMany({ user: userId, subSectionId });

        const answerDocs = [];

        // Validate and process each answer
        for(const key in answers) {
            const question = key;
            const answer = answers[key];
            if (!question || !answer) {
                return res.status(400).json({
                    message: `Each answer must include a question id and an answer string (error at item ${i + 1}).`
                });
            }
        }

        // Create answer documents
        for (const key in answers) {
            const question = key;
            const answer = answers[key];

            answerDocs.push({
                user: userId,
                subSection: subSectionId,
                question,
                answer
            });
        }

        await Answer.insertMany(answerDocs);

        return res.status(201).json({ success: true, message: 'Quiz submitted successfully.' });
    } catch (error) {
        console.error("Quiz submission error:", error);
        return res.status(500).json({ message: 'Error submitting quiz', error: error.message });
    }
};

exports.getSubmittedQuizzes = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        if (!userId || !courseId) {
            return res.status(400).json({
                message: 'userId and courseId are required.'
            });
        }

        const quizzes = await Quiz.find({ course: courseId });
        const data = {};

        for (const quiz of quizzes) {
            // Get all submitted answers for the user in the quiz's subsection
            const answers = await Answer.find({
                user: userId,
                subSection: quiz.subsection
            });

            if (answers.length === 0) continue;

            const answerMapping = {};
            answers.forEach(item => {
                answerMapping[item.question] = item.answer;
            });

            // Retrieve quiz questions to compute points
            const questions = await Question.find({ quiz: quiz._id });
            const totalPoints = questions.length;
            let scoredPoints = 0;

            questions.forEach(q => {
                if (
                    answerMapping[q._id.toString()]?.toString().trim() ===
                    q.correctAnswer.toString().trim()
                ) {
                    scoredPoints++;
                }
            });

            data[quiz.subsection] = {
                totalPoints,
                scoredPoints,
                answers: answerMapping
            };
        }

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving submitted quizzes',
            error: error.message
        });
    }
};