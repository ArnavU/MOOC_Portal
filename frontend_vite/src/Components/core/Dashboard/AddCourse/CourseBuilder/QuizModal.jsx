import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RxCross2 } from 'react-icons/rx';
import { createQuiz, getQuizDetails, deleteQuiz } from '../../../../../services/operations/quizAPI';
import { parseQuizDocx } from '../../../../../utils/parseWordQuiz';

const QuizModal = ({ modalData, setModalData, setResetSubSectionIds }) => {
  const [questions, setQuestions] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [inputMode, setInputMode] = useState("manual"); // "manual" or "word"
  const [file, setFile] = useState(null);               // for .docx file upload
  const [parsedQuestions, setParsedQuestions] = useState([]); // store parsed questions

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
        console.log("Quiz details response:", result); 
        
        if (result?.quizData) {
          setDescription(result.quizData.description || '');
          setQuestions(result.quizData.questions || []);
          setTitle(result.quizData.title || modalData.title);
        } else {
          setDescription(result.description || '');
          setQuestions(result.questions || []);
          setTitle(result.title || modalData.title);
        }
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

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setParsedQuestions([]);
      return;
    }
    
    if (!selectedFile.name.endsWith('.docx')) {
      toast.error("Please upload a Word (.docx) file");
      return;
    }
    
    setFile(selectedFile);
    setLoading(true);
    
    try {
      console.log("Starting to parse Word file...");
      const parsed = await parseQuizDocx(selectedFile);
      console.log("Parsed questions:", parsed);
      
      // Validate parsed questions
      const validQuestions = parsed.filter(q => 
        q.question && 
        q.options && 
        Array.isArray(q.options) && 
        q.options.length === 4 &&
        q.correctAnswer && 
        q.options.includes(q.correctAnswer)
      );
      
      setParsedQuestions(validQuestions);
      
      if (validQuestions.length === 0) {
        toast.error("No valid questions found in the file");
      } else {
        toast.success(`Successfully parsed ${validQuestions.length} questions`);
      }
    } catch (error) {
      console.error("Error parsing Word file:", error);
      toast.error("Failed to parse Word file: " + (error.message || "Unknown error"));
      setParsedQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    try {
      let quizQuestions = [];
      
      if (inputMode === "manual") {
        // Validate manual questions
        const valid = questions.every(
          (q) => q.question && q.correctAnswer && q.options.length === 4 && q.options.includes(q.correctAnswer)
        );
        
        if (!valid) {
          toast.error("Please complete all manual questions correctly");
          return;
        }
        
        quizQuestions = questions;
      } else {
        // Use parsed questions from Word file
        if (parsedQuestions.length === 0) {
          toast.error("No valid questions found. Please upload a properly formatted Word file");
          return;
        }
        
        quizQuestions = parsedQuestions;
      }
      
      if (!title.trim()) {
        toast.error("Please enter a quiz title");
        return;
      }
      
      if (!description.trim()) {
        toast.error("Please enter a quiz description");
        return;
      }
      
      setLoading(true);
      await createQuiz({
        title,
        description,
        courseId: modalData.courseId,
        subsectionId: modalData.subSectionId,
        questions: quizQuestions,
      });
      
      toast.success("Quiz created successfully");
      setResetSubSectionIds(prev => !prev);
      setModalData(null);
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      setLoading(true);
      await deleteQuiz(modalData.subSectionId);
      toast.success("Quiz deleted successfully");
      setResetSubSectionIds(prev => !prev);
      setModalData(null);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    } finally {
      setLoading(false);
    }
  };

  const previewParsedQuestions = () => {
    if (parsedQuestions.length === 0) {
      return <p className="text-yellow-300">No questions parsed yet</p>;
    }
    
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Preview ({parsedQuestions.length} questions):</h3>
        {parsedQuestions.slice(0, 3).map((q, i) => (
          <div key={i} className="mb-2 p-2 border border-richblack-600 rounded">
            <p className="font-medium">{i+1}. {q.question}</p>
            <div className="mt-1">
              {q.options.map((option, idx) => (
                <p key={idx} className={`text-sm ${q.correctAnswer === option ? 'text-green-400' : 'text-gray-400'}`}>
                  {String.fromCharCode(65 + idx)}) {option} {q.correctAnswer === option ? '✓' : ''}
                </p>
              ))}
            </div>
          </div>
        ))}
        {parsedQuestions.length > 3 && (
          <p className="text-sm text-gray-400">...and {parsedQuestions.length - 3} more</p>
        )}
      </div>
    );
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
          <p className="text-center text-yellow-300 p-6">Loading...</p>
        ) : (
          <>
            {!modalData.isExistingQuiz && (
              <div className="flex gap-4 px-6 mb-4">
                <button
                  type="button"
                  onClick={() => setInputMode("manual")}
                  className={`px-3 py-1 rounded ${inputMode === "manual" ? "bg-yellow-400 text-black" : "bg-richblack-600 text-white"}`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("word")}
                  className={`px-3 py-1 rounded ${inputMode === "word" ? "bg-yellow-400 text-black" : "bg-richblack-600 text-white"}`}
                >
                  Upload Word File
                </button>
              </div>
            )}

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

            {modalData.isExistingQuiz ? (
              questions.map((q, qIndex) => (
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
                          disabled={modalData.isExistingQuiz}
                        />
                        <div className="absolute inset-0 hidden"></div>
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
              ))
            ) : (
              inputMode === "manual" ? (
                questions.map((q, qIndex) => (
                  <div key={qIndex} className="mb-6 border-b border-richblack-600 pb-4 px-6">
                    <label className="block mb-2 font-semibold">Question {qIndex + 1}</label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                      className="w-full p-2 mb-3 rounded bg-richblack-700 text-white border border-richblack-600"
                      placeholder="Enter your question"
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
                        </div>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                          className="flex-1 p-2 rounded bg-richblack-700 text-white border border-richblack-600"
                          placeholder={`Option ${optIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="px-6 mb-6">
                  <label className="block mb-2 font-semibold">Upload Word (.docx) File</label>
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileChange}
                    className="text-white"
                  />
                  <p className="mt-2 text-sm text-yellow-300">
                    Format in your document: <br />
                    1. Question text <br />
                    A) First option <br />
                    B) Second option ✓ <br />
                    C) Third option <br />
                    D) Fourth option <br />
                    (Mark correct answer with ✓, ✅, or *)
                  </p>
                  
                  {/* Preview parsed questions */}
                  {file && previewParsedQuestions()}
                </div>
              )
            )}

            {!modalData.isExistingQuiz && inputMode === "manual" && (
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
                  className="bg-red-600 text-white px-4 py-2 rounded"
                  onClick={handleDeleteQuiz}
                  disabled={loading}
                >
                  Delete Quiz
                </button>
              ) : (
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                  onClick={handleSaveQuiz}
                  disabled={loading}
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