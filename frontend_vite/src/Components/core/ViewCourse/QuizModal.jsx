import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { submitQuiz } from "../../../services/operations/quizAPI";
import { useDispatch, useSelector } from "react-redux";
import { setReloadQuizzesDetails } from "../../../slices/quizSlice";

const QuizModal = ({ onClose, quiz }) => {
    console.log("QuizModal", quiz);
  const [answers, setAnswers] = useState({}); // given by user
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { selectedQuizSubSectionId, submittedQuizzesDetails } = useSelector((state) => state.quizDetails);

  const dispatch = useDispatch();

  const handleOptionChange = (qId, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const clearSelection = (qId) => {
    if (submitted) return;
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[qId];
      return updated;
    });
  };

  const handleRetake = () => {
    setAnswers({});
    setScore(0);
    setSubmitted(false);
  }

  const handleSubmit = async () => {
    const unanswered = quiz.questions.some((q) => !answers.hasOwnProperty(q._id));
    if (unanswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    await submitQuiz(selectedQuizSubSectionId, answers);

    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (answers[q._id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
    dispatch(setReloadQuizzesDetails(prev => !prev));

    toast.success(`You scored ${correctCount} out of ${quiz.questions.length}`);
  };

  useEffect(() => {
    // prefil the answers if the quiz is already submitted
    if (submittedQuizzesDetails && submittedQuizzesDetails[selectedQuizSubSectionId]) {
        console.log("submittedQuizzesDetails in useEffect", submittedQuizzesDetails);
        const quizDetails = submittedQuizzesDetails[selectedQuizSubSectionId];
        setAnswers(quizDetails.answers);
        setScore(quizDetails.scoredPoints);
        setSubmitted(true);
    } else {
        setAnswers({});
        setScore(0);
        setSubmitted(false);
    }
  }, [submittedQuizzesDetails, selectedQuizSubSectionId]);

  return (
    <div className="absolute top-0 left-0 h-full z-10 w-full flex items-center justify-center bg-black bg-opacity-50 text-richblack-5">
      <div className="w-full h-full overflow-y-auto rounded-lg bg-richblack-900 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-1">{quiz.title}</h2>
        <p className="text-richblack-200 mb-6">{quiz.description}</p>

        {quiz.questions.map((question, qIndex) => (
          <div
            key={question._id}
            className="mb-6 border-b border-richblack-600 pb-4"
          >
            <h3 className="font-semibold text-lg mb-2">
              Q{qIndex + 1}. {question.question}
            </h3>
            <div className="space-y-2 pl-4">
              {question.options.map((option, oIndex) => {
                const isSelected = answers[question._id] === option;
                const isCorrect = question.correctAnswer === option;
                const showResult = submitted;

                let textColor = "text-richblack-100";
                if (showResult) {
                  if (isCorrect) {
                    textColor = "text-green-400";
                  } else if (isSelected && !isCorrect) {
                    textColor = "text-red-500";
                  }
                }

                return (
                  <label
                    key={oIndex}
                    className={`flex items-center gap-2 ${textColor}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleOptionChange(question._id, option)}
                      className="form-checkbox text-yellow-400 bg-richblack-700 border-richblack-600"
                      disabled={submitted}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
            {!submitted && (
              <button
                className="mt-2 text-sm text-yellow-400 hover:underline"
                onClick={() => clearSelection(question._id)}
              >
                Clear selection
              </button>
            )}
          </div>
        ))}

        {submitted && (
          <div className="text-lg font-medium text-green-400 mb-4">
            Your Score: {score} / {quiz.questions.length}
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-richblack-700 hover:bg-richblack-600 text-richblack-100"
          >
            Close
          </button>
          {!submitted && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-richblack-900"
            >
              Submit Quiz
            </button>
          )}
          {submitted && (
            <button
              onClick={handleRetake}
              className="px-4 py-2 rounded bg-yellow-300 hover:bg-yellow-600 text-richblack-900"
            >
              Retake Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
