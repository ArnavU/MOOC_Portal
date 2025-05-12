import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RxCross2 } from 'react-icons/rx';
import { createQuiz, getQuizDetails, deleteQuiz } from '../../../../../services/operations/quizAPI';

const QuizModal = ({ modalData, setModalData, setResetSubSectionIds }) => {
  const [questions, setQuestions] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');


  const initializeEmptyQuestion = () => ({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });

    useEffect(() => {
        const fetchQuizDetails = async () => {
            if (modalData?.isExistingQuiz) {
                setLoading(true);
                try {
                    const result = await getQuizDetails(modalData.subSectionId);
                    setDescription(result.description || '');
                    setQuestions(result.questions || []);
                    setTitle(modalData.title); // still show it
                } catch (error) {
                    console.error("Failed to fetch quiz details", error);
                    toast.error("Could not load quiz");
                } finally {
                    setLoading(false);
                }
            } else {
                setQuestions([initializeEmptyQuestion()]);
                setDescription('');
                setTitle(modalData.title || ''); // allow editing
            }
        };
        fetchQuizDetails();
    }, [modalData]);

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    if (updated[qIndex].correctAnswer === updated[qIndex].options[optIndex]) {
      updated[qIndex].correctAnswer = value;
    }
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex, answerValue) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = answerValue;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, initializeEmptyQuestion()]);
  };

  const handleSaveQuiz = async () => {
    try {
        await createQuiz({
            title,
            description,
            courseId: modalData.courseId,
            subsectionId: modalData.subSectionId,
            questions,
        });
        setResetSubSectionIds(prev=>!prev);
        setModalData(null);
    } catch (error) {
        console.error(error);
        toast.error("Failed to create quiz");
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      await deleteQuiz(modalData.subSectionId);
      setResetSubSectionIds(prev=>!prev);
      setModalData(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete quiz");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative bg-richblack-800 rounded-lg w-[90%] max-w-2xl text-white overflow-y-auto max-h-[90vh]">
        <button onClick={() => setModalData(null)} className="sticky text-white left-full top-1 bg-richblack-500 p-1 m-1 rounded-full hover:bg-richblack-600 transition duration-200">
            <RxCross2 size={20} />
        </button>
        <div className="flex justify-between items-center mb-4 pt-6 px-6">
            <div className="text-xl font-semibold w-full">
              {modalData.isExistingQuiz ? (
                <h2>Quiz for: {title}</h2>
              ) : (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  className="w-full p-2 rounded bg-richblack-700 text-white border border-richblack-600"
                />
              )}
            </div>
        </div>

        {loading ? (
          <p className="text-center text-yellow-300 p-6">Loading quiz...</p>
        ) : (
          <>
            <div className="mb-6 px-6">
              <label className="block mb-2 font-semibold">Quiz Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-2 rounded bg-richblack-700 text-white border border-richblack-600 resize-none"
                placeholder="Enter quiz description"
                disabled={modalData.isExistingQuiz}
              />
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} className="mb-6 border-b border-richblack-600 pb-4 px-6">
                <label className="block mb-2 font-semibold">Question {qIndex + 1}</label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                  className="w-full p-2 mb-3 rounded bg-richblack-700 text-white border border-richblack-600"
                  placeholder="Enter your question"
                  disabled={modalData.isExistingQuiz}
                />
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2 mb-2">
                    <div className="relative flex items-center">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === opt}
                          onChange={() => handleCorrectAnswerChange(qIndex, opt)}
                        />
                        <div className={`absolute inset-0 ${!modalData.isExistingQuiz && "hidden"}`}></div>
                    </div>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                      className="flex-1 p-2 rounded bg-richblack-700 text-white border border-richblack-600"
                      placeholder={`Option ${optIndex + 1}`}
                      disabled={modalData.isExistingQuiz}
                    />
                  </div>
                ))}
              </div>
            ))}

            {!modalData.isExistingQuiz && (
              <button
                onClick={addQuestion}
                className="text-yellow-300 mb-4 underline px-6"
              >
                + Add Another Question
              </button>
            )}

            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setModalData(null)}
                className="px-4 py-2 bg-richblack-600 text-white rounded"
              >
                Cancel
              </button>
              {modalData.isExistingQuiz ? (
                <button
                  className="bg-red-600 text-white px-4 py-2"
                  onClick={handleDeleteQuiz}
                >
                  Delete Quiz
                </button>
              ) : (
                <button
                  className="bg-yellow-500 text-white px-4 py-2"
                  onClick={handleSaveQuiz}
                >
                  Save Quiz
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
